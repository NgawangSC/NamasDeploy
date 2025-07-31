import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import HeroBanner from "../components/HeroBanner"
import HeroBannerFixed from "../components/HeroBannerFixed"
import HeroBannerSelfContained from "../components/HeroBannerSelfContained"
import DebugFeaturedProjects from "../components/DebugFeaturedProjects"
import "./HomePage.css"

function HomePage() {
  const navigate = useNavigate()
  const { getRecentProjects, clients, loading, fetchClients, featuredProjects, fetchFeaturedProjects, fetchProjects } = useData()
  const [selectedTestimonial, setSelectedTestimonial] = useState(0)
  const [currentClientSlide, setCurrentClientSlide] = useState(0)

  const totalClientSlides = Math.max(1, Math.ceil(clients.length / 3))

  // Fetch data on component mount
  useEffect(() => {
    console.log('HomePage: Fetching initial data...')
    fetchClients()
    fetchFeaturedProjects()
  }, [fetchClients, fetchFeaturedProjects])

  // Debug featuredProjects
  useEffect(() => {
    console.log('HomePage: featuredProjects changed:', featuredProjects)
    console.log('HomePage: featuredProjects length:', featuredProjects?.length || 0)
  }, [featuredProjects])

  // Also fetch data when the window gains focus (user returns from dashboard)
  useEffect(() => {
    let timeoutId
    
    const handleFocus = () => {
      // Debounce to prevent multiple rapid calls
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        fetchClients()
        fetchFeaturedProjects()
        fetchProjects()
      }, 300)
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
      clearTimeout(timeoutId)
    }
  }, [fetchClients, fetchFeaturedProjects, fetchProjects])

  // Refresh featured projects periodically to ensure hero banner is up to date
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFeaturedProjects()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [fetchFeaturedProjects])

  // Get the 6 most recent projects from the dashboard
  const recentProjects = getRecentProjects(6).map(project => {
    return {
      id: project.id,
      name: project.title,
      year: project.year,
      image: project.image,
      alt: project.title,
      date: project.createdAt || project.date
    };
  })

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
      {/* Hero Banner Section with Featured Projects - Self-Contained Version */}
      <HeroBannerSelfContained />

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
                          src={getImageUrl(project.image) || "/images/placeholder.png"} 
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
                          src={getImageUrl(project.image) || "/images/placeholder.png"} 
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
            {loading.clients ? (
              <div className="clients-loading">
                <p>Loading clients...</p>
              </div>
            ) : clients.length > 0 ? (
              <>
                <button onClick={prevClientSlide} className="clients-arrow clients-arrow-left">
                  <ChevronLeft size={24} />
                </button>
                <div className="clients-grid">
                  {clients
                    .slice(currentClientSlide * 3, (currentClientSlide + 1) * 3)
                    .map((client) => (
                      <div key={client.id} className="client-card">
                        <div className="client-logo">
                          <img 
                            src={getImageUrl(client.logo)} 
                            alt={client.name}
                            onError={(e) => {
                              e.target.src = "/images/placeholder-logo.png"
                            }}
                          />
                          <div className="client-name">{client.name}</div>
                        </div>
                      </div>
                    ))}
                </div>
                <button onClick={nextClientSlide} className="clients-arrow clients-arrow-right">
                  <ChevronRight size={24} />
                </button>
              </>
            ) : (
              <div className="no-clients">
                <p>No clients available. Add some clients in the dashboard to see them here!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage