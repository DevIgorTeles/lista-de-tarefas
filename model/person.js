const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  age: { 
    type: Number, 
    required: true, 
    min: 15, 
    max: 99 
  },
  profile: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Profile" 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Person", personSchema);
