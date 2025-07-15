"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "./ProjectDetailPage.css"

const ProjectDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [project, setProject] = useState(null)

  const projects = [
    {
      id: 1,
      title: "Dechen Barwa Wangi Phodrang",
      images: ["/images/project1.png", "/images/project2.png", "/images/project3.png"],
      category: "Residential",
      location: "Bhutan",
      year: "2023",
      client: "Private Client",
      designTeam: "NAMAS Architecture",
      status: "Completed",
    },
    {
      id: 2,
      title: "Cultural Heritage Center",
      images: ["/images/project2.png", "/images/project1.png", "/images/project4.png"],
      category: "Cultural",
      location: "Bhutan",
      year: "2023",
      client: "Government of Bhutan",
      designTeam: "NAMAS Architecture",
      status: "Completed",
    },
    {
      id: 3,
      title: "Modern Villa Complex",
      images: ["/images/project3.png", "/images/project5.png", "/images/project6.png"],
      category: "Residential",
      location: "Thimphu",
      year: "2022",
      client: "Private Developer",
      designTeam: "NAMAS Architecture",
      status: "Completed",
    },
    {
      id: 4,
      title: "Traditional Heritage Center",
      images: ["/images/project4.png", "/images/project1.png", "/images/project2.png"],
      category: "Cultural",
      location: "Paro",
      year: "2022",
      client: "Cultural Ministry",
      designTeam: "NAMAS Architecture",
      status: "Completed",
    },
    {
      id: 5,
      title: "Contemporary Office Building",
      images: ["/images/project5.png", "/images/project3.png", "/images/project1.png"],
      category: "Commercial",
      location: "Thimphu",
      year: "2021",
      client: "Corporate Client",
      designTeam: "NAMAS Architecture",
      status: "Completed",
    },
    {
      id: 6,
      title: "Monastery Restoration",
      images: ["/images/project6.png", "/images/project4.png", "/images/project2.png"],
      category: "Religious",
      location: "Punakha",
      year: "2021",
      client: "Monastery Board",
      designTeam: "NAMAS Architecture",
      status: "Completed",
    },
  ]

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === Number.parseInt(id))
    setProject(foundProject)
  }, [id])

  const handlePrevImage = () => {
    if (project) {
      setCurrentImageIndex((prev) => (prev === 0 ? project.images.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (project) {
      setCurrentImageIndex((prev) => (prev === project.images.length - 1 ? 0 : prev + 1))
    }
  }

  const handleIndicatorClick = (index) => {
    setCurrentImageIndex(index)
  }
  
  if (!project) {
    return <div className="project-loading">Loading...</div>
  }

  return (
    <div className="project-detail-page">
      <div className="project-gallery">
        <div className="gallery-container">
          <button className="nav-arrow nav-arrow-left" onClick={handlePrevImage}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="gallery-image-container">
            <img
              src={project.images[currentImageIndex] || "/placeholder.svg"}
              alt={project.title}
              className="gallery-image"
            />
            <div className="project-title-overlay">
              <h1>{project.title}</h1>
            </div>
          </div>

          <button className="nav-arrow nav-arrow-right" onClick={handleNextImage}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="gallery-indicators">
          {project.images.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentImageIndex ? "active" : ""}`}
              onClick={() => handleIndicatorClick(index)}
            />
          ))}
        </div>
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
            <div className="info-cell">{project.title}</div>
            <div className="info-cell">{project.client}</div>
            <div className="info-cell">{project.year}</div>
            <div className="info-cell">{project.location}</div>
            <div className="info-cell">{project.designTeam}</div>
            <div className="info-cell">{project.status}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailPage
