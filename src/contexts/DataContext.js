// Create this file: src/contexts/DataContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    // Website content that can be edited
    siteSettings: {
      title: "Your Site Title",
      description: "Your site description",
      logo: "/logo.png",
      contactEmail: "contact@yoursite.com",
      phone: "+1234567890"
    },
    // Pages content
    pages: {
      home: {
        hero: {
          title: "Welcome to Our Site",
          subtitle: "Professional services you can trust",
          backgroundImage: "/hero-bg.jpg"
        },
        services: [
          { id: 1, title: "Architecture", description: "Professional architecture services" },
          { id: 2, title: "Interior Design", description: "Beautiful interior solutions" },
          { id: 3, title: "Planning", description: "Comprehensive planning services" }
        ]
      },
      about: {
        title: "About Us",
        content: "Your about page content here...",
        image: "/about-image.jpg"
      }
    },
    // Projects data - will be fetched from API
    projects: [],
    // Blog posts - will be fetched from API  
    blogs: [],
    // Media files
    media: [
      {
        id: 1,
        name: "sample-image.jpg",
        url: "/sample-image.jpg",
        type: "image",
        size: "500KB",
        uploadDate: "2024-01-01"
      }
    ]
  });

  const [loading, setLoading] = useState({
    projects: false,
    blogs: false
  });

  const [error, setError] = useState({
    projects: null,
    blogs: null
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('websiteData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setData(prev => ({
          ...prev,
          ...parsed,
          // Don't restore projects and blogs from localStorage, fetch from API instead
          projects: [],
          blogs: []
        }));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever data changes (excluding projects and blogs)
  useEffect(() => {
    const { projects, blogs, ...dataToSave } = data;
    localStorage.setItem('websiteData', JSON.stringify(dataToSave));
  }, [data]);

  // Fetch projects from API on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(prev => ({ ...prev, projects: true }));
      setError(prev => ({ ...prev, projects: null }));
      
      const response = await ApiService.getProjects();
      const apiProjects = response.data || [];
      
      setData(prev => ({
        ...prev,
        projects: apiProjects
      }));
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(prev => ({ ...prev, projects: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(prev => ({ ...prev, blogs: true }));
      setError(prev => ({ ...prev, blogs: null }));
      
      const response = await ApiService.getBlogs();
      const apiBlogs = response.data || [];
      
      setData(prev => ({
        ...prev,
        blogs: apiBlogs
      }));
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(prev => ({ ...prev, blogs: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, blogs: false }));
    }
  };

  // Helper functions
  const updateSiteSettings = (newSettings) => {
    setData(prev => ({
      ...prev,
      siteSettings: { ...prev.siteSettings, ...newSettings }
    }));
  };

  const updatePageContent = (pageName, content) => {
    setData(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageName]: { ...prev.pages[pageName], ...content }
      }
    }));
  };

  const addProject = async (project, files = []) => {
    try {
      const response = await ApiService.createProject(project, files);
      const newProject = response.data;
      
      setData(prev => ({
        ...prev,
        projects: [...prev.projects, newProject]
      }));
      
      return newProject;
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  const updateProject = async (id, updates, files = []) => {
    try {
      const response = await ApiService.updateProject(id, updates, files);
      const updatedProject = response.data;
      
      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === id ? updatedProject : p)
      }));
      
      return updatedProject;
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await ApiService.deleteProject(id);
      
      setData(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== id)
      }));
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  const addBlog = async (blog) => {
    try {
      const response = await ApiService.createBlog(blog);
      const newBlog = response.data;
      
      setData(prev => ({
        ...prev,
        blogs: [...prev.blogs, newBlog]
      }));
      
      return newBlog;
    } catch (err) {
      console.error('Error creating blog:', err);
      throw err;
    }
  };

  const updateBlog = async (id, updates) => {
    try {
      const response = await ApiService.updateBlog(id, updates);
      const updatedBlog = response.data;
      
      setData(prev => ({
        ...prev,
        blogs: prev.blogs.map(b => b.id === id ? updatedBlog : b)
      }));
      
      return updatedBlog;
    } catch (err) {
      console.error('Error updating blog:', err);
      throw err;
    }
  };

  const deleteBlog = async (id) => {
    try {
      await ApiService.deleteBlog(id);
      
      setData(prev => ({
        ...prev,
        blogs: prev.blogs.filter(b => b.id !== id)
      }));
    } catch (err) {
      console.error('Error deleting blog:', err);
      throw err;
    }
  };

  const addMedia = (media) => {
    setData(prev => ({
      ...prev,
      media: [...prev.media, { ...media, id: Date.now() }]
    }));
  };

  const deleteMedia = (id) => {
    setData(prev => ({
      ...prev,
      media: prev.media.filter(m => m.id !== id)
    }));
  };

  // Get recent projects (sorted by creation date)
  const getRecentProjects = (limit = 6) => {
    return data.projects
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, limit);
  };

  const contextValue = {
    data,
    loading,
    error,
    setData,
    updateSiteSettings,
    updatePageContent,
    addProject,
    updateProject,
    deleteProject,
    addBlog,
    updateBlog,
    deleteBlog,
    addMedia,
    deleteMedia,
    fetchProjects,
    fetchBlogs,
    getRecentProjects,
    // Export individual data for easier access
    projects: data.projects,
    blogs: data.blogs,
    media: data.media
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};