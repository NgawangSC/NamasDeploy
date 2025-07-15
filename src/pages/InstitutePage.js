"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./InstitutePage.css"

const InstitutePage = () => {
  const navigate = useNavigate()
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

  const projects = [
    {
      id: 1,
      title: "Dechen Barwa Wangi Phodrang",
      image: "/images/project1.png",
      category: "Residential",
      location: "Bhutan",
      year: "2023",
      status: "Completed"
    },
    {
      id: 2,
      title: "Dechen Barwa Wangi Phodrang",
      image: "/images/project2.png",
      category: "Cultural",
      location: "Bhutan",
      year: "2023",
      status: "Ongoing"
    },
    {
      id: 3,
      title: "Modern Villa Complex",
      image: "/images/project3.png",
      category: "Residential",
      location: "Thimphu",
      year: "2022",
      status: "Completed"
    },
    {
      id: 4,
      title: "Traditional Heritage Center",
      image: "/images/project4.png",
      category: "Cultural",
      location: "Paro",
      year: "2022",
      status: "Ongoing"
    },
    {
      id: 5,
      title: "Contemporary Office Building",
      image: "/images/project5.png",
      category: "Commercial",
      location: "Thimphu",
      year: "2021",
      status: "Completed"
    },
    {
      id: 6,
      title: "Monastery Restoration",
      image: "/images/project6.png",
      category: "Religious",
      location: "Punakha",
      year: "2021",
      status: "Ongoing"
    },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.institute-filter-item')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openDropdown])

  const getUniqueValues = (key) => {
    return [...new Set(projects.map(project => project[key]))].sort()
  }

  const filteredProjects = projects.filter(project => {
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
    if (e.target.closest('.institute-filter-section')) return
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
    if (e.target.closest('.institute-filter-section')) return
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
      const startIndex = i * 2
      const pair = filteredProjects.slice(startIndex, startIndex + 2)
      if (pair.length === 1) pair.push(filteredProjects[0] || pair[0])
      pairs.push(pair)
    }
    return pairs
  }

  const projectPairs = getAllProjectPairs()

  return (
    <div className="institute-page">
      <div
        className="institute-slider-container"
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
          className="institute-projects-slider"
          style={{
            transform: `translateX(${-currentSlide * 100 + (translateX / window.innerWidth) * 100}%)`,
            transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {projectPairs.map((pair, slideIndex) => (
            <div key={slideIndex} className="institute-projects-display">
              {pair.map((project, index) => (
                <div key={`${project.id}-${slideIndex}-${index}`} className="institute-project-half">
                  <div className="institute-project-background" style={{ backgroundImage: `url(${project.image})` }}>
                    <div className="institute-project-overlay-content">
                      <div className="institute-project-text-content">
                        <h2 className="institute-project-title">{project.title}</h2>
                        <span onClick={(e) => handleReadClick(e, project.id)} className="institute-read-link">
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

      <div className="institute-filter-section">
        <div className="institute-filter-controls">
          {/* YEAR */}
          <div className="institute-filter-item">
            <div onClick={(e) => handleDropdownToggle(e, 'year')} className="institute-filter-dropdown-trigger">
              <span>{filters.year || 'YEAR'}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={`institute-dropdown-arrow ${openDropdown === 'year' ? 'institute-rotated' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {openDropdown === 'year' && (
              <div className="institute-dropup">
                <div className="institute-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'year', '')}>All Years</div>
                {getUniqueValues('year').map(year => (
                  <div key={year} className="institute-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'year', year)}>{year}</div>
                ))}
              </div>
            )}
          </div>

          {/* LOCATION */}
          <div className="institute-filter-item">
            <div onClick={(e) => handleDropdownToggle(e, 'location')} className="institute-filter-dropdown-trigger">
              <span>{filters.location || 'LOCATION'}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={`institute-dropdown-arrow ${openDropdown === 'location' ? 'institute-rotated' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {openDropdown === 'location' && (
              <div className="institute-dropup">
                <div className="institute-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'location', '')}>All Locations</div>
                {getUniqueValues('location').map(loc => (
                  <div key={loc} className="institute-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'location', loc)}>{loc}</div>
                ))}
              </div>
            )}
          </div>

          {/* CATEGORY */}
          <div className="institute-filter-item">
            <div onClick={(e) => handleDropdownToggle(e, 'category')} className="institute-filter-dropdown-trigger">
              <span>{filters.category || 'CATEGORY'}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={`institute-dropdown-arrow ${openDropdown === 'category' ? 'institute-rotated' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {openDropdown === 'category' && (
              <div className="institute-dropup">
                <div className="institute-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'category', '')}>All Categories</div>
                {getUniqueValues('category').map(cat => (
                  <div key={cat} className="institute-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'category', cat)}>{cat}</div>
                ))}
              </div>
            )}
          </div>

          {/* STATUS */}
          <div className="institute-filter-item">
            <div onClick={(e) => handleDropdownToggle(e, 'status')} className="institute-filter-dropdown-trigger">
              <span>{filters.status || 'STATUS'}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={`institute-dropdown-arrow ${openDropdown === 'status' ? 'institute-rotated' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {openDropdown === 'status' && (
              <div className="institute-dropup">
                <div className="institute-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'status', '')}>All Status</div>
                {getUniqueValues('status').map(stat => (
                  <div key={stat} className="institute-dropup-item" onClick={(e) => handleDropdownItemClick(e, 'status', stat)}>{stat}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstitutePage