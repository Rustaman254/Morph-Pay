import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRouter.js';
import userManagementRoutes from './routes/userManagementRoutes.js';
import dotenv from 'dotenv';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/v1/auth/', authRoutes);
app.use('/api/v1/p2p/', orderRoutes);
// app.use('/api/v1/p2p/', userManagementRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
