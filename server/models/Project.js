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
    enum: ['Residential', 'Commercial', 'Interior Design', 'Renovation', 'Remodeling', 'Landscape', 'Other']
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
    enum: ['completed', 'ongoing', 'planned'],
    default: 'completed'
  },
  client: {
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
