"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const express_validator_1 = require("express-validator");
const user_model_1 = __importDefault(require("../models/user.model"));
const jwt_util_1 = require("../utils/jwt.util");
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const { name, email, password } = req.body;
        // Check if user already exists
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User with this email already exists',
            });
            return;
        }
        // Create new user
        const user = yield user_model_1.default.create({
            name,
            email,
            password,
        });
        // Send token response
        (0, jwt_util_1.sendTokenResponse)(user, 201, res);
    }
    catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
exports.register = register;
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const { email, password } = req.body;
        // Find user by email and include password
        const user = yield user_model_1.default.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }
        // Check if password matches
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }
        // Send token response
        (0, jwt_util_1.sendTokenResponse)(user, 200, res);
    }
    catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
exports.login = login;
// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
const logout = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        message: 'User logged out successfully',
    });
});
exports.logout = logout;
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error('Get me error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
exports.getMe = getMe;
