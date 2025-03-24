import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// Define a custom interface to extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Protect routes middleware
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token;

  // Check if token exists in headers or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-default-jwt-secret-for-dev'
    ) as { id: string };

    // Get user from the token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Authorize roles middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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