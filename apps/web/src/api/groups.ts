import type {
  AddGroupMemberInput,
  CreateGroupInput,
  Group,
  GroupMemberWithUser
} from "@tripplanner/shared";
import { apiRequest } from "./client";

export async function listGroups() {
  return apiRequest<Group[]>("/groups");
}

export async function createGroup(payload: CreateGroupInput) {
  return apiRequest<Group>("/groups", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function listGroupMembers(groupId: string) {
  return apiRequest<GroupMemberWithUser[]>(`/groups/${groupId}/members`);
}

export async function addGroupMember(
  groupId: string,
  payload: AddGroupMemberInput
) {
  return apiRequest<GroupMemberWithUser>(`/groups/${groupId}/members`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function deleteGroupMember(groupId: string, memberId: string) {
  return apiRequest<void>(`/groups/${groupId}/members/${memberId}`, {
    method: "DELETE"
  });
}
