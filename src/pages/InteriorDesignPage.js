"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import "./InteriorDesignPage.css"

const InteriorDesignPage = () => {
  const navigate = useNavigate()
  const { projects, loading, fetchProjects } = useData()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const sliderRef = useRef(null)

  // Filter states
  const [filters, setFilters] = useState({
    year: '',
    location: '',
    category: '',
    status: '' // NEW status filter
  })
  const [openDropdown, setOpenDropdown] = useState(null)

  // Categories that should appear on the Interior Design page
  const interiorDesignCategories = [
    "Architecture"
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

  // Filter projects to show only interior design related categories
  const interiorProjects = projects.filter(project => 
    interiorDesignCategories.includes(project.category)
  )

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.interior-design-filter-item')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openDropdown])

  const getUniqueValues = (key) => {
    return [...new Set(interiorProjects.map(project => project[key]))].sort()
  }

  const filteredProjects = interiorProjects.filter(project => {
    return (
      (!filters.year || project.year === filters.year) &&
      (!filters.location || project.location === filters.location) &&
      (!filters.category || project.category === filters.category) &&
      (!filters.status || project.status === filters.status)
    )
  })

  const totalSlides = isMobile ? filteredProjects.length : Math.ceil(filteredProjects.length / 2)

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
    setCurrentSlide(0) // Reset to first slide when filter changes
    setOpenDropdown(null)
  }

  const handleDropdownToggle = (e, dropdownType) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenDropdown(openDropdown === dropdownType ? null : dropdownType)
  }

  const handleDropdownItemClick = (e, filterType, value) => {
    e.preventDefault()
    e.stopPropagation()
    handleFilterChange(filterType, value)
  }

  const handleMouseDown = (e) => {
    if (e.target.closest('.interior-design-filter-section')) return
    setIsDragging(true)
    setStartX(e.clientX)
    setTranslateX(0)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const currentX = e.clientX
    setTranslateX(currentX - startX)
  }

  const handleMouseUp = (e) => {
    if (!isDragging) return
    setIsDragging(false)
    const diff = e.clientX - startX

    if (Math.abs(diff) > 150) {
      if (diff < 0 && currentSlide < totalSlides - 1) setCurrentSlide(prev => prev + 1)
      else if (diff > 0 && currentSlide > 0) setCurrentSlide(prev => prev - 1)
    }

    setTranslateX(0)
  }

  const handleTouchStart = (e) => {
    if (e.target.closest('.interior-design-filter-section')) return
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setTranslateX(0)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    const currentX = e.touches[0].clientX
    setTranslateX(currentX - startX)
  }

  const handleTouchEnd = (e) => {
    if (!isDragging) return
    setIsDragging(false)
    const diff = e.changedTouches[0].clientX - startX

    if (Math.abs(diff) > 150) {
      if (diff < 0 && currentSlide < totalSlides - 1) setCurrentSlide(prev => prev + 1)
      else if (diff > 0 && currentSlide > 0) setCurrentSlide(prev => prev - 1)
    }

    setTranslateX(0)
  }

  const handleReadClick = (e, projectId) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/project/${projectId}`)
  }

  const getAllProjectPairs = () => {
    const pairs = []
    for (let i = 0; i < totalSlides; i++) {
      if (isMobile) {
        // Show one project per slide on mobile
        const project = filteredProjects[i]
        pairs.push(project ? [project] : [])
      } else {
        // Show two projects per slide on desktop
        const startIndex = i * 2
        const pair = filteredProjects.slice(startIndex, startIndex + 2)
        pairs.push(pair)
      }
    }
    return pairs
  }

  const projectPairs = getAllProjectPairs()

  return (
    <div className="interior-design-page">
      <div
        className="interior-design-slider-container"
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
          className="interior-design-projects-slider"
          style={{
            transform: `translateX(${-currentSlide * 100 + (translateX / window.innerWidth) * 100}%)`,
            transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {projectPairs.map((pair, slideIndex) => (
            <div key={slideIndex} className="interior-design-projects-display">
              {pair.map((project, index) => (
                <div key={`${project.id}-${slideIndex}-${index}`} className="interior-design-project-half">
                                      <div className="interior-design-project-background" style={{ backgroundImage: `url(${getImageUrl(project.image)})` }}>
                    <div className="interior-design-project-overlay-content">
                      <div className="interior-design-project-text-content">
                        <h2 className="interior-design-project-title">{project.title}</h2>
                        <span onClick={(e) => handleReadClick(e, project.id)} className="interior-design-read-link">
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

      <div className="interior-design-filter-section">
        <div className="interior-design-filter-controls">
          {/* YEAR */}
          <div className="interior-design-filter-item">
            <div onClick={(e) => handleDropdownToggle(e, 'year')} className="interior-design-filter-dropdown-trigger">
              <span>{filters.year || 'YEAR'}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={`interior-design-dropdown-arrow ${openDropdown === 'year' ? 'interior-design-rotated' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {openDropdown === 'year' && (
              <div className="interior-design-dropup">
                <div className="interior-design-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'year', '')}>All Years</div>
                {getUniqueValues('year').map(year => (
                  <div key={year} className="interior-design-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'year', year)}>{year}</div>
                ))}
              </div>
            )}
          </div>

          {/* LOCATION */}
          <div className="interior-design-filter-item">
            <div onClick={(e) => handleDropdownToggle(e, 'location')} className="interior-design-filter-dropdown-trigger">
              <span>{filters.location || 'LOCATION'}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={`interior-design-dropdown-arrow ${openDropdown === 'location' ? 'interior-design-rotated' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {openDropdown === 'location' && (
              <div className="interior-design-dropup">
                <div className="interior-design-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'location', '')}>All Locations</div>
                {getUniqueValues('location').map(loc => (
                  <div key={loc} className="interior-design-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'location', loc)}>{loc}</div>
                ))}
              </div>
            )}
          </div>

          {/* CATEGORY */}
          <div className="interior-design-filter-item">
            <div onClick={(e) => handleDropdownToggle(e, 'category')} className="interior-design-filter-dropdown-trigger">
              <span>{filters.category || 'CATEGORY'}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={`interior-design-dropdown-arrow ${openDropdown === 'category' ? 'interior-design-rotated' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {openDropdown === 'category' && (
              <div className="interior-design-dropup">
                <div className="interior-design-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'category', '')}>All Categories</div>
                {getUniqueValues('category').map(cat => (
                  <div key={cat} className="interior-design-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'category', cat)}>{cat}</div>
                ))}
              </div>
            )}
          </div>

          {/* STATUS */}
          <div className="interior-design-filter-item">
            <div onClick={(e) => handleDropdownToggle(e, 'status')} className="interior-design-filter-dropdown-trigger">
              <span>{filters.status || 'STATUS'}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={`interior-design-dropdown-arrow ${openDropdown === 'status' ? 'interior-design-rotated' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {openDropdown === 'status' && (
              <div className="interior-design-dropup">
                <div className="interior-design-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'status', '')}>All Status</div>
                {getUniqueValues('status').map(stat => (
                  <div key={stat} className="interior-design-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'status', stat)}>{stat}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteriorDesignPage