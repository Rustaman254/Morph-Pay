import jwt from "jsonwebtoken";
import type{ Request, Response, NextFunction } from 'express';
import { error } from "console";

const JWT_SECRET = process.env.JWT_SECRET || "";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided." });
    }
    const token = authHeader.split(" ")[1];
    if (token == undefined) {
        throw new Error("No token")
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; ``
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
}
