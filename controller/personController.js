const Person = require("../model/person.js");

const createPerson = async (req, res) => {
  try {
    const { name, age } = req.body;
    
    if (!name || !age) {
      return res.status(400).json({ message: "Nome e idade são obrigatórios." });
    }
    
    const newPerson = new Person({ name, age });
    await newPerson.save();
    
    res.status(201).json({
      message: "Pessoa criada com sucesso!",
      person: newPerson,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro interno do servidor.", error: error.message });
  }
};

const getAllPersons = async (req, res) => {
  try {
    const persons = await Person.find().populate("profile");
    res.status(200).json(persons);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar pessoas.", error: error.message });
  }
};

const deletePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPerson = await Person.findByIdAndDelete(id);
    
    if (!deletedPerson) {
      return res.status(404).json({ message: "Pessoa não encontrada." });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover pessoa.", error: error.message });
  }
};

const editPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age } = req.body;
    
    if (!name || !age) {
      return res.status(400).json({ message: "Nome e idade são obrigatórios." });
    }
    
    const updatedPerson = await Person.findByIdAndUpdate(id, { name, age }, { new: true });
    
    if (!updatedPerson) {
      return res.status(404).json({ message: "Pessoa não encontrada." });
    }
    
    res.status(200).json({
      message: "Pessoa atualizada com sucesso!",
      person: updatedPerson,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar pessoa.", error: error.message });
  }
};

module.exports = { getAllPersons, createPerson, editPerson, deletePerson };
