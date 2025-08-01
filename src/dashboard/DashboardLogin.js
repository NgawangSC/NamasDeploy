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
    
    if (
      (credentials.username === "namasbhutan" && credentials.password === "admin123")
    ) {
      const currentTime = new Date().getTime()
      localStorage.setItem("dashboardAuth", "true")
      localStorage.setItem("dashboardAuthTime", currentTime.toString())
      setIsAuthenticated(true)
    } else {
      setError("Invalid credentials.")
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
        </div>
      </div>
    </div>
  )
}

export default DashboardLogin
