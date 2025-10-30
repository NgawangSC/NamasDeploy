"use client"

import { useState } from "react"
import { useData } from "@/contexts/DataContext"
import { getImageUrl } from "@/utils/imageUtils"
import "./PartnersManager.css"

const PartnersManager = () => {
  const { partners, addPartner, updatePartner, deletePartner } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editingPartner, setEditingPartner] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    logo: null,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      logo: e.target.files && e.target.files.length > 0 ? e.target.files[0] : null,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPartner) {
        await updatePartner(editingPartner.id || editingPartner._id, formData)
      } else {
        await addPartner(formData)
      }
      resetForm()
    } catch (error) {
      console.error("Error saving partner:", error)
      alert("Error saving partner: " + error.message)
    }
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", website: "", logo: null })
    setEditingPartner(null)
    setShowForm(false)
  }

  const handleEdit = (partner) => {
    setEditingPartner(partner)
    setFormData({
      name: partner.name,
      description: partner.description || "",
      website: partner.website || "",
      logo: null,
    })
    setShowForm(true)
  }

  const handleDelete = async (partnerId) => {
    if (window.confirm("Are you sure you want to delete this partner?")) {
      try {
        await deletePartner(partnerId)
      } catch (error) {
        console.error("Error deleting partner:", error)
        alert("Error deleting partner: " + error.message)
      }
    }
  }

  const sortedPartners = [...partners].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.updatedAt || a.date || 0)
    const dateB = new Date(b.createdAt || b.updatedAt || b.date || 0)
    return dateB - dateA
  })

  return (
    <div className="partners-manager">
      <div className="partners-header">
        <h2>Partners Management</h2>
        <button onClick={() => setShowForm(true)} className="add-btn">
          Add New Partner
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingPartner ? "Edit Partner" : "Add New Partner"}</h3>
            <form onSubmit={handleSubmit} className="partner-form">
              <div className="form-group">
                <label htmlFor="name">Partner Name *</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="logo">Partner Logo</label>
                <input type="file" id="logo" name="logo" onChange={handleFileChange} accept="image/*" />
                <small>Upload a logo image for the partner</small>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingPartner ? "Update Partner" : "Add Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="partners-list">
        {sortedPartners.length === 0 ? (
          <div className="no-partners">
            <p>No partners found. Add your first partner to get started!</p>
          </div>
        ) : (
          <div className="partners-container" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sortedPartners.map((partner) => (
              <div key={partner.id || partner._id} className="partner-card">
                <div className="partner-logo">
                  <img
                    src={getImageUrl(partner.logo) || "/images/placeholder-logo.jpg"}
                    alt={partner.name}
                    onError={(e) => {
                      e.target.src = "/images/placeholder-logo.jpg"
                    }}
                  />
                </div>
                <div className="partner-info">
                  <h4 style={{ margin: 0 }}>{partner.name}</h4>
                  {partner.description && <p style={{ margin: "6px 0", color: "#374151" }}>{partner.description}</p>}
                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#3b82f6", textDecoration: "none" }}
                    >
                      Visit Website
                    </a>
                  )}
                </div>
                <div className="partner-actions">
                  <button onClick={() => handleEdit(partner)} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(partner.id || partner._id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PartnersManager
