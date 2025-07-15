"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./AboutInteriorPage.css"

function AboutInteriorPage() {
  const [activeCategory, setActiveCategory] = useState(0)
  const navigate = useNavigate()

  const interiorServices = [
    {
      id: 1,
      title: "Space Planning",
      description: "Optimizing layouts for functionality, flow, and aesthetic appeal in any space.",
      icon: "📐"
    },
    {
      id: 2,
      title: "Furniture Selection",
      description: "Curating bespoke furniture pieces that complement your style and space requirements.",
      icon: "🪑"
    },
    {
      id: 3,
      title: "Color & Materials",
      description: "Expert selection of colors, textures, and materials to create the perfect ambiance.",
      icon: "🎨"
    },
    {
      id: 4,
      title: "Lighting Design",
      description: "Strategic lighting solutions that enhance both function and mood in your spaces.",
      icon: "💡"
    },
    {
      id: 5,
      title: "Custom Millwork",
      description: "Bespoke cabinetry and built-in solutions tailored to your specific needs.",
      icon: "🔨"
    },
    {
      id: 6,
      title: "Art & Accessories",
      description: "Curating art pieces and accessories that add personality and character to your space.",
      icon: "🖼️"
    }
  ]

  const interiorCategories = [
    {
      name: "Residential",
      description: "Creating warm, functional homes that reflect your personal style and enhance daily living.",
      image: "/images/residential-interior.jpg",
      features: ["Living Spaces", "Bedrooms", "Kitchens", "Bathrooms", "Home Offices"]
    },
    {
      name: "Commercial",
      description: "Professional environments that inspire productivity and reflect your brand identity.",
      image: "/images/commercial-interior.jpg",
      features: ["Office Spaces", "Retail Stores", "Restaurants", "Hotels", "Healthcare"]
    },
    {
      name: "Cultural",
      description: "Spaces that honor tradition while embracing contemporary functionality and beauty.",
      image: "/images/cultural-interior.jpg",
      features: ["Monasteries", "Cultural Centers", "Museums", "Community Halls", "Religious Spaces"]
    },
    {
      name: "Hospitality",
      description: "Memorable experiences through thoughtful design that welcomes and inspires guests.",
      image: "/images/hospitality-interior.jpg",
      features: ["Hotels", "Restaurants", "Cafes", "Lounges", "Event Spaces"]
    }
  ]

  const designPhilosophy = [
    {
      title: "Functional Beauty",
      description: "Every element serves a purpose while contributing to the overall aesthetic harmony."
    },
    {
      title: "Cultural Integration",
      description: "Respecting and incorporating local traditions and cultural elements into modern design."
    },
    {
      title: "Sustainable Materials",
      description: "Choosing eco-friendly materials and practices that benefit both people and planet."
    },
    {
      title: "Timeless Design",
      description: "Creating spaces that remain beautiful and relevant for years to come."
    }
  ]

  return (
    <div className="about-interior-page">
      {/* Hero Section */}
      <section className="interior-hero">
        <div className="hero-background">
          <img src="/images/interior-hero-bg.jpg" alt="Interior Design" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <button className="back-button" onClick={() => navigate('/about')}>
            ← Back to About
          </button>
          <h1 className="hero-title">Interior Design</h1>
          <p className="hero-subtitle">Bespoke, stylish, and functional environments</p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="interior-intro">
        <div className="container">
          <div className="intro-content">
            <h2 className="intro-title">Transforming Spaces, Enhancing Lives</h2>
            <p className="intro-description">
              You may engage your architect to provide interior design services, advising on loose furniture, 
              finishes, and spatial arrangements that create harmonious and functional environments. Our interior 
              design philosophy centers on creating spaces that not only look beautiful but also enhance the way 
              you live, work, and interact.
            </p>
            <p className="intro-description">
              From concept to completion, we work closely with you to understand your lifestyle, preferences, 
              and functional requirements, translating them into interior spaces that are both timeless and 
              uniquely yours.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="interior-services">
        <div className="container">
          <div className="services-header">
            <h2 className="services-title">Our Interior Design Services</h2>
            <p className="services-subtitle">Comprehensive interior solutions for every space</p>
          </div>
          <div className="services-grid">
            {interiorServices.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="interior-categories">
        <div className="container">
          <div className="categories-header">
            <h2 className="categories-title">Design Categories</h2>
            <p className="categories-subtitle">Specialized expertise across diverse interior environments</p>
          </div>
          <div className="categories-navigation">
            {interiorCategories.map((category, index) => (
              <button
                key={index}
                className={`category-tab ${index === activeCategory ? 'active' : ''}`}
                onClick={() => setActiveCategory(index)}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="category-content">
            <div className="category-info">
              <h3 className="category-title">{interiorCategories[activeCategory].name} Interiors</h3>
              <p className="category-description">{interiorCategories[activeCategory].description}</p>
              <div className="category-features">
                <h4>Specializations:</h4>
                <ul>
                  {interiorCategories[activeCategory].features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="category-image">
              <img src={interiorCategories[activeCategory].image} alt={interiorCategories[activeCategory].name} />
            </div>
          </div>
        </div>
      </section>

      {/* Design Philosophy */}
      <section className="design-philosophy">
        <div className="container">
          <div className="philosophy-header">
            <h2 className="philosophy-title">Our Design Philosophy</h2>
            <p className="philosophy-subtitle">Guiding principles that shape every interior we create</p>
          </div>
          <div className="philosophy-grid">
            {designPhilosophy.map((item, index) => (
              <div key={index} className="philosophy-item">
                <h3 className="philosophy-item-title">{item.title}</h3>
                <p className="philosophy-description">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="interior-process">
        <div className="container">
          <div className="process-header">
            <h2 className="process-title">Our Interior Design Process</h2>
          </div>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>Discovery & Consultation</h3>
                <p>Understanding your lifestyle, preferences, and functional requirements through detailed discussions.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>Concept Development</h3>
                <p>Creating initial design concepts, mood boards, and space planning solutions.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Design Development</h3>
                <p>Refining concepts, selecting materials, finishes, and furniture to create detailed proposals.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">04</div>
              <div className="step-content">
                <h3>Implementation</h3>
                <p>Coordinating with contractors and suppliers to bring your interior design vision to life.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="interior-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Interior Space?</h2>
            <p className="cta-description">
              Let's create an interior environment that reflects your style and enhances your daily experience.
            </p>
            <button className="cta-button" onClick={() => navigate('/contact')}>
              Start Your Interior Project
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutInteriorPage