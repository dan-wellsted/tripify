import { Router } from "express";
import {
  createTripHandler,
  deleteTripHandler,
  getTripHandler,
  listTripsHandler,
  updateTripHandler
} from "./handlers.js";

const router = Router();

router.post("/trips", createTripHandler);
router.get("/trips", listTripsHandler);
router.get("/trips/:tripId", getTripHandler);
router.patch("/trips/:tripId", updateTripHandler);
router.delete("/trips/:tripId", deleteTripHandler);

export default router;
