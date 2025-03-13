const Profile = require("../model/profile.js");
const Project = require("../model/project.js");
const Task = require("../model/task.js");
const mongoose = require('mongoose');

const createProfile = async (req, res) => {
  try {
    const { occupation, phone, address, personId } = req.body;
    
    if (!occupation || !phone || !address || !personId) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }
    
    const newProfile = new Profile({ occupation, phone, address, person: personId });
    await newProfile.save();
    
    res.status(201).json({
      message: "Perfil criado com sucesso!",
      profile: newProfile,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro interno do servidor.", error: error.message });
  }
};

const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate("person");
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar perfis.", error: error.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProfile = await Profile.findByIdAndDelete(id);
    
    if (!deletedProfile) {
      return res.status(404).json({ message: "Perfil não encontrado." });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover perfil.", error: error.message });
  }
};

const editProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { occupation, phone, address, personId } = req.body;
    
    if (!occupation || !phone || !address || !personId) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }
    
    const updatedProfile = await Profile.findByIdAndUpdate(id, { occupation, phone, address, person: personId }, { new: true });
    
    if (!updatedProfile) {
      return res.status(404).json({ message: "Perfil não encontrado." });
    }
    
    res.status(200).json({
      message: "Perfil atualizado com sucesso!",
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar perfil.", error: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;
    
    if (!name || !endDate) {
      return res.status(400).json({ 
        message: "Os campos 'name' e 'endDate' são obrigatórios" 
      });
    }
    
    const newProject = new Project({ 
      name,
      description: description || "",
      startDate: startDate || new Date(),
      endDate
    });
    
    await newProject.save();
    
    res.status(201).json({
      message: "Projeto criado com sucesso!",
      project: newProject,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro interno do servidor.", error: error.message });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("tasks.personId");
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar projetos.", error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = await Project.findByIdAndDelete(id);
    
    if (!deletedProject) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover projeto.", error: error.message });
  }
};

const editProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate } = req.body;
    
    if (!name || !endDate) {
      return res.status(400).json({ 
        message: "Os campos 'name' e 'endDate' são obrigatórios" 
      });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      id, 
      { 
        name,
        description: description || "",
        startDate: startDate || new Date(),
        endDate
      }, 
      { new: true }
    );
    
    if (!updatedProject) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }
    
    res.status(200).json({
      message: "Projeto atualizado com sucesso!",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar projeto.", error: error.message });
  }
};

// Novos endpoints para gerenciar tasks dentro do projeto
const addTaskToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, personId } = req.body;

    if (!title || !description || !personId) {
      return res.status(400).json({ 
        message: "Os campos 'title', 'description' e 'personId' são obrigatórios" 
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }

    project.tasks.push({
      title,
      description,
      personId: mongoose.Types.ObjectId(personId)
    });

    await project.save();
    
    // Populate personId antes de retornar
    await project.populate('tasks.personId');
    
    res.status(201).json({
      message: "Tarefa adicionada ao projeto com sucesso!",
      project
    });
  } catch (error) {
    console.error('Erro ao adicionar task:', error);
    res.status(500).json({ 
      message: "Erro ao adicionar tarefa.", 
      error: error.message 
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { finished } = req.body;

    // Converter os IDs para ObjectId
    const project = await Project.findById(mongoose.Types.ObjectId(projectId));
    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }

    const task = project.tasks.id(mongoose.Types.ObjectId(taskId));
    if (!task) {
      return res.status(404).json({ message: "Tarefa não encontrada." });
    }

    task.finished = finished;
    await project.save();

    // Populate personId antes de retornar
    await project.populate('tasks.personId');

    res.status(200).json({
      message: "Status da tarefa atualizado com sucesso!",
      project
    });
  } catch (error) {
    console.error('Erro ao atualizar status da task:', error);
    res.status(500).json({ 
      message: "Erro ao atualizar status da tarefa.", 
      error: error.message 
    });
  }
};

const deleteTaskFromProject = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }

    project.tasks.pull(taskId);
    await project.save();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover tarefa.", error: error.message });
  }
};

module.exports = { 
  createProfile, 
  getAllProfiles, 
  deleteProfile, 
  editProfile,
  createProject, 
  getAllProjects, 
  deleteProject, 
  editProject,
  addTaskToProject,
  updateTaskStatus,
  deleteTaskFromProject
};
