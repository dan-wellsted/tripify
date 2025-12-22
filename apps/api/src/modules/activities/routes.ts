import { Router } from "express";
import {
  createActivityHandler,
  deleteActivityHandler,
  getActivityHandler,
  listActivitiesHandler,
  updateActivityHandler
} from "./handlers.js";

const router = Router();

router.get("/activities", listActivitiesHandler);
router.post("/activities", createActivityHandler);
router.get("/activities/:activityId", getActivityHandler);
router.patch("/activities/:activityId", updateActivityHandler);
router.delete("/activities/:activityId", deleteActivityHandler);

export default router;
