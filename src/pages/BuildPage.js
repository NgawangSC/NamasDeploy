"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useData } from "../contexts/DataContext"
import "./DesignPage.css"

const BuildPage = () => {
  const navigate = useNavigate()
  const { projects, loading, fetchProjects } = useData()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const sliderRef = useRef(null)

  // Build page categories - projects that fall under build/construction services
  const buildCategories = [
    "Interior Build",
    "Private Homes",
    "Commercial Buildings", 
    "Office",
    "Institute",
    "Hospitality",
    "Renovation",
    "Supervision",
    "Management",
    "Commercial",
    "Healthcare"
  ]

  useEffect(() => {
    // Fetch projects if not already loaded
    if (projects.length === 0 && !loading.projects) {
      fetchProjects()
    }
  }, [projects, loading.projects, fetchProjects])

  // Filter projects to show only build-related categories
  const buildProjects = projects.filter(project => 
    buildCategories.includes(project.category)
  )

  const totalSlides = Math.ceil(buildProjects.length / 2)

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.clientX)
    setTranslateX(0)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    const currentX = e.clientX
    const diff = currentX - startX
    setTranslateX(diff)
  }

  const handleMouseUp = (e) => {
    if (!isDragging) return

    setIsDragging(false)
    const currentX = e.clientX
    const diff = currentX - startX

    // Threshold for slide change (150px)
    if (Math.abs(diff) > 150) {
      if (diff < 0 && currentSlide < totalSlides - 1) {
        // Drag left - next slide
        setCurrentSlide((prev) => prev + 1)
      } else if (diff > 0 && currentSlide > 0) {
        // Drag right - previous slide
        setCurrentSlide((prev) => prev - 1)
      }
    }

    setTranslateX(0)
  }

  const handleTouchStart = (e) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setTranslateX(0)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return

    const currentX = e.touches[0].clientX
    const diff = currentX - startX
    setTranslateX(diff)
  }

  const handleTouchEnd = (e) => {
    if (!isDragging) return

    setIsDragging(false)
    const currentX = e.changedTouches[0].clientX
    const diff = currentX - startX

    if (Math.abs(diff) > 150) {
      if (diff < 0 && currentSlide < totalSlides - 1) {
        setCurrentSlide((prev) => prev + 1)
      } else if (diff > 0 && currentSlide > 0) {
        setCurrentSlide((prev) => prev - 1)
      }
    }

    setTranslateX(0)
  }

  const handleReadClick = (projectId) => {
    navigate(`/project/${projectId}`)
  }

  // Get all project pairs for smooth sliding
  const getAllProjectPairs = () => {
    const pairs = []
    for (let i = 0; i < totalSlides; i++) {
      const startIndex = i * 2
      const pair = buildProjects.slice(startIndex, startIndex + 2)
      pairs.push(pair)
    }
    return pairs
  }

  const projectPairs = getAllProjectPairs()

  return (
    <div className="design-page">
      <div
        className="slider-container"
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="projects-slider"
          style={{
            transform: `translateX(${-currentSlide * 100 + (translateX / window.innerWidth) * 100}%)`,
            transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {projectPairs.map((pair, slideIndex) => (
            <div key={slideIndex} className="projects-display">
              {pair.map((project, index) => (
                <div key={`${project.id}-${slideIndex}-${index}`} className="project-half">
                  <div className="project-background" style={{ backgroundImage: `url(${project.image})` }}>
                    <div className="project-overlay">
                      <div className="project-content">
                        <h2 className="project-title">{project.title}</h2>
                        <span className="read-text" onClick={() => handleReadClick(project.id)}>
                          READ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-controls">
          <div className="filter-item">
            <span>YEAR</span>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="filter-item">
            <span>LOCATION</span>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="filter-item">
            <span>CATEGORY</span>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="social-icons">
          <a href="#" className="social-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a href="#" className="social-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="white" strokeWidth="2" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" stroke="white" strokeWidth="2" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </a>
          <a href="#" className="social-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.54 6.42A2.78 2.78 0 0 0 20.58 4.46C18.88 4 12 4 12 4S5.12 4 3.42 4.46A2.78 2.78 0 0 0 1.46 6.42C1 8.12 1 12 1 12S1 15.88 1.46 17.58A2.78 2.78 0 0 0 3.42 19.54C5.12 20 12 20 12 20S18.88 20 20.58 19.54A2.78 2.78 0 0 0 22.54 17.58C23 15.88 23 12 23 12S23 8.12 22.54 6.42Z"
                stroke="white"
                strokeWidth="2"
              />
              <polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="white" />
            </svg>
          </a>
          <a href="#" className="social-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

export default BuildPage
