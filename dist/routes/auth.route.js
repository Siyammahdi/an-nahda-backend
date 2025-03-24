"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = express_1.default.Router();
// Public routes
router.post('/register', validation_middleware_1.registerValidation, auth_controller_1.register);
router.post('/login', validation_middleware_1.loginValidation, auth_controller_1.login);
router.get('/logout', auth_controller_1.logout);
// Protected routes
router.get('/me', auth_middleware_1.protect, auth_controller_1.getMe);
exports.default = router;
