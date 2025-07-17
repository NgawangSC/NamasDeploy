"use client"

import { useState } from "react"
import { useProjects, useProjectOperations } from "../hooks/useApi"
import { useData } from "../contexts/DataContext"
import "./AdminProjects.css"

const AdminProjects = () => {
  const { data: projects, loading, error, refetch } = useProjects()
  const { createProject, updateProject: updateProjectApi, deleteProject, loading: operationLoading } = useProjectOperations()
  const { updateProject: updateProjectContext } = useData()

  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    year: "",
    status: "Ongoing",
    client: "",
    designTeam: "NAMAS Architecture",
    description: "",
  })
  const [selectedImages, setSelectedImages] = useState([])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageChange = (e) => {
    // Check if files exist before trying to create an array
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImages(Array.from(e.target.files))
    } else {
      setSelectedImages([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingProject) {
        await updateProjectApi(editingProject.id, formData, selectedImages)
      } else {
        await createProject(formData, selectedImages)
      }

      // Reset form
      setFormData({
        title: "",
        category: "",
        location: "",
        year: "",
        status: "Ongoing",
        client: "",
        designTeam: "NAMAS Architecture",
        description: "",
      })
      setSelectedImages([])
      setShowForm(false)
      setEditingProject(null)
      refetch()
    } catch (error) {
      console.error("Error saving project:", error)
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      category: project.category,
      location: project.location,
      year: project.year,
      status: project.status,
      client: project.client || "",
      designTeam: project.designTeam || "NAMAS Architecture",
      description: project.description || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id)
        refetch()
      } catch (error) {
        console.error("Error deleting project:", error)
      }
    }
  }

  const toggleFeatured = async (project) => {
    try {
      const updatedProject = { ...project, featured: !project.featured }
      await updateProjectContext(project.id, updatedProject)
      refetch()
    } catch (error) {
      console.error('Error updating featured status:', error)
      alert('Error updating featured status: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      location: "",
      year: "",
      status: "Ongoing",
      client: "",
      designTeam: "NAMAS Architecture",
      description: "",
    })
    setSelectedImages([])
    setShowForm(false)
    setEditingProject(null)
  }

  if (loading) return <div className="admin-loading">Loading projects...</div>
  if (error) return <div className="admin-error">Error: {error}</div>

  return (
    <div className="admin-projects">
      <div className="admin-header">
        <h1>Manage Projects</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)} disabled={operationLoading}>
          Add New Project
        </button>
      </div>

      {showForm && (
        <div className="project-form-overlay">
          <div className="project-form">
            <div className="form-header">
              <h2>{editingProject ? "Edit Project" : "Add New Project"}</h2>
              <button className="btn-close" onClick={resetForm}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
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

                <div className="form-group">
                  <label>Location *</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Year *</label>
                  <input type="text" name="year" value={formData.year} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
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
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" />
              </div>

              <div className="form-group">
                <label>Images</label>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} />
                {selectedImages.length > 0 && (
                  <div className="selected-images">
                    {selectedImages.map((file, index) => (
                      <span key={index} className="image-name">
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={operationLoading}>
                  {operationLoading ? "Saving..." : editingProject ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="projects-grid">
        {projects?.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-image">
              <img src={project.image || "/placeholder.svg"} alt={project.title} />
              {project.featured && <span className="featured-badge">Featured</span>}
            </div>
            <div className="project-content">
              <h3>{project.title}</h3>
              <div className="project-meta">
                <span className="category">{project.category}</span>
                <span className="location">{project.location}</span>
                <span className="year">{project.year}</span>
                <span className={`status ${project.status.toLowerCase()}`}>{project.status}</span>
              </div>
              <p>{project.description}</p>
              <div className="project-actions">
                <button className="btn-edit" onClick={() => handleEdit(project)} disabled={operationLoading}>
                  Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(project.id)} disabled={operationLoading}>
                  Delete
                </button>
                <button 
                  className={`btn-featured ${project.featured ? 'remove' : 'add'}`}
                  onClick={() => toggleFeatured(project)} 
                  disabled={operationLoading}
                >
                  {project.featured ? 'Remove from Hero' : 'Add to Hero'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminProjects
