import React, { useState, useEffect } from 'react';
import { useBlogs } from '../hooks/useApi';

const API_BASE_URL = 'http://localhost:5000/api';

console.log('API_BASE_URL:', API_BASE_URL);
console.log('process.env.REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

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

  // Projects API
  static async getProjects() {
    return this.request('/projects');
  }

  static async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  static async createProject(projectData, files = []) {
    const formData = new FormData();
    
    // Append project data
    Object.keys(projectData).forEach(key => {
      formData.append(key, projectData[key]);
    });
    
    // Append files
    files.forEach(file => {
      formData.append('images', file);
    });
    
    return this.requestMultipart('/projects', formData);
  }

  static async updateProject(id, projectData, files = []) {
    const formData = new FormData();
    
    // Append project data
    Object.keys(projectData).forEach(key => {
      formData.append(key, projectData[key]);
    });
    
    // Append files
    files.forEach(file => {
      formData.append('images', file);
    });
    
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

  // Blogs API
  static async getBlogs() {
    return this.request('/blogs');
  }

  static async getBlog(id) {
    return this.request(`/blogs/${id}`);
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

  // Contacts API
  static async getContacts() {
    return this.request('/contacts');
  }

  static async createContact(contactData) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  static async updateContact(id, updates) {
    return this.request(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Search API
  static async search(query, type = null) {
    const params = new URLSearchParams({ query });
    if (type) {
      params.append('type', type);
    }
    return this.request(`/search?${params.toString()}`);
  }
}

export default ApiService;