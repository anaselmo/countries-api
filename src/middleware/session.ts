import { Request, Response, NextFunction } from "express";
import { handleError } from "../utils/handleError";
import { verifyToken } from "../utils/handleJwt";
import { prisma } from "../db";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.headers.authorization) { 
            return handleError(res,"YOU_NEED_SESSION", 401);
        }
        
        const token = req.headers.authorization.split(' ')[1] // Bearer **<token>**
        if (!token) {
            return handleError(res,"NO_TOKEN", 401);
        }

        const dataToken = await verifyToken(token);

        if (!dataToken) {
            return handleError(res, "ERROR_TOKEN", 401);
        }

        const user = await prisma.tourist.findUnique({
            where:{
                id: dataToken.id
            }
        });

        res.locals.user = user;

        next();
    } catch (err) {
        return handleError(res, "NO_SESSION", 401);
    }
}