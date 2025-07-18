"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getImageUrl } from "../utils/imageUtils"
import "./HeroBanner.css"

const HeroBannerFixed = ({ featuredProjects = [] }) => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [debugInfo, setDebugInfo] = useState({})

  // Enhanced debugging and logging
  useEffect(() => {
    const info = {
      timestamp: new Date().toISOString(),
      featuredProjectsReceived: !!featuredProjects,
      featuredProjectsLength: featuredProjects?.length || 0,
      featuredProjectsType: typeof featuredProjects,
      isArray: Array.isArray(featuredProjects),
      firstProject: featuredProjects?.[0] || null
    }
    
    setDebugInfo(info)
    
    console.log('HeroBannerFixed: Props received', info)
    console.log('HeroBannerFixed: Full featuredProjects data:', featuredProjects)
    
    // Also try to make a direct API call to test connectivity
    if (featuredProjects?.length === 0) {
      console.log('HeroBannerFixed: No featured projects, testing direct API call...')
      testApiConnection()
    }
  }, [featuredProjects])

  const testApiConnection = async () => {
    try {
      console.log('HeroBannerFixed: Testing direct API connection...')
      const response = await fetch('http://localhost:5000/api/projects/featured')
      console.log('HeroBannerFixed: API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('HeroBannerFixed: Direct API call successful:', data)
      } else {
        console.error('HeroBannerFixed: API call failed with status:', response.status)
      }
    } catch (error) {
      console.error('HeroBannerFixed: Direct API call error:', error)
    }
  }

  // Reset slide to 0 when featuredProjects changes
  useEffect(() => {
    setCurrentSlide(0)
  }, [featuredProjects])

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (featuredProjects.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredProjects.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [featuredProjects.length])

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % featuredProjects.length)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + featuredProjects.length) % featuredProjects.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`)
  }

  // Enhanced empty state with debug information
  if (!featuredProjects || featuredProjects.length === 0) {
    return (
      <section className="hero-banner hero-banner-empty">
        <div className="hero-content">
          <h1>Welcome to Our Architecture Studio</h1>
          <p>Creating beautiful and innovative architectural solutions</p>
          <div className="hero-empty-message">
            <p>Add some projects in the dashboard to see them featured here!</p>
            <p className="hero-empty-subtitle">Projects marked as "featured" will appear in this hero banner carousel.</p>
            
            {/* Debug information - remove in production */}
            <div style={{ 
              marginTop: '20px', 
              padding: '10px', 
              backgroundColor: '#f0f0f0', 
              borderRadius: '5px',
              fontSize: '12px',
              textAlign: 'left'
            }}>
              <strong>🐛 Debug Info:</strong><br/>
              Projects received: {debugInfo.featuredProjectsReceived ? 'Yes' : 'No'}<br/>
              Projects count: {debugInfo.featuredProjectsLength}<br/>
              Is Array: {debugInfo.isArray ? 'Yes' : 'No'}<br/>
              Type: {debugInfo.featuredProjectsType}<br/>
              Last update: {debugInfo.timestamp}<br/>
              {debugInfo.firstProject && (
                <>First project: {debugInfo.firstProject.title}</>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="hero-banner">
      {/* Debug overlay - remove in production */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '3px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        ✅ {featuredProjects.length} featured project(s) loaded
      </div>
      
      <div className="hero-slider">
        {featuredProjects.map((project, index) => (
          <div
            key={project.id}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${getImageUrl(project.image) || '/images/placeholder.png'})`
            }}
            onClick={() => handleProjectClick(project.id)}
          >
            <div className="hero-overlay" />
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">{project.title}</h1>
                <div className="hero-actions">
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation arrows */}
        {featuredProjects.length > 1 && (
          <>
            <button className="hero-arrow hero-arrow-left" onClick={prevSlide}>
              <ChevronLeft size={24} />
            </button>
            <button className="hero-arrow hero-arrow-right" onClick={nextSlide}>
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Slide indicators */}
        {featuredProjects.length > 1 && (
          <div className="hero-indicators">
            {featuredProjects.map((_, index) => (
              <button
                key={index}
                className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default HeroBannerFixed