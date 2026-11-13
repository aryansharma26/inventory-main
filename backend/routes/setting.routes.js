import { Router } from 'express';
import { verifyJWT, requireRole } from '../middleware/auth.js';
import { getSettings, updateSettings } from '../controllers/setting.controller.js';

const router = Router();

router.route('/')
  .get(getSettings)
  .patch(verifyJWT, requireRole('admin'), updateSettings);

export default router;
