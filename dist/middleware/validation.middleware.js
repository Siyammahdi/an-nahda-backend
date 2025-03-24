"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = exports.registerValidation = void 0;
const express_validator_1 = require("express-validator");
// Validation rules for user registration
exports.registerValidation = [
    (0, express_validator_1.body)('name')
        .not()
        .isEmpty()
        .withMessage('Name is required')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please include a valid email')
        .normalizeEmail()
        .toLowerCase(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number'),
];
// Validation rules for user login
exports.loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please include a valid email')
        .normalizeEmail()
        .toLowerCase(),
    (0, express_validator_1.body)('password')
        .not()
        .isEmpty()
        .withMessage('Password is required'),
];
