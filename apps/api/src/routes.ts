import { Router } from "express";
import { healthHandler } from "./health.js";
import authRoutes from "./modules/auth/routes.js";
import tripRoutes from "./modules/trips/routes.js";

const router = Router();

router.get("/health", healthHandler);
router.use(authRoutes);
router.use(tripRoutes);

export default router;
