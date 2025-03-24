"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.sendTokenResponse = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Get JWT secret from environment variables or use a default (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret-for-dev';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';
const COOKIE_EXPIRE = parseInt(process.env.COOKIE_EXPIRE || '30', 10);
// Generate JWT token
const generateToken = (id) => {
    // @ts-ignore - Ignoring type check for jwt.sign
    return jsonwebtoken_1.default.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};
exports.generateToken = generateToken;
// Send token in a cookie and response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = (0, exports.generateToken)(user._id);
    // Get environment
    const isProduction = process.env.NODE_ENV === 'production';
    // Cookie options
    const options = {
        expires: new Date(Date.now() + COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
    };
    // Remove password from response
    user.password = undefined;
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
        success: true,
        token,
        user,
    });
};
exports.sendTokenResponse = sendTokenResponse;
// Verify JWT token
const verifyToken = (token) => {
    try {
        // @ts-ignore - Ignoring type check for jwt.verify
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
