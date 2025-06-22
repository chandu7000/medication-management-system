import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/init.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { registerValidation, loginValidation, validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Register new user
router.post('/register', registerValidation, validateRequest, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      try {
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        db.run(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [name, email, hashedPassword, role],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ message: 'Failed to create user' });
            }

            const userId = this.lastID;
            const token = generateToken(userId);

            res.status(201).json({
              message: 'User created successfully',
              token,
              user: {
                id: userId,
                name,
                email,
                role
              }
            });
          }
        );
      } catch (hashError) {
        console.error('Password hashing error:', hashError);
        res.status(500).json({ message: 'Failed to process password' });
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
router.post('/login', loginValidation, validateRequest, (req, res) => {
  try {
    const { email, password } = req.body;

    db.get(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }

        if (!user) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        try {
          const isValidPassword = await bcrypt.compare(password, user.password);

          if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
          }

          const token = generateToken(user.id);

          res.json({
            message: 'Login successful',
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          });
        } catch (compareError) {
          console.error('Password comparison error:', compareError);
          res.status(500).json({ message: 'Authentication failed' });
        }
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    message: 'Token is valid',
    user: req.user
  });
});

export default router;