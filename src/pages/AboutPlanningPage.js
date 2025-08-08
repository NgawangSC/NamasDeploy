"use client"

import { useNavigate } from "react-router-dom"
import "./AboutPlanningPage.css"

function AboutPlanningPage() {
  const navigate = useNavigate()

  return (
    <div className="about-planning-page">
      {/* Hero Section */}
      <section className="planning-hero">
        <div className="hero-background">
          <img src="/images/about-hero-bg.jpg" alt="Planning and Design" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Planning Services</h1>
          <p className="hero-subtitle">Strategic planning that transforms visions into reality</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="planning-content">
        <div className="container">
          <div className="content-wrapper">
            <h1 className="page-title">Planning Services</h1>
            <p className="page-subtitle">Strategic planning that transforms visions into reality</p>
            
            <div className="content-text">
              <p>
                Our master plans provide a comprehensive look at where an organization is today and where it wants to be in the future. 
                We combine strategic thinking with practical implementation to create roadmaps that guide successful development projects 
                from conception to completion.
              </p>
              
              <p>
                With over a decade of experience in architectural planning, we understand that great buildings start with great planning. 
                Our systematic approach ensures that every project is built on a solid foundation of research, analysis, and strategic thinking.
              </p>
              
              <p>
                Our planning services include master planning, site analysis, feasibility studies, zoning and regulatory compliance, 
                budget planning, and timeline management. We work closely with you through every phase, from initial consultation 
                and site investigation to concept development, regulatory review, and final planning documentation.
              </p>
              
              <p>
                We bring over 10 years of experience in architectural planning across diverse project types, with a comprehensive 
                approach that considers every aspect from site conditions to regulatory requirements. Our planning solutions respect 
                local culture and community needs while integrating sustainable practices and environmental considerations into every 
                planning decision.
              </p>
            </div>

            <div className="cta-section">
              <h3>Ready to Start Planning Your Project?</h3>
              <p>Let's discuss your vision and create a comprehensive plan that brings your project to life.</p>
              <button className="cta-button" onClick={() => navigate('/contact')}>
                Get Started Today
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPlanningPage