import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.js';
import {
  getInventory, adjustStock, getStockHistory, getInventoryStats
} from '../controllers/inventory.controller.js';

const router = Router();

router.get('/stats', getInventoryStats);
router.get('/history', getStockHistory);
router.route('/')
  .get(getInventory)
  .post(verifyJWT, adjustStock);

export default router;
