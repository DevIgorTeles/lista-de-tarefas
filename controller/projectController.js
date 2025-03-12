const Profile = require("../model/profile.js");
const Project = require("../model/project.js");
const Task = require("../model/task.js");

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

module.exports = { createProfile, getAllProfiles, deleteProfile, editProfile, createProject, getAllProjects, deleteProject, editProject };
