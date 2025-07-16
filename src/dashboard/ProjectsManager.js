"use client"

import { useState } from "react"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import "./ProjectsManager.css"

const ProjectsManager = () => {
  const { projects, addProject, updateProject, deleteProject } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    year: "",
    location: "",
    category: "",
    status: "In Progress",
    client: "",
    designTeam: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData)
      } else {
        await addProject(formData)
      }
      resetForm()
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Error saving project: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: "",
      year: "",
      location: "",
      category: "",
      status: "In Progress",
      client: "",
      designTeam: "",
    })
    setShowForm(false)
    setEditingProject(null)
  }

  const handleEdit = (project) => {
    setFormData(project)
    setEditingProject(project)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id)
      } catch (error) {
        console.error('Error deleting project:', error)
        alert('Error deleting project: ' + error.message)
      }
    }
  }

  const toggleFeatured = async (project) => {
    try {
      const updatedProject = { ...project, featured: !project.featured }
      await updateProject(project.id, updatedProject)
    } catch (error) {
      console.error('Error updating featured status:', error)
      alert('Error updating featured status: ' + error.message)
    }
  }

  return (
    <div className="projects-manager">
      <div className="manager-header">
        <h1>Projects Manager</h1>
        <button onClick={() => setShowForm(true)} className="add-btn">
          Add New Project
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h2>{editingProject ? "Edit Project" : "Add New Project"}</h2>
              <button onClick={resetForm} className="close-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="project-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Year *</label>
                  <input type="text" name="year" value={formData.year} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location *</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="">Select Category</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Educational">Educational</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Hospitality">Hospitality</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} required>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Planning">Planning</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Client</label>
                  <input type="text" name="client" value={formData.client} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Design Team</label>
                <input type="text" name="designTeam" value={formData.designTeam} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingProject ? "Update Project" : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-image">
              <img src={getImageUrl(project.image) || "/placeholder.svg?height=200&width=300&text=No+Image"} alt={project.title} />
              {project.featured && <span className="featured-badge">Featured</span>}
            </div>
            <div className="project-info">
              <h3>{project.title}</h3>
              <p className="project-meta">
                {project.location} • {project.year} • {project.category}
              </p>
              <p className="project-description">{project.description}</p>
              <div className="project-status">
                <span className={`status ${project.status.toLowerCase().replace(" ", "-")}`}>{project.status}</span>
              </div>
              <div className="project-actions">
                <button onClick={() => handleEdit(project)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDelete(project.id)} className="delete-btn">
                  Delete
                </button>
                <button 
                  onClick={() => toggleFeatured(project)} 
                  className={`featured-btn ${project.featured ? 'remove' : 'add'}`}
                >
                  {project.featured ? 'Remove from Hero' : 'Add to Hero'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="empty-state">
          <h3>No projects yet</h3>
          <p>Add your first project to get started</p>
          <button onClick={() => setShowForm(true)} className="add-btn">
            Add Project
          </button>
        </div>
      )}
    </div>
  )
}

export default ProjectsManager
