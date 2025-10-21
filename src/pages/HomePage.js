import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useData } from "../contexts/DataContext"
import { getImageUrl, getProjectImage } from "../utils/imageUtils"
import { useProjectNavigation, validateProjectForNavigation } from "../utils/navigationUtils"
import ApiService from "../services/api"
import HeroBannerSelfContained from "../components/HeroBannerSelfContained"
import ExperienceBox from "../components/ExperienceBox"
import MiniLoadingAnimation from "../components/MiniLoadingAnimation"
import SEO from "../components/SEO"
import "./HomePage.css"

function HomePage() {
  const navigate = useNavigate()
  const navigateToProject = useProjectNavigation('HomePage')
  const { getRecentProjects, clients, partners, loading, fetchClients, featuredProjects, fetchFeaturedProjects, fetchProjects, fetchPartners, data, fetchTeamMembers } = useData()
  const [selectedTestimonial, setSelectedTestimonial] = useState(0)
  const [currentClientSlide, setCurrentClientSlide] = useState(0)

  const totalClientSlides = Math.max(1, Math.ceil(clients.length / 3))
  const totalClientSlidesResponsive = Math.max(1, clients.length)

  // Fetch data on component mount
  useEffect(() => {
    console.log('HomePage: Fetching initial data...')
    fetchClients()
    fetchFeaturedProjects()
    fetchPartners()
    fetchTeamMembers()
  }, [fetchClients, fetchFeaturedProjects, fetchPartners, fetchTeamMembers])

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
        fetchPartners()
        fetchTeamMembers()
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
      image: getProjectImage(project),
      alt: project.title,
      date: project.createdAt || project.date
    };
  })

  const testimonials = [
    {
      id: 1,
      name: "Neten Sherab",
      quote:
        "Well established office with required professionals. The firm built my dream house without any hindrance.",
      title: "Client",
    },
    {
      id: 2,
      name: "Karma Dorji",
      quote:
        "Their innovative approach to sustainable design has transformed our understanding of modern architecture. Every project tells a unique story.",
      title: "Urban Planner",
    },
    {
      id: 3,
      name: "Pema Sherab",
      quote:
        "Working with this team was an exceptional experience. They brought our vision to life while exceeding all our expectations for functionality and beauty.",
      title: "Property Developer",
    },
    {
      id: 4,
      name: "Kezang Choden",
      quote:
        "The attention to detail and commitment to excellence is evident in every aspect of their work. Truly masters of their craft.",
      title: "Interior Designer",
    },
  ]

  // Testimonial slider functions
  const nextTestimonial = () => {
    setSelectedTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setSelectedTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const nextClientSlide = () => {
    // Check if we're on a responsive breakpoint (this is a simple check, you might want to use a proper media query hook)
    const isResponsive = window.innerWidth <= 768
    const maxSlides = isResponsive ? totalClientSlidesResponsive : totalClientSlides
    setCurrentClientSlide((prev) => (prev + 1) % maxSlides)
  }

  const prevClientSlide = () => {
    const isResponsive = window.innerWidth <= 768
    const maxSlides = isResponsive ? totalClientSlidesResponsive : totalClientSlides
    setCurrentClientSlide((prev) => (prev - 1 + maxSlides) % maxSlides)
  }

  const handleReadMore = (project) => {
    if (validateProjectForNavigation(project, 'HomePage', true)) {
      navigateToProject(project.id)
    }
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NAMAS Bhutan",
    "url": process.env.REACT_APP_SITE_URL || "https://www.namasbhutan.com",
    "logo": (process.env.REACT_APP_SITE_URL || "https://www.namasbhutan.com") + "/android-chrome-192x192.png",
    "sameAs": []
  }

  return (
    <div className="homepage">
      <SEO
        title="NAMAS Bhutan — Architecture, Planning, Interiors & Construction"
        description="Integrated design and build studio in Bhutan delivering architecture, planning, interior design, construction, supervision and project management."
        image="/android-chrome-512x512.png"
        type="website"
        schema={[organizationSchema]}
      />
      {/* Hero Banner Section with Featured Projects - Self-Contained Version */}
      <HeroBannerSelfContained />

      {/* About Us Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-content">
            <div className="experience-card">
              <ExperienceBox />
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
                <MiniLoadingAnimation 
                  size="large" 
                  text="Loading projects..." 
                  variant="default"
                  className="mini-loading-inline"
                />
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
                          src={getImageUrl(getProjectImage(project)) || "/images/project1.png"} 
                          alt={project.alt || project.name} 
                          className="project-img" 
                        />
                      </div>
                      <div className="project-details">
                        <div className="project-year">{project.year}</div>
                        <h3 className="project-name">{project.name}</h3>
                        <button 
                          className="project-read-btn" 
                          onClick={() => handleReadMore(project)}
                        >
                          Read <ChevronRight size={16} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="project-details">
                        <div className="project-year">{project.year}</div>
                        <h3 className="project-name">{project.name}</h3>
                        <button 
                          className="project-read-btn" 
                          onClick={() => handleReadMore(project)}
                        >
                          Read <ChevronRight size={16} />
                        </button>
                      </div>
                      <div className="project-image">
                        <img 
                          src={getImageUrl(getProjectImage(project)) || "/images/project1.png"} 
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
                  className={`testimonial-name-btn ${index === selectedTestimonial ? 'active' : ''}`}
                  onClick={() => setSelectedTestimonial(index)}
                >
                  {testimonial.name}
                </button>
              ))}
            </div>
            <div className="testimonial-quote-container">
              <div className="testimonial-slider-nav">
                <button onClick={prevTestimonial} className="testimonial-arrow testimonial-arrow-left">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextTestimonial} className="testimonial-arrow testimonial-arrow-right">
                  <ChevronRight size={24} />
                </button>
              </div>
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
                <MiniLoadingAnimation 
                  size="medium" 
                  text="Loading clients..." 
                  variant="minimal"
                  className="mini-loading-inline"
                />
              </div>
            ) : clients.length > 0 ? (
              <>
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
                <div className="clients-grid-responsive">
                  {clients.slice(currentClientSlide, currentClientSlide + 1).map((client) => (
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
                  <div className="client-slider-nav">
                    <button onClick={prevClientSlide} className="client-arrow client-arrow-left">
                      <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextClientSlide} className="client-arrow client-arrow-right">
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
                <button onClick={prevClientSlide} className="clients-arrow clients-arrow-left">
                  <ChevronLeft size={24} />
                </button>
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

      {/* Our Partners Section */}
      <section className="our-team-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Partners</h2>
          </div>
          <div className="team-subtitle">
            <h3>Trusted collaborators</h3>
          </div>
          <div className="team-grid">
            {loading.partners ? (
              <div className="team-loading">
                <MiniLoadingAnimation 
                  size="medium" 
                  text="Loading partners..." 
                  variant="minimal"
                  className="mini-loading-inline"
                />
              </div>
            ) : partners && partners.length > 0 ? (
              partners.map((partner) => (
                <div 
                  key={partner.id} 
                  className={`team-member-card ${partner.website ? 'clickable' : ''}`}
                  onClick={() => {
                    if (partner.website) {
                      // Ensure the URL has a protocol
                      const url = partner.website.startsWith('http://') || partner.website.startsWith('https://') 
                        ? partner.website 
                        : `https://${partner.website}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  style={{
                    cursor: partner.website ? 'pointer' : 'default'
                  }}
                >
                  <div className="team-member-image">
                    <img 
                      src={getImageUrl(partner.logo) || "/images/founder-pic.png"} 
                      alt={partner.name}
                      onError={(e) => {
                        e.target.src = "/images/founder-pic.png";
                      }}
                    />
                  </div>
                  <div className="team-member-info">
                    <h4 className="team-member-name">{partner.name}</h4>
                    <p className="team-member-title">{partner.description || "Partner"}</p>
                    <p className="team-member-position">{partner.website || ""}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-team-members">
                <p>No partners found. Add partners through the dashboard to display them here.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage