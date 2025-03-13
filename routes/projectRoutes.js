const express = require("express");
const router = express.Router();
const { 
  createProject, 
  getAllProjects, 
  deleteProject, 
  editProject,
  addTaskToProject,
  updateTaskStatus,
  deleteTaskFromProject
} = require("../controller/projectController.js");
const { authenticate } = require("../middleware/auth.js");

// Rotas de Projeto
router.post("/projects", authenticate, createProject);
router.get("/projects", authenticate, getAllProjects);
router.delete("/projects/:id", authenticate, deleteProject);
router.put("/projects/:id", authenticate, editProject);

// Rotas de Tasks dentro do Projeto
router.post("/projects/:projectId/tasks", authenticate, addTaskToProject);
router.put("/projects/:projectId/tasks/:taskId", authenticate, updateTaskStatus);
router.delete("/projects/:projectId/tasks/:taskId", authenticate, deleteTaskFromProject);

module.exports = router;
