"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
const course_route_1 = __importDefault(require("./routes/course.route"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Define allowed origins
const allowedOrigins = [
    'http://localhost:3000',
    'https://an-nahda-academy.vercel.app'
];
// CORS configuration with multiple origins support
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api', course_route_1.default);
app.use('/api/auth', auth_route_1.default);
// Connect to MongoDB
(0, db_1.default)();
app.get('/', (_req, res) => {
    res.send('API is running...');
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
