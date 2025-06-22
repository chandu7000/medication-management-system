import jwt from 'jsonwebtoken';
import { db } from '../database/init.js';

import dotenv from 'dotenv';

dotenv.config(); // Add this

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment');
}

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Authenticate JWT token and attach user to request
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    const userId = decoded.id;

    db.get(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }

        if (!user) {
          return res.status(403).json({ message: 'User not found' });
        }

        req.user = user;
        next();
      }
    );
  });
};
