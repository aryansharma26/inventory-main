import { validationResult } from 'express-validator';
import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new ApiError(400, 'Validation failed', errors);
      }
      next(error);
    }
  };
};

export const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }
  next();
};
