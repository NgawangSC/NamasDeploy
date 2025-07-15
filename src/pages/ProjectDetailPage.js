"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useData } from "../contexts/DataContext"
import "./ProjectDetailPage.css"

const ProjectDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, loading, fetchProjects } = useData()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [project, setProject] = useState(null)

  useEffect(() => {
    // Fetch projects if not already loaded
    if (projects.length === 0 && !loading.projects) {
      fetchProjects()
    }
  }, [projects, loading.projects, fetchProjects])

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === Number.parseInt(id))
    setProject(foundProject)
    
    // Reset image index when project changes
    if (foundProject) {
      setCurrentImageIndex(0)
    }
  }, [id, projects])

  const handlePrevImage = () => {
    if (project && project.images && project.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? project.images.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (project && project.images && project.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === project.images.length - 1 ? 0 : prev + 1))
    }
  }

  const handleIndicatorClick = (index) => {
    setCurrentImageIndex(index)
  }
  
  if (loading.projects) {
    return <div className="project-loading">Loading projects...</div>
  }

  if (!project) {
    return (
      <div className="project-loading">
        <h2>Project not found</h2>
        <p>The project you're looking for doesn't exist or may have been removed.</p>
        <button onClick={() => navigate('/')} className="back-home-btn">
          Go Back to Home
        </button>
      </div>
    )
  }

  // Handle both single image and multiple images
  const projectImages = project.images && project.images.length > 0 
    ? project.images 
    : project.image 
      ? [project.image] 
      : ["/placeholder.svg"]

  return (
    <div className="project-detail-page">
      <div className="project-gallery">
        <div className="gallery-container">
          {projectImages.length > 1 && (
            <button className="nav-arrow nav-arrow-left" onClick={handlePrevImage}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <div className="gallery-image-container">
            <img
              src={projectImages[currentImageIndex] || "/placeholder.svg"}
              alt={project.title}
              className="gallery-image"
            />
            <div className="project-title-overlay">
              <h1>{project.title}</h1>
            </div>
          </div>

          {projectImages.length > 1 && (
            <button className="nav-arrow nav-arrow-right" onClick={handleNextImage}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {projectImages.length > 1 && (
          <div className="gallery-indicators">
            {projectImages.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentImageIndex ? "active" : ""}`}
                onClick={() => handleIndicatorClick(index)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="project-info-section">
        <div className="project-info-table">
          <div className="info-row">
            <div className="info-cell">PROJECT NAME</div>
            <div className="info-cell">CLIENT</div>
            <div className="info-cell">YEAR</div>
            <div className="info-cell">LOCATION</div>
            <div className="info-cell">DESIGN TEAM</div>
            <div className="info-cell">STATUS</div>
          </div>
          <div className="info-row info-data">
            <div className="info-cell">{project.title || 'N/A'}</div>
            <div className="info-cell">{project.client || 'N/A'}</div>
            <div className="info-cell">{project.year || 'N/A'}</div>
            <div className="info-cell">{project.location || 'N/A'}</div>
            <div className="info-cell">{project.designTeam || 'NAMAS Architecture'}</div>
            <div className="info-cell">{project.status || 'N/A'}</div>
          </div>
        </div>
        
        {project.description && (
          <div className="project-description-section">
            <h2>Project Description</h2>
            <p>{project.description}</p>
          </div>
        )}
        
        {project.category && (
          <div className="project-category-section">
            <h3>Category: <span>{project.category}</span></h3>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetailPage
