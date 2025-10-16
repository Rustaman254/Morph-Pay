import { Router } from 'express';
import { createBuyStablecoinOrder, confirmFiatAndReleaseCrypto } from '../controller/ordersController';

const router = Router();

router.post('/buy', createBuyStablecoinOrder);
router.post('/confirm', confirmFiatAndReleaseCrypto);

export default router;
