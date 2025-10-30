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
      console.error("Error saving client:", error)
      alert("Error saving client: " + error.message)
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
        console.error("Error deleting client:", error)
        alert("Error deleting client: " + error.message)
      }
    }
  }

  const categories = ["General", "Government", "Corporate", "Banking", "Real Estate", "Healthcare", "Education"]
  const statuses = ["Active", "Inactive", "Pending"]

  // Sort clients by creation date (most recent first)
  const sortedClients = [...clients].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.updatedAt || a.date || 0)
    const dateB = new Date(b.createdAt || b.updatedAt || b.date || 0)
    return dateB - dateA
  })

  // Helper function to chunk clients into groups of 3
  const chunkClients = (clients, chunkSize = 3) => {
    const chunks = []
    for (let i = 0; i < clients.length; i += chunkSize) {
      chunks.push(clients.slice(i, i + chunkSize))
    }
    return chunks
  }

  const clientRows = chunkClients(sortedClients, 3)

  return (
    <div className="clients-manager">
      <div className="manager-header">
        <h2>Clients Management</h2>
        <button onClick={() => setShowForm(true)} className="add-btn">
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
                <input type="url" id="website" name="website" value={formData.website} onChange={handleInputChange} />
              </div>

              {/* Additional form fields can be added here */}

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={formData.category} onChange={handleInputChange}>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleInputChange}>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="logo">Logo</label>
                <input type="file" id="logo" name="logo" onChange={handleFileChange} />
              </div>

              <button type="submit" className="submit-btn">
                {editingClient ? "Save Changes" : "Add Client"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="clients-list">
        {clientRows.map((row, rowIndex) => (
          <div key={rowIndex} className="client-row">
            {row.map((client) => (
              <div key={client.id} className="client-card">
                <div className="client-logo">
                  {client.logo && <img src={getImageUrl(client.logo) || "/placeholder.svg"} alt={client.name} />}
                </div>
                <div className="client-info">
                  <h4>{client.name}</h4>
                  <p>{client.description}</p>
                  <a href={client.website} target="_blank" rel="noopener noreferrer">
                    {client.website}
                  </a>
                  <p>Category: {client.category}</p>
                  <p>Status: {client.status}</p>
                </div>
                <div className="client-actions">
                  <button onClick={() => handleEdit(client)} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClientsManager
