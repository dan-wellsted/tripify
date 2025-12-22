import { Router } from "express";
import {
  createPlaceHandler,
  deletePlaceHandler,
  getPlaceHandler,
  listPlacesHandler,
  updatePlaceHandler
} from "./handlers.js";

const router = Router();

router.get("/places", listPlacesHandler);
router.post("/places", createPlaceHandler);
router.get("/places/:placeId", getPlaceHandler);
router.patch("/places/:placeId", updatePlaceHandler);
router.delete("/places/:placeId", deletePlaceHandler);

export default router;
