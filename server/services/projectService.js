const { Project } = require('../models');

class ProjectService {
  // Get all projects
  async getAllProjects() {
    try {
      return await Project.find({}).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Get featured projects
  async getFeaturedProjects() {
    try {
      return await Project.find({ featured: true }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      throw error;
    }
  }

  // Get projects by category
  async getProjectsByCategory(category) {
    try {
      return await Project.find({ category }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching projects by category:', error);
      throw error;
    }
  }

  // Get project by ID
  async getProjectById(id) {
    try {
      return await Project.findById(id);
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      throw error;
    }
  }

  // Create new project
  async createProject(projectData) {
    try {
      const project = new Project(projectData);
      return await project.save();
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update project
  async updateProject(id, updateData) {
    try {
      return await Project.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete project
  async deleteProject(id) {
    try {
      return await Project.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Search projects
  async searchProjects(query) {
    try {
      return await Project.find({
        $text: { $search: query }
      }).sort({ score: { $meta: "textScore" } });
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  }
}

module.exports = new ProjectService();
