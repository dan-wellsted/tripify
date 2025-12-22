import { Router } from "express";
import { createTripDayHandler, listTripDaysHandler } from "./handlers.js";

const router = Router();

router.get("/trips/:tripId/days", listTripDaysHandler);
router.post("/trips/:tripId/days", createTripDayHandler);

export default router;
