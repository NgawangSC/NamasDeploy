const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    required: false
  },
  description: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ["General", "Government", "Corporate", "Banking", "Real Estate", "Healthcare", "Education"],
    default: "General"
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Pending"],
    default: "Active"
  },
  order: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Client', clientSchema);
