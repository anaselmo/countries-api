import { Router } from "express";
import { createCountry, deleteCountry, getCountries, getCountry, updateCountry } from "../controllers/countries.controller";
import { handleError } from "../utils/handleError";

const router = Router();

/**
 * Obtener la lista de todos los países
 */
router.get("/", handleError(getCountries));

/**
 * Obtener la información de un país por su id
 */
router.get("/:id", handleError(getCountry));

/**
 * Crear un registro de un país
 */
router.post("/", handleError(createCountry));

/**
 * Actualizar información de un país
 */
router.put("/:id", handleError(updateCountry));

/**
 * Eliminar un país
 */
router.delete("/:id", handleError(deleteCountry));



export default router;