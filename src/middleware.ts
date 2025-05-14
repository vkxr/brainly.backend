import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error("secret missing in .env");
}

interface JwtPayload {
    id: string;
}


declare module "express-serve-static-core" {
    interface Request {
        userId?: string;
    }
}


export const UserMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers["authorization"];
    if (!header) {
        res.status(401).json({ message: "Authorization header is missing" });
        return;
    }

    try {
        const decoded = jwt.verify(header, secret) as JwtPayload;
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(403).json({ message: "You are not logged in" });
    }
};
