import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import courseRoutes from './routes/course.route';
import authRoutes from './routes/auth.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://an-nahda-academy.vercel.app'
];

// CORS configuration with multiple origins support
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', courseRoutes);
app.use('/api/auth', authRoutes);

// Connect to MongoDB
connectDB();

app.get('/', (_req, res) => {
    res.send('API is running...');
  });
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});