import { Router } from "express";
import { healthHandler } from "./health.js";
import authRoutes from "./modules/auth/routes.js";
import tripRoutes from "./modules/trips/routes.js";
import itineraryRoutes from "./modules/itineraries/routes.js";
import placeRoutes from "./modules/places/routes.js";
import cityRoutes from "./modules/cities/routes.js";
import activityRoutes from "./modules/activities/routes.js";
import groupRoutes from "./modules/groups/routes.js";

const router = Router();

router.get("/health", healthHandler);
router.use(authRoutes);
router.use(tripRoutes);
router.use(itineraryRoutes);
router.use(placeRoutes);
router.use(cityRoutes);
router.use(activityRoutes);
router.use(groupRoutes);

export default router;
