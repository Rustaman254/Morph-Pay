import type { Request, Response } from 'express';
import { connectDB } from '../config/db.js';

export const listUsers = async (req: Request, res: Response) => {
    try {
        const db = await connectDB();
        const users = db.collection('users');
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 25;

        const total = await users.countDocuments();
        const data = await users.find({})
            .skip((page-1) * pageSize)
            .limit(pageSize)
            .project({ passwordHash: 0 }) 
            .toArray();

        res.json({ total, page, pageSize, data });
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const contact = req.params.contact; 
        if (!contact) return res.status(400).json({ error: "contact required" });
        const db = await connectDB();
        const users = db.collection('users');
        const user = await users.findOne({ contact }, { projection: { passwordHash: 0 } });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
};


