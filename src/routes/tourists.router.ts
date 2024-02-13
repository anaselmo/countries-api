import { Router } from "express";
import { registerTourist, loginTourist, deleteTourist, getTourist, getTourists, updateTourist } from "../controllers/tourists.controller";
import { authMiddleware } from "../middleware/session";
import { handleError } from "../utils/handleError";

const router = Router();

/**
 * Obtener la lista de todos los turistas
 */
router.get("/", authMiddleware, handleError(getTourists));

/**
 * Obtener la información de un turista por su id
 */
router.get("/:id", authMiddleware, handleError(getTourist));

/**
 * Registrarse como turista
 */
router.post("/auth/register", handleError(registerTourist));

/**
 * Iniciar sesión como turista
 */
router.post("/auth/login", handleError(loginTourist));

/**
 * Actualizar información de un turista
 */
router.put("/:id", authMiddleware, handleError(updateTourist));

/**
 * Eliminar un turista
 */
router.delete("/:id", authMiddleware, handleError(deleteTourist));



export default router;