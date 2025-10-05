import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRouter';
import p2pEscrow from './routes/p2pEscrowRoutes';
import userManagementRoutes from './routes/userManagementRoutes';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use('/api/v1/auth/', authRoutes);
app.use('/api/v1/p2p/', p2pEscrow);
app.use('/api/v1/p2p/', userManagementRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map