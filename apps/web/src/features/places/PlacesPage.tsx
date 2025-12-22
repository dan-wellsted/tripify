import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text
} from "@chakra-ui/react";
import type { Place } from "@tripplanner/shared";
import { createPlace, deletePlace, listPlaces } from "../../api/places";
import { ApiError } from "../../api/client";

function formatCoord(value: number | null) {
  if (value === null) {
    return "";
  }

  return value.toFixed(4);
}

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safePlaces = useMemo(
    () => (Array.isArray(places) ? places : []),
    [places]
  );

  const filteredPlaces = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return safePlaces;
    }

    return safePlaces.filter((place) => {
      return (
        place.name.toLowerCase().includes(normalized) ||
        (place.description ?? "").toLowerCase().includes(normalized) ||
        (place.address ?? "").toLowerCase().includes(normalized)
      );
    });
  }, [safePlaces, query]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await listPlaces();
        if (isMounted) {
          setPlaces(Array.isArray(response) ? response : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load places");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const newPlace = await createPlace({
        name,
        description: description.length ? description : undefined,
        address: address.length ? address : undefined,
        latitude: latitude.length ? Number(latitude) : undefined,
        longitude: longitude.length ? Number(longitude) : undefined
      });

      setPlaces((current) => [newPlace, ...current]);
      setName("");
      setDescription("");
      setAddress("");
      setLatitude("");
      setLongitude("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to create place.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (placeId: string) => {
    try {
      await deletePlace(placeId);
      setPlaces((current) => current.filter((place) => place.id !== placeId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete place");
    }
  };

  return (
    <Stack spacing={8} maxW="840px" mx="auto">
      <Box bg="white" p={{ base: 6, md: 8 }} rounded="lg" shadow="md">
        <Stack spacing={4} as="form" onSubmit={handleSubmit}>
          <Heading size="lg">Add a place</Heading>
          <Text color="gray.600">
            Keep a shared place library to drop onto itinerary days.
          </Text>
          {error ? <Text color="red.500">{error}</Text> : null}
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Address</FormLabel>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Latitude</FormLabel>
            <Input
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Longitude</FormLabel>
            <Input
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </FormControl>
          <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
            Save place
          </Button>
        </Stack>
      </Box>

      <Stack spacing={4}>
        <Heading size="md">Place library</Heading>
        <FormControl>
          <FormLabel>Search</FormLabel>
          <Input
            placeholder="Search by name or address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </FormControl>
        {isLoading ? <Text>Loading places…</Text> : null}
        {!isLoading && filteredPlaces.length === 0 ? (
          <Text color="gray.600">No places yet. Add your first spot.</Text>
        ) : null}
        {filteredPlaces.map((place) => (
          <Box key={place.id} bg="white" p={4} rounded="md" shadow="sm">
            <Stack spacing={1}>
              <Heading size="sm">{place.name}</Heading>
              <Text color="gray.600">
                {place.description || "No description"}
              </Text>
              <Text color="gray.500">
                {place.address || "No address"}
              </Text>
              {place.latitude !== null && place.longitude !== null ? (
                <Text fontSize="sm" color="gray.500">
                  {formatCoord(place.latitude)}, {formatCoord(place.longitude)}
                </Text>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                alignSelf="flex-start"
                onClick={() => void handleDelete(place.id)}
              >
                Remove
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
