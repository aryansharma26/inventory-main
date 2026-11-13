import { Router } from 'express';
import { verifyJWT, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getActiveCategories,
} from '../controllers/category.controller.js';
import { createCategoryValidator, updateCategoryValidator } from '../validators/product.validator.js';

const router = Router();

router.get('/active', getActiveCategories);

router
  .route('/')
  .get(getAllCategories)
  .post(verifyJWT, requireRole('admin'), validate(createCategoryValidator), createCategory);

router
  .route('/:id')
  .get(getCategoryById)
  .patch(verifyJWT, requireRole('admin'), validate(updateCategoryValidator), updateCategory)
  .delete(verifyJWT, requireRole('admin'), deleteCategory);

export default router;
