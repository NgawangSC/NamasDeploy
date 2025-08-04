"use client"

import { useNavigate } from "react-router-dom"
import "./AboutInteriorPage.css"

function AboutInteriorPage() {
  const navigate = useNavigate()

  return (
    <div className="about-interior-page">
      {/* Hero Section */}
      <section className="interior-hero">
        <div className="hero-background">
          <img src="/images/about-hero-bg.jpg" alt="Interior Design" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <button className="back-button" onClick={() => navigate('/about')}>
            ← Back to About
          </button>
          <div className="hero-text">
            <h1 className="hero-title">Interior Design</h1>
            <p className="hero-description">Bespoke, stylish, and functional environments</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="interior-content">
        <div className="container">
          <div className="content-wrapper">
            <h1 className="page-title">Interior Design</h1>
            <p className="page-subtitle">Bespoke, stylish, and functional environments</p>
            
            <div className="content-text">
              <p>
                You may engage your architect to provide interior design services, advising on loose furniture, 
                finishes, and spatial arrangements that create harmonious and functional environments. Our interior 
                design philosophy centers on creating spaces that not only look beautiful but also enhance the way 
                you live, work, and interact.
              </p>
              
              <p>
                From concept to completion, we work closely with you to understand your lifestyle, preferences, 
                and functional requirements, translating them into interior spaces that are both timeless and 
                uniquely yours.
              </p>
              
              <p>
                Our interior design services include space planning, furniture selection, color and material coordination, 
                lighting design, custom millwork, and art curation. We specialize in residential, commercial, cultural, 
                and hospitality interiors, creating environments that serve their intended purpose while reflecting 
                your personal style and values.
              </p>
              
              <p>
                Our design philosophy emphasizes functional beauty, cultural integration, sustainable materials, and 
                timeless design. Every element serves a purpose while contributing to the overall aesthetic harmony, 
                respecting local traditions while incorporating contemporary functionality that enhances comfort and 
                energy efficiency.
              </p>
            </div>

            <div className="cta-section">
              <h3>Ready to Transform Your Interior Space?</h3>
              <p>Let's create an interior environment that reflects your style and enhances your daily experience.</p>
              <button className="cta-button" onClick={() => navigate('/contact')}>
                Start Your Interior Project
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutInteriorPage