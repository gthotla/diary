import Diary from '../models/diary.js';
import { invalidateRecentEntriesCache } from './recentEntriesService.js';
import { invalidateUserStatsCache } from './userStatsService.js';
import logger from '../utils/logger.js';

//FUcntion to create a  diary entry
export const createDiaryEntry = async (data) => {
  try {
    const { title, entry, mood, images, videos, links, userId } = data;
    const newDiaryEntry = new Diary({
      title,
      entry,
      mood,
      images,
      videos,
      links,
      userId
    });
    await newDiaryEntry.save();
    
    // Invalidate caches
    await Promise.all([
      invalidateRecentEntriesCache(userId),
      invalidateUserStatsCache(userId)
    ]);
    logger.info(`✅ Created new diary entry and invalidated caches for user ${userId}`);
    
    return newDiaryEntry;

  } catch (err) {
    console.error("Error ceating diary entry :", err.message);
    throw new Error("Error creating diary entry: " + err.message);
  }
}

//function to get all diary entries of a user

export const getAllDiaryEntries = async (userId) => {
  try {
    const diaryEntries = await Diary.find({ userId: userId }).sort({ createdAt: -1 }).populate('todoIds');
    //console.log("Diary Entries: ",diaryEntries);
    return diaryEntries;

  } catch (err) {
    console.error("Error fetching diary entries:", err.message);
    throw new Error("Error fetching diary entries: " + err.message);

  }
}

//function to get diary netry by id ;
export const getDiaryEntryById = async (id, userId) => {
  // console.log("Fetching diary entry with ID:", id, "for user:", userId);
  const entry = await Diary.findOne({ _id: id, userId });
  // console.log("Diary Entry by ID: ", entry);
  if (!entry) {
    throw new Error("Diary entry not found or you do not have permission to access it.");
  }
  return entry;
};

//function to update diary entry by id
export const updateEntry = async (id, userId, updatedData) => {
  try {
    const updatedEntry = await Diary.findByIdAndUpdate(
      { _id: id, userId },
      { $set: updatedData },
      { new: true, runValidators: true }
    )
    console.log("Updated Entry(SErvice): ", updatedEntry);
    
    // Invalidate caches
    await Promise.all([
      invalidateRecentEntriesCache(userId),
      invalidateUserStatsCache(userId)
    ]);
    logger.info(`✅ Updated diary entry and invalidated caches for user ${userId}`);
    
    return updatedEntry;
  }
  catch (err) {
    console.error("Error updating the Entry: ", err.message);
    throw new Error("Error updating diary Entry: " + err.message);
  }
}

//function to delete the Entry
export const deleteEntry = async (id, userID) => {
  try {
    const deletedEntry = await Diary.findByIdAndDelete({ _id: id, userID })
    
    // Invalidate caches
    await Promise.all([
      invalidateRecentEntriesCache(userID),
      invalidateUserStatsCache(userID)
    ]);
    logger.info(`✅ Deleted diary entry and invalidated caches for user ${userID}`);
    
    return deletedEntry;
  }
  catch (err) {
    console.error("Error Deleting diary entry: ", err.message);
    throw new Error("Error Deleting Diary Entry: " + err.message);
  }
}

//function to get the Diary entries in specific range 
export const getDiaryInRange = async (userId, startDate, endDate) => {
  try {
    const diaryEntries = await Diary.find({
      user: userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }, { sort: -1 }).populate('todoIds');
    //console.log("Diary Entries in range: ",diaryEntries);
    return diaryEntries;
  } catch (err) {
    console.error("Error fetching diary entries in range:", err.message);
    throw new Error("Error fetching diary entries in range: " + err.message);
  }
}

//function to get the Diary by time (year, month, day)
export const getEntriesByTime = async (userId, type, value) => {
  const matchStage = { userId };

  const projectStage = {
    year: { $year: '$date' },
    month: { $month: '$date' },
    day: { $dayOfMonth: '$date' },
    title: 1,
    entry: 1,
    mood: 1,
    date: 1,
  };

  if (type === 'year') matchStage['$expr'] = { $eq: [{ $year: '$date' }, parseInt(value)] };
  if (type === 'month') matchStage['$expr'] = { $eq: [{ $month: '$date' }, parseInt(value)] };
  if (type === 'day') matchStage['$expr'] = { $eq: [{ $dayOfMonth: '$date' }, parseInt(value)] };

  return await Diary.aggregate([
    { $match: matchStage },
    { $project: projectStage },
    { $sort: { date: -1 } }
  ]).populate('todoIds');
  //console.log("Diary Entries by time: ",diaryEntries);
};