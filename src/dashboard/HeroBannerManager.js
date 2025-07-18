"use client"

import { useState, useEffect } from "react"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import "./HeroBannerManager.css"

const HeroBannerManager = () => {
  const { projects, featuredProjects, loading, updateProject, fetchProjects, fetchFeaturedProjects } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [updatingProject, setUpdatingProject] = useState(null)

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
      await updateProject(project.id, {
        ...project,
        featured: !project.featured
      })
      // Refresh the featured projects list to ensure UI is updated
      await fetchFeaturedProjects()
      // Show success message
      const message = `"${project.title}" has been ${action} the hero banner!`
      console.log(message)
      // You could replace this with a toast notification system
    } catch (error) {
      console.error('Error updating project featured status:', error)
      alert('Error updating project: ' + error.message)
    } finally {
      setUpdatingProject(null)
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
      </div>

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