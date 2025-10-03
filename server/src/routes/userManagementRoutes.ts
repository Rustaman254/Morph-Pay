import express from "express";
import { getUser, listUsers } from "../controller/userManagement.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/users", requireAuth, listUsers);
router.get("/user/:contact", requireAuth, getUser);

export default router;
