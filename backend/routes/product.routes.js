import { Router } from 'express';
import { verifyJWT, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/multer.js';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  duplicateProduct,
  getProductStats,
  getLowStockProducts,
} from '../controllers/product.controller.js';
import {
  createProductValidator,
  updateProductValidator,
  bulkDeleteValidator,
} from '../validators/product.validator.js';

const router = Router();

router.get('/stats', getProductStats);
router.get('/low-stock', getLowStockProducts);

router
  .route('/')
  .get(getAllProducts)
  .post(verifyJWT, requireRole('admin'), upload.single('image'), validate(createProductValidator), createProduct);

router
  .route('/:id')
  .get(getProductById)
  .patch(verifyJWT, requireRole('admin'), upload.single('image'), validate(updateProductValidator), updateProduct)
  .delete(verifyJWT, requireRole('admin'), deleteProduct);

router.post('/bulk-delete', verifyJWT, requireRole('admin'), validate(bulkDeleteValidator), bulkDeleteProducts);
router.post('/:id/duplicate', verifyJWT, requireRole('admin'), duplicateProduct);

export default router;
