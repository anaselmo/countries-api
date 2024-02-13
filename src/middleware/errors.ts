import { Request, Response, NextFunction } from "express";
import { NotFoundError, UnauthenticatedError } from "../utils/handleError";


//TODO instalar un linter
export const errorMiddleware = async (err: Error, req: Request, res: Response , next: NextFunction) => {
    if (err instanceof NotFoundError) {
        res.status(404);
    } else if (err instanceof UnauthenticatedError) {
        res.status(401);
    } else {
        res.status(500);
    }

    res.send(err.message);
};