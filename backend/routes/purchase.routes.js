import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.js';
import {
  createPurchase, getAllPurchases, getPurchaseById,
  receivePurchase, returnPurchase, deletePurchase, getPurchaseStats
} from '../controllers/purchase.controller.js';

const router = Router();

router.get('/stats', getPurchaseStats);
router.route('/')
  .get(getAllPurchases)
  .post(verifyJWT, createPurchase);
router.route('/:id')
  .get(getPurchaseById)
  .delete(verifyJWT, deletePurchase);
router.post('/:id/receive', verifyJWT, receivePurchase);
router.post('/:id/return', verifyJWT, returnPurchase);

export default router;
