import { Link } from "react-router-dom"
import { useData } from "../contexts/DataContext"
import { getImageUrl } from "../utils/imageUtils"
import "./DashboardHome.css"

const DashboardHome = () => {
  const { projects, blogs } = useData()

  // Add default empty arrays to prevent undefined errors
  const safeProjects = projects || []
  const safeBlogs = blogs || []

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
  ]

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
      </div>
    </div>
  )
}

export default DashboardHome