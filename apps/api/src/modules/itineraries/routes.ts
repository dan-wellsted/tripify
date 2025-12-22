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
  reorderTripDayActivitiesHandler,
  reorderTripDayCitiesHandler,
  reorderTripDayPlacesHandler,
  reorderTripDaysHandler,
  listTripDaysHandler
} from "./handlers.js";

const router = Router();

router.get("/trips/:tripId/days", listTripDaysHandler);
router.post("/trips/:tripId/days", createTripDayHandler);
router.patch("/trips/:tripId/days/reorder", reorderTripDaysHandler);
router.get("/trips/:tripId/days/:dayId/cities", listTripDayCitiesHandler);
router.post("/trips/:tripId/days/:dayId/cities", addTripDayCityHandler);
router.delete(
  "/trips/:tripId/days/:dayId/cities/:dayCityId",
  deleteTripDayCityHandler
);
router.patch(
  "/trips/:tripId/days/:dayId/cities/reorder",
  reorderTripDayCitiesHandler
);
router.get("/trips/:tripId/days/:dayId/activities", listTripDayActivitiesHandler);
router.post("/trips/:tripId/days/:dayId/activities", addTripDayActivityHandler);
router.delete(
  "/trips/:tripId/days/:dayId/activities/:dayActivityId",
  deleteTripDayActivityHandler
);
router.patch(
  "/trips/:tripId/days/:dayId/activities/reorder",
  reorderTripDayActivitiesHandler
);
router.get("/trips/:tripId/days/:dayId/places", listTripDayPlacesHandler);
router.post("/trips/:tripId/days/:dayId/places", addTripDayPlaceHandler);
router.delete(
  "/trips/:tripId/days/:dayId/places/:dayPlaceId",
  deleteTripDayPlaceHandler
);
router.patch(
  "/trips/:tripId/days/:dayId/places/reorder",
  reorderTripDayPlacesHandler
);

export default router;
