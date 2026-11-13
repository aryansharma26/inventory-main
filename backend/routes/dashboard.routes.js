import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.js';
import { getDashboardStats } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/stats', verifyJWT, getDashboardStats);

export default router;