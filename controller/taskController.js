const Profile = require("../model/profile.js");
const Project = require("../model/project.js");
const Task = require("../model/task.js");
const Person = require("../model/person.js");
const { validationResult } = require('express-validator');

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
    const { name, description, startDate, endDate, tasksIds } = req.body;
    
    if (!name || !description || !startDate || !endDate || !tasksIds) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }
    
    const newProject = new Project({ name, description, startDate, endDate, tasks: tasksIds });
    await newProject.save();
    
    await Task.updateMany(
      { _id: { $in: tasksIds } },
      { $push: { projects: newProject._id } }
    );
    
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
    const projects = await Project.find().populate("tasks");
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
    const { name, description, startDate, endDate, tasks } = req.body;
    
    if (!name || !description || !startDate || !endDate || !tasks) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(id, { name, description, startDate, endDate, tasks }, { new: true });
    
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

const createTask = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { title, finished, personId, projectIds } = req.body;

    // Verificar se a pessoa existe
    if (personId) {
      const person = await Person.findById(personId);
      if (!person) {
        return res.status(404).json({ 
          success: false, 
          message: "Pessoa não encontrada." 
        });
      }
    }

    // Verificar se os projetos existem
    if (projectIds && projectIds.length > 0) {
      const projects = await Project.find({ _id: { $in: projectIds } });
      if (projects.length !== projectIds.length) {
        return res.status(404).json({ 
          success: false, 
          message: "Um ou mais projetos não foram encontrados." 
        });
      }
    }

    // Criar a tarefa
    const newTask = new Task({
      title,
      finished: finished || false,
      person: personId,
      projects: projectIds || []
    });

    await newTask.save();

    // Atualizar projetos com a nova tarefa
    if (projectIds && projectIds.length > 0) {
      await Project.updateMany(
        { _id: { $in: projectIds } },
        { $push: { tasks: newTask._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: "Tarefa criada com sucesso!",
      task: newTask
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Erro ao criar tarefa.", 
      error: error.message 
    });
  }
};

const getAllTasks = async (req, res) => {
  try {
    // Parâmetros de paginação
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtros
    const filter = {};
    if (req.query.finished) {
      filter.finished = req.query.finished === 'true';
    }
    if (req.query.personId) {
      filter.person = req.query.personId;
    }
    if (req.query.projectId) {
      filter.projects = req.query.projectId;
    }

    // Contagem total para paginação
    const total = await Task.countDocuments(filter);
    
    // Buscar tarefas com paginação e filtros
    const tasks = await Task.find(filter)
      .populate('person', 'name age')
      .populate('projects', 'name description')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      tasks
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Erro ao buscar tarefas.", 
      error: error.message 
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findById(id)
      .populate('person', 'name age')
      .populate('projects', 'name description');
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: "Tarefa não encontrada." 
      });
    }
    
    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Erro ao buscar tarefa.", 
      error: error.message 
    });
  }
};

const editTask = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { title, finished, personId, projectIds } = req.body;

    // Verificar se a tarefa existe
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: "Tarefa não encontrada." 
      });
    }

    // Verificar se a pessoa existe
    if (personId) {
      const person = await Person.findById(personId);
      if (!person) {
        return res.status(404).json({ 
          success: false, 
          message: "Pessoa não encontrada." 
        });
      }
    }

    // Verificar se os projetos existem
    if (projectIds && projectIds.length > 0) {
      const projects = await Project.find({ _id: { $in: projectIds } });
      if (projects.length !== projectIds.length) {
        return res.status(404).json({ 
          success: false, 
          message: "Um ou mais projetos não foram encontrados." 
        });
      }
    }

    // Remover a tarefa dos projetos antigos
    if (task.projects && task.projects.length > 0) {
      await Project.updateMany(
        { _id: { $in: task.projects } },
        { $pull: { tasks: task._id } }
      );
    }

    // Atualizar a tarefa
    task.title = title || task.title;
    task.finished = finished !== undefined ? finished : task.finished;
    task.person = personId || task.person;
    task.projects = projectIds || task.projects;

    await task.save();

    // Adicionar a tarefa aos novos projetos
    if (projectIds && projectIds.length > 0) {
      await Project.updateMany(
        { _id: { $in: projectIds } },
        { $addToSet: { tasks: task._id } }
      );
    }

    res.status(200).json({
      success: true,
      message: "Tarefa atualizada com sucesso!",
      task
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Erro ao atualizar tarefa.", 
      error: error.message 
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a tarefa existe
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: "Tarefa não encontrada." 
      });
    }
    
    // Remover a tarefa dos projetos
    if (task.projects && task.projects.length > 0) {
      await Project.updateMany(
        { _id: { $in: task.projects } },
        { $pull: { tasks: task._id } }
      );
    }
    
    // Excluir a tarefa
    await Task.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "Tarefa excluída com sucesso!"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Erro ao excluir tarefa.", 
      error: error.message 
    });
  }
};

const getAllTasksAdmin = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('person')
      .populate('projects');
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Erro ao buscar tarefas.", 
      error: error.message 
    });
  }
};

module.exports = { createProfile, getAllProfiles, deleteProfile, editProfile, createProject, getAllProjects, deleteProject, editProject, createTask, getAllTasks, getTaskById, editTask, deleteTask, getAllTasksAdmin };
