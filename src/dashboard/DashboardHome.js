import { Link } from "react-router-dom"
import { useData } from "../contexts/DataContext"
import "./DashboardHome.css"

const DashboardHome = () => {
  const { projects, blogs, images } = useData()

  // Add default empty arrays to prevent undefined errors
  const safeProjects = projects || []
  const safeBlogs = blogs || []
  const safeImages = images || []

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
      title: "Media Files",
      count: safeImages.length,
      icon: "🖼️",
      link: "/dashboard/media",
      color: "#f59e0b",
    },
    {
      title: "Draft Blogs",
      count: safeBlogs.filter((blog) => blog.status === "draft").length,
      icon: "📄",
      link: "/dashboard/blogs",
      color: "#ef4444",
    },
  ]

  const recentProjects = safeProjects.slice(0, 3)
  const recentBlogs = safeBlogs.slice(0, 3)

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
                  <img src={project.image || "/placeholder.svg"} alt={project.title || "Project"} />
                  <div className="item-info">
                    <h4>{project.title || "Untitled Project"}</h4>
                    <p>
                      {project.location || "Unknown Location"} • {project.year || "Unknown Year"}
                    </p>
                    <span className={`status ${project.status ? project.status.toLowerCase().replace(" ", "-") : "unknown"}`}>
                      {project.status || "Unknown"}
                    </span>
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
                  <img src={blog.image || "/placeholder.svg"} alt={blog.title || "Blog Post"} />
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
      </div>
    </div>
  )
}

export default DashboardHome