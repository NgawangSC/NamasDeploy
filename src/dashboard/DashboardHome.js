import { Link } from "react-router-dom"
import { useEffect } from "react"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import "./DashboardHome.css"

const DashboardHome = () => {
  const { projects, blogs, clients, teamMembers, fetchClients, fetchBlogs, fetchTeamMembers } = useData()

  // Add default empty arrays to prevent undefined errors
  const safeProjects = projects || []
  const safeBlogs = blogs || []
  const safeClients = clients || []
  const safeTeamMembers = teamMembers || []

  const stats = [
    {
      title: "Total Projects",
      count: safeProjects.length,
      icon: "🏗️",
      link: "/dashboard/projects",
      color: "#3b82f6",
    },
    {
      title: "Published Blogs",
      count: safeBlogs.filter((blog) => blog.status === "published").length,
      icon: "📝",
      link: "/dashboard/blogs",
      color: "#10b981",
    },
    {
      title: "Draft Blogs",
      count: safeBlogs.filter((blog) => blog.status === "draft").length,
      icon: "📄",
      link: "/dashboard/blogs",
      color: "#ef4444",
    },
    {
      title: "Total Clients",
      count: safeClients.length,
      icon: "🏢",
      link: "/dashboard/clients",
      color: "#8b5cf6",
    },
    {
      title: "Team Members",
      count: safeTeamMembers.length,
      icon: "👥",
      link: "/dashboard/team",
      color: "#f59e0b",
    },
  ]

  // Get recent items sorted by creation date
  const recentProjects = [...safeProjects]
    .sort((a, b) => new Date(b.createdAt || b.updatedAt || b.date || 0) - new Date(a.createdAt || a.updatedAt || a.date || 0))
    .slice(0, 3)
  
  const recentBlogs = [...safeBlogs]
    .sort((a, b) => new Date(b.createdAt || b.updatedAt || b.publishedAt || b.date || 0) - new Date(a.createdAt || a.updatedAt || a.publishedAt || a.date || 0))
    .slice(0, 3)
    
  const recentClients = [...safeClients]
    .sort((a, b) => new Date(b.createdAt || b.updatedAt || b.date || 0) - new Date(a.createdAt || a.updatedAt || a.date || 0))
    .slice(0, 3)

  // Fetch clients, blogs, and team members when component mounts
  useEffect(() => {
    if (clients.length === 0) {
      fetchClients()
    }
    if (blogs.length === 0) {
      fetchBlogs()
    }
    if (teamMembers.length === 0) {
      fetchTeamMembers()
    }
  }, [clients.length, blogs.length, teamMembers.length, fetchClients, fetchBlogs, fetchTeamMembers])

  return (
    <div className="dashboard-home">
      <div className="welcome-section">
        <h1>Welcome to Namas Dashboard</h1>
        <p>Manage your architecture website content from here</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link} className="stat-card">
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.count}</h3>
              <p>{stat.title}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="recent-content">
        <div className="recent-section">
          <div className="section-header">
            <h2>Recent Projects</h2>
            <Link to="/dashboard/projects" className="view-all-btn">
              View All
            </Link>
          </div>
          <div className="recent-items">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div key={project.id} className="recent-item">
                  <img src={getImageUrl(project.image) || "/placeholder.svg"} alt={project.title || "Project"} />
                  <div className="item-info">
                    <h4>{project.title || "Untitled Project"}</h4>
                    <p>
                      {project.location || "Unknown Location"} • {project.year || "Unknown Year"} • {project.category || "Uncategorized"}
                    </p>
                    <span className={`status ${(project.status || "unknown").toLowerCase().replace(" ", "-")}`}>{project.status || "Unknown"}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-content">
                No projects yet. <Link to="/dashboard/projects">Add your first project</Link>
              </p>
            )}
          </div>
        </div>

        <div className="recent-section">
          <div className="section-header">
            <h2>Recent Blogs</h2>
            <Link to="/dashboard/blogs" className="view-all-btn">
              View All
            </Link>
          </div>
          <div className="recent-items">
            {recentBlogs.length > 0 ? (
              recentBlogs.map((blog) => (
                <div key={blog.id} className="recent-item">
                  <img src={getImageUrl(blog.image) || "/placeholder.svg"} alt={blog.title || "Blog Post"} />
                  <div className="item-info">
                    <h4>{blog.title || "Untitled Blog Post"}</h4>
                    <p>
                      By {blog.author || "Unknown Author"} • {blog.category || "Uncategorized"}
                    </p>
                    <span className={`status ${blog.status || "unknown"}`}>{blog.status || "Unknown"}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-content">
                No blogs yet. <Link to="/dashboard/blogs">Write your first blog</Link>
              </p>
            )}
          </div>
        </div>

        <div className="recent-section">
          <div className="section-header">
            <h2>Recent Clients</h2>
            <Link to="/dashboard/clients" className="view-all-btn">
              View All
            </Link>
          </div>
          <div className="recent-items">
            {recentClients.length > 0 ? (
              recentClients.map((client) => (
                <div key={client.id} className="recent-item">
                  <img src={getImageUrl(client.logo) || "/placeholder.svg"} alt={client.name || "Client"} />
                  <div className="item-info">
                    <h4>{client.name || "Unnamed Client"}</h4>
                    <p>
                      {client.category || "General"} • {client.status || "Active"}
                    </p>
                    {client.website && (
                      <a href={client.website} target="_blank" rel="noopener noreferrer" className="client-link">
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-content">
                No clients yet. <Link to="/dashboard/clients">Add your first client</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome