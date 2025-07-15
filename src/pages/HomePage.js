"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useData } from "../contexts/DataContext"
import "./HomePage.css"

function HomePage() {
  const navigate = useNavigate()
  const { getRecentProjects, loading } = useData()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedTestimonial, setSelectedTestimonial] = useState(0)
  const [currentClientSlide, setCurrentClientSlide] = useState(0)

  const totalSlides = 5
  const totalClientSlides = 3

  // Get the 6 most recent projects from the dashboard
  const recentProjects = getRecentProjects(6).map(project => ({
    id: project.id,
    name: project.title,
    year: project.year,
    image: project.image,
    alt: project.title,
    date: project.createdAt || project.date
  }))

  const testimonials = [
    {
      id: 1,
      name: "Jennifer Hilbertson",
      quote:
        "The Seascape Villas project constitutes one of the first urban interventions in this very unique context, a landscape dominated by mountains and sea.",
      title: "Architecture Critic",
    },
    {
      id: 2,
      name: "Michael Chen",
      quote:
        "Their innovative approach to sustainable design has transformed our understanding of modern architecture. Every project tells a unique story.",
      title: "Urban Planner",
    },
    {
      id: 3,
      name: "Sarah Williams",
      quote:
        "Working with this team was an exceptional experience. They brought our vision to life while exceeding all our expectations for functionality and beauty.",
      title: "Property Developer",
    },
    {
      id: 4,
      name: "David Rodriguez",
      quote:
        "The attention to detail and commitment to excellence is evident in every aspect of their work. Truly masters of their craft.",
      title: "Interior Designer",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const nextClientSlide = () => {
    setCurrentClientSlide((prev) => (prev + 1) % totalClientSlides)
  }

  const prevClientSlide = () => {
    setCurrentClientSlide((prev) => (prev - 1 + totalClientSlides) % totalClientSlides)
  }

  const handleReadMore = (projectId) => {
    navigate(`/project/${projectId}`)
  }

  return (
    <div className="homepage">
      {/* Hero Carousel Section */}
      <section className="hero-section">
        <div className="hero-image">
          <img
            src="/images/hero-banner.png"
            alt="Traditional temple architecture with reflection"
            className="hero-img"
          />
          <div className="hero-overlay"></div>
        </div>

        <button onClick={prevSlide} className="nav-arrow nav-arrow-left">
          <ChevronLeft size={24} />
        </button>
        <button onClick={nextSlide} className="nav-arrow nav-arrow-right">
          <ChevronRight size={24} />
        </button>

        <div className="slide-indicators">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`slide-dot ${index === currentSlide ? "active" : ""}`}
            />
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-content">
            <div className="experience-card">
              <img src="/images/experience-bg.jpeg" alt="5 Years of Experience" className="cutout-image" />
            </div>
            <div className="about-text-side">
              <div className="about-header">ABOUT US</div>
              <h2 className="about-title">Awesome Design for Bhutan</h2>
              <div className="about-description">
                <p>
                  Based on collective work and shared knowledge, Architecture-Studio aims to favour dialogue and debate,
                  to transform individual knowledge into increased creative potential.
                </p>
                <p>
                  Our Studio is a architecture practice based in Prague, Czech and Venice. Today, it includes 150
                  architects, urban planners, landscape and interior designers of 25 different nationalities. The
                  company principle of Architecture-Studio is the collective conception.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects-section">
        <div className="projects-container">
          <div className="projects-header">
            <div className="projects-label">LAST PROJECTS</div>
            <h2 className="projects-title">Make it with passion.</h2>
          </div>
          <div className="projects-grid">
            {loading.projects ? (
              <div className="projects-loading">
                <p>Loading projects...</p>
              </div>
            ) : recentProjects.length > 0 ? (
              recentProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className={`project-card ${index % 2 === 1 ? "project-card-reverse" : ""}`}
                >
                  {index % 2 === 0 ? (
                    <>
                      <div className="project-image">
                        <img 
                          src={project.image || "/images/placeholder.png"} 
                          alt={project.alt || project.name} 
                          className="project-img" 
                        />
                      </div>
                      <div className="project-details">
                        <div className="project-year">{project.year}</div>
                        <h3 className="project-name">{project.name}</h3>
                        <button className="project-read-btn" onClick={() => handleReadMore(project.id)}>
                          Read <ChevronRight size={16} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="project-details">
                        <div className="project-year">{project.year}</div>
                        <h3 className="project-name">{project.name}</h3>
                        <button className="project-read-btn" onClick={() => handleReadMore(project.id)}>
                          Read <ChevronRight size={16} />
                        </button>
                      </div>
                      <div className="project-image">
                        <img 
                          src={project.image || "/images/placeholder.png"} 
                          alt={project.alt || project.name} 
                          className="project-img" 
                        />
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="no-projects">
                <p>No projects available. Add some projects in the dashboard to see them here!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <div className="testimonials-header">
            <div className="testimonials-label">TESTIMONIALS</div>
            <h2 className="testimonials-title">They love us</h2>
          </div>
          <div className="testimonials-content">
            <div className="testimonials-list">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.id}
                  onClick={() => setSelectedTestimonial(index)}
                  className={`testimonial-name-btn ${index === selectedTestimonial ? "active" : ""}`}
                >
                  {testimonial.name}
                </button>
              ))}
            </div>
            <div className="testimonial-quote-container">
              <div className="quote-mark">"</div>
              <div className="testimonial-quote">{testimonials[selectedTestimonial].quote}</div>
              <div className="testimonial-author">-{testimonials[selectedTestimonial].name}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="clients-section">
        <div className="clients-container">
          <div className="clients-header">
            <img src="/images/people-clients.png" alt="People Clients" className="clients-title-image" />
          </div>
          <div className="clients-carousel">
            <button onClick={prevClientSlide} className="clients-arrow clients-arrow-left">
              <ChevronLeft size={24} />
            </button>
            <div className="clients-grid">
              <div className="client-card">
                <div className="client-logo">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
              </div>
              <div className="client-card">
                <div className="client-logo">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
              </div>
              <div className="client-card">
                <div className="client-logo">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
              </div>
            </div>
            <button onClick={nextClientSlide} className="clients-arrow clients-arrow-right">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage