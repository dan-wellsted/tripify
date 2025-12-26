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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await register({
        email,
        password,
        name: name.length ? name : undefined
      });
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to register.");
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
            Get started
          </Text>
          <Heading size="lg">Create your Wandr account</Heading>
          <Text color="gray.600">Plan your first trip in minutes.</Text>
        </Stack>
        {error ? <Text color="red.500">{error}</Text> : null}
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            borderRadius="full"
          />
        </FormControl>
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
          Sign up
        </Button>
        <Text fontSize="sm" color="gray.600">
          Already have an account?{" "}
          <Button variant="link" colorScheme="orange" as={RouterLink} to="/login">
            Log in
          </Button>
        </Text>
      </Stack>
    </Box>
  );
}
