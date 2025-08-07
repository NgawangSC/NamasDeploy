"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import ApiService from "../services/api"
import SEO from "../components/SEO"
import "./ContactPage.css"

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // Submit the form data to the backend API
      const response = await ApiService.createContact(formData)
      
      if (response.success) {
        setSubmitStatus("success")
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: ""
        })
      } else {
        setSubmitStatus("error")
      }
    } catch (error) {
      console.error("Error submitting contact form:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact NAMAS Architecture Studio",
    "description": "Get in touch with NAMAS Architecture Studio for your architectural, construction, and design needs in Bhutan.",
    "url": "https://namasarchitecture.com/contact",
    "mainEntity": {
      "@type": "ArchitecturalFirm",
      "name": "NAMAS Architecture Studio",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "Bhutan"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["English", "Dzongkha"]
      }
    }
  };

  return (
    <div className="contact-page">
      <SEO 
        title="Contact NAMAS Architecture Studio - Get Your Design Quote Today"
        description="Get in touch with NAMAS Architecture Studio for your architectural, construction, interior design, and planning needs in Bhutan. Contact us for a consultation."
        keywords="contact NAMAS, architecture consultation Bhutan, design quote, construction inquiry, architectural services contact"
        url="https://namasarchitecture.com/contact"
        schemaData={contactPageSchema}
      />
      
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-background">
          <img src="/images/about-hero-bg.jpg" alt="Contact Us" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Contact Us</h1>
          <p className="hero-subtitle">Let's bring your architectural vision to life</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-wrapper">
            {/* Contact Information */}
            <div className="contact-info">
              <h2 className="contact-info-title">Get in Touch</h2>
              <p className="contact-info-description">
                Ready to start your architectural journey? We'd love to hear about your project and discuss how we can help bring your vision to life.
              </p>

              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon">
                    <MapPin size={24} />
                  </div>
                  <div className="contact-text">
                    <h4>Visit Our Office</h4>
                    <p>Babesa, Thimphu, Bhutan<br />Namas Design and Build</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <Phone size={24} />
                  </div>
                  <div className="contact-text">
                    <h4>Call Us</h4>
                    <p>+975 17786124 <br />+975 77986124</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <Mail size={24} />
                  </div>
                  <div className="contact-text">
                    <h4>Email Us</h4>
                    <p>namasdesign2021@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-section">
              <h2 className="form-title">Send Us a Message</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+975 XXXX XXXX"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    placeholder="Tell us about your project, requirements, timeline, budget, or any other details that would help us understand your needs better..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>

                {submitStatus === "success" && (
                  <div className="form-message success">
                    Thank you for your message! We'll get back to you soon.
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="form-message error">
                    There was an error sending your message. Please try again or contact us directly.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage