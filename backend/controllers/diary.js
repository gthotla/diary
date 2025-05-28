import asyncHandler from 'express-async-handler';
import {
  createDiaryEntry,
  getAllDiaryEntries,
  getDiaryEntryById,
  updateEntry,
  deleteEntry,
  getDiaryInRange,
  getEntriesByTime
} from '../services/diaryService.js';

// @desc    Create a new diary entry
// @route   POST /api/diary
// @access  Private
export const createEntryController = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    userId: req.user.userId // assuming user is added to req by auth middleware
  };

  const entry = await createDiaryEntry(data);
  res.status(201).json(entry);
});

// @desc    Get all diary entries for logged in user
// @route   GET /api/diary
// @access  Private
export const getAllEntriesController = asyncHandler(async (req, res) => {
  const entries = await getAllDiaryEntries(req.user.userId);
  res.status(200).json(entries);
});

// @desc    Get a diary entry by ID
// @route   GET /api/diary/:id
// @access  Private
export const getEntryByIdController = asyncHandler(async (req, res) => {
  const entry = await getDiaryEntryById(req.params.id, req.user.userId);
  if (!entry) {
    res.status(404);
    throw new Error('Entry not found');
  }
  res.status(200).json(entry);
});

// @desc    Update a diary entry
// @route   PUT /api/diary/:id
// @access  Private
export const updateEntryController = asyncHandler(async (req, res) => {
  const updated = await updateEntry(req.params.id, req.user.userId, req.body);
  if (!updated) {
    res.status(404);
    throw new Error('Entry not found or not authorized');
  }
  res.status(200).json(updated);
});

// @desc    Delete a diary entry
// @route   DELETE /api/diary/:id
// @access  Private
export const deleteEntryController = asyncHandler(async (req, res) => {
  const deleted = await deleteEntry(req.params.id, req.user.userId);
  if (!deleted) {
    res.status(404);
    throw new Error('Entry not found or not authorized');
  }
  res.status(200).json({ message: 'Entry deleted successfully' });
});

// @desc    Get entries by date range
// @route   GET /api/diary/range?start=YYYY-MM-DD&end=YYYY-MM-DD
// @access  Private
export const getEntriesInRangeController = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  const entries = await getDiaryInRange(req.user.userId, start, end);
  res.status(200).json(entries);
});

// @desc    Get entries by year/month/day
// @route   GET /api/diary/time/:type/:value
// @access  Private
export const getEntriesByTimeController = asyncHandler(async (req, res) => {
  const { type, value } = req.params;
  const validTypes = ['year', 'month', 'day'];
  if (!validTypes.includes(type)) {
    res.status(400);
    throw new Error('Invalid time filter type');
  }

  const entries = await getEntriesByTime(req.user.userId, type, value);
  res.status(200).json(entries);
});
