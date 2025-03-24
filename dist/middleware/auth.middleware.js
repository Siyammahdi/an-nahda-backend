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
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
// Protect routes middleware
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let token;
    // Check if token exists in headers or cookies
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];
    }
    else if ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token) {
        // Get token from cookie
        token = req.cookies.token;
    }
    // Check if token exists
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Not authorized to access this route',
        });
        return;
    }
    try {
        // Verify token
        // @ts-ignore - Ignoring type check for jwt.verify
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-default-jwt-secret-for-dev');
        // Get user from the token
        req.user = yield user_model_1.default.findById(decoded.id);
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Not authorized to access this route',
        });
    }
});
exports.protect = protect;
// Authorize roles middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized to access this route',
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`,
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
