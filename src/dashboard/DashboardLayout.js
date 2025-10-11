"use client"
import { Link, useLocation, useNavigate } from "react-router-dom"
import "./DashboardLayout.css"

const DashboardLayout = ({ children, setIsAuthenticated }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("dashboardAuth")
    localStorage.removeItem("dashboardAuthTime")
    setIsAuthenticated(false)
    navigate("/dashboard/login")
  }

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/dashboard/projects", label: "Projects", icon: "🏗️" },
    { path: "/dashboard/blogs", label: "Blogs", icon: "📝" },
    { path: "/dashboard/clients", label: "Clients", icon: "🏢" },
    { path: "/dashboard/partners", label: "Partners", icon: "🤝" },
    { path: "/dashboard/team", label: "Team", icon: "👥" },
  ]

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Namas Dashboard</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="view-site-btn">
            View Website
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Content Management</h1>
        </header>

        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  )
}

export default DashboardLayout
