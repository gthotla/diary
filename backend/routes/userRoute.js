import express from 'express';
import {
  register,
  login,
  logout,
  getUser,
  updateUser,
  getAccessToken
} from '../controllers/user.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login a user
router.post('/login', login);

// Logout a user
router.post('/logout', authMiddleware, logout);

// Get current logged-in user's profile
router.get('/me', authMiddleware, getUser);

// Update current logged-in user's profile
router.put('/me', authMiddleware, updateUser);

// Refresh access token using refresh token
router.get('/token', getAccessToken);

export default router;
