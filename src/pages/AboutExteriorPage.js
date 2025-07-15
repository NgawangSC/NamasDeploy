"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./AboutExteriorPage.css"

function AboutExteriorPage() {
  const [activeFeature, setActiveFeature] = useState(0)
  const navigate = useNavigate()

  const exteriorServices = [
    {
      id: 1,
      title: "Facade Design",
      description: "Creating stunning building facades that balance aesthetics with functionality and climate considerations.",
      icon: "🏢"
    },
    {
      id: 2,
      title: "Landscape Architecture",
      description: "Integrating buildings with their natural surroundings through thoughtful landscape design.",
      icon: "🌳"
    },
    {
      id: 3,
      title: "Outdoor Living Spaces",
      description: "Designing terraces, patios, and outdoor areas that extend your living space into nature.",
      icon: "🏡"
    },
    {
      id: 4,
      title: "Sustainable Systems",
      description: "Incorporating green roofs, solar panels, and other sustainable exterior technologies.",
      icon: "♻️"
    },
    {
      id: 5,
      title: "Weather Protection",
      description: "Designing exterior elements that protect against local weather conditions while maintaining beauty.",
      icon: "☂️"
    },
    {
      id: 6,
      title: "Cultural Integration",
      description: "Honoring local architectural traditions while embracing contemporary design principles.",
      icon: "🏛️"
    }
  ]

  const exteriorFeatures = [
    {
      title: "Climate-Responsive Design",
      description: "Our exterior designs respond to Bhutan's unique climate conditions, incorporating elements that protect against monsoons while maximizing natural light and ventilation.",
      image: "/images/climate-responsive.jpg",
      benefits: ["Natural ventilation systems", "Rain protection features", "Solar orientation optimization", "Thermal comfort enhancement"]
    },
    {
      title: "Cultural Harmony",
      description: "We seamlessly blend traditional Bhutanese architectural elements with contemporary design, creating exteriors that honor cultural heritage while meeting modern needs.",
      image: "/images/cultural-harmony.jpg",
      benefits: ["Traditional motif integration", "Local material usage", "Cultural color palettes", "Authentic craftsmanship"]
    },
    {
      title: "Environmental Integration",
      description: "Our designs work in harmony with the natural landscape, preserving existing vegetation and incorporating sustainable practices that benefit both the environment and inhabitants.",
      image: "/images/environmental-integration.jpg",
      benefits: ["Native plant integration", "Water conservation systems", "Minimal site disruption", "Biodiversity preservation"]
    },
    {
      title: "Modern Functionality",
      description: "While respecting tradition, we incorporate modern amenities and technologies that enhance comfort, security, and energy efficiency in exterior spaces.",
      image: "/images/modern-functionality.jpg",
      benefits: ["Smart home integration", "Energy-efficient systems", "Security features", "Accessibility compliance"]
    }
  ]

  const designPrinciples = [
    {
      icon: "🌍",
      title: "Environmental Stewardship",
      description: "Every exterior design prioritizes environmental protection and sustainability."
    },
    {
      icon: "🏔️",
      title: "Contextual Sensitivity",
      description: "Designs that respond to and enhance the natural mountain landscape of Bhutan."
    },
    {
      icon: "🎨",
      title: "Cultural Authenticity",
      description: "Honoring traditional Bhutanese architectural language in contemporary applications."
    },
    {
      icon: "🔧",
      title: "Technical Excellence",
      description: "Incorporating the latest building technologies and engineering solutions."
    }
  ]

  const projectTypes = [
    {
      type: "Residential",
      description: "Private homes that blend seamlessly with their surroundings while providing modern comfort.",
      examples: ["Mountain Villas", "Traditional Farmhouses", "Modern Family Homes", "Eco-Friendly Retreats"]
    },
    {
      type: "Commercial",
      description: "Business buildings that make a statement while respecting local architectural traditions.",
      examples: ["Office Buildings", "Retail Complexes", "Hotels & Resorts", "Mixed-Use Developments"]
    },
    {
      type: "Institutional",
      description: "Public and educational buildings that serve communities while celebrating cultural identity.",
      examples: ["Schools & Universities", "Healthcare Facilities", "Government Buildings", "Community Centers"]
    },
    {
      type: "Cultural",
      description: "Sacred and cultural spaces that honor tradition while providing modern functionality.",
      examples: ["Monasteries", "Cultural Centers", "Museums", "Ceremonial Halls"]
    }
  ]

  return (
    <div className="about-exterior-page">
      {/* Hero Section */}
      <section className="exterior-hero">
        <div className="hero-background">
          <img src="/images/exterior-hero-bg.jpg" alt="Exterior Design" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <button className="back-button" onClick={() => navigate('/about')}>
            ← Back to About
          </button>
          <h1 className="hero-title">Exterior Design</h1>
          <p className="hero-subtitle">Where architecture meets nature in perfect harmony</p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="exterior-intro">
        <div className="container">
          <div className="intro-content">
            <h2 className="intro-title">Designing with Nature and Culture</h2>
            <p className="intro-description">
              Working together with your architect, you will share your project needs, dreams, and goals to create 
              exterior spaces that celebrate both natural beauty and cultural heritage. Our exterior design approach 
              considers the unique landscape of Bhutan, incorporating traditional elements while embracing innovative 
              solutions for modern living.
            </p>
            <p className="intro-description">
              From the initial site analysis to the final landscaping details, we ensure that every exterior element 
              contributes to a harmonious whole that respects the environment, honors local traditions, and meets 
              contemporary functional requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="exterior-services">
        <div className="container">
          <div className="services-header">
            <h2 className="services-title">Our Exterior Design Services</h2>
            <p className="services-subtitle">Comprehensive exterior solutions that harmonize with nature and culture</p>
          </div>
          <div className="services-grid">
            {exteriorServices.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Design Elements */}
      <section className="exterior-features">
        <div className="container">
          <div className="features-header">
            <h2 className="features-title">Our Design Approach</h2>
            <p className="features-subtitle">Key elements that define our exterior design philosophy</p>
          </div>
          <div className="features-navigation">
            {exteriorFeatures.map((feature, index) => (
              <button
                key={index}
                className={`feature-tab ${index === activeFeature ? 'active' : ''}`}
                onClick={() => setActiveFeature(index)}
              >
                {feature.title}
              </button>
            ))}
          </div>
          <div className="feature-content">
            <div className="feature-info">
              <h3 className="feature-title">{exteriorFeatures[activeFeature].title}</h3>
              <p className="feature-description">{exteriorFeatures[activeFeature].description}</p>
              <div className="feature-benefits">
                <h4>Key Benefits:</h4>
                <ul>
                  {exteriorFeatures[activeFeature].benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="feature-image">
              <img src={exteriorFeatures[activeFeature].image} alt={exteriorFeatures[activeFeature].title} />
            </div>
          </div>
        </div>
      </section>

      {/* Design Principles */}
      <section className="design-principles">
        <div className="container">
          <div className="principles-header">
            <h2 className="principles-title">Our Design Principles</h2>
            <p className="principles-subtitle">Guiding values that shape every exterior we create</p>
          </div>
          <div className="principles-grid">
            {designPrinciples.map((principle, index) => (
              <div key={index} className="principle-item">
                <div className="principle-icon">{principle.icon}</div>
                <h3 className="principle-title">{principle.title}</h3>
                <p className="principle-description">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Types */}
      <section className="project-types">
        <div className="container">
          <div className="types-header">
            <h2 className="types-title">Project Types</h2>
            <p className="types-subtitle">Diverse exterior design expertise across multiple building categories</p>
          </div>
          <div className="types-grid">
            {projectTypes.map((project, index) => (
              <div key={index} className="type-card">
                <h3 className="type-title">{project.type}</h3>
                <p className="type-description">{project.description}</p>
                <div className="type-examples">
                  <h4>Examples:</h4>
                  <ul>
                    {project.examples.map((example, idx) => (
                      <li key={idx}>{example}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="exterior-process">
        <div className="container">
          <div className="process-header">
            <h2 className="process-title">Our Exterior Design Process</h2>
          </div>
          <div className="process-timeline">
            <div className="process-step">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>Site Analysis & Vision</h3>
                <p>Comprehensive evaluation of site conditions, climate factors, and your project vision.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>Concept & Integration</h3>
                <p>Developing design concepts that integrate with landscape, climate, and cultural context.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Design Development</h3>
                <p>Refining exterior elements, materials, and details to create comprehensive design solutions.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">04</div>
              <div className="step-content">
                <h3>Implementation & Completion</h3>
                <p>Coordinating construction and landscaping to ensure your exterior vision becomes reality.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="exterior-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Create Your Exterior Masterpiece?</h2>
            <p className="cta-description">
              Let's work together to design an exterior that harmonizes with nature while expressing your unique vision.
            </p>
            <button className="cta-button" onClick={() => navigate('/contact')}>
              Begin Your Exterior Project
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutExteriorPage