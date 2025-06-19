import express from 'express';
import {
  createEntryController,
  getAllEntriesController,
  getEntryByIdController,
  updateEntryController,
  deleteEntryController,
  getEntriesInRangeController,
  getEntriesByTimeController
} from '../controllers/diary.js';

import { authMiddleware } from '../middleware/auth.js';
import uploadImages from '../middleware/uploadImages.js';


const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Diary
 *     description: Diary management endpoints
 */

/**
 * @swagger
 * /diary:
 *   post:
 *     summary: Create a new diary entry
 *     tags: [Diary]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Entry created successfully
 *   get:
 *     summary: Get all diary entries for the user
 *     tags: [Diary]
 *     responses:
 *       200:
 *         description: Entries retrieved successfully
 */
router.route('/')
  .post(authMiddleware, uploadImages, createEntryController)
  .get(authMiddleware, getAllEntriesController);

/**
 * @swagger
 * /diary/{id}:
 *   get:
 *     summary: Get diary entry by ID
 *     tags: [Diary]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Diary entry ID
 *     responses:
 *       200:
 *         description: Entry retrieved successfully
 *       404:
 *         description: Entry not found
 *   put:
 *     summary: Update diary entry
 *     tags: [Diary]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Diary entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Entry updated successfully
 *       404:
 *         description: Entry not found or not authorized
 *   delete:
 *     summary: Delete diary entry
 *     tags: [Diary]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Diary entry ID
 *     responses:
 *       200:
 *         description: Entry deleted successfully
 *       404:
 *         description: Entry not found or not authorized
 */
router.route('/:id')
  .get(authMiddleware, getEntryByIdController)
  .put(authMiddleware, updateEntryController)
  .delete(authMiddleware, deleteEntryController);

/**
 * @swagger
 * /diary/range/date:
 *   get:
 *     summary: Get diary entries by date range
 *     tags: [Diary]
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date in YYYY-MM-DD format
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Entries retrieved successfully
 */
router.get('/range/date', authMiddleware, getEntriesInRangeController);

/**
 * @swagger
 * /diary/time/{type}/{value}:
 *   get:
 *     summary: Get diary entries by time filter
 *     tags: [Diary]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [year, month, day]
 *         description: Filter type (year, month, or day)
 *       - in: path
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *         description: Value for the filter type (e.g., '2024' for year)
 *     responses:
 *       200:
 *         description: Entries retrieved successfully
 *       400:
 *         description: Invalid time filter type
 */
router.get('/time/:type/:value', authMiddleware, getEntriesByTimeController);

export default router;
