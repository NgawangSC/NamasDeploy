"use client"

import { useState } from "react"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import "./ClientsManager.css"

const ClientsManager = () => {
  const { clients, addClient, updateClient, deleteClient } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    category: "General",
    status: "Active",
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
      if (editingClient) {
        await updateClient(editingClient.id, formData)
      } else {
        await addClient(formData)
      }
      resetForm()
    } catch (error) {
      console.error('Error saving client:', error)
      alert('Error saving client: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      website: "",
      category: "General",
      status: "Active",
      logo: null,
    })
    setEditingClient(null)
    setShowForm(false)
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      description: client.description || "",
      website: client.website || "",
      category: client.category || "General",
      status: client.status || "Active",
      logo: null, // Reset file input for editing
    })
    setShowForm(true)
  }

  const handleDelete = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await deleteClient(clientId)
      } catch (error) {
        console.error('Error deleting client:', error)
        alert('Error deleting client: ' + error.message)
      }
    }
  }

  const categories = ["General", "Government", "Corporate", "Banking", "Real Estate", "Healthcare", "Education"]
  const statuses = ["Active", "Inactive", "Pending"]

  return (
    <div className="clients-manager">
      <div className="manager-header">
        <h2>Clients Management</h2>
        <button 
          onClick={() => setShowForm(true)} 
          className="add-btn"
        >
          Add New Client
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingClient ? "Edit Client" : "Add New Client"}</h3>
            <form onSubmit={handleSubmit} className="client-form">
              <div className="form-group">
                <label htmlFor="name">Client Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="logo">Client Logo</label>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <small>Upload a logo image for the client</small>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingClient ? "Update Client" : "Add Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="clients-list">
        {clients.length === 0 ? (
          <div className="no-clients">
            <p>No clients found. Add your first client to get started!</p>
          </div>
        ) : (
          <div className="clients-grid">
            {clients.map((client) => (
              <div key={client.id} className="client-card">
                <div className="client-logo">
                  <img 
                    src={getImageUrl(client.logo) || "/images/placeholder-logo.png"} 
                    alt={client.name}
                    onError={(e) => {
                      e.target.src = "/images/placeholder-logo.png"
                    }}
                  />
                </div>
                <div className="client-info">
                  <h4>{client.name}</h4>
                  <p className="client-description">{client.description}</p>
                  <div className="client-meta">
                    <span className={`status ${client.status?.toLowerCase()}`}>
                      {client.status}
                    </span>
                    <span className="category">{client.category}</span>
                  </div>
                  {client.website && (
                    <a 
                      href={client.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="client-website"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
                <div className="client-actions">
                  <button 
                    onClick={() => handleEdit(client)} 
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(client.id)} 
                    className="delete-btn"
                  >
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

export default ClientsManager