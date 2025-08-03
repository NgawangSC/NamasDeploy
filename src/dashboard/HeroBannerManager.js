"use client"

import { useState, useEffect } from "react"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import "./HeroBannerManager.css"

const HeroBannerManager = () => {
  const { projects, featuredProjects, loading, updateProject, addProject, fetchProjects, fetchFeaturedProjects } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [updatingProject, setUpdatingProject] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    year: "",
    location: "",
    category: "",
    status: "In Progress",
    client: "",
    designTeam: "",
    featured: true // Automatically set to true for hero banner
  })

  useEffect(() => {
    if (projects.length === 0 && !loading.projects) {
      fetchProjects()
    }
    if (featuredProjects.length === 0 && !loading.featuredProjects) {
      fetchFeaturedProjects()
    }
  }, [projects, featuredProjects, loading, fetchProjects, fetchFeaturedProjects])

  const handleToggleFeatured = async (project) => {
    try {
      setUpdatingProject(project.id)
      const action = project.featured ? 'removed from' : 'added to'
      
      // Create updated project object with toggled featured status
      const updatedProjectData = {
        ...project,
        featured: !project.featured
      }
      
      // Force refresh both projects and featured projects lists
      await Promise.all([
        fetchProjects(),
        fetchFeaturedProjects()
      ])
      
      // Trigger storage event to notify homepage of changes
      localStorage.setItem('projectsUpdated', Date.now().toString())
      localStorage.removeItem('projectsUpdated')
      
      // Show success message
      const message = `"${project.title}" has been ${action} the hero banner!`
      console.log(message)
      alert(message) // Show user feedback
      
    } catch (error) {
      console.error('Error updating project featured status:', error)
      let errorMessage = error.message;
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check that the server is running and try again.';
      }
      alert('Error updating featured status: ' + errorMessage)
    } finally {
      setUpdatingProject(null)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedImages(files)
    
    // Create preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file))
    setImagePreviews(previewUrls)
  }

  const handleAddProject = async (e) => {
    e.preventDefault()

    try {
      const submitData = new FormData()
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key])
      })

      // Append selected images
      selectedImages.forEach(file => {
        submitData.append('images', file)
      })

      const newProject = await addProject(submitData)
      
      // Refresh projects and featured projects to ensure we have the latest data
      await fetchProjects()
      await fetchFeaturedProjects()
      
      // Trigger storage event to notify homepage of changes
      localStorage.setItem('projectsUpdated', Date.now().toString())
      localStorage.removeItem('projectsUpdated')
      
      resetForm()
      alert(`"${newProject.title}" has been added to the hero banner!`)
    } catch (error) {
      console.error('Error adding project:', error)
      let errorMessage = error.message;
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
      }
      alert('Error adding project: ' + errorMessage)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      year: "",
      location: "",
      category: "",
      status: "In Progress",
      client: "",
      designTeam: "",
      featured: true
    })
    setSelectedImages([])
    setImagePreviews([])
    setShowAddForm(false)
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const featuredProjectIds = new Set(featuredProjects.map(p => p.id))

  return (
    <div className="hero-banner-manager">
      <div className="manager-header">
        <h1>Hero Banner Manager</h1>
        <p>Select which projects appear in the homepage hero banner</p>
        <button 
          onClick={() => setShowAddForm(true)}
          className="add-hero-project-btn"
        >
          + Add New Project to Hero Banner
        </button>
      </div>

      {showAddForm && (
        <div className="add-project-form-overlay">
          <div className="add-project-form">
            <div className="form-header">
              <h2>Add New Project to Hero Banner</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="close-form-btn"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddProject} className="hero-project-form">
              <div className="form-group">
                <label htmlFor="title">Project Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="year">Year *</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    min="1900"
                    max="2099"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Institutional">Institutional</option>
                    <option value="Mixed Use">Mixed Use</option>
                    <option value="Renovation">Renovation</option>
                    <option value="Interior Design">Interior Design</option>
                    <option value="Urban Planning">Urban Planning</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Planning">Planning</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="client">Client</label>
                  <input
                    type="text"
                    id="client"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="designTeam">Design Team</label>
                  <input
                    type="text"
                    id="designTeam"
                    name="designTeam"
                    value={formData.designTeam}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="images">Project Images</label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleImageChange}
                  multiple
                  accept="image/*"
                />
                <small>You can select multiple images. The first image will be used as the main image.</small>
              </div>

              {imagePreviews.length > 0 && (
                <div className="image-previews">
                  <h4>Image Previews:</h4>
                  <div className="preview-grid">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="preview-item">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        {index === 0 && <span className="main-image-label">Main Image</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add to Hero Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="search-section">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="featured-summary">
        <h2>Hero Banner ({featuredProjects.length} projects)</h2>
        <div className="featured-grid">
          {featuredProjects.map((project) => (
            <div key={project.id} className="featured-project-card">
              <div className="project-image">
                <img 
                  src={getImageUrl(project.image) || "/placeholder.svg?height=150&width=200&text=No+Image"} 
                  alt={project.title} 
                />
              </div>
              <div className="project-info">
                <h3>{project.title}</h3>
                <p>{project.location} • {project.year}</p>
                <button 
                  onClick={() => handleToggleFeatured(project)}
                  className="remove-featured-btn"
                  disabled={updatingProject === project.id}
                >
                  {updatingProject === project.id ? 'Removing...' : 'Remove from Hero Banner'}
                </button>
              </div>
            </div>
          ))}
          {featuredProjects.length === 0 && (
            <div className="empty-state">
              <p>No projects are currently featured in the hero banner.</p>
              <p>Select projects below to add them to the hero banner.</p>
            </div>
          )}
        </div>
      </div>

      <div className="all-projects-section">
        <h2>All Projects</h2>
        {loading.projects ? (
          <div className="loading">Loading projects...</div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <div key={project.id} className={`project-card ${featuredProjectIds.has(project.id) ? 'featured' : ''}`}>
                <div className="project-image">
                  <img 
                    src={getImageUrl(project.image) || "/placeholder.svg?height=150&width=200&text=No+Image"} 
                    alt={project.title} 
                  />
                  {featuredProjectIds.has(project.id) && (
                    <div className="featured-badge">Featured</div>
                  )}
                </div>
                <div className="project-info">
                  <h3>{project.title}</h3>
                  <p className="project-meta">
                    {project.category} • {project.location} • {project.year}
                  </p>
                  <p className="project-description">{project.description}</p>
                  <button 
                    onClick={() => handleToggleFeatured(project)}
                    className={`toggle-featured-btn ${featuredProjectIds.has(project.id) ? 'featured' : ''}`}
                    disabled={updatingProject === project.id}
                  >
                    {updatingProject === project.id 
                      ? 'Updating...' 
                      : featuredProjectIds.has(project.id) 
                        ? 'Remove from Hero Banner' 
                        : 'Add to Hero Banner'
                    }
                  </button>
                </div>
              </div>
            ))}
            {filteredProjects.length === 0 && !loading.projects && (
              <div className="empty-state">
                <p>No projects found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default HeroBannerManager