import { Router } from "express";
import { healthHandler } from "./health.js";
import authRoutes from "./modules/auth/routes.js";

const router = Router();

router.get("/health", healthHandler);
router.use(authRoutes);

export default router;
