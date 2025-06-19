import express from 'express';
import {
  register,
  login,
  logout,
  getUser,
  updateUser,
  UpdateProfile,
  getAccessToken
} from '../controllers/user.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management endpoints
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     description: Creates a new user with username, email, password, dob, and profile. Returns tokens and user data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               profile:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 */
router.post('/register', register);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
 *     description: Authenticates user with email and password. Returns tokens and user data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid email or password
 */
router.post('/login', login);

/**
 * @swagger
 * /user/logout:
 *   get:
 *     summary: Logout the current user
 *     tags: [User]
 *     description: Clears access and refresh tokens from cookies to logout the user.
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.get('/logout', authMiddleware, logout);

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [User]
 *     description: Returns the profile of the currently logged-in user, excluding password.
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 */
router.get('/me', authMiddleware, getUser);

/**
 * @swagger
 * /user/update-profile:
 *   put:
 *     summary: Update current user's profile
 *     tags: [User]
 *     description: Updates the profile details of the currently logged-in user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                profile:
 *              
 *     responses:
 *       200:
 *         description: User Profile updated successfully
 *       404:
 *         description: User not found or can't update
 */
router.patch('/update-profile', authMiddleware, UpdateProfile);


/**
 * @swagger
 * /user/me:
 *   put:
 *     summary: Update current user's profile
 *     tags: [User]
 *     description: Updates the profile details of the currently logged-in user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               profile:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found or can't update
 */
router.put('/me', authMiddleware, updateUser);

/**
 * @swagger
 * /user/token:
 *   get:
 *     summary: Refresh access token
 *     tags: [User]
 *     description: Generates a new access token using the refresh token from cookies.
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *       401:
 *         description: No token provided
 *       403:
 *         description: Invalid refresh token
 */
router.get('/token', getAccessToken);

export default router;
