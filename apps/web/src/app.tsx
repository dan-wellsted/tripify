import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Link,
  Stack,
  Tag,
  TagLabel,
  Text
} from "@chakra-ui/react";
import {
  Link as RouterLink,
  Navigate,
  Route,
  Routes,
  useLocation
} from "react-router-dom";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import { useAuth } from "./features/auth/AuthProvider";
import TripsPage from "./features/trips/TripsPage";
import TripDetailPage from "./features/trips/TripDetailPage";
import ItineraryPage from "./features/itinerary/ItineraryPage";
import PlacesPage from "./features/places/PlacesPage";
import CitiesPage from "./features/cities/CitiesPage";
import ActivitiesPage from "./features/activities/ActivitiesPage";

export default function App() {
  const { user, isLoading, logout, error } = useAuth();
  const location = useLocation();

  const requireAuth = (element: React.ReactElement) => {
    if (isLoading) {
      return <Text>Loading session…</Text>;
    }
    if (!user) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return element;
  };

  return (
    <Box
      minH="100vh"
      bg="#fbf7f2"
      px={{ base: 6, md: 12 }}
      py={10}
    >
      <Flex
        maxW="1216px"
        mx="auto"
        mb={10}
        align="center"
        justify="space-between"
        wrap="wrap"
        gap={4}
      >
        <HStack spacing={3}>
          <Box
            w="28px"
            h="28px"
            rounded="full"
            bg="orange.400"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="bold"
            fontSize="sm"
          >
            W
          </Box>
          <Heading size="md" letterSpacing="wide">
            Wandr
          </Heading>
        </HStack>
        <HStack spacing={3}>
          {!user ? (
            <>
              <Button as={RouterLink} to="/login" variant="ghost">
                Log in
              </Button>
              <Button as={RouterLink} to="/register" variant="gradient">
                Sign up
              </Button>
            </>
          ) : (
            <>
              <Button as={RouterLink} to="/" variant="ghost" size="sm">
                Dashboard
              </Button>
              <Text color="gray.700" fontSize="sm">
                {user.name ?? user.email}
              </Text>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void logout()}
                isLoading={isLoading}
              >
                Log out
              </Button>
            </>
          )}
        </HStack>
      </Flex>
      {error ? (
        <Box maxW="960px" mx="auto" mb={6}>
          <Text color="red.500">{error}</Text>
        </Box>
      ) : null}
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <TripsPage />
            ) : (
              <Stack spacing={10} maxW="1216px" mx="auto">
                <Box
                  rounded="3xl"
                  overflow="hidden"
                  shadow="lg"
                  position="relative"
                >
                  <Box
                    h={{ base: "420px", md: "520px" }}
                    bgImage="url(https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80)"
                    bgSize="cover"
                    bgPos="center"
                  />
                  <Box
                    position="absolute"
                    inset={0}
                    bgGradient="linear(to-b, blackAlpha.400, blackAlpha.800)"
                  />
                  <Stack
                    position="absolute"
                    inset={0}
                    align="center"
                    justify="center"
                    px={{ base: 6, md: 12 }}
                    spacing={6}
                    textAlign="center"
                    color="white"
                  >
                    <Box
                      bg="whiteAlpha.200"
                      px={4}
                      py={2}
                      rounded="full"
                      fontSize="sm"
                    >
                      Your adventures, beautifully organized
                    </Box>
                    <Heading size="2xl">
                      Plan your trip. Capture the moments. Relive it later.
                    </Heading>
                    <Text fontSize="lg" color="whiteAlpha.800">
                      The modern travel planner that helps you organize your
                      itinerary and keep memories in one place.
                    </Text>
                    <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
                      <Button variant="gradient" size="lg" as={RouterLink} to="/trips">
                        Create a trip
                      </Button>
                      <Button variant="outline" color="white" size="lg" as={RouterLink} to="/trips">
                        See example trip
                      </Button>
                    </Stack>
                    <Text fontSize="sm" color="whiteAlpha.700">
                      Already have plans?{" "}
                      <Link as={RouterLink} to="/login" color="white">
                        Log in to continue.
                      </Link>
                    </Text>
                  </Stack>
                </Box>

                <Stack spacing={6}>
                  <Stack spacing={2} textAlign="center">
                    <Heading size="lg">See what&apos;s possible</Heading>
                    <Text color="gray.600">
                      From quick weekend getaways to month-long adventures — Wandr
                      handles it all beautifully.
                    </Text>
                  </Stack>
                  <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                    {[
                      {
                        title: "10 Days in Japan",
                        subtitle: "Tokyo, Kyoto & Osaka",
                        status: "Completed",
                        days: "10 days",
                        places: "24 places",
                        memories: "156",
                        image:
                          "https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=1200&q=80"
                      },
                      {
                        title: "Greek Island Hopping",
                        subtitle: "Santorini & Mykonos",
                        status: "Upcoming",
                        days: "8 days",
                        places: "12 places",
                        memories: "0",
                        image:
                          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
                      },
                      {
                        title: "Machu Picchu Adventure",
                        subtitle: "Cusco & Sacred Valley",
                        status: "Upcoming",
                        days: "9 days",
                        places: "8 places",
                        memories: "0",
                        image:
                          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80"
                      }
                    ].map((trip) => (
                      <Box
                        key={trip.title}
                        bg="white"
                        rounded="2xl"
                        shadow="sm"
                        overflow="hidden"
                        border="1px solid"
                        borderColor="orange.100"
                        flex="1"
                      >
                        <Box h="180px" bgImage={`url(${trip.image})`} bgSize="cover" bgPos="center" />
                        <Stack spacing={3} p={5}>
                          <Tag size="sm" colorScheme={trip.status === "Upcoming" ? "blue" : "orange"} alignSelf="flex-start">
                            <TagLabel>{trip.status}</TagLabel>
                          </Tag>
                          <Heading size="md">{trip.title}</Heading>
                          <Text color="gray.600" fontSize="sm">
                            {trip.subtitle}
                          </Text>
                          <HStack spacing={4} fontSize="sm" color="gray.500">
                            <HStack spacing={1}>
                              <Icon viewBox="0 0 24 24" boxSize={4} color="orange.400">
                                <path
                                  fill="currentColor"
                                  d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2zm13 8H4v10h16V10zM4 8h16V6H4v2z"
                                />
                              </Icon>
                              <Text>{trip.days}</Text>
                            </HStack>
                            <HStack spacing={1}>
                              <Icon viewBox="0 0 24 24" boxSize={4} color="orange.400">
                                <path
                                  fill="currentColor"
                                  d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                                />
                              </Icon>
                              <Text>{trip.places}</Text>
                            </HStack>
                            <HStack spacing={1}>
                              <Icon viewBox="0 0 24 24" boxSize={4} color="orange.400">
                                <path
                                  fill="currentColor"
                                  d="m12 2 2.8 6.1 6.7.6-5 4.4 1.5 6.6L12 16.9 6 19.7l1.5-6.6-5-4.4 6.7-.6L12 2z"
                                />
                              </Icon>
                              <Text>{trip.memories} memories</Text>
                            </HStack>
                          </HStack>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Stack>

                <Stack spacing={6} align="center">
                  <Heading size="lg">Everything you need to travel better</Heading>
                  <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                    {[
                      {
                        title: "Day-by-day planning",
                        description:
                          "Organize your trip with a visual timeline. Drag and drop to reorder, add notes, set times.",
                        icon: (
                          <Icon viewBox="0 0 24 24" boxSize={5} color="orange.500">
                            <path
                              fill="currentColor"
                              d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2zm13 8H4v10h16V10zM4 8h16V6H4v2z"
                            />
                          </Icon>
                        )
                      },
                      {
                        title: "Place library",
                        description:
                          "Save restaurants, attractions, and hotels. Add them to any trip with one click.",
                        icon: (
                          <Icon viewBox="0 0 24 24" boxSize={5} color="orange.500">
                            <path
                              fill="currentColor"
                              d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                            />
                          </Icon>
                        )
                      },
                      {
                        title: "Travel stories",
                        description:
                          "Turn your trip into a beautiful, shareable story with photos and memories.",
                        icon: (
                          <Icon viewBox="0 0 24 24" boxSize={5} color="orange.500">
                            <path
                              fill="currentColor"
                              d="M4 6a2 2 0 0 1 2-2h9l5 5v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm11 0v4h4"
                            />
                          </Icon>
                        )
                      }
                    ].map((feature) => (
                      <Box
                        key={feature.title}
                        bg="white"
                        rounded="2xl"
                        shadow="sm"
                        border="1px solid"
                        borderColor="orange.100"
                        p={6}
                        flex="1"
                        textAlign="center"
                      >
                        <Box
                          w="44px"
                          h="44px"
                          rounded="full"
                          bg="orange.50"
                          display="inline-flex"
                          alignItems="center"
                          justifyContent="center"
                          mb={3}
                        >
                          {feature.icon}
                        </Box>
                        <Heading size="sm" mb={2}>
                          {feature.title}
                        </Heading>
                        <Text color="gray.600" fontSize="sm">
                          {feature.description}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                </Stack>

                <Box
                  bgGradient="linear(135deg, #ef6939, #f6a823)"
                  rounded="2xl"
                  p={{ base: 8, md: 10 }}
                  color="white"
                  textAlign="center"
                >
                  <Heading size="lg">Ready for your next adventure?</Heading>
                  <Text mt={2} color="whiteAlpha.900">
                    Join thousands of travelers who plan smarter and travel better
                    with Wandr.
                  </Text>
                  <Button mt={6} variant="outline" color="white" bg="whiteAlpha.200">
                    Start planning for free
                  </Button>
                </Box>

                <Flex
                  justify="space-between"
                  fontSize="sm"
                  color="gray.500"
                  py={4}
                  wrap="wrap"
                  gap={4}
                >
                  <Text>© 2024 Wandr. Made with ♥ for travelers.</Text>
                  <HStack spacing={4}>
                    <Link href="#">About</Link>
                    <Link href="#">Privacy</Link>
                    <Link href="#">Contact</Link>
                  </HStack>
                </Flex>
              </Stack>
            )
          }
        />
        <Route
          path="/trips"
          element={requireAuth(<TripsPage />)}
        />
        <Route
          path="/trips/:tripId"
          element={requireAuth(<TripDetailPage />)}
        />
        <Route
          path="/trips/:tripId/itinerary"
          element={requireAuth(<ItineraryPage />)}
        />
        <Route
          path="/places"
          element={requireAuth(<PlacesPage />)}
        />
        <Route
          path="/cities"
          element={requireAuth(<CitiesPage />)}
        />
        <Route
          path="/activities"
          element={requireAuth(<ActivitiesPage />)}
        />
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" replace /> : <LoginPage />
          }
        />
        <Route
          path="/register"
          element={
            user ? <Navigate to="/" replace /> : <RegisterPage />
          }
        />
      </Routes>
    </Box>
  );
}
