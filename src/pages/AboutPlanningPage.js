"use client"

import { useNavigate } from "react-router-dom"
import "./AboutPlanningPage.css"

function AboutPlanningPage() {
  const navigate = useNavigate()

  const planningServices = [
    {
      id: 1,
      title: "Master Planning",
      description: "Comprehensive long-term development strategies for communities, institutions, and large-scale projects.",
      icon: "🏛️"
    },
    {
      id: 2,
      title: "Site Analysis",
      description: "Detailed evaluation of topography, climate, accessibility, and environmental factors.",
      icon: "🗺️"
    },
    {
      id: 3,
      title: "Feasibility Studies",
      description: "Technical and economic assessment of project viability and potential challenges.",
      icon: "📊"
    },
    {
      id: 4,
      title: "Zoning & Regulations",
      description: "Navigation of local building codes, permits, and regulatory requirements.",
      icon: "📋"
    },
    {
      id: 5,
      title: "Budget Planning",
      description: "Detailed cost estimation and financial planning for construction projects.",
      icon: "💰"
    },
    {
      id: 6,
      title: "Timeline Management",
      description: "Project scheduling and milestone planning for efficient execution.",
      icon: "⏱️"
    }
  ]

  const planningProcess = [
    {
      step: "01",
      title: "Initial Consultation",
      description: "Understanding your vision, requirements, and project goals through detailed discussions."
    },
    {
      step: "02",
      title: "Site Investigation",
      description: "Comprehensive analysis of the project site including surveys, soil testing, and environmental assessment."
    },
    {
      step: "03",
      title: "Concept Development",
      description: "Creating initial design concepts and layout options based on your needs and site conditions."
    },
    {
      step: "04",
      title: "Regulatory Review",
      description: "Ensuring compliance with local building codes, zoning laws, and obtaining necessary permits."
    },
    {
      step: "05",
      title: "Final Planning",
      description: "Detailed project documentation including drawings, specifications, and implementation timeline."
    }
  ]

  return (
    <div className="about-planning-page">
      {/* Hero Section */}
      <section className="planning-hero">
        <div className="hero-background">
          <img src="/images/planning-hero-bg.jpg" alt="Planning and Design" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <button className="back-button" onClick={() => navigate('/about')}>
            ← Back to About
          </button>
          <h1 className="hero-title">Planning Services</h1>
          <p className="hero-subtitle">Strategic planning that transforms visions into reality</p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="planning-intro">
        <div className="container">
          <div className="intro-content">
            <h2 className="intro-title">Comprehensive Planning Solutions</h2>
            <p className="intro-description">
              Our master plans provide a comprehensive look at where an organization is today and where it wants to be in the future. 
              We combine strategic thinking with practical implementation to create roadmaps that guide successful development projects 
              from conception to completion.
            </p>
            <p className="intro-description">
              With over a decade of experience in architectural planning, we understand that great buildings start with great planning. 
              Our systematic approach ensures that every project is built on a solid foundation of research, analysis, and strategic thinking.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="planning-services">
        <div className="container">
          <div className="services-header">
            <h2 className="services-title">Our Planning Services</h2>
            <p className="services-subtitle">Comprehensive planning solutions for every project phase</p>
          </div>
          <div className="services-grid">
            {planningServices.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="planning-process">
        <div className="container">
          <div className="process-header">
            <h2 className="process-title">Our Planning Process</h2>
            <p className="process-subtitle">A systematic approach to successful project development</p>
          </div>
          <div className="process-timeline">
            {planningProcess.map((item, index) => (
              <div key={index} className="process-item">
                <div className="process-step">{item.step}</div>
                <div className="process-content">
                  <h3 className="process-item-title">{item.title}</h3>
                  <p className="process-description">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <div className="container">
          <div className="why-choose-content">
            <div className="why-choose-text">
              <h2 className="why-choose-title">Why Choose Our Planning Services?</h2>
              <div className="benefits-list">
                <div className="benefit-item">
                  <h4>Experience & Expertise</h4>
                  <p>Over 10 years of experience in architectural planning across diverse project types.</p>
                </div>
                <div className="benefit-item">
                  <h4>Comprehensive Approach</h4>
                  <p>We consider every aspect from site conditions to regulatory requirements.</p>
                </div>
                <div className="benefit-item">
                  <h4>Cultural Sensitivity</h4>
                  <p>Planning solutions that respect local culture and community needs.</p>
                </div>
                <div className="benefit-item">
                  <h4>Sustainable Focus</h4>
                  <p>Environmental considerations integrated into every planning decision.</p>
                </div>
              </div>
            </div>
            <div className="why-choose-image">
              <img src="/images/planning-team.jpg" alt="Planning Team at Work" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="planning-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Planning Your Project?</h2>
            <p className="cta-description">
              Let's discuss your vision and create a comprehensive plan that brings your project to life.
            </p>
            <button className="cta-button" onClick={() => navigate('/contact')}>
              Get Started Today
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPlanningPage