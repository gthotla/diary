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

 if (!['todo', 'in-progress', 'done'].includes(status)) {
    throw new Error('Invalid status value');
  }
  const updatedTodo = await Todo.findByIdAndUpdate(
    id,
    { status },
    { new: true } // Return the updated task
  );

  if (!updatedTodo) {
    throw new Error('Todo not found or you do not have permission to update it');
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
