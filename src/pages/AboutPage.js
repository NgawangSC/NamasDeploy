"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./AboutPage.css"

function AboutPage() {
  const [selectedTestimonial, setSelectedTestimonial] = useState(0)
  const navigate = useNavigate()

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
      number: "1",
      name: "Architectural Design",
      backDescription:
        "Culturally attuned, innovative solutions.",
    },
    {
      id: 2,
      number: "2",
      name: "Construction",
      backDescription:
        "Creative, cost-effective building practices with material ingenuity tailored to economic and social contexts.",
    },
    {
      id: 3,
      number: "3",
      name: "Interior Design",
      backDescription:
        "Bespoke. stylish, and functional environments.",
    },
    {
      id: 4,
      number: "4",
      name: "Renovation & Remodelling",
      backDescription:
        "Modern transformations of existing spaces.",
    },
    {
      id: 5,
      number: "5",
      name: "Project Planning",
      backDescription:
        "Feasibility studies, budgeting, and site analysis.",
    },
    {
      id: 6,
      number: "6",
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
                        <span className="service-number">{service.number}</span>
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
            <div className="team-member-card">
              <div className="team-member-image">
                <img src="/images/founder-pic.png" alt="Sonam Tobgay" />
              </div>
              <div className="team-member-info">
                <h4 className="team-member-name">Sonam Tobgay</h4>
                <p className="team-member-title">Founder</p>
                <p className="team-member-position">Principal Architect</p>
              </div>
            </div>
            <div className="team-member-card">
              <div className="team-member-image">
                <img src="/images/founder-pic.png" alt="Sonam Tobgay" />
              </div>
              <div className="team-member-info">
                <h4 className="team-member-name">Sonam Tobgay</h4>
                <p className="team-member-title">Founder</p>
                <p className="team-member-position">Principal Architect</p>
              </div>
            </div>
            <div className="team-member-card">
              <div className="team-member-image">
                <img src="/images/founder-pic.png" alt="Sonam Tobgay" />
              </div>
              <div className="team-member-info">
                <h4 className="team-member-name">Sonam Tobgay</h4>
                <p className="team-member-title">Founder</p>
                <p className="team-member-position">Principal Architect</p>
              </div>
            </div>
            <div className="team-member-card">
              <div className="team-member-image">
                <img src="/images/founder-pic.png" alt="Sonam Tobgay" />
              </div>
              <div className="team-member-info">
                <h4 className="team-member-name">Sonam Tobgay</h4>
                <p className="team-member-title">Founder</p>
                <p className="team-member-position">Principal Architect</p>
              </div>
            </div>
            <div className="team-member-card">
              <div className="team-member-image">
                <img src="/images/founder-pic.png" alt="Sonam Tobgay" />
              </div>
              <div className="team-member-info">
                <h4 className="team-member-name">Sonam Tobgay</h4>
                <p className="team-member-title">Founder</p>
                <p className="team-member-position">Principal Architect</p>
              </div>
            </div>
            <div className="team-member-card">
              <div className="team-member-image">
                <img src="/images/founder-pic.png" alt="Sonam Tobgay" />
              </div>
              <div className="team-member-info">
                <h4 className="team-member-name">Sonam Tobgay</h4>
                <p className="team-member-title">Founder</p>
                <p className="team-member-position">Principal Architect</p>
              </div>
            </div>
            <div className="team-member-card">
              <div className="team-member-image">
                <img src="/images/founder-pic.png" alt="Sonam Tobgay" />
              </div>
              <div className="team-member-info">
                <h4 className="team-member-name">Sonam Tobgay</h4>
                <p className="team-member-title">Founder</p>
                <p className="team-member-position">Principal Architect</p>
              </div>
            </div>
            <div className="team-member-card">
              <div className="team-member-image">
                <img src="/images/founder-pic.png" alt="Sonam Tobgay" />
              </div>
              <div className="team-member-info">
                <h4 className="team-member-name">Sonam Tobgay</h4>
                <p className="team-member-title">Founder</p>
                <p className="team-member-position">Principal Architect</p>
              </div>
            </div>
            <div className="team-member-card">
              <div className="team-member-image">
                <img src="/images/founder-pic.png" alt="Sonam Tobgay" />
              </div>
              <div className="team-member-info">
                <h4 className="team-member-name">Sonam Tobgay</h4>
                <p className="team-member-title">Founder</p>
                <p className="team-member-position">Principal Architect</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="statistics-section">
        <div className="container">
          <div className="statistics-content">
            <div className="statistics-image">
              <img src="/images/statistics-pic.jpeg" alt="statistics" />
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

      {/* Awards Timeline Section */}
      <section className="awards-section">
        <div className="container">
          <div className="awards-header">
            <p className="awards-label">TIMELINE</p>
            <h2 className="awards-title">Awards that we have</h2>
          </div>
          <div className="awards-timeline">
            <div className="awards-column">
              <div className="award-item">
                <div className="award-year">2016</div>
                <div className="award-content">
                  <h3 className="award-name">University of Australia Innovation Quarter</h3>
                  <p className="award-description">Shortlist ( 3 finalist among 400 entries)</p>
                </div>
              </div>
              <div className="award-item">
                <div className="award-year">2016</div>
                <div className="award-content">
                  <h3 className="award-name">University of Australia Innovation Quarter</h3>
                  <p className="award-description">Shortlist ( 3 finalist among 400 entries)</p>
                </div>
              </div>
              <div className="award-item">
                <div className="award-year">2016</div>
                <div className="award-content">
                  <h3 className="award-name">University of Australia Innovation Quarter</h3>
                  <p className="award-description">Shortlist ( 3 finalist among 400 entries)</p>
                </div>
              </div>
            </div>
            <div className="awards-column">
              <div className="award-item">
                <div className="award-year">2016</div>
                <div className="award-content">
                  <h3 className="award-name">University of Australia Innovation Quarter</h3>
                  <p className="award-description">Shortlist ( 3 finalist among 400 entries)</p>
                </div>
              </div>
              <div className="award-item">
                <div className="award-year">2016</div>
                <div className="award-content">
                  <h3 className="award-name">University of Australia Innovation Quarter</h3>
                  <p className="award-description">Shortlist ( 3 finalist among 400 entries)</p>
                </div>
              </div>
              <div className="award-item">
                <div className="award-year">2016</div>
                <div className="award-content">
                  <h3 className="award-name">University of Australia Innovation Quarter</h3>
                  <p className="award-description">Shortlist ( 3 finalist among 400 entries)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage