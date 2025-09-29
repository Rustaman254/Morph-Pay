import type { Request, Response } from 'express';
import { Wallet } from 'ethers';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/db'

function isEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPhone(phone: string): boolean {
    return /^\+[1-9]\d{9,14}$/.test(phone);
}

export const register = async (req: Request, res: Response) => {
    try {
        const { phone, email, password } = req.body;
        const contact = phone || email;

        if (!contact || !(isPhone(contact) || isEmail(contact))) {
            return res.status(400).json({ error: "Invalid phone number or email." });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters." });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const wallet = Wallet.createRandom();
        const did = `did:ethr:${wallet.address}`;

        // TODO: generate user's Models
        const db = await connectDB();
        const users = db.collection('users');

        const exist = await users.findOne({contact});
        if (exist) {
            res.status(409).json({error: "Contact already registered"})
        }

        const userDoc = {
            contact,
            passwordHash,
            did,    
            address: wallet.address,
            publicKey: wallet.publicKey,
            cretedAt: new Date()
        }

        await users.insertOne(userDoc);

        res.json({
            did,
            address: wallet.address,
            publicKey: wallet.publicKey,
            contact
        });
    } catch (err) {
        res.status(500).json({
            message: (err as Error).message
        });
    }
}

