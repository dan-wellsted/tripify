import { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Select,
  Stack,
  Text
} from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import type { Group, Trip } from "@tripplanner/shared";
import { getTrip, updateTrip } from "../../api/trips";
import { listGroups } from "../../api/groups";
import { ApiError } from "../../api/client";

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString();
}

export default function TripDetailPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);
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

  useEffect(() => {
    let isMounted = true;

    const loadGroups = async () => {
      try {
        const response = await listGroups();
        if (isMounted) {
          setGroups(response);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load groups");
        }
      } finally {
        if (isMounted) {
          setIsLoadingGroups(false);
        }
      }
    };

    void loadGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleGroupChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!trip) {
      return;
    }

    const nextGroupId = event.target.value || null;
    setIsUpdatingGroup(true);
    setError(null);

    try {
      const updated = await updateTrip(trip.id, { groupId: nextGroupId });
      setTrip(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to update group.");
      }
    } finally {
      setIsUpdatingGroup(false);
    }
  };

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
            <FormControl>
              <FormLabel>Group</FormLabel>
              <Select
                value={trip.groupId ?? ""}
                onChange={handleGroupChange}
                isDisabled={isLoadingGroups || isUpdatingGroup}
              >
                <option value="">No group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
}
