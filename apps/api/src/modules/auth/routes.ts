import { Router } from "express";
import { createRateLimiter } from "../../middleware/rateLimit.js";
import {
  loginHandler,
  logoutHandler,
  meHandler,
  registerHandler
} from "./handlers.js";

const router = Router();

const authLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 20,
  keyPrefix: "auth"
});

router.post("/auth/register", authLimiter, registerHandler);
router.post("/auth/login", authLimiter, loginHandler);
router.post("/auth/logout", logoutHandler);
router.get("/auth/me", meHandler);

export default router;
