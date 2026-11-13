import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.js';
import {
  createExpense, getAllExpenses, getExpenseById,
  updateExpense, deleteExpense, getExpenseStats
} from '../controllers/expense.controller.js';

const router = Router();

router.get('/stats', getExpenseStats);
router.route('/')
  .get(getAllExpenses)
  .post(verifyJWT, createExpense);
router.route('/:id')
  .get(getExpenseById)
  .patch(verifyJWT, updateExpense)
  .delete(verifyJWT, deleteExpense);

export default router;
