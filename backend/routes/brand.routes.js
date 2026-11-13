import { Router } from 'express';
import { verifyJWT, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  getActiveBrands,
} from '../controllers/brand.controller.js';
import { createBrandValidator, updateBrandValidator } from '../validators/product.validator.js';

const router = Router();

router.get('/active', getActiveBrands);

router
  .route('/')
  .get(getAllBrands)
  .post(verifyJWT, requireRole('admin'), validate(createBrandValidator), createBrand);

router
  .route('/:id')
  .get(getBrandById)
  .patch(verifyJWT, requireRole('admin'), validate(updateBrandValidator), updateBrand)
  .delete(verifyJWT, requireRole('admin'), deleteBrand);

export default router;
