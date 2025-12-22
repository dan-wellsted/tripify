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
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { ApiError } from "../../api/client";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login({ email, password });
      navigate("/");
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
    <Box maxW="420px" mx="auto" mt={12} p={8} bg="white" rounded="lg" shadow="md">
      <Stack spacing={4} as="form" onSubmit={handleSubmit}>
        <Heading size="lg">Welcome back</Heading>
        <Text color="gray.600">Log in to continue planning your trips.</Text>
        {error ? <Text color="red.500">{error}</Text> : null}
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormControl>
        <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
          Log in
        </Button>
        <Text fontSize="sm" color="gray.600">
          Need an account?{" "}
          <Button variant="link" colorScheme="blue" as={RouterLink} to="/register">
            Create one
          </Button>
        </Text>
      </Stack>
    </Box>
  );
}
