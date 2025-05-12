import {
    createTodo,
    getUserTodos,
    getTodoById,
    updateTodo,
    deleteTodo,
    getTodosByPriority,
  } from '../services/todo.js';
  
  export const createTodoController = async (req, res) => {
    try {
      const todo = await createTodo({ ...req.body, user: req.user.userId });
      res.status(201).json(todo);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
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
  