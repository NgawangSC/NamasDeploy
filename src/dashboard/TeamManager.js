import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './TeamManager.css';

// Component for handling image loading
const TeamMemberImage = ({ src, alt, onImageLoad }) => {
  const [imageSrc, setImageSrc] = useState('/images/founder-pic.png');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    console.log('TeamMemberImage src:', src);
    if (src && src !== '/images/founder-pic.png') {
      const img = new Image();
      img.onload = () => {
        console.log('Image loaded successfully:', src);
        setImageSrc(src);
        setImageLoaded(true);
        if (onImageLoad) onImageLoad();
      };
      img.onerror = () => {
        console.log('Image failed to load:', src);
        setImageSrc('/images/founder-pic.png');
        setImageLoaded(true);
      };
      img.src = src;
    } else {
      setImageLoaded(true);
    }
  }, [src, onImageLoad]);

  return (
    <img 
      src={imageSrc}
      alt={alt}
      style={{ 
        opacity: imageLoaded ? '1' : '0.7',
        transition: 'opacity 0.3s ease'
      }}
    />
  );
};

const TeamManager = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    position: '',
    image: null
  });
  const [editingMember, setEditingMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await API.getTeamMembers();
      setTeamMembers(response.data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setMessage('Error loading team members');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.title || !formData.position) {
      setMessage('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Submitting form data:', formData);
      
      let response;
      if (editingMember) {
        response = await API.updateTeamMember(editingMember.id, formData);
        setMessage('Team member updated successfully');
      } else {
        response = await API.createTeamMember(formData);
        setMessage('Team member created successfully');
      }
      
      console.log('API response:', response);
      
      resetForm();
      fetchTeamMembers();
    } catch (error) {
      console.error('Error saving team member:', error);
      setMessage(`Error saving team member: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      title: member.title,
      position: member.position,
      image: null
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) {
      return;
    }

    try {
      setLoading(true);
      await API.deleteTeamMember(id);
      setMessage('Team member deleted successfully');
      fetchTeamMembers();
    } catch (error) {
      console.error('Error deleting team member:', error);
      setMessage('Error deleting team member');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      position: '',
      image: null
    });
    setEditingMember(null);
    setMessage('');
  };

  return (
    <div className="team-manager">
      <div className="team-manager-header">
        <h1>Team Members Management</h1>
        <p>Manage your team members</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="team-manager-content">
        <div className="team-form-section">
          <h2>{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</h2>
          <form onSubmit={handleSubmit} className="team-form">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
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
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Founder, Senior Architect"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">Position *</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="e.g., Principal Architect, Project Manager"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Profile Image</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving...' : (editingMember ? 'Update Member' : 'Add Member')}
              </button>
              {editingMember && (
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="team-list-section">
          <h2>Current Team Members</h2>
          {loading && <div className="loading">Loading...</div>}
          
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-member-card">
                <div className="team-member-image">
                  <TeamMemberImage 
                    src={API.getImageUrl(member.image)}
                    alt={member.name}
                  />
                </div>
                <div className="team-member-info">
                  <h4 className="team-member-name">{member.name}</h4>
                  <p className="team-member-title">{member.title}</p>
                  <p className="team-member-position">{member.position}</p>
                </div>
                <div className="team-member-actions">
                  <button onClick={() => handleEdit(member)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {teamMembers.length === 0 && !loading && (
            <div className="no-members">
              <p>No team members found. Add your first team member above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamManager;