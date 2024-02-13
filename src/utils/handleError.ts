import { Request, Response, NextFunction } from "express";

//--------------------------------------------------------------------//
//--------------------------------------------------------------------//

export const outputError = (res: Response, message: string, code: number, error?: unknown) => {
    console.error(message, error);
    res.status(code).send({ error: message });
}; 

//--------------------------------------------------------------------//

export const handleError = (fn: (req: Request, res: Response, next: NextFunction) => void ) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        let e = null;
        try{
            await fn(req, res, next);
        } catch (err) {
            e = err;
            next(err);
        }

        if (!e) {
            next();
        }
    };
};

//--------------------------------------------------------------------//

export class NotFoundError extends Error {
    constructor(msg?: string){
        super(msg ?? "RESOURCE_NOT_FOUND");
    }
};

export class UnauthenticatedError extends Error {
    constructor(msg?: string){
        super(msg ?? "UNAUNTHENTICATED");
    }
};

//--------------------------------------------------------------------//