"use client"

import { useState, useEffect, useMemo } from "react"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import ViewFilter from "../components/ViewFilter"
import "./ProjectsManager.css"

const ProjectsManager = () => {
  const { projects, addProject, updateProject, deleteProject, fetchProjects, fetchFeaturedProjects } = useData()
  
  // Ensure projects are fetched when component mounts
  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects()
    }
  }, [projects.length, fetchProjects])
  
  const [showForm, setShowForm] = useState(false)
  const [showImageManager, setShowImageManager] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [managingProject, setManagingProject] = useState(null)
  const [additionalImages, setAdditionalImages] = useState([])
  const [updatingFeatured, setUpdatingFeatured] = useState(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [viewMode, setViewMode] = useState("detail") // 'list' or 'detail'
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
    featured: false,
  })

  // Extract unique categories from projects
  const categories = useMemo(() => {
    const cats = [...new Set(projects.map(project => project.category).filter(Boolean))]
    return cats.sort()
  }, [projects])

  // Filter projects based on search term and category
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = !searchTerm || 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.designTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.category.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = !selectedCategory || project.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [projects, searchTerm, selectedCategory])

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

  const handleAdditionalImageChange = (e) => {
    const files = Array.from(e.target.files)
    setAdditionalImages(files)
  }

  const removeImagePreview = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    
    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
    
    // Update file input
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) {
      const dt = new DataTransfer()
      newImages.forEach(file => dt.items.add(file))
      fileInput.files = dt.files
    }
  }

  const addImagesToProject = async () => {
    if (!managingProject || additionalImages.length === 0) return

    try {
      const formData = new FormData()
      additionalImages.forEach(file => {
        formData.append('images', file)
      })

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/projects/${managingProject.id}/images`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add images')
      }

      const result = await response.json()
      const updatedProject = result.data.project

      // Update the project in the state and also update the managingProject
      await updateProject(managingProject.id, updatedProject)
      setManagingProject(updatedProject)
      
      // Refresh projects data to ensure we have the latest information
      fetchProjects();
      
      // Reset additional images
      setAdditionalImages([])
      const fileInput = document.querySelector('.additional-images-input')
      if (fileInput) fileInput.value = ''
      
      alert(`${result.data.newImages.length} image(s) added successfully!`)
    } catch (error) {
      console.error('Error adding images:', error)
      let errorMessage = error.message;
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
      }
      alert('Error adding images: ' + errorMessage)
    }
  }

  const removeImageFromProject = async (imageUrl) => {
    if (!managingProject) return

    if (window.confirm('Are you sure you want to remove this image?')) {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/projects/${managingProject.id}/images`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to remove image')
        }

        const result = await response.json()
        const updatedProject = result.data

        // Update the project in the state and also update the managingProject
        await updateProject(managingProject.id, updatedProject)
        setManagingProject(updatedProject)
        
        alert('Image removed successfully!')
      } catch (error) {
        console.error('Error removing image:', error)
        let errorMessage = error.message;
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
        }
        alert('Error removing image: ' + errorMessage)
      }
    }
  }

  const setCoverImage = async (imageUrl) => {
    if (!managingProject) return

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/projects/${managingProject.id}/cover`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to set cover image')
      }

      const result = await response.json()
      const updatedProject = result.data

      // Update the project in the state and also update the managingProject
      await updateProject(managingProject.id, updatedProject)
      setManagingProject(updatedProject)
      
      alert('Cover image updated successfully!')
    } catch (error) {
      console.error('Error setting cover image:', error)
      let errorMessage = error.message;
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
      }
      alert('Error setting cover image: ' + errorMessage)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const submitData = new FormData()
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'image') { // Don't include the old image field
          submitData.append(key, formData[key])
        }
      })

      // Append selected images
      selectedImages.forEach(file => {
        submitData.append('images', file)
      })



      if (editingProject) {
        await updateProject(editingProject.id, submitData)
      } else {
        await addProject(submitData)
      }
      
      // Refresh projects to ensure we have the latest data
      fetchProjects()
      resetForm()
    } catch (error) {
      console.error('Error saving project:', error)
      let errorMessage = error.message;
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
      }
      alert('Error saving project: ' + errorMessage)
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
      featured: false,
    })
    setSelectedImages([])
    setImagePreviews([])
    setShowForm(false)
    setEditingProject(null)
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleEdit = (project) => {
    setFormData(project)
    setEditingProject(project)
    setSelectedImages([])
    setImagePreviews([])
    setShowForm(true)
  }

  const handleManageImages = (project) => {
    // Ensure the project has an images array, converting from single image if needed
    const normalizedProject = {
      ...project,
      images: project.images && Array.isArray(project.images) 
        ? project.images 
        : project.image 
          ? [project.image] 
          : []
    }
    
    setManagingProject(normalizedProject)
    setAdditionalImages([])
    setShowImageManager(true)
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

  // List view component
  const ProjectListView = ({ project }) => (
    <div className="project-list-item">
      <div className="project-list-image">
        <img src={getImageUrl(project.image) || "/placeholder.svg"} alt={project.title} />
        {project.featured && <span className="featured-badge">Featured</span>}
        {(() => {
          const imageCount = project.images && Array.isArray(project.images) 
            ? project.images.length 
            : project.image ? 1 : 0;
          return imageCount > 1 && (
            <span className="image-count-badge">{imageCount} images</span>
          );
        })()}
      </div>
      <div className="project-list-content">
        <div className="project-list-main">
          <h3>{project.title}</h3>
          <p className="project-meta">{project.location} • {project.year} • {project.category}</p>
          <p className="project-description">{project.description}</p>
          <div className="project-details">
            {project.client && <span className="detail-item">Client: {project.client}</span>}
            {project.designTeam && <span className="detail-item">Team: {project.designTeam}</span>}
          </div>
        </div>
        <div className="project-list-sidebar">
          <span className={`status ${project.status.toLowerCase().replace(" ", "-")}`}>{project.status}</span>
          <div className="project-actions">
            <button onClick={() => handleEdit(project)} className="edit-btn">Edit</button>
            <button onClick={() => handleManageImages(project)} className="manage-images-btn">Images</button>
            <button onClick={() => handleDelete(project.id)} className="delete-btn">Delete</button>
            <button 
              onClick={() => toggleFeatured(project)} 
              className={`featured-btn ${project.featured ? 'remove' : 'add'}`}
              disabled={updatingFeatured === project.id}
            >
              {updatingFeatured === project.id 
                ? 'Updating...' 
                : project.featured 
                  ? 'Remove from Hero' 
                  : 'Add to Hero'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Detail view component (existing card view)
  const ProjectDetailView = ({ project }) => (
    <div className="project-card">
      <div className="project-image">
        <img src={getImageUrl(project.image) || "/placeholder.svg?height=200&width=300&text=No+Image"} alt={project.title} />
        {project.featured && <span className="featured-badge">Featured</span>}
        {(() => {
          const imageCount = project.images && Array.isArray(project.images) 
            ? project.images.length 
            : project.image ? 1 : 0;
          return imageCount > 1 && (
            <span className="image-count-badge">{imageCount} images</span>
          );
        })()}
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
          <button onClick={() => handleManageImages(project)} className="manage-images-btn">
            Manage Images
          </button>
          <button onClick={() => handleDelete(project.id)} className="delete-btn">
            Delete
          </button>
          <button 
            onClick={() => toggleFeatured(project)} 
            className={`featured-btn ${project.featured ? 'remove' : 'add'}`}
            disabled={updatingFeatured === project.id}
          >
            {updatingFeatured === project.id 
              ? 'Updating...' 
              : project.featured 
                ? 'Remove from Hero' 
                : 'Add to Hero'
            }
          </button>
        </div>
      </div>
    </div>
  )

  const toggleFeatured = async (project) => {
    const originalFeaturedStatus = project.featured
    
    try {
      setUpdatingFeatured(project.id)
      const newFeaturedStatus = !project.featured
      const action = newFeaturedStatus ? 'added to' : 'removed from'
      
      // Update the project on the server
      await updateProject(project.id, { featured: newFeaturedStatus })
      
      // Refresh the projects list to get updated data
      await fetchProjects()
      
      // If we're adding to featured, also refresh featured projects
      if (newFeaturedStatus) {
        await fetchFeaturedProjects()
      }
      
      // Notify homepage of changes
      localStorage.setItem('projectsUpdated', Date.now().toString())
      localStorage.removeItem('projectsUpdated')
      
      // Show success message
      alert(`"${project.title}" has been ${action} the hero banner!`)
      
    } catch (error) {
      console.error('Error updating featured status:', error)
      alert('Error updating featured status: ' + error.message)
    } finally {
      setUpdatingFeatured(null)
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

      <ViewFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalItems={filteredProjects.length}
        itemType="Projects"
      />

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
                    
                    {/* Design Categories */}
                    <optgroup label="Design Services">
                      <option value="Architecture">Architecture</option>
                      <option value="Planning">Planning</option>
                      <option value="Interior Design">Interior Design</option>
                      <option value="Landscape">Landscape</option>
                    </optgroup>
                    
                    {/* Build Categories */}
                    <optgroup label="Build Services">
                      <option value="Supervision">Supervision</option>
                      <option value="Management">Management</option>
                      <option value="Real Estate">Real Estate</option>
                    </optgroup>
                      

                    {/* Construction Categories */}
                    <optgroup label="Construction Services">
                      <option value="Private Homes">Private Homes</option>
                      <option value="Commercial Buildings">Commercial Buildings</option>
                      <option value="Office">Office</option>
                      <option value="Institute">Institute</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Interior Build">Interior Build</option>
                      <option value="Renovation">Renovation</option>
                    </optgroup>
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
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="featured" 
                    checked={formData.featured} 
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  />
                  <span className="checkmark"></span>
                  Add to Hero Banner (Featured)
                </label>
                <small>Projects marked as featured will appear in the homepage hero banner carousel.</small>
              </div>

              <div className="form-group">
                <label>Project Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="file-input"
                />
                <p className="file-input-hint">
                  {editingProject 
                    ? "Select new images to replace existing ones (optional)" 
                    : "Select one or more images for this project"
                  }
                </p>
                
                {imagePreviews.length > 0 && (
                  <div className="image-previews">
                    <h4>Selected Images:</h4>
                    <div className="preview-grid">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="preview-item">
                          <img src={preview} alt={`Preview ${index + 1}`} />
                          <button
                            type="button"
                            onClick={() => removeImagePreview(index)}
                            className="remove-preview"
                          >
                            ×
                          </button>
                          {index === 0 && <span className="cover-badge">Cover</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

      {showImageManager && managingProject && (
        <div className="form-overlay">
          <div className="form-container image-manager-container">
            <div className="form-header">
              <h2>Manage Images - {managingProject.title}</h2>
              <button onClick={() => setShowImageManager(false)} className="close-btn">
                ×
              </button>
            </div>

            <div className="image-manager-content">
              {/* Current Images */}
              <div className="current-images-section">
                <h3>Current Images</h3>
                {managingProject && managingProject.images && Array.isArray(managingProject.images) && managingProject.images.length > 0 ? (
                  <div className="current-images-grid">
                    {managingProject.images.map((imageUrl, index) => (
                      <div key={index} className="current-image-item">
                        <img 
                          src={getImageUrl(imageUrl)} 
                          alt={`Project image ${index + 1}`} 
                          onError={(e) => {
                            console.warn('Image failed to load:', getImageUrl(imageUrl));
                            e.target.src = "/placeholder.svg?height=150&width=200&text=Image+Not+Found";
                          }}
                        />
                        <div className="image-actions">
                          <button
                            onClick={() => setCoverImage(imageUrl)}
                            className={`set-cover-btn ${managingProject.image === imageUrl ? 'current-cover' : ''}`}
                          >
                            {managingProject.image === imageUrl ? 'Cover' : 'Set Cover'}
                          </button>
                          <button
                            onClick={() => removeImageFromProject(imageUrl)}
                            className="remove-image-btn"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : managingProject && managingProject.image ? (
                                      <div className="current-images-grid">
                      <div className="current-image-item">
                        <img 
                          src={getImageUrl(managingProject.image)} 
                          alt="Project cover" 
                          onError={(e) => {
                            console.warn('Cover image failed to load:', getImageUrl(managingProject.image));
                            e.target.src = "/placeholder.svg?height=150&width=200&text=Image+Not+Found";
                          }}
                        />
                        <div className="image-actions">
                        <button className="set-cover-btn current-cover">
                          Cover
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>No images available</p>
                )}
              </div>

              {/* Add New Images */}
              <div className="add-images-section">
                <h3>Add New Images</h3>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImageChange}
                  className="file-input additional-images-input"
                />
                <p className="file-input-hint">Select additional images to add to this project</p>
                
                {additionalImages.length > 0 && (
                  <div className="add-images-actions">
                    <p>{additionalImages.length} image(s) selected</p>
                    <button onClick={addImagesToProject} className="add-images-btn">
                      Add Images
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'list' ? (
        <div className="projects-list">
          {filteredProjects.map((project) => (
            <ProjectListView key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <ProjectDetailView key={project.id} project={project} />
          ))}
        </div>
      )}

      {filteredProjects.length === 0 && projects.length > 0 && (
        <div className="empty-state">
          <h3>No projects match your filters</h3>
          <p>Try adjusting your search or filter criteria</p>
          <button onClick={() => {
            setSearchTerm("")
            setSelectedCategory("")
          }} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      )}

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
