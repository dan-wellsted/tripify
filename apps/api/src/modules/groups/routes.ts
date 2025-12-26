import { Router } from "express";
import {
  addGroupMemberHandler,
  createGroupHandler,
  deleteGroupMemberHandler,
  listGroupMembersHandler,
  listGroupsHandler
} from "./handlers.js";

const router = Router();

router.get("/groups", listGroupsHandler);
router.post("/groups", createGroupHandler);
router.get("/groups/:groupId/members", listGroupMembersHandler);
router.post("/groups/:groupId/members", addGroupMemberHandler);
router.delete("/groups/:groupId/members/:memberId", deleteGroupMemberHandler);

export default router;
