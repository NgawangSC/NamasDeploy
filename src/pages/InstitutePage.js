"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import "./DesignPage.css"

const InstitutePage = () => {
  const navigate = useNavigate()
  const { projects, loading, fetchProjects } = useData()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const sliderRef = useRef(null)

  // Filter state
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  // Institute page categories - projects that fall under institute/educational services
  const instituteCategories = [
    "Institute",
  ]

  useEffect(() => {
    // Fetch projects if not already loaded
    if (projects.length === 0 && !loading.projects) {
      fetchProjects()
    }
  }, [projects, loading.projects, fetchProjects])

  // Handle window resize to update mobile state
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile)
        setCurrentSlide(0) // Reset to first slide when changing layouts
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobile])

  // Filter projects to show only institute-related categories
  let instituteProjects = projects.filter(project => 
    instituteCategories.includes(project.category)
  )

  // Apply additional filters
  if (selectedYear) {
    instituteProjects = instituteProjects.filter(project => project.year === selectedYear)
  }
  if (selectedLocation) {
    instituteProjects = instituteProjects.filter(project => project.location === selectedLocation)
  }
  if (selectedCategory) {
    instituteProjects = instituteProjects.filter(project => project.category === selectedCategory)
  }

  // Get unique values for filter options
  const availableYears = [...new Set(projects.filter(p => instituteCategories.includes(p.category)).map(p => p.year))].sort()
  const availableLocations = [...new Set(projects.filter(p => instituteCategories.includes(p.category)).map(p => p.location))].sort()
  const availableCategories = [...new Set(projects.filter(p => instituteCategories.includes(p.category)).map(p => p.category))].sort()

  const totalSlides = Math.ceil(instituteProjects.length / 2)

  // Reset slide when filters change
  useEffect(() => {
    setCurrentSlide(0)
  }, [selectedYear, selectedLocation, selectedCategory])

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
      const pair = instituteProjects.slice(startIndex, startIndex + 2)
      pairs.push(pair)
    }
    return pairs
  }

  const projectPairs = getAllProjectPairs()

  // Clear all filters
  const clearFilters = () => {
    setSelectedYear("")
    setSelectedLocation("")
    setSelectedCategory("")
  }

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowYearDropdown(false)
      setShowLocationDropdown(false)
      setShowCategoryDropdown(false)
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

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
                  <div className="project-background" style={{ backgroundImage: `url(${getImageUrl(project.image)})` }}>
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
          <div className="filter-item" onClick={(e) => {e.stopPropagation(); setShowYearDropdown(!showYearDropdown); setShowLocationDropdown(false); setShowCategoryDropdown(false)}}>
            <span>{selectedYear || "YEAR"}</span>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {showYearDropdown && (
              <div className="filter-dropdown">
                <div className="filter-option" onClick={(e) => {e.stopPropagation(); setSelectedYear(""); setShowYearDropdown(false)}}>
                  All Years
                </div>
                {availableYears.map(year => (
                  <div key={year} className="filter-option" onClick={(e) => {e.stopPropagation(); setSelectedYear(year); setShowYearDropdown(false)}}>
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="filter-item" onClick={(e) => {e.stopPropagation(); setShowLocationDropdown(!showLocationDropdown); setShowYearDropdown(false); setShowCategoryDropdown(false)}}>
            <span>{selectedLocation || "LOCATION"}</span>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {showLocationDropdown && (
              <div className="filter-dropdown">
                <div className="filter-option" onClick={(e) => {e.stopPropagation(); setSelectedLocation(""); setShowLocationDropdown(false)}}>
                  All Locations
                </div>
                {availableLocations.map(location => (
                  <div key={location} className="filter-option" onClick={(e) => {e.stopPropagation(); setSelectedLocation(location); setShowLocationDropdown(false)}}>
                    {location}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="filter-item" onClick={(e) => {e.stopPropagation(); setShowCategoryDropdown(!showCategoryDropdown); setShowYearDropdown(false); setShowLocationDropdown(false)}}>
            <span>{selectedCategory || "CATEGORY"}</span>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {showCategoryDropdown && (
              <div className="filter-dropdown">
                <div className="filter-option" onClick={(e) => {e.stopPropagation(); setSelectedCategory(""); setShowCategoryDropdown(false)}}>
                  All Categories
                </div>
                {availableCategories.map(category => (
                  <div key={category} className="filter-option" onClick={(e) => {e.stopPropagation(); setSelectedCategory(category); setShowCategoryDropdown(false)}}>
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>
          {(selectedYear || selectedLocation || selectedCategory) && (
            <div className="clear-filters" onClick={clearFilters}>
              Clear Filters
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InstitutePage