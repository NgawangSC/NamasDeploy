"use client"

import { useState, useEffect } from "react"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import "./RecentProjectsManager.css"

const RecentProjectsManager = () => {
  const { projects, loading, updateProject, fetchProjects } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")

  useEffect(() => {
    if (projects.length === 0 && !loading.projects) {
      fetchProjects()
    }
  }, [projects, loading, fetchProjects])

  const handleToggleRecent = async (project) => {
    try {
      await updateProject(project.id, {
        ...project,
        showInRecent: !project.showInRecent
      })
    } catch (error) {
      console.error('Error updating project recent status:', error)
      alert('Error updating project: ' + error.message)
    }
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "createdAt":
        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
      case "title":
        return a.title.localeCompare(b.title)
      case "year":
        return parseInt(b.year) - parseInt(a.year)
      case "category":
        return a.category.localeCompare(b.category)
      default:
        return 0
    }
  })

  const recentProjects = sortedProjects.filter(p => p.showInRecent)
  const allProjects = sortedProjects

  return (
    <div className="recent-projects-manager">
      <div className="manager-header">
        <h1>Recent Projects Manager</h1>
        <p>Manage which projects appear in the "Recent Projects" section on the homepage</p>
      </div>

      <div className="controls-section">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="sort-section">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="createdAt">Date Created</option>
            <option value="year">Project Year</option>
            <option value="title">Title</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      <div className="recent-summary">
        <h2>Currently in Recent Projects ({recentProjects.length} projects)</h2>
        <p className="summary-text">These projects will appear in the homepage Recent Projects section</p>
        <div className="recent-grid">
          {recentProjects.map((project) => (
            <div key={project.id} className="recent-project-card">
              <div className="project-image">
                <img 
                  src={getImageUrl(project.image) || "/placeholder.svg?height=150&width=200&text=No+Image"} 
                  alt={project.title} 
                />
              </div>
              <div className="project-info">
                <h3>{project.title}</h3>
                <p className="project-meta">{project.category} • {project.location} • {project.year}</p>
                <button 
                  onClick={() => handleToggleRecent(project)}
                  className="remove-recent-btn"
                >
                  Remove from Recent
                </button>
              </div>
            </div>
          ))}
          {recentProjects.length === 0 && (
            <div className="empty-state">
              <p>No projects are currently marked as recent.</p>
              <p>Select projects below to add them to the recent projects section.</p>
            </div>
          )}
        </div>
      </div>

      <div className="all-projects-section">
        <h2>All Projects ({allProjects.length} total)</h2>
        {loading.projects ? (
          <div className="loading">Loading projects...</div>
        ) : (
          <div className="projects-grid">
            {allProjects.map((project) => (
              <div key={project.id} className={`project-card ${project.showInRecent ? 'recent' : ''}`}>
                <div className="project-image">
                  <img 
                    src={getImageUrl(project.image) || "/placeholder.svg?height=150&width=200&text=No+Image"} 
                    alt={project.title} 
                  />
                  {project.showInRecent && (
                    <div className="recent-badge">Recent</div>
                  )}
                  {project.featured && (
                    <div className="featured-badge">Featured</div>
                  )}
                </div>
                <div className="project-info">
                  <h3>{project.title}</h3>
                  <p className="project-meta">
                    {project.category} • {project.location} • {project.year}
                  </p>
                  <p className="project-status">Status: {project.status}</p>
                  <p className="project-description">{project.description}</p>
                  <button 
                    onClick={() => handleToggleRecent(project)}
                    className={`toggle-recent-btn ${project.showInRecent ? 'recent' : ''}`}
                  >
                    {project.showInRecent ? 'Remove from Recent' : 'Add to Recent'}
                  </button>
                </div>
              </div>
            ))}
            {allProjects.length === 0 && !loading.projects && (
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

export default RecentProjectsManager