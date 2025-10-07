// routes/authRoutes.ts
import express from 'express';
import { login, recover, register, resetPassword, registerMerchant } from '../controller/authController.js';

const router: express.Router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/register-merchant', registerMerchant);
router.post('/recover', recover);
router.post('/reset-password', resetPassword);

export default router;
