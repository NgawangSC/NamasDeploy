"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useData } from "../contexts/DataContext"
import ApiService from "../services/api"
import "./AboutPage.css"

// Custom hook for counter animation
const useCounter = (end, duration = 2000, startAnimation = false) => {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (!startAnimation || hasAnimated) return

    let startTime
    const startCount = 0

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(easeOutQuart * (end - startCount) + startCount)
      
      setCount(currentCount)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
        setHasAnimated(true)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, startAnimation, hasAnimated])

  return count
}

// Helper function to format large numbers
const formatNumber = (num) => {
  if (num >= 10000) {
    return Math.floor(num / 1000) + "K"
  }
  return num.toString()
}

// Counter component
const AnimatedCounter = ({ end, suffix = "", startAnimation, formatLargeNumbers = false }) => {
  const count = useCounter(end, 2000, startAnimation)
  const displayValue = formatLargeNumbers ? formatNumber(count) : count
  return <span>{displayValue}{suffix}</span>
}

function AboutPage() {
  const [selectedTestimonial, setSelectedTestimonial] = useState(0)

  // Slider functions for mobile testimonials
  const nextTestimonial = () => {
    setSelectedTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setSelectedTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }
  const [startCounters, setStartCounters] = useState(false)
  const statisticsRef = useRef(null)
  const navigate = useNavigate()
  
  // Get data from context
  const { data, loading, fetchProjects, fetchClients, fetchTeamMembers } = useData()
  
  // Fetch data on component mount
  useEffect(() => {
    fetchProjects()
    fetchClients()
    fetchTeamMembers()
  }, [fetchProjects, fetchClients, fetchTeamMembers])
  

  
  const [statistics, setStatistics] = useState({
    projects: 0,
    clients: 0,
    workingHours: 0,
    awards: 0
  })
  
  // Recalculate statistics when data changes
  useEffect(() => {
    const calculateStats = () => {
      const currentYear = new Date().getFullYear()
      const foundingYear = 2021 // Based on your about section text
      
      // Calculate total projects done
      const totalProjects = data.projects?.length || 0
      
      // Calculate happy clients - try to get from clients data, fallback to estimation
      let happyClients = 0
      if (data.clients && data.clients.length > 0) {
        happyClients = data.clients.length
      } else if (totalProjects > 0) {
        // Estimate clients as 75% of projects (some clients may have multiple projects)
        happyClients = Math.max(Math.ceil(totalProjects * 0.75), 1)
      } else {
        happyClients = 0
      }
      
      // Calculate working hours (1 project = 100 working hours)
      const hoursPerProject = 100
      const totalWorkingHours = totalProjects * hoursPerProject
      
      // Calculate awards - count from the awards timeline section (6 awards currently listed)
      // Can be enhanced to pull from awards data if made dynamic
      const baseAwards = 6 // Current awards in timeline
      const additionalAwards = Math.floor(totalProjects / 15) // Bonus awards for project milestones
      const totalAwards = baseAwards + additionalAwards
      
              return {
          projects: Math.max(totalProjects, 0),
          clients: Math.max(happyClients, 0),
          workingHours: Math.max(totalWorkingHours, 0),
          awards: Math.max(totalAwards, 0)
        }
    }
    
    const newStats = calculateStats()
    setStatistics(newStats)
  }, [data.projects, data.clients])

  // Navigation handlers for service pages
  const handlePlanningClick = () => {
    navigate('/about/about-planning')
  }

  const handleInteriorClick = () => {
    navigate('/about/about-interior')
  }

  const handleExteriorClick = () => {
    navigate('/about/about-exterior')
  }

  // Core Values background image
  const coreValuesBackgroundImage = "/images/core-values-bg.png"

  // Core Services data with front and back content
  const coreServices = [
    {
      id: 1,
      name: "Architectural Design",
      backDescription:
        "Culturally attuned, innovative solutions.",
    },
    {
      id: 2,
      name: "Construction",
      backDescription:
        "Creative, cost-effective building practices with material ingenuity tailored to economic and social contexts.",
    },
    {
      id: 3,
      name: "Interior Design",
      backDescription:
        "Bespoke. stylish, and functional environments.",
    },
    {
      id: 4,
      name: "Renovation & Remodelling",
      backDescription:
        "Modern transformations of existing spaces.",
    },
    {
      id: 5,
      name: "Project Planning",
      backDescription:
        "Feasibility studies, budgeting, and site analysis.",
    },
    {
      id: 6,
      name: "Sustainability Consulting",
      backDescription:
        "Eco-friendly and energy-efficient practices.",
    },
  ]

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

  // Intersection Observer to trigger counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startCounters) {
            setStartCounters(true)
          }
        })
      },
      {
        threshold: 0.3, // Trigger when 30% of the element is visible
      }
    )

    const currentRef = statisticsRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [startCounters])

  return (
    <div className="about-page">
      {/* Hero Banner */}
      <section className="about-hero-banner">
        <div className="hero-background">
          <img src="images/about-hero-bg.jpg" alt="NAMAS Architecture Interior" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <p className="hero-subtitle">ABOUT US</p>
          <h1 className="hero-title">NAMAS DESIGN AND BUILD</h1>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-us-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">About Us</h2>
          </div>
          <div className="founder-card">
            <div className="founder-image">
              <img src="/images/founder-pic.png" alt="Sonam Tobgay" />
            </div>
            <div className="founder-info">
              <h3 className="founder-name">Sonam Tobgay</h3>
              <p className="founder-title">Founder</p>
              <p className="founder-position">Principal Architect</p>
            </div>
          </div>
          <div className="about-description">
            <p>
              Founded in 2021 by Mr. Sonam Tobgay, NAMAS Design and Build delivers integrated architectural, planning,
              and construction solutions. We transform visions into functional, sustainable, and visually appealing
              spaces for institutions, homes, commercial buildings, monasteries, and master planning projects.
            </p>
            <p>
              Leveraging over a decade of experience from Gandhara Designs, our founder has honed expertise across a
              diverse range of projects—from educational institutions and private residences to commercial complexes,
              cultural spaces, and comprehensive master plans.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section
        className="core-values-section"
        style={{
          backgroundImage: `url(${coreValuesBackgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="core-values-overlay"></div>
        <div className="container">
          <div className="core-values-header">
            <h2 className="core-values-title">Core Values</h2>
            <p className="core-values-description">
              Guided by Innovation, Quality, Collaboration, Sustainability, and Integrity, we create projects that
              enrich communities and stand the test of time.
            </p>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="core-services-section">
        <div className="container">
          <div className="core-services-header">
            <h2 className="core-services-title">Core Services</h2>
          </div>
          <div className="services-diamond-grid">
            {coreServices.map((service) => (
              <div key={service.id} className="diamond-service">
                <div className="diamond-shape">
                  <div className="diamond-inner">
                    <div className="diamond-front">
                      <div className="diamond-content">
                        <h4 className="service-name">{service.name}</h4>
                      </div>
                    </div>
                    <div className="diamond-back">
                      <div className="diamond-content">
                        <h4 className="service-back-title">{service.backTitle}</h4>
                        <p className="service-back-description">{service.backDescription}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision and Mission Section */}
      <section className="vision-mission-section">
        <div className="container">
          <div className="vision-mission-header">
            <h2 className="vision-mission-title">Vision and Mission</h2>
          </div>
          <div className="vision-mission-content">
            <div className="vision-block">
              <h3 className="vision-title">Vision</h3>
              <p className="vision-text">
                "To lead in sustainable, high-quality architectural and construction solutions."
              </p>
            </div>
            <div className="mission-block">
              <h3 className="mission-title">Mission</h3>
              <p className="mission-text">
                "To exceed client expectations through innovation, sustainability, and cost effectiveness"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="our-team-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Team</h2>
          </div>
          <div className="team-subtitle">
            <h3>Experts ready to serve</h3>
          </div>
          <div className="team-grid">
            {loading.teamMembers ? (
              <div className="team-loading">Loading team members...</div>
            ) : data.teamMembers && data.teamMembers.length > 0 ? (
              data.teamMembers.map((member) => (
                <div key={member.id} className="team-member-card">
                  <div className="team-member-image">
                    <img 
                      src={ApiService.getImageUrl(member.image) || "/images/founder-pic.png"} 
                      alt={member.name}
                      onError={(e) => {
                        e.target.src = "/images/founder-pic.png";
                      }}
                    />
                  </div>
                  <div className="team-member-info">
                    <h4 className="team-member-name">{member.name}</h4>
                    <p className="team-member-title">{member.title}</p>
                    <p className="team-member-position">{member.position}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-team-members">
                <p>No team members found. Add team members through the dashboard to display them here.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="statistics-section" ref={statisticsRef}>
        <div className="container">
          <div className="statistics-content">
            <div className="statistics-box">
              <div className="box-section">
                <h4>
                  {loading.projects ? (
                    <span>...</span>
                  ) : (
                    <AnimatedCounter end={statistics.projects} suffix="+" startAnimation={startCounters} />
                  )}
                </h4>
                <p>Projects Done</p>
              </div>
              <div className="box-section">
                <h4>
                  {loading.clients ? (
                    <span>...</span>
                  ) : (
                    <AnimatedCounter end={statistics.clients} suffix="+" startAnimation={startCounters} />
                  )}
                </h4>
                <p>Happy Clients</p>
              </div>
              <div className="box-section">
                <h4>
                  <AnimatedCounter 
                    end={statistics.workingHours} 
                    suffix="+" 
                    startAnimation={startCounters} 
                    formatLargeNumbers={true}
                  />
                </h4>
                <p>Working Hours</p>
              </div>
              <div className="box-section">
                <h4>
                  <AnimatedCounter end={statistics.awards} suffix="+" startAnimation={startCounters} />
                </h4>
                <p>Awards</p>
              </div>
            </div>
            <div className="statistics-text">
              <p className="statistics-subtitle">NUMBERS</p>
              <h3 className="statistics-title">Make with love all what we do</h3>
              <p className="statistics-description">
                Our team takes over everything, from an idea and concept development to realization. We believe in
                traditions and incorporate them within our innovations. All our projects incorporate a unique artistic
                image and functional solutions.
              </p>
            </div>
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
            
            {/* Mobile Testimonial Slider Controls */}
            <div className="testimonial-mobile-controls">
              <button onClick={prevTestimonial} className="testimonial-arrow testimonial-arrow-left">
                <ChevronLeft size={24} />
              </button>
              <div className="testimonial-dots">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTestimonial(index)}
                    className={`testimonial-dot ${index === selectedTestimonial ? "active" : ""}`}
                  />
                ))}
              </div>
              <button onClick={nextTestimonial} className="testimonial-arrow testimonial-arrow-right">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="services-background">
          <img src="/images/service-bg.png" alt="Modern Architecture" />
          <div className="services-overlay"></div>
        </div>
        <div className="services-container">
          <div className="services-header">
            <h2 className="services-title">This is what we do</h2>
          </div>
          <div className="services-grid">
            <div className="service-card planning-card">
              <h3 className="service-title">Planning</h3>
              <p className="service-description">
                Our master plans provide a comprehensive look at where an organization is today.
              </p>
              <button className="service-btn" onClick={handlePlanningClick}>READ</button>
            </div>
            <div className="service-card interior-card">
              <h3 className="service-title">Interior</h3>
              <p className="service-description">
                You may engage your architect to provide interior design service, advising on loose furniture.
              </p>
              <button className="service-btn" onClick={handleInteriorClick}>READ</button>
            </div>
            <div className="service-card exterior-card">
              <div className="exterior-bg-image">
                <img src="/images/exterior-bg.jpg" alt="Exterior Design" />
              </div>
              <h3 className="service-title">Exterior</h3>
              <p className="service-description">
                Working together with your architect, you will share your project needs, dreams and goals.
              </p>
              <button className="service-btn" onClick={handleExteriorClick}>READ</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage