import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv"
import { Prisma, Tourist } from "@prisma/client";
dotenv.config();
// import { getProperties } from "./handlePropertiesEngine";

// const propertiesKey = getProperties();
const JWT_SECRET = process.env.JWT_SECRET || "falta JWT";
// const ID_KEY = (propertiesKey.id); // ?Preguntar



export type JwtPayloadCustom = ((string | JwtPayload ) & Tourist) | null;

/**
 * Debes de pasar el objeto del usuario
 * @param user 
 * @returns 
 */
export const tokenSign = async (user: Tourist) => {
    const sign = jwt.sign(
        {
            id: user.id,
            // role: user.role
        },
        JWT_SECRET,
        {
            expiresIn: "2h"
        }
    );
    
    return sign;
};

/**
 * Debes de pasar el token de sesión (el JWT)
 * @param tokenJwt 
 * @returns 
 */
export const verifyToken = async (tokenJwt: string) => {
    try {
        return jwt.verify(tokenJwt, JWT_SECRET) as JwtPayloadCustom;
    } catch (err) {
        return null;
    }
};