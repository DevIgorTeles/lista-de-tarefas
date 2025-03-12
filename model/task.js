const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  finished: { 
    type: Boolean,
    default: false
  },
  person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
  },
  projects: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Project" 
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Task", taskSchema);
