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
  Select,
  Stack,
  Tag,
  TagLabel,
  Text,
  useDisclosure
} from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import type { Group, GroupMemberWithUser, Trip } from "@tripplanner/shared";
import { getTrip, updateTrip } from "../../api/trips";
import {
  addGroupMember,
  createGroup,
  deleteGroupMember,
  listGroupMembers,
  listGroups
} from "../../api/groups";
import { ApiError } from "../../api/client";
import { useAuth } from "../auth/AuthProvider";
import ItineraryPage from "../itinerary/ItineraryPage";

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

function tripImage(trip: Trip) {
  const images = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1600&q=80"
  ];
  const index =
    Math.abs(trip.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) %
    images.length;
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

function UsersIcon(props: ComponentProps<typeof Icon>) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M16 11a4 4 0 1 0-3.999-4A4 4 0 0 0 16 11Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm8 2c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4Zm-8 0c-.6 0-1.37.1-2.2.29C3.82 13.73 2 14.69 2 16v2h5v-1c0-1.52.72-2.63 1.78-3.42A8.4 8.4 0 0 0 8 13Z"
      />
    </Icon>
  );
}

export default function TripDetailPage() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMemberWithUser[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const manageGroupDisclosure = useDisclosure();
  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? null,
    [groups, selectedGroupId]
  );
  const isGroupOwner = Boolean(
    selectedGroup && user && selectedGroup.ownerId === user.id
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!tripId) {
        return;
      }

      try {
        const response = await getTrip(tripId);
        if (isMounted) {
          setTrip(response);
          setSelectedGroupId(response.groupId ?? null);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load trip");
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

    const loadGroups = async () => {
      try {
        const response = await listGroups();
        if (isMounted) {
          setGroups(response);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load groups");
        }
      } finally {
        if (isMounted) {
          setIsLoadingGroups(false);
        }
      }
    };

    void loadGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadMembers = async () => {
      if (!selectedGroupId) {
        setGroupMembers([]);
        return;
      }
      setIsLoadingMembers(true);
      try {
        const response = await listGroupMembers(selectedGroupId);
        if (isMounted) {
          setGroupMembers(response);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load members"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingMembers(false);
        }
      }
    };

    void loadMembers();

    return () => {
      isMounted = false;
    };
  }, [selectedGroupId]);

  const handleGroupChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!trip) {
      return;
    }

    const nextGroupId = event.target.value || null;
    setIsUpdatingGroup(true);
    setError(null);

    try {
      const updated = await updateTrip(trip.id, { groupId: nextGroupId });
      setTrip(updated);
      setSelectedGroupId(updated.groupId ?? null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to update group.");
      }
    } finally {
      setIsUpdatingGroup(false);
    }
  };

  const handleCreateGroup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!trip || !groupName.trim()) {
      return;
    }

    setIsCreatingGroup(true);
    setError(null);

    try {
      const newGroup = await createGroup({ name: groupName.trim() });
      setGroups((current) => [...current, newGroup]);
      const updated = await updateTrip(trip.id, { groupId: newGroup.id });
      setTrip(updated);
      setSelectedGroupId(newGroup.id);
      setGroupName("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to create group.");
      }
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleAddMember = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedGroupId || !memberEmail.trim()) {
      return;
    }
    setIsAddingMember(true);
    setError(null);

    try {
      const newMember = await addGroupMember(selectedGroupId, {
        email: memberEmail.trim()
      });
      setGroupMembers((current) => [...current, newMember]);
      setMemberEmail("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to add member.");
      }
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedGroupId) {
      return;
    }

    try {
      await deleteGroupMember(selectedGroupId, memberId);
      setGroupMembers((current) =>
        current.filter((member) => member.id !== memberId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove member");
    }
  };

  return (
    <Stack spacing={8} maxW="1216px" mx="auto">
      <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
        <Button as={RouterLink} to="/" variant="ghost">
          Back to trips
        </Button>
      </Stack>
      {error ? <Text color="red.500">{error}</Text> : null}
      {trip ? (
        <Stack spacing={8}>
          <Box
            bg="white"
            rounded="3xl"
            shadow="sm"
            overflow="hidden"
            border="1px solid"
            borderColor="orange.100"
          >
            <Box position="relative" h={{ base: "180px", md: "240px" }}>
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
                bgGradient="linear(to-b, blackAlpha.200, blackAlpha.600)"
              />
            </Box>
            <Stack spacing={3} p={{ base: 6, md: 8 }}>
              <HStack spacing={2}>
                <Tag size="sm" colorScheme="orange">
                  <TagLabel>
                    {trip.endDate &&
                    new Date(trip.endDate).getTime() < Date.now()
                      ? "Completed"
                      : "Upcoming"}
                  </TagLabel>
                </Tag>
                <Text fontSize="sm" color="gray.500">
                  {trip.description || "Trip overview"}
                </Text>
              </HStack>
              <Heading size="xl">{trip.title}</Heading>
              <Text fontSize="sm" color="gray.500">
                {formatDate(trip.startDate)}
                {trip.startDate || trip.endDate ? " – " : ""}
                {formatDate(trip.endDate)}
              </Text>
            </Stack>
          </Box>
          <Box
            bg="white"
            p={{ base: 6, md: 8 }}
            rounded="2xl"
            shadow="sm"
            border="1px solid"
            borderColor="orange.100"
          >
            <Stack spacing={3}>
              <Heading size="md">Overview</Heading>
              <Box
                display="grid"
                gap={4}
                gridTemplateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
              >
                <Box bg="gray.50" p={4} rounded="2xl">
                  <HStack spacing={2} fontSize="sm" color="gray.500">
                    <CalendarIcon />
                    <Text>Days</Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight="semibold">
                    {tripDays(trip) ?? "—"}
                  </Text>
                </Box>
                <Box bg="gray.50" p={4} rounded="2xl">
                  <HStack spacing={2} fontSize="sm" color="gray.500">
                    <PinIcon boxSize={4} />
                    <Text>Places</Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight="semibold">
                    0
                  </Text>
                </Box>
                <Box bg="gray.50" p={4} rounded="2xl">
                  <HStack spacing={2} fontSize="sm" color="gray.500">
                    <StarIcon />
                    <Text>Memories</Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight="semibold">
                    0
                  </Text>
                </Box>
                <Box
                  bg="gray.50"
                  p={4}
                  rounded="2xl"
                  cursor="pointer"
                  onClick={() => manageGroupDisclosure.onOpen()}
                  _hover={{ bg: "orange.50" }}
                  transition="background-color 0.2s"
                >
                  <HStack spacing={2} fontSize="sm" color="gray.500">
                    <UsersIcon boxSize={4} />
                    <Text>Travelers</Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight="semibold">
                    {groupMembers.length || 1}
                  </Text>
                </Box>
              </Box>
            </Stack>
          </Box>

          <Box
            bg="white"
            p={{ base: 6, md: 8 }}
            rounded="2xl"
            shadow="sm"
            border="1px solid"
            borderColor="orange.100"
          >
            <Stack spacing={4}>
              <Heading size="md">Itinerary</Heading>
              <ItineraryPage
                tripId={trip.id}
                showBackLink={false}
                showHeading={false}
              />
            </Stack>
          </Box>
        </Stack>
      ) : null}

      <Modal
        isOpen={manageGroupDisclosure.isOpen}
        onClose={manageGroupDisclosure.onClose}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={5}>
              <FormControl>
                <FormLabel>Group</FormLabel>
                <Select
                  value={trip?.groupId ?? ""}
                  onChange={handleGroupChange}
                  isDisabled={isLoadingGroups || isUpdatingGroup}
                >
                  <option value="">No group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <Stack as="form" onSubmit={handleCreateGroup} spacing={3}>
                <FormControl isRequired>
                  <FormLabel>New group name</FormLabel>
                  <Input
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                    placeholder="e.g. Family 2025"
                  />
                </FormControl>
                <Button
                  type="submit"
                  variant="gradient"
                  isLoading={isCreatingGroup}
                  isDisabled={!trip}
                  alignSelf="flex-start"
                >
                  Create group and assign
                </Button>
              </Stack>
              {selectedGroup ? (
                <Stack spacing={3}>
                  <Heading size="sm">Members</Heading>
                  <Text color="gray.600">
                    {isGroupOwner
                      ? "Invite collaborators by email."
                      : "Only the group owner can manage members."}
                  </Text>
                  <HStack
                    spacing={3}
                    as="form"
                    onSubmit={handleAddMember}
                    align="flex-end"
                  >
                    <FormControl isRequired isDisabled={!isGroupOwner}>
                      <FormLabel>Email</FormLabel>
                      <Input
                        value={memberEmail}
                        onChange={(event) => setMemberEmail(event.target.value)}
                        placeholder="member@example.com"
                      />
                    </FormControl>
                    <Button
                      type="submit"
                      variant="gradient"
                      isLoading={isAddingMember}
                      isDisabled={!isGroupOwner}
                    >
                      Add member
                    </Button>
                  </HStack>
                  {isLoadingMembers ? <Text>Loading members…</Text> : null}
                  {!isLoadingMembers && groupMembers.length === 0 ? (
                    <Text color="gray.600">No members yet.</Text>
                  ) : null}
                  <Stack spacing={3}>
                    {groupMembers.map((member) => {
                      const canRemove =
                        member.role !== "owner" &&
                        (isGroupOwner || member.userId === user?.id);
                      return (
                        <Box key={member.id} p={3} bg="gray.50" rounded="md">
                          <Stack
                            direction={{ base: "column", sm: "row" }}
                            align="start"
                            justify="space-between"
                          >
                            <Stack spacing={1}>
                              <Text fontWeight="medium">
                                {member.user.name ?? member.user.email}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {member.user.email}
                              </Text>
                            </Stack>
                            <HStack spacing={2}>
                              <Tag size="sm" colorScheme="teal">
                                <TagLabel>{member.role}</TagLabel>
                              </Tag>
                              <Button
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => void handleRemoveMember(member.id)}
                                isDisabled={!canRemove}
                              >
                                Remove
                              </Button>
                            </HStack>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                </Stack>
              ) : (
                <Text color="gray.600">
                  Select or create a group to manage collaborators.
                </Text>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={manageGroupDisclosure.onClose}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
}
