import { Router } from "express";
import { createCountry, deleteCountry, getCountries, getCountry, updateCountry } from "../controllers/countries.controller";

const router = Router();

/**
 * Obtener la lista de todos los países
 */
router.get("/", getCountries);

/**
 * Obtener la información de un país por su id
 */
router.get("/:id", getCountry);

/**
 * Crear un registro de un país
 */
router.post("/", createCountry);

/**
 * Actualizar información de un país
 */
router.put("/:id", updateCountry);

/**
 * Eliminar un país
 */
router.delete("/:id", deleteCountry);



export default router;