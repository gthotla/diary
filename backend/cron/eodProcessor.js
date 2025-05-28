import User from '../models/user.js';
import Todo from '../models/todo.js';
import Diary from '../models/diary.js';
import { getLocalDate, isMidnightInTz } from '../utils/timeUtil.js';

async function moveTodosToDiary(user, dateStr) {
  const todos = await Todo.find({
    userId: user._id,
    createdAt: {
      $gte: new Date(`${dateStr}T00:00:00.000Z`),
      $lte: new Date(`${dateStr}T23:59:59.999Z`)
    }
  });

  if (!todos.length) return;

  await Diary.findOneAndUpdate(
    { userId: user._id, date: dateStr },
    { $push: { todos: { $each: todos.map(t => t.toObject()) } } },
    { upsert: true }
  );

  console.log(`[${user.email}] Moved ${todos.length} todos to diary on ${dateStr}`);
}

export async function processTodosForAllUsers() {
  const users = await User.find({});

  for (const user of users) {
    const tz = user?.profile?.settings?.timezone || 'UTC';
    const localDate = getLocalDate(tz);

    if (isMidnightInTz(tz)) {
      // Check if we've already processed this day
      if (user.profile?.diaryStats?.lastEntryDate?.toISOString()?.slice(0, 10) === localDate) continue;

      await moveTodosToDiary(user, localDate);

      // Update lastEntryDate
      user.profile.diaryStats.lastEntryDate = new Date(localDate);
      await user.save();
    }
  }
}

export default {processTodosForAllUsers};