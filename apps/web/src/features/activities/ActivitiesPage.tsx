import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Tag,
  TagLabel,
  Text
} from "@chakra-ui/react";
import type { ActivityWithPlace, Place } from "@tripplanner/shared";
import {
  createActivity,
  deleteActivity,
  listActivities
} from "../../api/activities";
import { listPlaces } from "../../api/places";
import { ApiError } from "../../api/client";

function toIsoDateTime(value: string) {
  if (!value) {
    return undefined;
  }

  return new Date(value).toISOString();
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityWithPlace[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeActivities = useMemo(
    () => (Array.isArray(activities) ? activities : []),
    [activities]
  );
  const safePlaces = useMemo(
    () => (Array.isArray(places) ? places : []),
    [places]
  );

  const filteredActivities = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return safeActivities;
    }

    return safeActivities.filter((activity) => {
      return (
        activity.title.toLowerCase().includes(normalized) ||
        (activity.description ?? "").toLowerCase().includes(normalized) ||
        (activity.place?.name ?? "").toLowerCase().includes(normalized)
      );
    });
  }, [safeActivities, query]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [activityResponse, placeResponse] = await Promise.all([
          listActivities(),
          listPlaces()
        ]);
        if (isMounted) {
          setActivities(Array.isArray(activityResponse) ? activityResponse : []);
          setPlaces(Array.isArray(placeResponse) ? placeResponse : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load activities"
          );
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
      const newActivity = await createActivity({
        title,
        description: description.length ? description : undefined,
        notes: notes.length ? notes : undefined,
        startTime: toIsoDateTime(startTime),
        endTime: toIsoDateTime(endTime),
        placeId: placeId.length ? placeId : undefined
      });

      setActivities((current) => [newActivity, ...current]);
      setTitle("");
      setDescription("");
      setNotes("");
      setStartTime("");
      setEndTime("");
      setPlaceId("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to create activity.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (activityId: string) => {
    try {
      await deleteActivity(activityId);
      setActivities((current) =>
        current.filter((activity) => activity.id !== activityId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete activity");
    }
  };

  return (
    <Stack spacing={8} maxW="840px" mx="auto">
      <Box bg="white" p={{ base: 6, md: 8 }} rounded="lg" shadow="md">
        <Stack spacing={4} as="form" onSubmit={handleSubmit}>
          <Heading size="lg">Add an activity</Heading>
          <Text color="gray.600">
            Track tours, bookings, or notes and attach them to trip days.
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
            <FormLabel>Notes</FormLabel>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Start time</FormLabel>
            <Input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>End time</FormLabel>
            <Input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Place (optional)</FormLabel>
            <Select
              placeholder="Select a place"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              isDisabled={safePlaces.length === 0}
            >
              {safePlaces.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
            Save activity
          </Button>
        </Stack>
      </Box>

      <Stack spacing={4}>
        <Heading size="md">Activity library</Heading>
        <FormControl>
          <FormLabel>Search</FormLabel>
          <Input
            placeholder="Search by title or place"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </FormControl>
        {isLoading ? <Text>Loading activities…</Text> : null}
        {!isLoading && filteredActivities.length === 0 ? (
          <Text color="gray.600">
            No activities yet. Add your first one.
          </Text>
        ) : null}
        {filteredActivities.map((activity) => (
          <Box key={activity.id} bg="white" p={4} rounded="md" shadow="sm">
            <Stack spacing={1}>
              <Heading size="sm">{activity.title}</Heading>
              {activity.place ? (
                <Tag size="sm" colorScheme="purple" alignSelf="flex-start">
                  <TagLabel>{activity.place.name}</TagLabel>
                </Tag>
              ) : null}
              <Text color="gray.600">
                {activity.description || "No description"}
              </Text>
              {activity.notes ? (
                <Text color="gray.500">{activity.notes}</Text>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                alignSelf="flex-start"
                onClick={() => void handleDelete(activity.id)}
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
