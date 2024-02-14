import { Router } from "express";
import { getVisits, getVisit, createVisit, updateVisit, deleteVisit } from "../controllers/visits.controller";
import { authMiddleware } from "../middleware/session";
import { handleError } from "../utils/handleError";

const router = Router();

/**
 * Obtener la lista de todas las visitas
 */
router.get("/", authMiddleware, handleError(getVisits));

/**
 * Obtener la información de una visita por su id
 */
router.get("/:id", authMiddleware, handleError(getVisit));

/**
 * Crear una visita
 */
router.post("/", authMiddleware, handleError(createVisit));

/**
 * Actualizar información de una visita
 */
router.put("/:id", authMiddleware, handleError(updateVisit));

/**
 * Eliminar una visita
 */
router.delete("/:id", authMiddleware, handleError(deleteVisit));



export default router;