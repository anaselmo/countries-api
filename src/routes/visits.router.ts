import { Router } from "express";
import { getVisits, getVisit, createVisit, updateVisit, deleteVisit } from "../controllers/visits.controller";
import { authMiddleware } from "../middleware/session";

const router = Router();

/**
 * Obtener la lista de todas las visitas
 */
router.get("/", authMiddleware, getVisits);

/**
 * Obtener la información de una visita por su id
 */
router.get("/:id", authMiddleware, getVisit);

/**
 * Crear una visita
 */
router.post("/:id", authMiddleware, createVisit);

/**
 * Actualizar información de una visita
 */
router.put("/:id", authMiddleware, updateVisit);

/**
 * Eliminar una visita
 */
router.delete("/:id", authMiddleware, deleteVisit);



export default router;