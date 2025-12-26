import { useEffect, useMemo, useState, type ComponentProps } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
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
  SimpleGrid,
  Stack,
  Tag,
  TagLabel,
  Text,
  useDisclosure
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

function getUserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString();
}

function tripDays(trip: Trip) {
  if (!trip.startDate || !trip.endDate) {
    return null;
  }
  const start = new Date(trip.startDate).getTime();
  const end = new Date(trip.endDate).getTime();
  const diff = Math.max(0, end - start);
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

function tripStatus(trip: Trip) {
  if (!trip.endDate) {
    return "Upcoming";
  }
  const end = new Date(trip.endDate).getTime();
  const now = Date.now();
  return end < now ? "Completed" : "Upcoming";
}

function tripImage(trip: Trip) {
  const images = [
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80"
  ];
  const index = Math.abs(trip.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % images.length;
  return images[index];
}

function PinIcon(props: ComponentProps<typeof Icon>) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
      />
    </Icon>
  );
}

function CalendarIcon(props: ComponentProps<typeof Icon>) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2zm13 8H4v10h16V10zM4 8h16V6H4v2z"
      />
    </Icon>
  );
}

function StarIcon(props: ComponentProps<typeof Icon>) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="m12 2 2.8 6.1 6.7.6-5 4.4 1.5 6.6L12 16.9 6 19.7l1.5-6.6-5-4.4 6.7-.6L12 2z"
      />
    </Icon>
  );
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createDisclosure = useDisclosure();

  const filteredTrips = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...trips]
      .filter((trip) =>
        normalized ? trip.title.toLowerCase().includes(normalized) : true
      )
      .sort((a, b) => {
        if (a.startDate && b.startDate) {
          return a.startDate.localeCompare(b.startDate);
        }
        if (a.startDate) {
          return -1;
        }
        if (b.startDate) {
          return 1;
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [trips, query]);

  const upcomingTrips = filteredTrips.filter(
    (trip) => tripStatus(trip) === "Upcoming"
  );
  const pastTrips = filteredTrips.filter(
    (trip) => tripStatus(trip) === "Completed"
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
      const timeZone = getUserTimeZone();
      const newTrip = await createTrip({
        title,
        description: description.length ? description : undefined,
        startDate: toIsoDate(startDate),
        endDate: toIsoDate(endDate),
        startDateTimeZone: startDate ? timeZone : undefined,
        endDateTimeZone: endDate ? timeZone : undefined
      });

      setTrips((current) => [newTrip, ...current]);
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      createDisclosure.onClose();
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
    <Stack spacing={8} maxW="1216px" mx="auto">
      <Stack spacing={6}>
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={3}
          align={{ base: "stretch", md: "center" }}
          justify="space-between"
        >
          <Stack spacing={1}>
            <Heading size="lg">Your Trips</Heading>
            <Text color="gray.600">
              Plan, organize, and relive your adventures.
            </Text>
          </Stack>
          <Button variant="gradient" onClick={createDisclosure.onOpen}>
            + New Trip
          </Button>
        </Stack>
        <HStack spacing={3} pt={2}>
          <Input
            placeholder="Search trips..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxW="360px"
            bg="white"
            borderRadius="full"
            shadow="sm"
          />
          <Button variant="outline" borderRadius="full" shadow="sm">
            Filters
          </Button>
        </HStack>
        {isLoading ? <Text>Loading trips…</Text> : null}
        {!isLoading && filteredTrips.length === 0 ? (
          <Text color="gray.600">
            No trips yet. Create your first trip to get started.
          </Text>
        ) : null}
        {upcomingTrips.length > 0 ? (
          <Stack spacing={4} pt={2}>
            <HStack spacing={2}>
              <Box w="6px" h="6px" rounded="full" bg="orange.400" />
              <Heading size="sm">Upcoming</Heading>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {upcomingTrips.map((trip) => {
                const days = tripDays(trip);
                return (
                  <Box
                    key={trip.id}
                    bg="white"
                    rounded="2xl"
                    shadow="sm"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="orange.100"
                    maxW="380px"
                    as={RouterLink}
                    to={`/trips/${trip.id}`}
                    display="block"
                    _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                    transition="all 0.2s"
                  >
                    <Box position="relative" h="180px">
                      <Box
                        position="absolute"
                        inset={0}
                        bgImage={`url(${tripImage(trip)})`}
                        bgSize="cover"
                        bgPos="center"
                      />
                      <Box
                        position="absolute"
                        inset={0}
                        bgGradient="linear(to-b, blackAlpha.100, blackAlpha.500)"
                      />
                    </Box>
                    <Stack spacing={3} p={5}>
                      <Tag size="sm" colorScheme="blue" alignSelf="flex-start">
                        <TagLabel>{tripStatus(trip)}</TagLabel>
                      </Tag>
                      <Heading size="md" color="gray.800">
                        {trip.title}
                      </Heading>
                      <Text color="gray.600" fontSize="sm">
                        {trip.description || "No description"}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {formatDate(trip.startDate)}
                        {trip.startDate || trip.endDate ? " – " : ""}
                        {formatDate(trip.endDate)}
                      </Text>
                      <HStack spacing={4} fontSize="sm" color="gray.500">
                        <HStack spacing={1}>
                          <CalendarIcon />
                          <Text>{days ? `${days} days` : "Dates not set"}</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <PinIcon boxSize={4} />
                          <Text>0 places</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <StarIcon />
                          <Text>0 memories</Text>
                        </HStack>
                      </HStack>
                    </Stack>
                  </Box>
                );
              })}
            </SimpleGrid>
          </Stack>
        ) : null}
        {pastTrips.length > 0 ? (
          <Stack spacing={4} pt={6}>
            <HStack spacing={2}>
              <Box w="6px" h="6px" rounded="full" bg="orange.400" />
              <Heading size="sm">Past Adventures</Heading>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {pastTrips.map((trip) => {
                const days = tripDays(trip);
                return (
                  <Box
                    key={trip.id}
                    bg="white"
                    rounded="2xl"
                    shadow="sm"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="orange.100"
                    maxW="380px"
                    as={RouterLink}
                    to={`/trips/${trip.id}`}
                    display="block"
                    _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                    transition="all 0.2s"
                  >
                    <Box position="relative" h="180px">
                      <Box
                        position="absolute"
                        inset={0}
                        bgImage={`url(${tripImage(trip)})`}
                        bgSize="cover"
                        bgPos="center"
                      />
                      <Box
                        position="absolute"
                        inset={0}
                        bgGradient="linear(to-b, blackAlpha.100, blackAlpha.500)"
                      />
                    </Box>
                    <Stack spacing={3} p={5}>
                      <Tag size="sm" colorScheme="orange" alignSelf="flex-start">
                        <TagLabel>{tripStatus(trip)}</TagLabel>
                      </Tag>
                      <Heading size="md" color="gray.800">
                        {trip.title}
                      </Heading>
                      <Text color="gray.600" fontSize="sm">
                        {trip.description || "No description"}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {formatDate(trip.startDate)}
                        {trip.startDate || trip.endDate ? " – " : ""}
                        {formatDate(trip.endDate)}
                      </Text>
                      <HStack spacing={4} fontSize="sm" color="gray.500">
                        <HStack spacing={1}>
                          <CalendarIcon />
                          <Text>{days ? `${days} days` : "Dates not set"}</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <PinIcon boxSize={4} />
                          <Text>0 places</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <StarIcon />
                          <Text>0 memories</Text>
                        </HStack>
                      </HStack>
                    </Stack>
                  </Box>
                );
              })}
            </SimpleGrid>
          </Stack>
        ) : null}
        <Stack spacing={4} pt={6}>
          <HStack spacing={2}>
            <Box w="6px" h="6px" rounded="full" bg="orange.400" />
            <Heading size="sm">Inspiration</Heading>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[
              {
                title: "Autumn in Kyoto",
                subtitle: "Temples, tea houses, and fall colors",
                image:
                  "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
              },
              {
                title: "Lisbon by the sea",
                subtitle: "Trams, tiles, and coastal sunsets",
                image:
                  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"
              },
              {
                title: "Patagonia escape",
                subtitle: "Glaciers, hikes, and wide open skies",
                image:
                  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80"
              }
            ].map((idea) => (
              <Box
                key={idea.title}
                bg="white"
                rounded="2xl"
                shadow="sm"
                overflow="hidden"
                border="1px solid"
                borderColor="orange.100"
                display="block"
              >
                <Box position="relative" h="180px">
                  <Box
                    position="absolute"
                    inset={0}
                    bgImage={`url(${idea.image})`}
                    bgSize="cover"
                    bgPos="center"
                  />
                  <Box
                    position="absolute"
                    inset={0}
                    bgGradient="linear(to-b, blackAlpha.100, blackAlpha.500)"
                  />
                </Box>
                <Stack spacing={2} p={5}>
                  <Heading size="md">{idea.title}</Heading>
                  <Text color="gray.600" fontSize="sm">
                    {idea.subtitle}
                  </Text>
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
        </Stack>
      </Stack>

      <Modal isOpen={createDisclosure.isOpen} onClose={createDisclosure.onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a trip</ModalHeader>
          <ModalCloseButton />
          <Stack as="form" onSubmit={handleSubmit}>
            <ModalBody>
              <Stack spacing={4}>
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
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={createDisclosure.onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" isLoading={isSubmitting}>
                Create trip
              </Button>
            </ModalFooter>
          </Stack>
        </ModalContent>
      </Modal>
    </Stack>
  );
}
