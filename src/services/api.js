const API_BASE_URL = 'http://localhost:5000/api';
const SERVER_BASE_URL = 'http://localhost:5000';

class ApiService {
  // Helper method to construct full image URLs
  static getImageUrl(imagePath) {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${SERVER_BASE_URL}${imagePath}`;
  }
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

  static async createBlog(blogData, imageFile = null) {
    if (imageFile) {
      // Use FormData for file upload
      const formData = new FormData();
      
      // Append blog data
      Object.keys(blogData).forEach(key => {
        formData.append(key, blogData[key]);
      });
      
      // Append image file
      formData.append('image', imageFile);
      
      return this.requestMultipart('/blogs', formData);
    } else {
      // Use JSON for text-only data
      return this.request('/blogs', {
        method: 'POST',
        body: JSON.stringify(blogData),
      });
    }
  }

  static async updateBlog(id, blogData, imageFile = null) {
    if (imageFile) {
      // Use FormData for file upload
      const formData = new FormData();
      
      // Append blog data
      Object.keys(blogData).forEach(key => {
        formData.append(key, blogData[key]);
      });
      
      // Append image file
      formData.append('image', imageFile);
      
      const url = `${API_BASE_URL}/blogs/${id}`;
      
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
    } else {
      // Use JSON for text-only data
      return this.request(`/blogs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(blogData),
      });
    }
  }

  static async deleteBlog(id) {
    return this.request(`/blogs/${id}`, {
      method: 'DELETE',
    });
  }

  // Team Member methods
  static async getTeamMembers() {
    return this.request('/team-members');
  }

  static async createTeamMember(teamMemberData) {
    const { image, ...data } = teamMemberData;
    
    if (image) {
      // Use FormData for file upload
      const formData = new FormData();
      
      // Append team member data
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      
      // Append image file
      formData.append('image', image);
      
      return this.requestMultipart('/team-members', formData);
    } else {
      // Use JSON for text-only data
      return this.request('/team-members', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  }

  static async updateTeamMember(id, teamMemberData) {
    const { image, ...data } = teamMemberData;
    
    if (image) {
      // Use FormData for file upload
      const formData = new FormData();
      
      // Append team member data
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      
      // Append image file
      formData.append('image', image);
      
      const url = `${API_BASE_URL}/team-members/${id}`;
      
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
    } else {
      // Use JSON for text-only data
      return this.request(`/team-members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
  }

  static async deleteTeamMember(id) {
    return this.request(`/team-members/${id}`, {
      method: 'DELETE',
    });
  }
}

export default ApiService;