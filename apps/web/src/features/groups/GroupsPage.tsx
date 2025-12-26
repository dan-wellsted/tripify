import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Tag,
  TagLabel,
  Text
} from "@chakra-ui/react";
import type { Group, GroupMemberWithUser } from "@tripplanner/shared";
import {
  addGroupMember,
  createGroup,
  deleteGroupMember,
  listGroupMembers,
  listGroups
} from "../../api/groups";
import { ApiError } from "../../api/client";
import { useAuth } from "../auth/AuthProvider";

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMemberWithUser[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? null,
    [groups, selectedGroupId]
  );
  const isOwner = Boolean(
    selectedGroup && user && selectedGroup.ownerId === user.id
  );

  useEffect(() => {
    let isMounted = true;

    const loadGroups = async () => {
      try {
        const response = await listGroups();
        if (!isMounted) {
          return;
        }
        setGroups(response);
        setError(null);
        if (response.length) {
          setSelectedGroupId((current) => current ?? response[0].id);
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
        setMembers([]);
        return;
      }
      setIsLoadingMembers(true);
      try {
        const response = await listGroupMembers(selectedGroupId);
        if (isMounted) {
          setMembers(response);
          setError(null);
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

  const handleCreateGroup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!groupName.trim()) {
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const newGroup = await createGroup({ name: groupName.trim() });
      setGroups((current) => {
        const next = [...current, newGroup].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        return next;
      });
      setSelectedGroupId(newGroup.id);
      setGroupName("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to create group.");
      }
    } finally {
      setIsCreating(false);
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
      setMembers((current) => [...current, newMember]);
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
      setMembers((current) => current.filter((member) => member.id !== memberId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove member");
    }
  };

  return (
    <Stack spacing={8} maxW="960px" mx="auto">
      <Box bg="white" p={{ base: 6, md: 8 }} rounded="lg" shadow="md">
        <Stack spacing={4} as="form" onSubmit={handleCreateGroup}>
          <Heading size="lg">Create a group</Heading>
          <Text color="gray.600">
            Use groups to share trips with collaborators and keep members in
            sync.
          </Text>
          {error ? <Text color="red.500">{error}</Text> : null}
          <FormControl isRequired>
            <FormLabel>Group name</FormLabel>
            <Input
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="e.g. Family summer 2025"
            />
          </FormControl>
          <Button type="submit" colorScheme="blue" isLoading={isCreating}>
            Create group
          </Button>
        </Stack>
      </Box>

      <Stack spacing={6}>
        <Heading size="md">Your groups</Heading>
        {isLoadingGroups ? <Text>Loading groups…</Text> : null}
        {!isLoadingGroups && groups.length === 0 ? (
          <Text color="gray.600">No groups yet. Create your first group.</Text>
        ) : null}
        <Stack direction={{ base: "column", md: "row" }} spacing={6} align="start">
          <Stack spacing={3} minW={{ base: "100%", md: "260px" }}>
            {groups.map((group) => (
              <Button
                key={group.id}
                variant={group.id === selectedGroupId ? "solid" : "outline"}
                colorScheme="blue"
                justifyContent="flex-start"
                onClick={() => setSelectedGroupId(group.id)}
              >
                {group.name}
              </Button>
            ))}
          </Stack>
          <Box flex="1" bg="white" p={{ base: 5, md: 6 }} rounded="lg" shadow="sm">
            {selectedGroup ? (
              <Stack spacing={4}>
                <Heading size="sm">Members</Heading>
                <Text color="gray.600">
                  {isOwner
                    ? "Invite collaborators by email."
                    : "Only the group owner can manage members."}
                </Text>
                <Stack
                  spacing={3}
                  as="form"
                  onSubmit={handleAddMember}
                >
                  <FormControl isRequired isDisabled={!isOwner}>
                    <FormLabel>Email</FormLabel>
                    <Input
                      value={memberEmail}
                      onChange={(event) => setMemberEmail(event.target.value)}
                      placeholder="member@example.com"
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isAddingMember}
                    isDisabled={!isOwner}
                  >
                    Add member
                  </Button>
                </Stack>
                {isLoadingMembers ? <Text>Loading members…</Text> : null}
                {!isLoadingMembers && members.length === 0 ? (
                  <Text color="gray.600">No members yet.</Text>
                ) : null}
                <Stack spacing={3}>
                  {members.map((member) => (
                    <Box key={member.id} p={3} bg="gray.50" rounded="md">
                      <Stack
                        direction={{ base: "column", sm: "row" }}
                        justify="space-between"
                        align="start"
                      >
                        <Stack spacing={1}>
                          <Text fontWeight="medium">
                            {member.user.name ?? member.user.email}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {member.user.email}
                          </Text>
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={2}
                          align="center"
                        >
                          <Tag size="sm" colorScheme="teal">
                            <TagLabel>{member.role}</TagLabel>
                          </Tag>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => void handleRemoveMember(member.id)}
                            isDisabled={!isOwner || member.role === "owner"}
                          >
                            Remove
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            ) : (
              <Text color="gray.600">Select a group to manage members.</Text>
            )}
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
}
