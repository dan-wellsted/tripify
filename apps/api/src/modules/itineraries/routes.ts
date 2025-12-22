import { Router } from "express";
import {
  addTripDayPlaceHandler,
  createTripDayHandler,
  deleteTripDayPlaceHandler,
  deleteTripDayCityHandler,
  deleteTripDayActivityHandler,
  addTripDayCityHandler,
  addTripDayActivityHandler,
  listTripDayCitiesHandler,
  listTripDayActivitiesHandler,
  listTripDayPlacesHandler,
  listTripDaysHandler
} from "./handlers.js";

const router = Router();

router.get("/trips/:tripId/days", listTripDaysHandler);
router.post("/trips/:tripId/days", createTripDayHandler);
router.get("/trips/:tripId/days/:dayId/cities", listTripDayCitiesHandler);
router.post("/trips/:tripId/days/:dayId/cities", addTripDayCityHandler);
router.delete(
  "/trips/:tripId/days/:dayId/cities/:dayCityId",
  deleteTripDayCityHandler
);
router.get("/trips/:tripId/days/:dayId/activities", listTripDayActivitiesHandler);
router.post("/trips/:tripId/days/:dayId/activities", addTripDayActivityHandler);
router.delete(
  "/trips/:tripId/days/:dayId/activities/:dayActivityId",
  deleteTripDayActivityHandler
);
router.get("/trips/:tripId/days/:dayId/places", listTripDayPlacesHandler);
router.post("/trips/:tripId/days/:dayId/places", addTripDayPlaceHandler);
router.delete(
  "/trips/:tripId/days/:dayId/places/:dayPlaceId",
  deleteTripDayPlaceHandler
);

export default router;
