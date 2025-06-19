import express from 'express';
import {
  createTodoController,
  getAllTodosController,
  getTodoByIdController,
  updateTodoController,
  deleteTodoController,
  getTodosByPriorityController,
  toggleTodoController
} from '../controllers/todo.js';

import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Todo
 *   description: Todo management endpoints
 */

/**
 * @swagger
 * /todo:
 *   post:
 *     summary: Create a new todo item
 *     tags: [Todo]
 *     description: Creates a new todo item for the authenticated user.
 *     responses:
 *       201:
 *         description: Todo created successfully
 *   get:
 *     summary: Get all todo items
 *     tags: [Todo]
 *     description: Returns all todo items for the logged-in user.
 *     responses:
 *       200:
 *         description: Todos retrieved successfully
 */
router.route('/')
  .post(authMiddleware, createTodoController)
  .get(authMiddleware, getAllTodosController);

/**
 * @swagger
 * /todo/{id}:
 *   get:
 *     summary: Get a todo item by ID
 *     tags: [Todo]
 *     description: Retrieves a specific todo item by ID for the logged-in user.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo retrieved successfully
 *       404:
 *         description: Todo not found
 *   put:
 *     summary: Update a todo item
 *     tags: [Todo]
 *     description: Updates a specific todo item by ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *       404:
 *         description: Todo not found
 *   delete:
 *     summary: Delete a todo item
 *     tags: [Todo]
 *     description: Deletes a specific todo item by ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo deleted successfully
 *       404:
 *         description: Todo not found
 */
router.route('/:id')
  .get(authMiddleware, getTodoByIdController)
  .put(authMiddleware, updateTodoController)
  .delete(authMiddleware, deleteTodoController);

/**
 * @swagger
 * /todo/priority/{priority}:
 *   get:
 *     summary: Get todos by priority
 *     tags: [Todo]
 *     description: Retrieves todo items filtered by priority level.
 *     parameters:
 *       - name: priority
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todos retrieved successfully
 */
router.get('/priority/:priority', authMiddleware, getTodosByPriorityController);
router.patch('/:id/status/:status',authMiddleware, toggleTodoController);
export default router;
