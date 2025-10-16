import { Router } from 'express';
import { createBuyStablecoinOrder, confirmFiatAndReleaseCrypto, createSellStablecoinOrder, confirmFiatReceivedAndReleaseStablecoin } from '../controller/ordersController';

const router = Router();

router.post('/buy', createBuyStablecoinOrder);
router.post('/confirm', confirmFiatAndReleaseCrypto);
router.post('/sell', createSellStablecoinOrder);
router.post('/user-confirm', confirmFiatReceivedAndReleaseStablecoin);

export default router;
