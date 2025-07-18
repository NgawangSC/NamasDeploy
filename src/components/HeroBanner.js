"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getImageUrl } from "../utils/imageUtils"
import "./HeroBanner.css"

const HeroBanner = ({ featuredProjects = [] }) => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)

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

  if (!featuredProjects || featuredProjects.length === 0) {
    return (
      <section className="hero-banner hero-banner-empty">
        <div className="hero-content">
          <h1>Welcome to Our Architecture Studio</h1>
          <p>Creating beautiful and innovative architectural solutions</p>
          <div className="hero-empty-message">
            <p>Add some projects in the dashboard to see them featured here!</p>
            <p className="hero-empty-subtitle">Projects marked as "featured" will appear in this hero banner carousel.</p>
          </div>
        </div>
      </section>
    )
  }

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

export default HeroBanner