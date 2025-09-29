import type { Request, Response } from 'express';
import { Wallet } from 'ethers';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/db';

// Validation functions
function isEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isPhone(phone: string): boolean {
    return /^\+[1-9]\d{9,14}$/.test(phone);
}

// Registration Controller
export const register = async (req: Request, res: Response) => {
    try {
        const {
            phone, email, password, country, fname, lname,
            isAgent, 
            businessName, legalEntityType, registrationNumber,
            businessEmail, website
        } = req.body;

        const contact = phone || email;
        if (!contact || !(isPhone(contact) || isEmail(contact))) {
            return res.status(400).json({ error: "Invalid phone number or email." });
        }
        if (!password || password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters." });
        }

        const db = await connectDB();
        const users = db.collection('users');
        const businesses = db.collection('businesses');

        // Check for existing peer
        const existPeer = await users.findOne({ contact });
        if (existPeer) {
            return res.status(409).json({ error: "Contact already registered" });
        }

        let businessId: string | undefined = undefined;

        // Register business if business details provided
        if (businessName && legalEntityType && businessEmail) {
            const existBiz = await businesses.findOne({ contactEmail: businessEmail });
            if (existBiz) {
                businessId = existBiz._id.toString();
            } else {
                const bizWallet = Wallet.createRandom();
                const bizDoc = {
                    businessName,
                    legalEntityType,
                    registrationNumber,
                    contactEmail: businessEmail,
                    address: bizWallet.address,
                    publicKey: bizWallet.publicKey,
                    website,
                    isApproved: false,      
                    kycStatus: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                const bizResult = await businesses.insertOne(bizDoc);
                businessId = bizResult.insertedId.toString();
            }
        }

        // Register peer (agent or non-agent)
        const passwordHash = await bcrypt.hash(password, 12);
        const wallet = Wallet.createRandom();
        const did = `did:ethr:${wallet.address}`;

        const userDoc = {
            contact,
            fname,
            lname,
            country,
            passwordHash,
            did,
            address: wallet.address,
            publicKey: wallet.publicKey,
            isAgent: isAgent || false,
            businessId,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await users.insertOne(userDoc);

        res.json({
            did,
            address: wallet.address,
            publicKey: wallet.publicKey,
            contact,
            isAgent: userDoc.isAgent,
            businessId
        });
    } catch (err) {
        res.status(500).json({
            message: (err as Error).message
        });
    }
};
