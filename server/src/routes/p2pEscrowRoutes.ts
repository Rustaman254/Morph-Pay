import express from "express";
import {
  acceptOrderAndStkPush,
  mpesaCallbackHandler,
  buyStablecoin,
  sellStablecoin,
  depositConfirm,
  fiatConfirm,
  dispute,
  resolve,
} from "../controller/p2pEscrowController.js";
import { generateToken } from "../middleware/mpesaAuth";

const router = express.Router();

router.post("/buy-stablecoin", buyStablecoin);
router.post("/sell-stablecoin", sellStablecoin);
router.post("/:orderId/deposit-confirm", depositConfirm);
router.post("/:orderId/fiat-confirm", fiatConfirm);
router.post("/:orderId/dispute", dispute);
router.post("/:orderId/resolve", resolve);
router.post("/:orderId/accept", generateToken, acceptOrderAndStkPush);
router.post("/mpesa/callback", mpesaCallbackHandler);

export default router;
