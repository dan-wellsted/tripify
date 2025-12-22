import { Router } from "express";
import {
  createCityHandler,
  deleteCityHandler,
  getCityHandler,
  listCitiesHandler,
  updateCityHandler
} from "./handlers.js";

const router = Router();

router.get("/cities", listCitiesHandler);
router.post("/cities", createCityHandler);
router.get("/cities/:cityId", getCityHandler);
router.patch("/cities/:cityId", updateCityHandler);
router.delete("/cities/:cityId", deleteCityHandler);

export default router;
