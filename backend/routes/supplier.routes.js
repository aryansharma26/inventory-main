import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createSupplier, getAllSuppliers, getSupplierById,
  updateSupplier, deleteSupplier, getActiveSuppliers
} from '../controllers/supplier.controller.js';
import { createSupplierValidator } from '../validators/product.validator.js';

const router = Router();

router.get('/active', getActiveSuppliers);
router.route('/')
  .get(getAllSuppliers)
  .post(verifyJWT, validate(createSupplierValidator), createSupplier);
router.route('/:id')
  .get(getSupplierById)
  .patch(verifyJWT, updateSupplier)
  .delete(verifyJWT, deleteSupplier);

export default router;
