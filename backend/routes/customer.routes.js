import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createCustomer, getAllCustomers, getCustomerById,
  updateCustomer, deleteCustomer, getActiveCustomers
} from '../controllers/customer.controller.js';
import { createCustomerValidator } from '../validators/product.validator.js';

const router = Router();

router.get('/active', getActiveCustomers);
router.route('/')
  .get(getAllCustomers)
  .post(verifyJWT, validate(createCustomerValidator), createCustomer);
router.route('/:id')
  .get(getCustomerById)
  .patch(verifyJWT, updateCustomer)
  .delete(verifyJWT, deleteCustomer);

export default router;
