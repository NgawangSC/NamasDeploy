"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import "./RenovationPage.css"

const RenovationPage = () => {
  const navigate = useNavigate()
  const { projects, loading, fetchProjects } = useData()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const sliderRef = useRef(null)

  // Filter states
  const [filters, setFilters] = useState({
    year: '',
    location: '',
    category: '',
    status: '' // NEW status filter
  })
  const [openDropdown, setOpenDropdown] = useState(null)

  // Renovation page categories - projects that fall under renovation/remodeling services
  const renovationCategories = [
    "Renovation"
  ]

  useEffect(() => {
    // Fetch projects if not already loaded
    if (projects.length === 0 && !loading.projects) {
      fetchProjects()
    }
  }, [projects, loading.projects, fetchProjects])

  // Filter projects to show only renovation related categories
  const renovationProjects = projects.filter(project => 
    renovationCategories.includes(project.category)
  )

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.renovation-filter-item')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openDropdown])

  const getUniqueValues = (key) => {
    return [...new Set(renovationProjects.map(project => project[key]))].sort()
  }

  const filteredProjects = renovationProjects.filter(project => {
    return (
      (!filters.year || project.year === filters.year) &&
      (!filters.location || project.location === filters.location) &&
      (!filters.category || project.category === filters.category) &&
      (!filters.status || project.status === filters.status)
    )
  })

  const totalSlides = Math.ceil(filteredProjects.length / 2)

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
    setCurrentSlide(0)
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
    if (e.target.closest('.renovation-filter-section')) return
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
    if (e.target.closest('.renovation-filter-section')) return
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

  const handleReadClick = (e, projectId) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/project/${projectId}`)
  }

  // Get all project pairs for smooth sliding
  const getAllProjectPairs = () => {
    const pairs = []
    for (let i = 0; i < totalSlides; i++) {
      const startIndex = i * 2
      const pair = filteredProjects.slice(startIndex, startIndex + 2)
      pairs.push(pair)
    }
    return pairs
  }

  const projectPairs = getAllProjectPairs()



  return (
    <div className="renovation-page">
      <div
        className="renovation-slider-container"
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
          className="renovation-projects-slider"
          style={{
            transform: `translateX(${-currentSlide * 100 + (translateX / window.innerWidth) * 100}%)`,
            transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {projectPairs.map((pair, slideIndex) => (
            <div key={slideIndex} className="renovation-projects-display">
              {pair.map((project, index) => (
                <div key={`${project.id}-${slideIndex}-${index}`} className="renovation-project-half">
                  <div className="renovation-project-background" style={{ backgroundImage: `url(${getImageUrl(project.image)})` }}>
                    <div className="renovation-project-overlay-content">
                      <div className="renovation-project-text-content">
                        <h2 className="renovation-project-title">{project.title}</h2>
                        <span onClick={(e) => handleReadClick(e, project.id)} className="renovation-read-link">
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

      <div className="renovation-filter-section">
        <div className="renovation-filter-controls">
          {/* YEAR */}
          <div className="renovation-filter-item">
            <div onClick={(e) => handleDropdownToggle(e, 'year')} className="renovation-filter-dropdown-trigger">
              <span>{filters.year || 'YEAR'}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={`renovation-dropdown-arrow ${openDropdown === 'year' ? 'renovation-rotated' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {openDropdown === 'year' && (
              <div className="renovation-dropup">
                <div className="renovation-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'year', '')}>All Years</div>
                {getUniqueValues('year').map(year => (
                  <div key={year} className="renovation-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'year', year)}>{year}</div>
                ))}
              </div>
            )}
          </div>

          {/* LOCATION */}
          <div className="renovation-filter-item">
            <div onClick={(e) => handleDropdownToggle(e, 'location')} className="renovation-filter-dropdown-trigger">
              <span>{filters.location || 'LOCATION'}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={`renovation-dropdown-arrow ${openDropdown === 'location' ? 'renovation-rotated' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {openDropdown === 'location' && (
              <div className="renovation-dropup">
                <div className="renovation-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'location', '')}>All Locations</div>
                {getUniqueValues('location').map(loc => (
                  <div key={loc} className="renovation-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'location', loc)}>{loc}</div>
                ))}
              </div>
            )}
          </div>

          {/* CATEGORY */}
          <div className="renovation-filter-item">
            <div onClick={(e) => handleDropdownToggle(e, 'category')} className="renovation-filter-dropdown-trigger">
              <span>{filters.category || 'CATEGORY'}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={`renovation-dropdown-arrow ${openDropdown === 'category' ? 'renovation-rotated' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {openDropdown === 'category' && (
              <div className="renovation-dropup">
                <div className="renovation-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'category', '')}>All Categories</div>
                {getUniqueValues('category').map(cat => (
                  <div key={cat} className="renovation-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'category', cat)}>{cat}</div>
                ))}
              </div>
            )}
          </div>

          {/* STATUS */}
          <div className="renovation-filter-item">
            <div onClick={(e) => handleDropdownToggle(e, 'status')} className="renovation-filter-dropdown-trigger">
              <span>{filters.status || 'STATUS'}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={`renovation-dropdown-arrow ${openDropdown === 'status' ? 'renovation-rotated' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {openDropdown === 'status' && (
              <div className="renovation-dropup">
                <div className="renovation-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'status', '')}>All Status</div>
                {getUniqueValues('status').map(stat => (
                  <div key={stat} className="renovation-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'status', stat)}>{stat}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RenovationPage