import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Heading,
  HStack,
  Select,
  Stack,
  Tag,
  TagLabel,
  Text
} from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import type {
  City,
  Place,
  TripDay,
  TripDayCityWithCity,
  TripDayPlaceWithPlace
} from "@tripplanner/shared";
import {
  addTripDayCity,
  addTripDayPlace,
  deleteTripDayCity,
  deleteTripDayPlace,
  listTripDayCities,
  listTripDayPlaces,
  listTripDays
} from "../../api/itinerary";
import { listCities } from "../../api/cities";
import { listPlaces } from "../../api/places";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export default function ItineraryPage() {
  const { tripId } = useParams();
  const [days, setDays] = useState<TripDay[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [dayCities, setDayCities] = useState<
    Record<string, TripDayCityWithCity[]>
  >({});
  const [dayPlaces, setDayPlaces] = useState<
    Record<string, TripDayPlaceWithPlace[]>
  >({});
  const [citySelections, setCitySelections] = useState<
    Record<string, string>
  >({});
  const [placeSelections, setPlaceSelections] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sortedDays = useMemo(
    () => [...days].sort((a, b) => a.position - b.position),
    [days]
  );
  const safePlaces = useMemo(
    () => (Array.isArray(places) ? places : []),
    [places]
  );
  const safeCities = useMemo(
    () => (Array.isArray(cities) ? cities : []),
    [cities]
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
      if (!tripId || sortedDays.length === 0) {
        return;
      }

      try {
        const results = await Promise.all(
          sortedDays.map(async (day) => {
            const response = await listTripDayPlaces(tripId, day.id);
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
  }, [tripId, sortedDays]);

  useEffect(() => {
    let isMounted = true;

    const loadDayCities = async () => {
      if (!tripId || sortedDays.length === 0) {
        return;
      }

      try {
        const results = await Promise.all(
          sortedDays.map(async (day) => {
            const response = await listTripDayCities(tripId, day.id);
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
  }, [tripId, sortedDays]);

  const handleAddCity = async (dayId: string) => {
    if (!tripId) {
      return;
    }

    const cityId = citySelections[dayId];
    if (!cityId) {
      return;
    }

    try {
      const created = await addTripDayCity(tripId, dayId, { cityId });
      setDayCities((current) => ({
        ...current,
        [dayId]: [...(current[dayId] ?? []), created].sort(
          (a, b) => a.position - b.position
        )
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add city");
    }
  };

  const handleRemoveCity = async (dayId: string, dayCityId: string) => {
    if (!tripId) {
      return;
    }

    try {
      await deleteTripDayCity(tripId, dayId, dayCityId);
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
    if (!tripId) {
      return;
    }

    const placeId = placeSelections[dayId];
    if (!placeId) {
      return;
    }

    try {
      const created = await addTripDayPlace(tripId, dayId, { placeId });
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
    if (!tripId) {
      return;
    }

    try {
      await deleteTripDayPlace(tripId, dayId, dayPlaceId);
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

  return (
    <Stack spacing={8} maxW="840px" mx="auto">
      <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
        <Button as={RouterLink} to={`/trips/${tripId ?? ""}`} variant="ghost">
          Back to trip
        </Button>
        <Button as={RouterLink} to="/places" variant="outline">
          Manage places
        </Button>
        <Button as={RouterLink} to="/cities" variant="outline">
          Manage cities
        </Button>
      </Stack>
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
            <Stack spacing={2}>
              <Heading size="sm">Day {day.position + 1}</Heading>
              <Text color="gray.700">{formatDate(day.date)}</Text>
              <Text color="gray.500">
                {day.title || "No title"}
              </Text>
              <Stack spacing={2} pt={2}>
                <Heading size="xs" color="gray.600">
                  Cities
                </Heading>
                {(dayCities[day.id] ?? []).length === 0 ? (
                  <Text color="gray.500" fontSize="sm">
                    No cities added yet.
                  </Text>
                ) : (
                  (dayCities[day.id] ?? []).map((entry) => (
                    <HStack
                      key={entry.id}
                      justify="space-between"
                      align="center"
                    >
                      <Stack spacing={1}>
                        <Tag size="sm" colorScheme="teal" alignSelf="flex-start">
                          <TagLabel>{entry.city.name}</TagLabel>
                        </Tag>
                        <Text fontSize="sm" color="gray.500">
                          {[entry.city.region, entry.city.country]
                            .filter(Boolean)
                            .join(", ") || "No region"}
                        </Text>
                      </Stack>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => void handleRemoveCity(day.id, entry.id)}
                      >
                        Remove
                      </Button>
                    </HStack>
                  ))
                )}
                <HStack>
                  <Select
                    placeholder="Select a city"
                    value={citySelections[day.id] ?? ""}
                    onChange={(event) =>
                      setCitySelections((current) => ({
                        ...current,
                        [day.id]: event.target.value
                      }))
                    }
                    isDisabled={safeCities.length === 0}
                  >
                    {safeCities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </Select>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => void handleAddCity(day.id)}
                    isDisabled={!citySelections[day.id]}
                  >
                    Add
                  </Button>
                </HStack>
                {safeCities.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">
                    Add cities to your library to attach them here.
                  </Text>
                ) : null}
              </Stack>
              <Stack spacing={2} pt={2}>
                <Heading size="xs" color="gray.600">
                  Places
                </Heading>
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
                    >
                      <Stack spacing={0}>
                        <Text fontWeight="semibold">
                          {entry.place.name}
                        </Text>
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
                <HStack>
                  <Select
                    placeholder={
                      isLoadingPlaces ? "Loading places..." : "Select a place"
                    }
                    value={placeSelections[day.id] ?? ""}
                    onChange={(event) =>
                      setPlaceSelections((current) => ({
                        ...current,
                        [day.id]: event.target.value
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
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => void handleAddPlace(day.id)}
                    isDisabled={!placeSelections[day.id]}
                  >
                    Add
                  </Button>
                </HStack>
                {!isLoadingPlaces && safePlaces.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">
                    Add places in your library to attach them here.
                  </Text>
                ) : null}
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
