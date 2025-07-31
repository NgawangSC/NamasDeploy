"use client"

import { useState } from "react"
import "./DashboardLogin.css"

const DashboardLogin = ({ setIsAuthenticated }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Very simple authentication - just check the values directly
    if (
      (credentials.username === "admin" && credentials.password === "admin123") ||
      (credentials.username === "admin" && credentials.password === "admin") ||
      (credentials.username === "admin" && credentials.password === "password")
    ) {
      localStorage.setItem("dashboardAuth", "true")
      setIsAuthenticated(true)
    } else {
      setError("Invalid credentials. Try: admin/admin123 or admin/admin or admin/password")
    }

    setIsLoading(false)
  }

  return (
    <div className="dashboard-login">
      <div className="login-container">
        <div className="login-header">
          <h1>Dashboard Login</h1>
          <p>Sign in to manage your website</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              required
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              required
              placeholder="Enter password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-info">
          <p>Try these credentials:</p>
          <p>Username: admin | Password: admin123</p>
          <p>Username: admin | Password: admin</p>
          <p>Username: admin | Password: password</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardLogin
