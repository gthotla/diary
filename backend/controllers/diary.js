import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';
import {
  createDiaryEntry,
  getAllDiaryEntries,
  getDiaryEntryById,
  updateEntry,
  deleteEntry,
  getDiaryInRange,
  getEntriesByTime
} from '../services/diaryService.js';

import {
  uploadFile,
  deleteFile,
  getCloudFrontSignedUrl as getCFSignedUrl
} from '../services/awsS3.js';
import { response } from 'express';

// Helper to upload one file and return { key, url }
const uploadFileToS3 = async (file) => {
  const key = `${uuidv4()}-${file.originalname}`;
  await uploadFile(file.buffer, key, file.mimetype);
  const url = await getCFSignedUrl(key, 3600);
  return { key, url };
 // return {key};
};

// @desc Create a new diary entry
// @route POST /api/diary
// @access Private
export const createEntryController = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    userId: req.user.userId
  };

  if (req.files && req.files.length > 0) {
    const uploadedImages = await Promise.all(req.files.map(uploadFileToS3));
    data.images = uploadedImages.map(img => ({ key: img.key })); // Only store key in DB
  }

  const entry = await createDiaryEntry(data);
  console.log('Created Entry:', entry);
  res.status(201).json(entry);
});

// @desc Get all diary entries for logged in user
// @route GET /api/diary
// @access Private
export const getAllEntriesController = asyncHandler(async (req, res) => {
  const entries = await getAllDiaryEntries(req.user.userId);

 const response= entries.map(entry => ({
    _id: entry._id,   
    title: entry.title,
    content: entry.entry,
    date: entry.date,
    mood: entry.mood,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,     
 }));


 // console.log('Updated Entries:', updateEntries);
  // Return the updated entries with signed URLs for images

  res.status(200).json(response);
});

// @desc Get a diary entry by ID
// @route GET /api/diary/:id
// @access Private
export const getEntryByIdController = asyncHandler(async (req, res) => {

  const entry = await getDiaryEntryById(req.params.id, req.user.userId);
  if (!entry) {
    res.status(404);
    throw new Error('Entry not found');
  }

   try {
    entry.images = await Promise.all(entry.images.map(async (img) => {
      const url = await getCFSignedUrl(img.key, 3600);
      return { key: img.key, url };
    }));

  } catch (err) {
    console.error("Signed URL error:", err);
    throw new Error("CloudFront URL generation failed");
  }
  const response={
    _id: entry._id,
    title: entry.title,
    content: entry.entry,
    date: entry.date,
    mood: entry.mood,
    images: entry.images.map(img=>({url:img.url})), // Now contains { key, url }
    videos: entry.videos,
    links: entry.links,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt
  }
  console.log('Response Entry:', response);
  res.status(200).json(response);
});

// @desc Update a diary entry
// @route PUT /api/diary/:id
// @access Private
export const updateEntryController = asyncHandler(async (req, res) => {
  const updated = await updateEntry(req.params.id, req.user.userId, req.body);
  if (!updated) {
    res.status(404);
    throw new Error('Entry not found or not authorized');
  }
  console.log('Updated Entry:', updated);
  res.status(200).json(updated);
});

// @desc Delete a diary entry
// @route DELETE /api/diary/:id
// @access Private
export const deleteEntryController = asyncHandler(async (req, res) => {
  const deleted = await deleteEntry(req.params.id, req.user.userId);
  if (!deleted) {
    res.status(404);
    throw new Error('Entry not found or not authorized');
  }

  // Optional: Delete related S3 images too (if needed)
  if (deleted.images && deleted.images.length > 0) {
    await Promise.all(deleted.images.map(img => deleteFile(img.key)));
  }

  res.status(200).json({ message: 'Entry deleted successfully' });
});

// @desc Get entries by date range
// @route GET /api/diary/range?start=YYYY-MM-DD&end=YYYY-MM-DD
// @access Private
export const getEntriesInRangeController = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  const entries = await getDiaryInRange(req.user.userId, start, end);

  if (!entries || entries.length === 0) {
    res.status(404);    
    throw new Error('No entries found for the given date range');  
  }   
  const response= entries.map(entry => ({
    _id: entry._id,
    title: entry.title,
    content: entry.content,
    date: entry.date,
    mood: entry.mood,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt
  }))
  res.status(200).json(response);
});

// @desc Get entries by year/month/day
// @route GET /api/diary/time/:type/:value
// @access Private
export const getEntriesByTimeController = asyncHandler(async (req, res) => {
  const { type, value } = req.params;
  const validTypes = ['year', 'month', 'day'];
  if (!validTypes.includes(type)) {
    res.status(400);
    throw new Error('Invalid time filter type');
  }

  const entries = await getEntriesByTime(req.user.userId, type, value);

  if (!entries || entries.length === 0) {
    res.status(404);  
    throw new Error(`No entries found for the given ${type}`);
  }
  const updateEntries = entries.map(entry => ({
    _id: entry._id,
    title: entry.title,
    content: entry.content,
    date: entry.date,
    mood: entry.mood,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt
  }));
  res.status(200).json(updateEntries);
});
