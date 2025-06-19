import Todo from '../models/todo.js';

export const createTodo = async (data) => {
  const newTodo = new Todo(data);
  await newTodo.save();
  return newTodo;
};

export const getUserTodos = async (userId) => {
  return await Todo.find({ userId }).sort({ createdAt: -1 });
};

export const toggleTodo = async (id, status, userId) => {
  if (!['To Do', 'In Progress', 'Done'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value. Must be one of: To Do, In Progress, Done' });
  }
  const updatedTodo = await Todo.findByIdAndUpdate(
    id,
    { status },
    { new: true } // Return the updated task
  );

  if (!updatedTodo) {
    return res.status(404).json({ message: 'Task not found' });
  }
  return updateTodo;
}

export const getTodoById = async (id, userId) => {
  return await Todo.findOne({ _id: id, userId });
};

export const updateTodo = async (id, userId, updates) => {
  return await Todo.findOneAndUpdate({ _id: id, userId }, updates, {
    new: true,
    runValidators: true,
  });
};

export const deleteTodo = async (id, userId) => {
  return await Todo.findOneAndDelete({ _id: id, userId });
};

export const getTodosByPriority = async (userId, priority) => {
  return await Todo.find({ userId, priority });
};
