"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getImageUrl } from "../utils/imageUtils"
import { heroUtils } from "../utils/heroFix"
import "./HeroBanner.css"

const HeroBannerSelfContained = () => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredProjects, setFeaturedProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState({})

  // Fetch featured projects directly
  useEffect(() => {
    console.log('HeroBannerSelfContained: Component mounted, starting data fetch...')
    fetchFeaturedProjects()
  }, [])

  const fetchFeaturedProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('HeroBannerSelfContained: Starting fetch process...')
      
      // First test server connectivity
      const connectionTest = await heroUtils.testServerConnection()
      console.log('HeroBannerSelfContained: Connection test result:', connectionTest)
      
      // Fetch featured projects with retry and fallback
      const result = await heroUtils.fetchWithRetryAndFallback(3, true)
      console.log('HeroBannerSelfContained: Fetch result:', result)
      
      if (result.success) {
        setFeaturedProjects(result.projects)
        setDebugInfo({
          timestamp: result.timestamp,
          source: result.source || 'api',
          count: result.count,
          connectionStatus: connectionTest.message
        })
        console.log('HeroBannerSelfContained: Successfully set featured projects:', result.projects)
      } else {
        setError(result.error)
        console.error('HeroBannerSelfContained: Failed to fetch projects:', result.error)
      }
    } catch (err) {
      console.error('HeroBannerSelfContained: Unexpected error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
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

  const nextSlide = (e) => {
    e?.stopPropagation()
    setCurrentSlide(prev => (prev + 1) % featuredProjects.length)
  }

  const prevSlide = (e) => {
    e?.stopPropagation()
    setCurrentSlide(prev => (prev - 1 + featuredProjects.length) % featuredProjects.length)
  }

  const goToSlide = (index, e) => {
    e?.stopPropagation()
    setCurrentSlide(index)
  }

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`)
  }

  const handleRetry = () => {
    console.log('HeroBannerSelfContained: Manual retry triggered')
    fetchFeaturedProjects()
  }

  // Loading state
  if (loading) {
    return (
      <section className="hero-banner hero-banner-empty">
        <div className="hero-content">
          <h1>Welcome to Our Architecture Studio</h1>
          <p>Loading featured projects...</p>
          <div style={{ 
            marginTop: '20px', 
            padding: '10px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '5px',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            🔄 Fetching featured projects from server...
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error && featuredProjects.length === 0) {
    return (
      <section className="hero-banner hero-banner-empty">
        <div className="hero-content">
          <h1>Welcome to Our Architecture Studio</h1>
          <p>Creating beautiful and innovative architectural solutions</p>
          <div className="hero-empty-message">
            <p style={{ color: '#e74c3c' }}>⚠️ Unable to load featured projects</p>
            <p className="hero-empty-subtitle">Error: {error}</p>
            <button 
              onClick={handleRetry}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              🔄 Retry Loading
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Empty state (no featured projects)
  if (featuredProjects.length === 0) {
    return (
      <section className="hero-banner hero-banner-empty">
        <div className="hero-content">
          <h1>Welcome to Our Architecture Studio</h1>
          <p>Creating beautiful and innovative architectural solutions</p>
          <div className="hero-empty-message">
            <p>Add some projects in the dashboard to see them featured here!</p>
            <p className="hero-empty-subtitle">Projects marked as "featured" will appear in this hero banner carousel.</p>
            
            {/* Debug information */}
            <div style={{ 
              marginTop: '20px', 
              padding: '10px', 
              backgroundColor: '#f0f0f0', 
              borderRadius: '5px',
              fontSize: '12px',
              textAlign: 'left'
            }}>
              <strong>🐛 Debug Info:</strong><br/>
              Data source: {debugInfo.source}<br/>
              Projects count: {debugInfo.count}<br/>
              Connection: {debugInfo.connectionStatus}<br/>
              Last update: {debugInfo.timestamp}<br/>
              <button 
                onClick={handleRetry}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  marginTop: '5px',
                  fontSize: '10px'
                }}
              >
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Success state with featured projects
  return (
    <section className="hero-banner">
      
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
            <button className="hero-arrow hero-arrow-left" onClick={(e) => prevSlide(e)}>
              <ChevronLeft size={24} />
            </button>
            <button className="hero-arrow hero-arrow-right" onClick={(e) => nextSlide(e)}>
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
                onClick={(e) => goToSlide(index, e)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default HeroBannerSelfContained