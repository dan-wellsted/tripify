import { FormEvent, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text
} from "@chakra-ui/react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { ApiError } from "../../api/client";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const redirectTo =
      (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname ?? "/";

    try {
      await login({ email, password });
      navigate(redirectTo);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to log in.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      maxW="460px"
      mx="auto"
      mt={12}
      p={{ base: 6, md: 8 }}
      bg="white"
      rounded="2xl"
      shadow="sm"
      border="1px solid"
      borderColor="orange.100"
    >
      <Stack spacing={4} as="form" onSubmit={handleSubmit}>
        <Stack spacing={1}>
          <Text fontSize="sm" color="orange.500" fontWeight="semibold">
            Welcome back
          </Text>
          <Heading size="lg">Log in to Wandr</Heading>
          <Text color="gray.600">Continue planning your next adventure.</Text>
        </Stack>
        {error ? <Text color="red.500">{error}</Text> : null}
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            borderRadius="full"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            borderRadius="full"
          />
        </FormControl>
        <Button type="submit" variant="gradient" isLoading={isSubmitting}>
          Log in
        </Button>
        <Text fontSize="sm" color="gray.600">
          Need an account?{" "}
          <Button variant="link" colorScheme="orange" as={RouterLink} to="/register">
            Create one
          </Button>
        </Text>
      </Stack>
    </Box>
  );
}
