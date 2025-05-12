import express from 'express';
import {
  createTodoController,
  getAllTodosController,
  getTodoByIdController,
  updateTodoController,
  deleteTodoController,
  getTodosByPriorityController
} from '../controllers/todo.js';

import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(authMiddleware, createTodoController)
  .get(authMiddleware, getAllTodosController);

router.route('/:id')
  .get(authMiddleware, getTodoByIdController)
  .put(authMiddleware, updateTodoController)
  .delete(authMiddleware, deleteTodoController);

router.get('/priority/:priority', authMiddleware, getTodosByPriorityController);

export default router;
