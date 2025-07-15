"use client"

import { useState } from "react"
import { useContacts } from "../hooks/useApi"
import ApiService from "../services/api"
import "./AdminContacts.css"

const AdminContacts = () => {
  const { data: contacts, loading, error, refetch } = useContacts()
  const [filter, setFilter] = useState("all")
  const [selectedContact, setSelectedContact] = useState(null)
  const [updating, setUpdating] = useState(false)

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setUpdating(true)
      await ApiService.updateContactStatus(id, newStatus)
      refetch()
    } catch (error) {
      console.error("Error updating contact status:", error)
    } finally {
      setUpdating(false)
    }
  }

  const filteredContacts = contacts?.filter((contact) => {
    if (filter === "all") return true
    return contact.status === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "#007bff"
      case "in-progress":
        return "#ffc107"
      case "resolved":
        return "#28a745"
      default:
        return "#6c757d"
    }
  }

  const getStatusCount = (status) => {
    if (!contacts) return 0
    return contacts.filter((contact) => contact.status === status).length
  }

  if (loading) return <div className="admin-loading">Loading contacts...</div>
  if (error) return <div className="admin-error">Error: {error}</div>

  return (
    <div className="admin-contacts">
      <div className="admin-header">
        <h1>Contact Management</h1>
        <div className="contact-stats">
          <div className="stat-card">
            <span className="stat-number">{contacts?.length || 0}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{getStatusCount("new")}</span>
            <span className="stat-label">New</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{getStatusCount("in-progress")}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{getStatusCount("resolved")}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-buttons">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
            All Contacts
          </button>
          <button className={filter === "new" ? "active" : ""} onClick={() => setFilter("new")}>
            New
          </button>
          <button className={filter === "in-progress" ? "active" : ""} onClick={() => setFilter("in-progress")}>
            In Progress
          </button>
          <button className={filter === "resolved" ? "active" : ""} onClick={() => setFilter("resolved")}>
            Resolved
          </button>
        </div>
      </div>

      <div className="contacts-list">
        {filteredContacts?.map((contact) => (
          <div key={contact.id} className="contact-card">
            <div className="contact-header">
              <div className="contact-info">
                <h3>{contact.name}</h3>
                <p className="contact-email">{contact.email}</p>
                <p className="contact-date">{new Date(contact.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="contact-status">
                <span className="status-badge" style={{ backgroundColor: getStatusColor(contact.status) }}>
                  {contact.status}
                </span>
              </div>
            </div>

            <div className="contact-message">
              <p>{contact.message}</p>
            </div>

            <div className="contact-actions">
              <div className="status-actions">
                <label>Update Status:</label>
                <select
                  value={contact.status}
                  onChange={(e) => handleStatusUpdate(contact.id, e.target.value)}
                  disabled={updating}
                >
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="action-buttons">
                <button className="btn-reply" onClick={() => setSelectedContact(contact)}>
                  View Details
                </button>
                <a href={`mailto:${contact.email}`} className="btn-email">
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        ))}

        {filteredContacts?.length === 0 && (
          <div className="no-contacts">
            <p>No contacts found for the selected filter.</p>
          </div>
        )}
      </div>

      {selectedContact && (
        <div className="contact-modal-overlay" onClick={() => setSelectedContact(null)}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Contact Details</h2>
              <button className="btn-close" onClick={() => setSelectedContact(null)}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="detail-row">
                <label>Name:</label>
                <span>{selectedContact.name}</span>
              </div>

              <div className="detail-row">
                <label>Email:</label>
                <span>{selectedContact.email}</span>
              </div>

              <div className="detail-row">
                <label>Phone:</label>
                <span>{selectedContact.phone || "Not provided"}</span>
              </div>

              <div className="detail-row">
                <label>Subject:</label>
                <span>{selectedContact.subject || "General Inquiry"}</span>
              </div>

              <div className="detail-row">
                <label>Date:</label>
                <span>{new Date(selectedContact.createdAt).toLocaleString()}</span>
              </div>

              <div className="detail-row">
                <label>Status:</label>
                <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedContact.status) }}>
                  {selectedContact.status}
                </span>
              </div>

              <div className="detail-row message-row">
                <label>Message:</label>
                <div className="message-content">{selectedContact.message}</div>
              </div>
            </div>

            <div className="modal-actions">
              <select
                value={selectedContact.status}
                onChange={(e) => {
                  handleStatusUpdate(selectedContact.id, e.target.value)
                  setSelectedContact({ ...selectedContact, status: e.target.value })
                }}
                disabled={updating}
              >
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <a href={`mailto:${selectedContact.email}`} className="btn-primary">
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminContacts
