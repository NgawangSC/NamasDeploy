const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    // Allow any category string to align with frontend options
  },
  location: {
    type: String,
    required: true
  },
  area: {
    type: String,
    default: 'Not specified'
  },
  year: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    default: []
  }],
  coverImage: {
    type: String,
    default: null
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    // Support both legacy (lowercase) and new (Title Case) statuses
    enum: ['completed', 'ongoing', 'planned', 'In Progress', 'Completed', 'On Hold'],
    default: 'In Progress'
  },
  client: {
    type: String,
    trim: true,
    default: ''
  },
  designTeam: {
    type: String,
    trim: true,
    default: ''
  },
  budget: {
    type: String,
    trim: true,
    default: ''
  },
  duration: {
    type: String,
    trim: true,
    default: ''
  },
  services: [{
    type: String,
    trim: true
  }],
  technologies: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better query performance
projectSchema.index({ category: 1, featured: 1 });
projectSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Project', projectSchema);
