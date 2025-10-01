import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrivyClient } from '@privy-io/node';
import { connectDB } from '../config/db';

// Validation functions
function isEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isPhone(phone: string): boolean {
    return /^\+[1-9]\d{9,14}$/.test(phone);
}

// Privy SDK initialization
const privy = new PrivyClient({
    appId: process.env.PRIVY_APP_ID!,
    appSecret: process.env.PRIVY_APP_SECRET!
});

// Registration Controller with privyWalletId added
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

        const existPeer = await users.findOne({ contact });
        if (existPeer) {
            return res.status(409).json({ error: "Contact already registered" });
        }

        let businessId: string | undefined = undefined;

        // Create wallet via Privy for business if needed
        let bizWalletData;
        if (businessName && legalEntityType && businessEmail) {
            const existBiz = await businesses.findOne({ contactEmail: businessEmail });
            if (existBiz) {
                businessId = existBiz._id.toString();
            } else {
                bizWalletData = await privy.wallets().create({ chain_type: 'ethereum' });
                const bizDoc = {
                    businessName,
                    legalEntityType,
                    registrationNumber,
                    contactEmail: businessEmail,
                    address: bizWalletData.address,
                    publicKey: bizWalletData.publicKey,
                    privyWalletId: bizWalletData.id, // Store Privy wallet ID
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

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create wallet via Privy for user
        const userWalletData = await privy.wallets().create({ chain_type: 'ethereum' });
        const did = `did:ethr:${userWalletData.address}`;

        const userDoc = {
            contact,
            fname,
            lname,
            country,
            passwordHash,
            did,
            address: userWalletData.address,
            publicKey: userWalletData.publicKey,
            privyWalletId: userWalletData.id, // Store Privy wallet ID
            isAgent: isAgent || false,
            businessId,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await users.insertOne(userDoc);

        res.json({
            did,
            address: userWalletData.address,
            publicKey: userWalletData.publicKey,
            privyWalletId: userWalletData.id, // Return Privy wallet ID for reference
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
