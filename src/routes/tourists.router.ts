import { Router } from "express";
import { registerTourist, loginTourist, deleteTourist, getTourist, getTourists, updateTourist } from "../controllers/tourists.controller";
import { authMiddleware } from "../middleware/session";

const router = Router();

/**
 * Obtener la lista de todos los turistas
 */
router.get("/", authMiddleware, getTourists);

/**
 * Obtener la información de un turista por su id
 */
router.get("/:id", authMiddleware, getTourist);

/**
 * Registrarse como turista
 */
router.post("/auth/register", registerTourist);

/**
 * Iniciar sesión como turista
 */
router.post("/auth/login", loginTourist);

/**
 * Actualizar información de un turista
 */
router.put("/:id", authMiddleware, updateTourist);

/**
 * Eliminar un turista
 */
router.delete("/:id", authMiddleware, deleteTourist);



export default router;