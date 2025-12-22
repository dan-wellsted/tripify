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
import { Link as RouterLink, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import { useAuth } from "./features/auth/AuthProvider";

export default function App() {
  const { user, isLoading, logout, error } = useAuth();

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
                <Button colorScheme="blue" size="lg">
                  Create a trip
                </Button>
                <Button variant="outline" size="lg">
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
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <RegisterPage />}
        />
      </Routes>
    </Box>
  );
}
