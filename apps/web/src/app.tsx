import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Link,
  Stack,
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
import GroupsPage from "./features/groups/GroupsPage";

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
      bgGradient="linear(to-br, gray.50, blue.50)"
      px={{ base: 6, md: 12 }}
      py={10}
    >
      <Flex
        maxW="960px"
        mx="auto"
        mb={10}
        align="center"
        justify="space-between"
        wrap="wrap"
        gap={4}
      >
        <Heading size="lg" color="brand.600">
          Trip Planner
        </Heading>
        <HStack spacing={3}>
          {!user ? (
            <>
              <Button as={RouterLink} to="/login" variant="ghost">
                Log in
              </Button>
              <Button as={RouterLink} to="/register" colorScheme="blue">
                Sign up
              </Button>
            </>
          ) : (
            <>
              <Button as={RouterLink} to="/places" variant="ghost" size="sm">
                Places
              </Button>
              <Button as={RouterLink} to="/cities" variant="ghost" size="sm">
                Cities
              </Button>
              <Button as={RouterLink} to="/activities" variant="ghost" size="sm">
                Activities
              </Button>
              <Button as={RouterLink} to="/groups" variant="ghost" size="sm">
                Groups
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
            <Stack spacing={6} maxW="720px" mx="auto">
              <Heading size="2xl" color="gray.800">
                Plan trips, map out days, and keep everything organized.
              </Heading>
              <Text fontSize="lg" color="gray.700">
                Collect places, build itineraries, and share plans when you’re
                ready.
              </Text>
              <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
                <Button colorScheme="blue" size="lg" as={RouterLink} to="/trips">
                  Create a trip
                </Button>
                <Button variant="outline" size="lg" as={RouterLink} to="/trips">
                  Browse trips
                </Button>
              </Stack>
              {!user ? (
                <Text fontSize="sm" color="gray.600">
                  Already have plans?{" "}
                  <Link as={RouterLink} to="/login" color="blue.600">
                    Log in to continue.
                  </Link>
                </Text>
              ) : null}
            </Stack>
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
          path="/groups"
          element={requireAuth(<GroupsPage />)}
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
