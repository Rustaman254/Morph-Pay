// routes/authRoutes.ts
import express from 'express';
import { login, recover, register, resetPassword } from '../controller/autController.js';

const router: express.Router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/recover', recover);
router.post('/reset-password', resetPassword);

export default router;
