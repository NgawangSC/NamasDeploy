const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  // Helper method for making HTTP requests
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Helper method for multipart form requests (with file uploads)
  static async requestMultipart(endpoint, formData) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Clients API
  static async getClients() {
    return this.request('/clients');
  }

  static async getClient(id) {
    return this.request(`/clients/${id}`);
  }

  static async createClient(clientData) {
    const formData = new FormData();
    
    // Append client data
    Object.keys(clientData).forEach(key => {
      if (key !== 'logo') {
        formData.append(key, clientData[key]);
      }
    });
    
    // Append logo file if exists
    if (clientData.logo) {
      formData.append('logo', clientData.logo);
    }
    
    return this.requestMultipart('/clients', formData);
  }

  static async updateClient(id, clientData) {
    const formData = new FormData();
    
    // Append client data
    Object.keys(clientData).forEach(key => {
      if (key !== 'logo') {
        formData.append(key, clientData[key]);
      }
    });
    
    // Append logo file if exists
    if (clientData.logo) {
      formData.append('logo', clientData.logo);
    }
    
    const url = `${API_BASE_URL}/clients/${id}`;
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async deleteClient(id) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Projects API (minimal for testing)
  static async getProjects() {
    return this.request('/projects');
  }

  static async getFeaturedProjects() {
    console.log('ApiService: Making request to /projects/featured');
    const result = await this.request('/projects/featured');
    console.log('ApiService: getFeaturedProjects result:', result);
    return result;
  }

  static async createProject(projectData, files = []) {
    const formData = new FormData();
    
    // Append project data
    Object.keys(projectData).forEach(key => {
      formData.append(key, projectData[key]);
    });
    
    // Append files - check if files array exists and has length
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('images', file);
      });
    }
    
    return this.requestMultipart('/projects', formData);
  }

  static async updateProject(id, projectData, files = []) {
    const formData = new FormData();
    
    // Append project data
    Object.keys(projectData).forEach(key => {
      formData.append(key, projectData[key]);
    });
    
    // Append files - check if files array exists and has length
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('images', file);
      });
    }
    
    const url = `${API_BASE_URL}/projects/${id}`;
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Blogs API (minimal for testing)
  static async getBlogs() {
    return this.request('/blogs');
  }

  static async createBlog(blogData) {
    return this.request('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  }

  static async updateBlog(id, blogData) {
    return this.request(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  }

  static async deleteBlog(id) {
    return this.request(`/blogs/${id}`, {
      method: 'DELETE',
    });
  }
}

export default ApiService;