import { body } from 'express-validator';

// Validation rules for user registration
export const registerValidation = [
  body('name')
    .not()
    .isEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

// Validation rules for user login
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .not()
    .isEmpty()
    .withMessage('Password is required'),
]; 