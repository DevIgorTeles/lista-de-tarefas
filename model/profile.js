const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  occupation: { 
    type: String,
    trim: true 
  },
  phone: { 
    type: String,
    trim: true 
  },
  address: { 
    type: String,
    trim: true 
  },
  person: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Person" 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Profile", profileSchema);



