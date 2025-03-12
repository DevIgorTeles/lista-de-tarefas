const express = require("express");
const router = express.Router();
const { check } = require('express-validator');
const taskController = require("../controller/taskController.js");
const { authenticate, isAdmin } = require('../middleware/auth');

// Validação para criação de tarefa
const taskValidation = [
  check('title', 'Título é obrigatório').not().isEmpty(),
  check('title', 'Título deve ter entre 3 e 100 caracteres').isLength({ min: 3, max: 100 })
];

// Rotas públicas
router.get("/tasks", taskController.getAllTasks);

// Rotas protegidas (requerem autenticação)
router.post("/tasks", authenticate, taskValidation, taskController.createTask);
router.get("/tasks/:id", authenticate, taskController.getTaskById);
router.put("/tasks/:id", authenticate, taskValidation, taskController.editTask);
router.delete("/tasks/:id", authenticate, taskController.deleteTask);

// Rotas administrativas (requerem permissão de admin)
router.get("/admin/tasks", authenticate, isAdmin, taskController.getAllTasksAdmin);

module.exports = router;
