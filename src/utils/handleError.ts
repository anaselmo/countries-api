import { Response } from "express";


export const handleError = (res: Response, message: string, code: number, error?: unknown) => {
    console.error(message, error);
    res.status(code).send({ error: message });
}; 