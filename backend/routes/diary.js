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

const router = express.Router();

// Routes for diary entries
router.route('/')
  .post(authMiddleware, createEntryController)           // Create new entry
  .get(authMiddleware, getAllEntriesController);         // Get all entries for the user

router.route('/:id')
  .get(authMiddleware, getEntryByIdController)           // Get single entry by ID
  .put(authMiddleware, updateEntryController)            // Update entry
  .delete(authMiddleware, deleteEntryController);        // Delete entry

// Route for date range filtering
router.get('/range/date', authMiddleware, getEntriesInRangeController);  // start & end in query

// Route for year/month/day filtering
router.get('/time/:type/:value', authMiddleware, getEntriesByTimeController);  // e.g., /time/month/4

export default router;
