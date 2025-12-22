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
import { Link as RouterLink } from "react-router-dom";
import type { Trip } from "@tripplanner/shared";
import { createTrip, listTrips } from "../../api/trips";
import { ApiError } from "../../api/client";

function toIsoDate(value: string) {
  if (!value) {
    return undefined;
  }

  return `${value}T00:00:00.000Z`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString();
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedTrips = useMemo(
    () => [...trips].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [trips]
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await listTrips();
        if (isMounted) {
          setTrips(response);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load trips");
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
      const newTrip = await createTrip({
        title,
        description: description.length ? description : undefined,
        startDate: toIsoDate(startDate),
        endDate: toIsoDate(endDate)
      });

      setTrips((current) => [newTrip, ...current]);
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to create trip.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={8} maxW="720px" mx="auto">
      <Box
        bg="white"
        p={{ base: 6, md: 8 }}
        rounded="lg"
        shadow="md"
      >
        <Stack spacing={4} as="form" onSubmit={handleSubmit}>
          <Heading size="lg">Create a trip</Heading>
          <Text color="gray.600">
            Add a new trip to start planning. Set start and end dates to
            generate itinerary days automatically.
          </Text>
          {error ? <Text color="red.500">{error}</Text> : null}
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Start date</FormLabel>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>End date</FormLabel>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormControl>
          <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
            Create trip
          </Button>
        </Stack>
      </Box>

      <Stack spacing={4}>
        <Heading size="md">Your trips</Heading>
        {isLoading ? <Text>Loading trips…</Text> : null}
        {!isLoading && sortedTrips.length === 0 ? (
          <Text color="gray.600">No trips yet. Create your first one.</Text>
        ) : null}
        {sortedTrips.map((trip) => (
          <Box key={trip.id} p={4} bg="white" rounded="md" shadow="sm">
            <Stack spacing={1}>
              <Heading size="sm">
                <Button
                  variant="link"
                  colorScheme="blue"
                  as={RouterLink}
                  to={`/trips/${trip.id}`}
                >
                  {trip.title}
                </Button>
              </Heading>
              <Text color="gray.600">
                {trip.description || "No description"}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {formatDate(trip.startDate)}
                {trip.startDate || trip.endDate ? " – " : ""}
                {formatDate(trip.endDate)}
              </Text>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
