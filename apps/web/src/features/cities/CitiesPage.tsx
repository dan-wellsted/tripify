import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Tag,
  TagLabel,
  Text
} from "@chakra-ui/react";
import type { City } from "@tripplanner/shared";
import { createCity, deleteCity, listCities } from "../../api/cities";
import { ApiError } from "../../api/client";

function formatCoord(value: number | null) {
  if (value === null) {
    return "";
  }

  return value.toFixed(4);
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeCities = useMemo(
    () => (Array.isArray(cities) ? cities : []),
    [cities]
  );

  const filteredCities = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return safeCities;
    }

    return safeCities.filter((city) => {
      return (
        city.name.toLowerCase().includes(normalized) ||
        (city.country ?? "").toLowerCase().includes(normalized) ||
        (city.region ?? "").toLowerCase().includes(normalized)
      );
    });
  }, [safeCities, query]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await listCities();
        if (isMounted) {
          setCities(Array.isArray(response) ? response : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load cities");
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
      const newCity = await createCity({
        name,
        country: country.length ? country : undefined,
        region: region.length ? region : undefined,
        latitude: latitude.length ? Number(latitude) : undefined,
        longitude: longitude.length ? Number(longitude) : undefined
      });

      setCities((current) => [...current, newCity].sort((a, b) =>
        a.name.localeCompare(b.name)
      ));
      setName("");
      setCountry("");
      setRegion("");
      setLatitude("");
      setLongitude("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to create city.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cityId: string) => {
    try {
      await deleteCity(cityId);
      setCities((current) => current.filter((city) => city.id !== cityId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete city");
    }
  };

  return (
    <Stack spacing={8} maxW="840px" mx="auto">
      <Box bg="white" p={{ base: 6, md: 8 }} rounded="lg" shadow="md">
        <Stack spacing={4} as="form" onSubmit={handleSubmit}>
          <Heading size="lg">Add a city</Heading>
          <Text color="gray.600">
            Maintain a global city library to attach to itinerary days.
          </Text>
          {error ? <Text color="red.500">{error}</Text> : null}
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Country</FormLabel>
            <Input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Region</FormLabel>
            <Input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
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
            Save city
          </Button>
        </Stack>
      </Box>

      <Stack spacing={4}>
        <Heading size="md">City library</Heading>
        <FormControl>
          <FormLabel>Search</FormLabel>
          <Input
            placeholder="Search by name or country"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </FormControl>
        {isLoading ? <Text>Loading cities…</Text> : null}
        {!isLoading && filteredCities.length === 0 ? (
          <Text color="gray.600">No cities yet. Add your first city.</Text>
        ) : null}
        {filteredCities.map((city) => (
          <Box key={city.id} bg="white" p={4} rounded="md" shadow="sm">
            <Stack spacing={1}>
              <Tag size="sm" colorScheme="teal" alignSelf="flex-start">
                <TagLabel>{city.name}</TagLabel>
              </Tag>
              <Text color="gray.600">
                {[city.region, city.country].filter(Boolean).join(", ") ||
                  "No region"}
              </Text>
              {city.latitude !== null && city.longitude !== null ? (
                <Text fontSize="sm" color="gray.500">
                  {formatCoord(city.latitude)}, {formatCoord(city.longitude)}
                </Text>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                alignSelf="flex-start"
                onClick={() => void handleDelete(city.id)}
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
