// Get API URLs from environment variables or fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"
const SERVER_BASE_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000"

class ApiService {
  // Helper method to construct full image URLs
  static getImageUrl(imagePath) {
    if (!imagePath) return null
    if (imagePath.startsWith("http")) return imagePath
    return `${SERVER_BASE_URL}${imagePath}`
  }

  // Helper method for making HTTP requests with better CORS handling
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      // Add credentials for CORS
      credentials: "include",
      // Add mode for CORS
      mode: "cors",
      ...options,
    }

    try {
      console.log(`Making API request to: ${url}`)
      const response = await fetch(url, config)

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          // If we can't parse the error response, use the status
          console.error("Could not parse error response:", parseError)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log(`API request successful:`, data)
      return data
    } catch (error) {
      console.error("API request failed:", error)

      // Provide more specific error messages for common issues
      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        throw new Error("Network error: Unable to connect to server. Please check your internet connection.")
      }

      if (error.message.includes("CORS")) {
        throw new Error("CORS error: Unable to access the API. Please contact support.")
      }

      throw error
    }
  }

  // Helper method for multipart form requests (with file uploads)
  static async requestMultipart(endpoint, formData, method = "POST") {
    const url = `${API_BASE_URL}${endpoint}`

    try {
      console.log(`Making multipart API request to: ${url}`)
      const response = await fetch(url, {
        method: method,
        body: formData,
        // Don't set Content-Type for FormData - let browser set it with boundary
        credentials: "include",
        mode: "cors",
      })

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          console.error("Could not parse error response:", parseError)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log(`Multipart API request successful:`, data)
      return data
    } catch (error) {
      console.error("Multipart API request failed:", error)

      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        throw new Error("Network error: Unable to connect to server. Please check your internet connection.")
      }

      throw error
    }
  }

  // Clients API
  static async getClients() {
    return this.request("/clients")
  }

  static async getClient(id) {
    return this.request(`/clients/${id}`)
  }

  static async createClient(clientData) {
    const formData = new FormData()

    // Append client data
    Object.keys(clientData).forEach((key) => {
      if (key !== "logo") {
        formData.append(key, clientData[key])
      }
    })

    // Append logo file if exists
    if (clientData.logo) {
      formData.append("logo", clientData.logo)
    }

    return this.requestMultipart("/clients", formData)
  }

  static async updateClient(id, clientData) {
    const formData = new FormData()

    // Append client data
    Object.keys(clientData).forEach((key) => {
      if (key !== "logo") {
        formData.append(key, clientData[key])
      }
    })

    // Append logo file if exists
    if (clientData.logo) {
      formData.append("logo", clientData.logo)
    }

    return this.requestMultipart(`/clients/${id}`, formData, "PUT")
  }

  static async deleteClient(id) {
    return this.request(`/clients/${id}`, {
      method: "DELETE",
    })
  }

  // Projects API
  static async getProjects() {
    return this.request("/projects")
  }

  static async getProject(id) {
    return this.request(`/projects/${id}`)
  }

  static async getFeaturedProjects() {
    console.log("ApiService: Making request to /projects/featured")
    const result = await this.request("/projects/featured")
    console.log("ApiService: getFeaturedProjects result:", result)
    return result
  }

  static async createProject(projectData, files = []) {
    const formData = new FormData()

    // Append project data
    Object.keys(projectData).forEach((key) => {
      formData.append(key, projectData[key])
    })

    // Append files - check if files array exists and has length
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("images", file)
      })
    }

    return this.requestMultipart("/projects", formData)
  }

  static async updateProject(id, projectData, files = []) {
    const formData = new FormData()

    // Append project data
    Object.keys(projectData).forEach((key) => {
      formData.append(key, projectData[key])
    })

    // Append files - check if files array exists and has length
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("images", file)
      })
    }

    return this.requestMultipart(`/projects/${id}`, formData, "PUT")
  }

  static async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: "DELETE",
    })
  }

  // Blogs API
  static async getBlogs() {
    return this.request("/blogs")
  }

  static async createBlog(blogData, imageFile = null) {
    if (imageFile) {
      // Use FormData for file upload
      const formData = new FormData()

      // Append blog data
      Object.keys(blogData).forEach((key) => {
        formData.append(key, blogData[key])
      })

      // Append image file
      formData.append("image", imageFile)

      return this.requestMultipart("/blogs", formData)
    } else {
      // Use JSON for text-only data
      return this.request("/blogs", {
        method: "POST",
        body: JSON.stringify(blogData),
      })
    }
  }

  static async updateBlog(id, blogData, imageFile = null) {
    if (imageFile) {
      // Use FormData for file upload
      const formData = new FormData()

      // Append blog data
      Object.keys(blogData).forEach((key) => {
        formData.append(key, blogData[key])
      })

      // Append image file
      formData.append("image", imageFile)

      return this.requestMultipart(`/blogs/${id}`, formData, "PUT")
    } else {
      // Use JSON for text-only data
      return this.request(`/blogs/${id}`, {
        method: "PUT",
        body: JSON.stringify(blogData),
      })
    }
  }

  static async deleteBlog(id) {
    return this.request(`/blogs/${id}`, {
      method: "DELETE",
    })
  }

  // Team Member methods
  static async getTeamMembers() {
    return this.request("/team-members")
  }

  static async createTeamMember(teamMemberData) {
    const { image, ...data } = teamMemberData

    if (image) {
      // Use FormData for file upload
      const formData = new FormData()

      // Append team member data
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key])
      })

      // Append image file
      formData.append("image", image)

      return this.requestMultipart("/team-members", formData)
    } else {
      // Use JSON for text-only data
      return this.request("/team-members", {
        method: "POST",
        body: JSON.stringify(data),
      })
    }
  }

  static async updateTeamMember(id, teamMemberData) {
    const { image, ...data } = teamMemberData

    if (image) {
      // Use FormData for file upload
      const formData = new FormData()

      // Append team member data
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key])
      })

      // Append image file
      formData.append("image", image)

      return this.requestMultipart(`/team-members/${id}`, formData, "PUT")
    } else {
      // Use JSON for text-only data
      return this.request(`/team-members/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    }
  }

  static async deleteTeamMember(id) {
    return this.request(`/team-members/${id}`, {
      method: "DELETE",
    })
  }

  // Health check method
  static async healthCheck() {
    try {
      const response = await this.request("")
      return response
    } catch (error) {
      console.error("Health check failed:", error)
      throw error
    }
  }
}

export default ApiService
