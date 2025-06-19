import asyncHandler from 'express-async-handler';
import {
  createTodo,
  getUserTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  getTodosByPriority,
  toggleTodo
} from '../services/todo.js';


export const createTodoController = asyncHandler(async (req, res) => {
  try {
  //  console.log('req.user:', req.user);  // 🔎 Check if userId exists
    //console.log('req.body:', req.body);  // 🔎 Check incoming data

    const todo = await createTodo({ ...req.body, userId: req.user.userId });

    res.status(201).json(todo);
  } catch (err) {
    console.error('Create Todo Error:', err);
    res.status(400).json({ message: err.message });
  }
});

export const toggleTodoController = asyncHandler(async (req, res) => {
  try {
    //console.log('Toggle Todo Request:', req.params.id, req.user.userId); // 🔎 Check incoming request
    const todo = await toggleTodo(req.params.id,req.params.status, req.user.userId,);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });

    }
    res.status(200).json({ message: "Todo toggled", todo });
  }
  catch (err) {
    console.error('Toggle Todo Completed Error:', err);
    res.status(500).json({ message: err.message });
  }
})
export const getAllTodosController = async (req, res) => {
  try {
    const todos = await getUserTodos(req.user.userId);
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTodoByIdController = async (req, res) => {
  try {
    const todo = await getTodoById(req.params.id, req.user.userId);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.status(200).json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTodoController = async (req, res) => {
  try {
    const todo = await updateTodo(req.params.id, req.user.userId, req.body);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.status(200).json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteTodoController = async (req, res) => {
  try {
    const result = await deleteTodo(req.params.id, req.user.userId);
    if (!result) return res.status(404).json({ message: 'Todo not found' });
    res.status(200).json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTodosByPriorityController = async (req, res) => {
  try {
    const todos = await getTodosByPriority(req.user.userId, req.params.priority);
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
