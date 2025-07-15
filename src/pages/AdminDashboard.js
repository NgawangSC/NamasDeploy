import { Link } from "react-router-dom"
import { useProjects, useBlogs, useContacts } from "../hooks/useApi"
import "./AdminDashboard.css"

const AdminDashboard = () => {
  const { data: projects, loading: projectsLoading } = useProjects()
  const { data: blogs, loading: blogsLoading } = useBlogs()
  const { data: contacts, loading: contactsLoading } = useContacts()

  const stats = {
    totalProjects: projects?.length || 0,
    totalBlogs: blogs?.length || 0,
    totalContacts: contacts?.length || 0,
    newContacts: contacts?.filter((c) => c.status === "New").length || 0,
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>NAMAS Admin Dashboard</h1>
        <p>Manage your architecture portfolio and content</p>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalProjects}</div>
          <div className="stat-label">Total Projects</div>
          <Link to="/admin/projects" className="stat-link">
            Manage Projects
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-number">{stats.totalBlogs}</div>
          <div className="stat-label">Blog Posts</div>
          <Link to="/admin/blogs" className="stat-link">
            Manage Blogs
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-number">{stats.totalContacts}</div>
          <div className="stat-label">Total Inquiries</div>
          <Link to="/admin/contacts" className="stat-link">
            View Contacts
          </Link>
        </div>

        <div className="stat-card highlight">
          <div className="stat-number">{stats.newContacts}</div>
          <div className="stat-label">New Inquiries</div>
          <Link to="/admin/contacts" className="stat-link">
            Review Now
          </Link>
        </div>
      </div>

      <div className="admin-actions">
        <div className="action-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/admin/projects" className="action-btn primary">
              <span>📁</span>
              Add New Project
            </Link>
            <Link to="/admin/blogs" className="action-btn primary">
              <span>✍️</span>
              Write Blog Post
            </Link>
            <Link to="/admin/contacts" className="action-btn secondary">
              <span>📧</span>
              View Messages
            </Link>
            <Link to="/search" className="action-btn secondary">
              <span>🔍</span>
              Search Content
            </Link>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {!projectsLoading &&
              projects?.slice(0, 3).map((project) => (
                <div key={project.id} className="activity-item">
                  <div className="activity-icon">📁</div>
                  <div className="activity-content">
                    <div className="activity-title">{project.title}</div>
                    <div className="activity-meta">
                      {project.category} • {project.location}
                    </div>
                  </div>
                  <div className="activity-date">{project.year}</div>
                </div>
              ))}

            {!blogsLoading &&
              blogs?.slice(0, 3).map((blog) => (
                <div key={blog.id} className="activity-item">
                  <div className="activity-icon">✍️</div>
                  <div className="activity-content">
                    <div className="activity-title">{blog.title}</div>
                    <div className="activity-meta">
                      {blog.author} • {blog.category}
                    </div>
                  </div>
                  <div className="activity-date">{blog.date}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
