import jwt from 'jsonwebtoken';
import { Response } from 'express';

// Get JWT secret from environment variables or use a default (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret-for-dev';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';
const COOKIE_EXPIRE = parseInt(process.env.COOKIE_EXPIRE || '30', 10);

// Generate JWT token
export const generateToken = (id: string): string => {
  // @ts-ignore - Ignoring type check for jwt.sign
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Send token in a cookie and response
export const sendTokenResponse = (
  user: any,
  statusCode: number,
  res: Response
): void => {
  // Create token
  const token = generateToken(user._id);

  // Cookie options
  const options = {
    expires: new Date(Date.now() + COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    // @ts-ignore - Ignoring type check for jwt.verify
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}; 