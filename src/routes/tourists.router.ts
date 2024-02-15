import { Router } from "express";
import { registerTourist, loginTourist, deleteTourist, getTourist, getTourists, updateTourist } from "../controllers/tourists.controller";
import { authMiddleware } from "../middleware/session";
import { handleError } from "../utils/handleError";

const router = Router();

/**
 * Obtener la lista de todos los turistas
 */
router.get("/", handleError(getTourists));

/**
 * Obtener la información de un turista por su id
 */
router.get("/:id", handleError(getTourist));

/**
 * Registrarse como turista
 */
router.post("/auth/register", handleError(registerTourist));

/**
 * Iniciar sesión como turista
 */
router.post("/auth/login", handleError(loginTourist));

/**
 * Actualizar información del turista del token
 * @pre debe tener un token
 */
router.put("/", authMiddleware, handleError(updateTourist));

/**
 * Eliminar turista del token
 * @pre debe tener un token
 */
router.delete("/", authMiddleware, handleError(deleteTourist));



export default router;