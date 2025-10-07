import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrivyClient } from '@privy-io/node';
import { connectDB } from '../config/db.js';
import { createViemAccount } from '@privy-io/node/viem';
import { createPublicClient, http } from "viem";
import { toKernelSmartAccount } from "permissionless/accounts";
import { baseSepolia } from "viem/chains";
import { entryPoint07Address } from "viem/account-abstraction";
import { User, UserRole, UserStatus } from '../models/user/User.js';
import { Merchant, MerchantService, MerchantStatus } from '../models/user/Merchants.js';
import type{SupportedAsset, PaymentMethod} from '../models/user/Merchants.js';

function isEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isPhone(phone: string): boolean {
    return /^\+[1-9]\d{9,14}$/.test(phone);
}
function normalizePhone(phone: string): string {
    return phone && phone[0] === '+' ? phone.slice(1) : phone;
}

const privy = new PrivyClient({
    appId: process.env.PRIVY_APP_ID!,
    appSecret: process.env.PRIVY_APP_SECRET!
});

const JWT_SECRET = process.env.JWT_SECRET || "";

// REGISTER USER
export const register = async (req: Request, res: Response) => {
    try {
        await connectDB();

        const {
            email,
            phone,
            password,
            country,
            fname,
            lname,
            dateOfBirth,
            avatar,
            language,
            currency,
            notifications,
            security,
            isAgent
        } = req.body;

        if (!phone) return res.status(400).json({ error: "Phone number is required for registration." });
        if (!isPhone(phone)) return res.status(400).json({ error: "Invalid phone format." });
        const contact = normalizePhone(phone);

        if (!password || password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

        let existUser = await User.findOne({ phone: contact });
        if (existUser) return res.status(409).json({ error: "Contact already registered" });

        const passwordHash = await bcrypt.hash(password, 12);

        // Wallet creation logic
        const userWalletData = await privy.wallets().create({ chain_type: 'ethereum' });
        const did = `did:ethr:${userWalletData.address}`;

        const userViemAccount = await createViemAccount(privy, {
            walletId: userWalletData.id,
            address: userWalletData.address as `0x${string}`
        });

        const publicClient = createPublicClient({
            chain: baseSepolia,
            transport: http(process.env.RPC_URL!)
        });

        const smartAccount = await toKernelSmartAccount({
            client: publicClient,
            entryPoint: { address: entryPoint07Address, version: '0.7' },
            owners: [userViemAccount]
        });

        // Build User doc
        const userDoc = new User({
            email: email ?? "",
            phone: contact,
            password: passwordHash,
            role: UserRole.USER,
            status: UserStatus.ACTIVE,
            profile: {
                firstName: fname,
                lastName: lname,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                avatar
            },
            preferences: {
                language: language ?? 'en',
                currency: currency ?? 'USD',
                notifications: {
                    email: notifications?.email ?? true,
                    push: notifications?.push ?? true,
                    sms: notifications?.sms ?? false
                },
                security: {
                    twoFactorEnabled: security?.twoFactorEnabled ?? false,
                    biometricsEnabled: security?.biometricsEnabled ?? false
                }
            },
            metadata: {
                registrationIp: req.ip,
                lastLoginAt: new Date(),
                loginCount: 0
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            did,
            evmAddress: userWalletData.address,
            publicKey: userWalletData.public_key,
            privyWalletId: userWalletData.id,
            smartWalletAddress: smartAccount.address,
            isAgent: isAgent || false
        });

        await userDoc.save();

        const jwtPayload = {
            userId: userDoc._id,
            did: userDoc.did,
            fname: userDoc.profile.firstName,
            lname: userDoc.profile.lastName,
            isAgent: userDoc.isAgent,
            merchantId: undefined,
        };

        const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            token,
            did: userDoc.did,
            evmAddress: userDoc.evmAddress,
            publicKey: userDoc.publicKey,
            privyWalletId: userDoc.privyWalletId,
            smartWalletAddress: userDoc.smartWalletAddress,
            contact: userDoc.phone,
            email: userDoc.email,
            isAgent: userDoc.isAgent
        });
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
};

// REGISTER MERCHANT
export const registerMerchant = async (req: Request, res: Response) => {
    try {
        await connectDB();

        const {
            userId,
            businessName,
            businessDescription,
            website,
            logo,
            registrationNumber,
            supportedAssets,
            paymentMethods,
            services,
            operatingHours
        } = req.body;

        if (!userId)
            return res.status(400).json({ error: "UserId is required for merchant registration." });
        if (!businessName)
            return res.status(400).json({ error: "Business name is required." });

        // Ensure the user exists
        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ error: "User not found." });

        // Ensure no duplicate merchant profile
        const existMerchant = await Merchant.findOne({ userId });
        if (existMerchant)
            return res.status(409).json({ error: "Merchant profile already exists for this user." });

        // --- ENUM NORMALIZATION, TYPE-SAFE ---
        const normalizedSupportedAssets = Array.isArray(supportedAssets)
            ? supportedAssets.map((sa: SupportedAsset) => ({
                ...sa,
                assetType: typeof sa.assetType === "string" ? sa.assetType.toLowerCase() : sa.assetType
            }))
            : [];
        const normalizedPaymentMethods = Array.isArray(paymentMethods)
            ? paymentMethods.map((pm: PaymentMethod) => ({
                ...pm,
                type: typeof pm.type === "string" ? pm.type.toLowerCase() : pm.type
            }))
            : [];
        const normalizedServices = Array.isArray(services)
            ? services.map((s: string) => typeof s === "string" ? s.toLowerCase() : s)
            : [];

        // Create merchant profile
        const merchantDoc = new Merchant({
            userId,
            business: {
                name: businessName,
                description: businessDescription ?? "",
                website: website ?? "",
                logo: logo ?? "",
                registrationNumber: registrationNumber ?? ""
            },
            capabilities: {
                supportedAssets: normalizedSupportedAssets,
                paymentMethods: normalizedPaymentMethods,
                services: normalizedServices.length ? normalizedServices : [MerchantService.BUY, MerchantService.SELL],
                operatingHours: operatingHours ?? { timezone: 'UTC', hours: [] }
            },
            limits: {
                daily: { totalAmount: 100000, transactionCount: 100, usedAmount: 0, usedCount: 0 },
                monthly: { totalAmount: 1000000, transactionCount: 1000, usedAmount: 0, usedCount: 0 },
                perTransaction: { min: 10, max: 50000 }
            },
            performance: {
                rating: 0, completedTrades: 0, successRate: 0,
                averageResponseTime: 0, disputeRate: 0
            },
            status: MerchantStatus.DRAFT,
            verification: { status: 'pending', submittedAt: new Date(), documents: [] },
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await merchantDoc.save();

        // Ensure user's role is updated
        if (user.role !== UserRole.MERCHANT) {
            user.role = UserRole.MERCHANT;
            await user.save();
        }

        res.status(201).json({
            merchantId: merchantDoc._id,
            userId,
            business: merchantDoc.business,
            capabilities: merchantDoc.capabilities,
            status: merchantDoc.status
        });
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
    try {
        await connectDB();

        let { contact, password } = req.body;

        if (!contact || (!isPhone(contact) && !isEmail(contact))) {
            return res.status(400).json({ error: "Invalid phone number or email." });
        }
        if (isPhone(contact)) {
            contact = normalizePhone(contact);
        }
        if (!password) {
            return res.status(400).json({ error: "Password required." });
        }

        const user = await User.findOne({ phone: contact });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        // Find merchant profile, if exists
        const merchant = await Merchant.findOne({ userId: user._id });

        const jwtPayload = {
            userId: user._id,
            did: user.did,
            fname: user.profile.firstName,
            lname: user.profile.lastName,
            isAgent: user.isAgent,
            merchantId: merchant ? merchant._id : undefined,
        };

        const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            token,
            did: user.did,
            address: user.evmAddress,
            publicKey: user.publicKey,
            privyWalletId: user.privyWalletId,
            contact: user.phone,
            isAgent: user.isAgent,
            merchantId: jwtPayload.merchantId,
        });
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
};

// RESET PASSWORD
export const resetPassword = async (req: Request, res: Response) => {
    try {
        await connectDB();

        let { contact, token, password } = req.body;
        if (!contact || !token || !password || password.length < 8) {
            return res.status(400).json({ error: "All fields required and password must be at least 8 characters." });
        }
        if (isPhone(contact)) contact = normalizePhone(contact);

        const { PasswordReset } = await import("../models/user/PasswordReset.js");
        const recovery = await PasswordReset.findOne({
            contact,
            used: false,
            expires: { $gt: new Date() }
        });

        if (!recovery) {
            return res.status(400).json({ error: "Invalid or expired recovery token." });
        }

        const tokenValid = await bcrypt.compare(token, recovery.tokenHash);
        if (!tokenValid) {
            return res.status(400).json({ error: "Invalid or expired recovery token." });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        await User.updateOne({ phone: contact }, { $set: { password: passwordHash } });

        recovery.used = true;
        await recovery.save();

        return res.json({ message: "Password reset successful." });
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
};

// RECOVER
export const recover = async (req: Request, res: Response) => {
    try {
        await connectDB();

        let { contact } = req.body;
        if (!contact || (!isPhone(contact) && !isEmail(contact))) {
            return res.status(400).json({ error: "Invalid phone number or email." });
        }
        if (isPhone(contact)) contact = normalizePhone(contact);

        const user = await User.findOne({ phone: contact });
        if (!user) {
            return res.status(200).json({ message: "If an account exists, recovery instructions have been sent." });
        }

        const token = jwt.sign(
            {
                contact,
                type: "password-reset"
            },
            JWT_SECRET,
            { expiresIn: "30m" }
        );

        // TODO: Send token to user via email/SMS as reset URL

        return res.status(200).json({
            message: "If an account exists, recovery instructions have been sent."
        });
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
};

// UPDATE PROFILE
export const updateUser = async (req: Request, res: Response) => {
    try {
        await connectDB();

        const { contact, email, fname, lname, country, password, isAgent, businessId, smartWalletAddress, evmAddress, publicKey, privyWalletId, status, profile, preferences } = req.body;

        if (!contact || (!isPhone(contact) && !isEmail(contact))) {
            return res.status(400).json({ error: "Invalid phone number or email used for identification." });
        }
        const normalizedContact = isPhone(contact) ? normalizePhone(contact) : contact;

        const updateDoc: Record<string, any> = {};
        if (email !== undefined) {
            if (email && !isEmail(email)) {
                return res.status(400).json({ error: "Invalid email format." });
            }
            updateDoc.email = email;
        }
        if (fname !== undefined || lname !== undefined || profile !== undefined) {
            updateDoc.profile = {
                ...(profile || {}),
                ...(fname !== undefined && { firstName: fname }),
                ...(lname !== undefined && { lastName: lname })
            };
        }
        if (country !== undefined) updateDoc.country = country;
        if (typeof password === "string" && password.length > 0) {
            if (password.length < 8) {
                return res.status(400).json({ error: "Password must be at least 8 characters." });
            }
            updateDoc.password = await bcrypt.hash(password, 12);
        }
        if (isAgent !== undefined) updateDoc.isAgent = isAgent;
        if (businessId !== undefined) updateDoc.businessId = businessId;
        if (smartWalletAddress !== undefined) updateDoc.smartWalletAddress = smartWalletAddress;
        if (evmAddress !== undefined) updateDoc.evmAddress = evmAddress;
        if (publicKey !== undefined) updateDoc.publicKey = publicKey;
        if (privyWalletId !== undefined) updateDoc.privyWalletId = privyWalletId;
        if (status !== undefined) updateDoc.status = status;
        if (preferences !== undefined) updateDoc.preferences = preferences;
        updateDoc.updatedAt = new Date();

        const user = await User.findOneAndUpdate({ phone: normalizedContact }, { $set: updateDoc }, { new: true });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
};
