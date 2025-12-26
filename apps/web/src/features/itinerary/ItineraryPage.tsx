import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Heading,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useDisclosure
} from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import type {
  ActivityWithPlace,
  City,
  Place,
  TripDay,
  TripDayActivityWithActivity,
  TripDayCityWithCity,
  TripDayPlaceWithPlace
} from "@tripplanner/shared";
import {
  addTripDayActivity,
  addTripDayCity,
  addTripDayPlace,
  deleteTripDayActivity,
  deleteTripDayCity,
  deleteTripDayPlace,
  reorderTripDayActivities,
  reorderTripDayCities,
  reorderTripDayPlaces,
  listTripDayActivities,
  listTripDayCities,
  listTripDayPlaces,
  listTripDays
} from "../../api/itinerary";
import { listActivities } from "../../api/activities";
import { listCities } from "../../api/cities";
import { listPlaces } from "../../api/places";
import { formatZonedTime } from "../../utils/dates";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

type ItineraryPageProps = {
  tripId?: string;
  showBackLink?: boolean;
  showHeading?: boolean;
};

export default function ItineraryPage({
  tripId,
  showBackLink = true,
  showHeading = true
}: ItineraryPageProps) {
  const { tripId: routeTripId } = useParams();
  const resolvedTripId = tripId ?? routeTripId;
  const [days, setDays] = useState<TripDay[]>([]);
  const [activities, setActivities] = useState<ActivityWithPlace[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [dayActivities, setDayActivities] = useState<
    Record<string, TripDayActivityWithActivity[]>
  >({});
  const [dayCities, setDayCities] = useState<
    Record<string, TripDayCityWithCity[]>
  >({});
  const [dayPlaces, setDayPlaces] = useState<
    Record<string, TripDayPlaceWithPlace[]>
  >({});
  const [activitySelections, setActivitySelections] = useState<
    Record<string, string>
  >({});
  const [placeSelections, setPlaceSelections] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  type DragType = "activities" | "cities" | "places";
  const [error, setError] = useState<string | null>(null);
  const addItemDisclosure = useDisclosure();
  const [modalDayId, setModalDayId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<DragType | null>(null);
  const [modalCityQuery, setModalCityQuery] = useState("");
  const [modalCitySelections, setModalCitySelections] = useState<string[]>([]);
  const sortedDays = useMemo(
    () =>
      [...days].sort((a, b) => {
        const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateDiff !== 0) {
          return dateDiff;
        }
        return a.position - b.position;
      }),
    [days]
  );

  const reorderById = <T extends { id: string; position: number }>(
    items: T[],
    sourceId: string,
    targetId: string
  ) => {
    const sourceIndex = items.findIndex((item) => item.id === sourceId);
    const targetIndex = items.findIndex((item) => item.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) {
      return items;
    }

    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    return next.map((item, index) => ({ ...item, position: index }));
  };

  const [dragging, setDragging] = useState<{
    dayId: string;
    type: DragType;
    itemId: string;
  } | null>(null);
  const safePlaces = useMemo(
    () => (Array.isArray(places) ? places : []),
    [places]
  );
  const safeActivities = useMemo(
    () => (Array.isArray(activities) ? activities : []),
    [activities]
  );
  const safeCities = useMemo(
    () => (Array.isArray(cities) ? cities : []),
    [cities]
  );
  const filteredCities = useMemo(() => {
    const normalized = modalCityQuery.trim().toLowerCase();
    if (!normalized) {
      return safeCities;
    }

    return safeCities.filter((city) =>
      city.name.toLowerCase().includes(normalized)
    );
  }, [modalCityQuery, safeCities]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!resolvedTripId) {
        return;
      }

      try {
        const response = await listTripDays(resolvedTripId);
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
  }, [resolvedTripId]);

  useEffect(() => {
    let isMounted = true;

    const loadActivities = async () => {
      try {
        const response = await listActivities();
        if (isMounted) {
          setActivities(Array.isArray(response) ? response : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load activities"
          );
        }
      }
    };

    void loadActivities();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCities = async () => {
      try {
        const response = await listCities();
        if (isMounted) {
          setCities(Array.isArray(response) ? response : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load cities");
        }
      }
    };

    void loadCities();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPlaces = async () => {
      try {
        const response = await listPlaces();
        if (isMounted) {
          setPlaces(Array.isArray(response) ? response : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load places");
        }
      } finally {
        if (isMounted) {
          setIsLoadingPlaces(false);
        }
      }
    };

    void loadPlaces();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDayPlaces = async () => {
      if (!resolvedTripId || sortedDays.length === 0) {
        return;
      }

      try {
        const results = await Promise.all(
          sortedDays.map(async (day) => {
            const response = await listTripDayPlaces(resolvedTripId, day.id);
            return [day.id, response] as const;
          })
        );
        if (isMounted) {
          const next = results.reduce<Record<string, TripDayPlaceWithPlace[]>>(
            (acc, [dayId, response]) => {
              acc[dayId] = response;
              return acc;
            },
            {}
          );
          setDayPlaces(next);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load day places"
          );
        }
      }
    };

    void loadDayPlaces();

    return () => {
      isMounted = false;
    };
  }, [resolvedTripId, sortedDays]);

  useEffect(() => {
    let isMounted = true;

    const loadDayActivities = async () => {
      if (!resolvedTripId || sortedDays.length === 0) {
        return;
      }

      try {
        const results = await Promise.all(
          sortedDays.map(async (day) => {
            const response = await listTripDayActivities(resolvedTripId, day.id);
            return [day.id, response] as const;
          })
        );
        if (isMounted) {
          const next = results.reduce<
            Record<string, TripDayActivityWithActivity[]>
          >((acc, [dayId, response]) => {
            acc[dayId] = response;
            return acc;
          }, {});
          setDayActivities(next);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load activities"
          );
        }
      }
    };

    void loadDayActivities();

    return () => {
      isMounted = false;
    };
  }, [resolvedTripId, sortedDays]);

  useEffect(() => {
    let isMounted = true;

    const loadDayCities = async () => {
      if (!resolvedTripId || sortedDays.length === 0) {
        return;
      }

      try {
        const results = await Promise.all(
          sortedDays.map(async (day) => {
            const response = await listTripDayCities(resolvedTripId, day.id);
            return [day.id, response] as const;
          })
        );
        if (isMounted) {
          const next = results.reduce<Record<string, TripDayCityWithCity[]>>(
            (acc, [dayId, response]) => {
              acc[dayId] = response;
              return acc;
            },
            {}
          );
          setDayCities(next);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load day cities"
          );
        }
      }
    };

    void loadDayCities();

    return () => {
      isMounted = false;
    };
  }, [resolvedTripId, sortedDays]);

  const handleAddActivity = async (dayId: string) => {
    if (!resolvedTripId) {
      return;
    }

    const activityId = activitySelections[dayId];
    if (!activityId) {
      return;
    }

    try {
      const created = await addTripDayActivity(resolvedTripId, dayId, { activityId });
      setDayActivities((current) => ({
        ...current,
        [dayId]: [...(current[dayId] ?? []), created].sort(
          (a, b) => a.position - b.position
        )
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add activity");
    }
  };

  const handleRemoveActivity = async (
    dayId: string,
    dayActivityId: string
  ) => {
    if (!resolvedTripId) {
      return;
    }

    try {
      await deleteTripDayActivity(resolvedTripId, dayId, dayActivityId);
      setDayActivities((current) => ({
        ...current,
        [dayId]: (current[dayId] ?? []).filter(
          (entry) => entry.id !== dayActivityId
        )
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove activity"
      );
    }
  };

  const handleDrop = (type: DragType, dayId: string, targetId: string) => {
    if (!dragging) {
      return;
    }
    if (dragging.dayId !== dayId || dragging.type !== type) {
      return;
    }
    if (dragging.itemId === targetId) {
      return;
    }

    const currentActivities = dayActivities[dayId] ?? [];
    const currentCities = dayCities[dayId] ?? [];
    const currentPlaces = dayPlaces[dayId] ?? [];

    if (type === "activities") {
      const next = reorderById(currentActivities, dragging.itemId, targetId);
      setDayActivities((current) => ({
        ...current,
        [dayId]: next
      }));

      if (resolvedTripId) {
        void reorderTripDayActivities(resolvedTripId, dayId, {
          orderedIds: next.map((item) => item.id)
        });
      }
    }

    if (type === "cities") {
      const next = reorderById(currentCities, dragging.itemId, targetId);
      setDayCities((current) => ({
        ...current,
        [dayId]: next
      }));

      if (resolvedTripId) {
        void reorderTripDayCities(resolvedTripId, dayId, {
          orderedIds: next.map((item) => item.id)
        });
      }
    }

    if (type === "places") {
      const next = reorderById(currentPlaces, dragging.itemId, targetId);
      setDayPlaces((current) => ({
        ...current,
        [dayId]: next
      }));

      if (resolvedTripId) {
        void reorderTripDayPlaces(resolvedTripId, dayId, {
          orderedIds: next.map((item) => item.id)
        });
      }
    }

    setDragging(null);
  };

  const handleAddCity = async (dayId: string) => {
    if (!resolvedTripId) {
      return;
    }

    try {
      const existingCityIds = new Set(
        (dayCities[dayId] ?? []).map((entry) => entry.cityId)
      );
      const selected = modalCitySelections.filter(
        (cityId) => !existingCityIds.has(cityId)
      );
      const created: TripDayCityWithCity[] = [];

      for (const cityId of selected) {
        const entry = await addTripDayCity(resolvedTripId, dayId, { cityId });
        created.push(entry);
      }

      if (created.length > 0) {
        setDayCities((current) => ({
          ...current,
          [dayId]: [...(current[dayId] ?? []), ...created].sort(
            (a, b) => a.position - b.position
          )
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add city");
    }
  };

  const handleRemoveCity = async (dayId: string, dayCityId: string) => {
    if (!resolvedTripId) {
      return;
    }

    try {
      await deleteTripDayCity(resolvedTripId, dayId, dayCityId);
      setDayCities((current) => ({
        ...current,
        [dayId]: (current[dayId] ?? []).filter(
          (entry) => entry.id !== dayCityId
        )
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove city");
    }
  };

  const handleAddPlace = async (dayId: string) => {
    if (!resolvedTripId) {
      return;
    }

    const placeId = placeSelections[dayId];
    if (!placeId) {
      return;
    }

    try {
      const created = await addTripDayPlace(resolvedTripId, dayId, { placeId });
      setDayPlaces((current) => ({
        ...current,
        [dayId]: [...(current[dayId] ?? []), created].sort(
          (a, b) => a.position - b.position
        )
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add place");
    }
  };

  const handleRemovePlace = async (dayId: string, dayPlaceId: string) => {
    if (!resolvedTripId) {
      return;
    }

    try {
      await deleteTripDayPlace(resolvedTripId, dayId, dayPlaceId);
      setDayPlaces((current) => ({
        ...current,
        [dayId]: (current[dayId] ?? []).filter(
          (entry) => entry.id !== dayPlaceId
        )
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove place");
    }
  };

  const containerMaxW = showBackLink || showHeading ? "840px" : "100%";
  const containerMx = showBackLink || showHeading ? "auto" : "0";
  const pinPath =
    "M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z";
  const starPath =
    "m12 2 2.8 6.1 6.7.6-5 4.4 1.5 6.6L12 16.9 6 19.7l1.5-6.6-5-4.4 6.7-.6L12 2z";

  const openAddModal = (type: DragType, dayId: string) => {
    setModalType(type);
    setModalDayId(dayId);
    if (type === "cities") {
      setModalCityQuery("");
      setModalCitySelections([]);
    }
    addItemDisclosure.onOpen();
  };

  const closeAddModal = () => {
    addItemDisclosure.onClose();
    setModalDayId(null);
    setModalType(null);
    setModalCityQuery("");
    setModalCitySelections([]);
  };

  const handleModalAdd = async () => {
    if (!modalDayId || !modalType) {
      return;
    }

    if (modalType === "activities") {
      await handleAddActivity(modalDayId);
    }
    if (modalType === "cities") {
      await handleAddCity(modalDayId);
    }
    if (modalType === "places") {
      await handleAddPlace(modalDayId);
    }

    closeAddModal();
  };

  const modalTitle =
    modalType === "activities"
      ? "Add activity"
      : modalType === "cities"
        ? "Add city"
        : modalType === "places"
          ? "Add place"
          : "Add item";

  const modalExistingCityIds = modalDayId
    ? new Set((dayCities[modalDayId] ?? []).map((entry) => entry.cityId))
    : new Set<string>();

  return (
    <Stack spacing={8} maxW={containerMaxW} mx={containerMx}>
      {showBackLink && resolvedTripId ? (
        <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
          <Button as={RouterLink} to={`/trips/${resolvedTripId}`} variant="ghost">
            Back to trip
          </Button>
        </Stack>
      ) : null}
      {showHeading ? <Heading size="lg">Itinerary</Heading> : null}
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
          <Box
            key={day.id}
            bg="white"
            p={{ base: 4, md: 6 }}
            rounded="2xl"
            shadow="sm"
            border="1px solid"
            borderColor="orange.100"
          >
            <Stack spacing={4}>
              <HStack spacing={3} align="center" justify="space-between">
                <HStack spacing={3} align="flex-start">
                  <Box
                    bg="orange.400"
                    color="white"
                    w="40px"
                    h="40px"
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="bold"
                  >
                    {day.position + 1}
                  </Box>
                  <Stack spacing={1}>
                    <Heading size="sm">{day.title || `Day ${day.position + 1}`}</Heading>
                    <Text color="gray.600" fontSize="sm">
                      {formatDate(day.date)}
                    </Text>
                  </Stack>
                </HStack>
                <HStack
                  spacing={2}
                  align="center"
                  justify="flex-end"
                  flex="1"
                  minW={0}
                  overflowX="auto"
                >
                  <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                    Cities
                  </Text>
                  {(dayCities[day.id] ?? []).length === 0 ? (
                    <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                      No cities yet.
                    </Text>
                  ) : (
                    (dayCities[day.id] ?? []).map((entry) => (
                      <Tag
                        key={entry.id}
                        size="sm"
                        colorScheme="teal"
                        draggable
                        onDragStart={() =>
                          setDragging({
                            dayId: day.id,
                            type: "cities",
                            itemId: entry.id
                          })
                        }
                        onDragEnd={() => setDragging(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleDrop("cities", day.id, entry.id)}
                        whiteSpace="nowrap"
                      >
                        <TagLabel>
                          <HStack spacing={1}>
                            <Icon viewBox="0 0 24 24" boxSize={3} color="teal.600">
                              <path fill="currentColor" d={pinPath} />
                            </Icon>
                            <Text>{entry.city.name}</Text>
                          </HStack>
                        </TagLabel>
                        <TagCloseButton
                          onClick={() => void handleRemoveCity(day.id, entry.id)}
                        />
                      </Tag>
                    ))
                  )}
                  <Button
                    size="xs"
                    variant="outline"
                    borderStyle="dashed"
                    onClick={() => openAddModal("cities", day.id)}
                    isDisabled={safeCities.length === 0}
                    whiteSpace="nowrap"
                  >
                    + Add city
                  </Button>
                </HStack>
              </HStack>
              <Stack spacing={2} pt={2}>
                <HStack justify="space-between">
                  <Heading size="xs" color="gray.600">
                    Activities
                  </Heading>
                  <Button
                    size="xs"
                    variant="outline"
                    borderStyle="dashed"
                    onClick={() => openAddModal("activities", day.id)}
                    isDisabled={safeActivities.length === 0}
                  >
                    + Add activity
                  </Button>
                </HStack>
                {(dayActivities[day.id] ?? []).length === 0 ? (
                  <Text color="gray.500" fontSize="sm">
                    No activities added yet.
                  </Text>
                ) : (
                  (dayActivities[day.id] ?? []).map((entry) => (
                    <HStack
                      key={entry.id}
                      justify="space-between"
                      align="center"
                      draggable
                      onDragStart={() =>
                        setDragging({
                          dayId: day.id,
                          type: "activities",
                          itemId: entry.id
                        })
                      }
                      onDragEnd={() => setDragging(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDrop("activities", day.id, entry.id)}
                    >
                      <Stack spacing={1} flex="1">
                        <HStack spacing={2}>
                          <Icon viewBox="0 0 24 24" boxSize={4} color="orange.400">
                            <path fill="currentColor" d={starPath} />
                          </Icon>
                          <Text fontWeight="semibold">{entry.activity.title}</Text>
                        </HStack>
                        {entry.activity.startTime || entry.activity.endTime ? (
                          <Text fontSize="sm" color="gray.500">
                            {formatZonedTime(
                              entry.activity.startTime,
                              entry.activity.startTimeZone
                            )}
                            {entry.activity.startTime || entry.activity.endTime
                              ? " → "
                              : ""}
                            {formatZonedTime(
                              entry.activity.endTime,
                              entry.activity.endTimeZone
                            )}
                          </Text>
                        ) : null}
                        {entry.activity.place ? (
                          <Tag
                            size="sm"
                            colorScheme="purple"
                            alignSelf="flex-start"
                          >
                            <TagLabel>{entry.activity.place.name}</TagLabel>
                          </Tag>
                        ) : null}
                      </Stack>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          void handleRemoveActivity(day.id, entry.id)
                        }
                      >
                        Remove
                      </Button>
                    </HStack>
                  ))
                )}
                {safeActivities.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">
                    No activities available yet.
                  </Text>
                ) : null}
              </Stack>
              <Stack spacing={2} pt={2}>
                <HStack justify="space-between">
                  <Heading size="xs" color="gray.600">
                    Places
                  </Heading>
                  <Button
                    size="xs"
                    variant="outline"
                    borderStyle="dashed"
                    onClick={() => openAddModal("places", day.id)}
                    isDisabled={isLoadingPlaces || safePlaces.length === 0}
                  >
                    + Add place
                  </Button>
                </HStack>
                {(dayPlaces[day.id] ?? []).length === 0 ? (
                  <Text color="gray.500" fontSize="sm">
                    No places added yet.
                  </Text>
                ) : (
                  (dayPlaces[day.id] ?? []).map((entry) => (
                    <HStack
                      key={entry.id}
                      justify="space-between"
                      align="center"
                      draggable
                      onDragStart={() =>
                        setDragging({
                          dayId: day.id,
                          type: "places",
                          itemId: entry.id
                        })
                      }
                      onDragEnd={() => setDragging(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDrop("places", day.id, entry.id)}
                    >
                      <Stack spacing={0} flex="1">
                        <HStack spacing={2}>
                          <Icon viewBox="0 0 24 24" boxSize={4} color="orange.400">
                            <path fill="currentColor" d={pinPath} />
                          </Icon>
                          <Text fontWeight="semibold">{entry.place.name}</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          {entry.place.address || "No address"}
                        </Text>
                      </Stack>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => void handleRemovePlace(day.id, entry.id)}
                      >
                        Remove
                      </Button>
                    </HStack>
                  ))
                )}
                {!isLoadingPlaces && safePlaces.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">
                    No places available yet.
                  </Text>
                ) : null}
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>

      <Modal isOpen={addItemDisclosure.isOpen} onClose={closeAddModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalTitle}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {modalType === "activities" ? (
              <Select
                placeholder="Select an activity"
                value={
                  modalDayId ? activitySelections[modalDayId] ?? "" : ""
                }
                onChange={(event) =>
                  setActivitySelections((current) => ({
                    ...current,
                    ...(modalDayId ? { [modalDayId]: event.target.value } : {})
                  }))
                }
                isDisabled={safeActivities.length === 0}
              >
                {safeActivities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.title}
                  </option>
                ))}
              </Select>
            ) : null}
            {modalType === "cities" ? (
              <Stack spacing={3}>
                <Input
                  placeholder="Search cities..."
                  value={modalCityQuery}
                  onChange={(event) => setModalCityQuery(event.target.value)}
                />
                <Stack spacing={2} maxH="260px" overflowY="auto">
                  {filteredCities.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">
                      No cities found.
                    </Text>
                  ) : (
                    filteredCities.map((city) => {
                      const isSelected = modalCitySelections.includes(city.id);
                      const isExisting = modalExistingCityIds.has(city.id);
                      return (
                        <Checkbox
                          key={city.id}
                          isChecked={isSelected}
                          isDisabled={isExisting}
                          onChange={(event) => {
                            setModalCitySelections((current) => {
                              if (event.target.checked) {
                                return [...current, city.id];
                              }
                              return current.filter((id) => id !== city.id);
                            });
                          }}
                        >
                          {city.name}
                        </Checkbox>
                      );
                    })
                  )}
                </Stack>
              </Stack>
            ) : null}
            {modalType === "places" ? (
              <Select
                placeholder={isLoadingPlaces ? "Loading places..." : "Select a place"}
                value={modalDayId ? placeSelections[modalDayId] ?? "" : ""}
                onChange={(event) =>
                  setPlaceSelections((current) => ({
                    ...current,
                    ...(modalDayId ? { [modalDayId]: event.target.value } : {})
                  }))
                }
                isDisabled={isLoadingPlaces || safePlaces.length === 0}
              >
                {safePlaces.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </Select>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeAddModal}>
              Cancel
            </Button>
            <Button
              colorScheme="orange"
              onClick={() => void handleModalAdd()}
              isDisabled={
                modalType === "activities"
                  ? !modalDayId || !activitySelections[modalDayId]
                  : modalType === "cities"
                    ? modalCitySelections.length === 0
                    : modalType === "places"
                      ? !modalDayId || !placeSelections[modalDayId]
                      : true
              }
            >
              {modalType === "cities" ? "Add selected" : "Add"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
}
