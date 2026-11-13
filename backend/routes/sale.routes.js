import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.js';
import {
  createSale, getAllSales, getSaleById, refundSale, deleteSale, getSaleStats
} from '../controllers/sale.controller.js';

const router = Router();

router.get('/stats', getSaleStats);
router.route('/')
  .get(getAllSales)
  .post(verifyJWT, createSale);
router.route('/:id')
  .get(getSaleById)
  .delete(verifyJWT, deleteSale);
router.post('/:id/refund', verifyJWT, refundSale);

export default router;
