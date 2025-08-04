"use client"

import { useNavigate } from "react-router-dom"
import "./AboutExteriorPage.css"

function AboutExteriorPage() {
  const navigate = useNavigate()

  return (
    <div className="about-exterior-page">
      {/* Hero Section */}
      <section className="exterior-hero">
        <div className="hero-background">
          <img src="/images/exterior-bg.jpg" alt="Exterior Design" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <button className="back-button" onClick={() => navigate('/about')}>
            ← Back to About
          </button>
          <div className="hero-text">
            <h1 className="hero-title">Exterior Design</h1>
            <p className="hero-description">Where architecture meets nature in perfect harmony</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="exterior-content">
        <div className="container">
          <div className="content-wrapper">
            <h1 className="page-title">Exterior Design</h1>
            <p className="page-subtitle">Where architecture meets nature in perfect harmony</p>
            
            <div className="content-text">
              <p>
                Working together with your architect, you will share your project needs, dreams, and goals to create 
                exterior spaces that celebrate both natural beauty and cultural heritage. Our exterior design approach 
                considers the unique landscape of Bhutan, incorporating traditional elements while embracing innovative 
                solutions for modern living.
              </p>
              
              <p>
                From the initial site analysis to the final landscaping details, we ensure that every exterior element 
                contributes to a harmonious whole that respects the environment, honors local traditions, and meets 
                contemporary functional requirements.
              </p>
              
              <p>
                Our exterior design services include facade design, landscape architecture, outdoor living spaces, 
                sustainable systems integration, weather protection solutions, and cultural design integration. We 
                specialize in creating climate-responsive designs that work with Bhutan's unique environmental conditions 
                while maintaining cultural authenticity and modern functionality.
              </p>
              
              <p>
                Our design principles emphasize environmental stewardship, contextual sensitivity to Bhutan's mountain 
                landscape, cultural authenticity that honors traditional architectural language, and technical excellence 
                incorporating the latest building technologies. We work across residential, commercial, institutional, 
                and cultural project types, creating exteriors that make lasting positive impacts.
              </p>
            </div>

            <div className="cta-section">
              <h3>Ready to Create Your Exterior Masterpiece?</h3>
              <p>Let's work together to design an exterior that harmonizes with nature while expressing your unique vision.</p>
              <button className="cta-button" onClick={() => navigate('/contact')}>
                Begin Your Exterior Project
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutExteriorPage