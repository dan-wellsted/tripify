import { useEffect, useMemo, useState } from "react";
import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import type { TripDay } from "@tripplanner/shared";
import { listTripDays } from "../../api/itinerary";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export default function ItineraryPage() {
  const { tripId } = useParams();
  const [days, setDays] = useState<TripDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sortedDays = useMemo(
    () => [...days].sort((a, b) => a.position - b.position),
    [days]
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!tripId) {
        return;
      }

      try {
        const response = await listTripDays(tripId);
        if (isMounted) {
          setDays(response);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load days");
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
  }, [tripId]);

  return (
    <Stack spacing={8} maxW="840px" mx="auto">
      <Button as={RouterLink} to={`/trips/${tripId ?? ""}`} variant="ghost">
        Back to trip
      </Button>
      <Heading size="lg">Itinerary</Heading>
      {error ? (
        <Box bg="white" p={{ base: 6, md: 8 }} rounded="lg" shadow="md">
          <Text color="red.500">{error}</Text>
        </Box>
      ) : null}

      <Stack spacing={3}>
        <Heading size="md">Days</Heading>
        {isLoading ? <Text>Loading days…</Text> : null}
        {!isLoading && sortedDays.length === 0 ? (
          <Text color="gray.600">
            No days yet. Add start and end dates on the trip to generate days.
          </Text>
        ) : null}
        {sortedDays.map((day) => (
          <Box key={day.id} bg="white" p={4} rounded="md" shadow="sm">
            <Stack spacing={1}>
              <Heading size="sm">Day {day.position + 1}</Heading>
              <Text color="gray.700">{formatDate(day.date)}</Text>
              <Text color="gray.500">
                {day.title || "No title"}
              </Text>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
