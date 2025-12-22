import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Stack,
  Text
} from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import type { Trip } from "@tripplanner/shared";
import { getTrip } from "../../api/trips";

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString();
}

export default function TripDetailPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!tripId) {
        return;
      }

      try {
        const response = await getTrip(tripId);
        if (isMounted) {
          setTrip(response);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load trip");
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [tripId]);

  return (
    <Stack spacing={6} maxW="720px" mx="auto">
      <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
        <Button as={RouterLink} to="/trips" variant="ghost">
          Back to trips
        </Button>
        {trip ? (
          <Button
            as={RouterLink}
            to={`/trips/${trip.id}/itinerary`}
            colorScheme="blue"
            variant="outline"
          >
            View itinerary
          </Button>
        ) : null}
      </Stack>
      {error ? <Text color="red.500">{error}</Text> : null}
      {trip ? (
        <Box bg="white" p={{ base: 6, md: 8 }} rounded="lg" shadow="md">
          <Stack spacing={3}>
            <Heading size="lg">{trip.title}</Heading>
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
      ) : null}
    </Stack>
  );
}
