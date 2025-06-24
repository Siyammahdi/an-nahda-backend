import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import courseRoutes from './routes/course.route';
import authRoutes from './routes/auth.route';
import adminRoutes from './routes/admin.route';
import paymentRoutes from './routes/payment.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://an-nahda-academy.vercel.app',
  'https://www.annahda.net',
  'https://annahda.net',
  'https://nahdalife.vercel.app'
];

// CORS configuration with multiple origins support
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('Blocked by CORS: ', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For SSLCommerz IPN
app.use(cookieParser());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api', courseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Connect to MongoDB
connectDB();

app.get('/', (_req, res) => {
    res.json({
      message: 'An-Nahda Backend API is running...',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        payment_test: '/api/payment/test',
        payment_init: '/api/payment/sslcommerz/init'
      }
    });
  });
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Payment test: http://localhost:${PORT}/api/payment/test`);
});