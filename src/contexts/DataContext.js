// Create this file: src/contexts/DataContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
    // Featured projects - will be fetched from API
    featuredProjects: [],
    // Blog posts - will be fetched from API  
    blogs: [],
    // Clients data - will be fetched from API
    clients: [],
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
    featuredProjects: false,
    blogs: false,
    clients: false
  });



  const [error, setError] = useState({
    projects: null,
    featuredProjects: null,
    blogs: null,
    clients: null
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
          // Don't restore projects, blogs, and clients from localStorage, fetch from API instead
          projects: [],
          blogs: [],
          clients: []
        }));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever data changes (excluding projects, blogs, and clients)
  useEffect(() => {
    const { projects, blogs, clients, ...dataToSave } = data;
    localStorage.setItem('websiteData', JSON.stringify(dataToSave));
  }, [data]);



  const fetchProjects = useCallback(async () => {
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
  }, []);

  const fetchBlogs = useCallback(async () => {
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
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, clients: true }));
      setError(prev => ({ ...prev, clients: null }));
      
      const response = await ApiService.getClients();
      const apiClients = response.data || [];
      
      setData(prev => ({
        ...prev,
        clients: apiClients
      }));
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(prev => ({ ...prev, clients: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, clients: false }));
    }
  }, []);

  const fetchFeaturedProjects = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, featuredProjects: true }));
      setError(prev => ({ ...prev, featuredProjects: null }));
      
      // Fetch featured projects from the API
      const response = await ApiService.getFeaturedProjects();
      const featured = response.data || [];
      
      setData(prev => ({
        ...prev,
        featuredProjects: featured
      }));
    } catch (err) {
      console.error('Error fetching featured projects:', err);
      setError(prev => ({ ...prev, featuredProjects: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, featuredProjects: false }));
    }
  }, []);

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

  const addProject = async (projectData) => {
    try {
      let response;
      
      // Check if projectData is FormData (contains files)
      if (projectData instanceof FormData) {
        // Handle FormData directly
        const url = 'http://localhost:5000/api/projects';
        const fetchResponse = await fetch(url, {
          method: 'POST',
          body: projectData,
        });
        
        if (!fetchResponse.ok) {
          const errorData = await fetchResponse.json();
          throw new Error(errorData.error || `HTTP error! status: ${fetchResponse.status}`);
        }
        
        response = await fetchResponse.json();
      } else {
        // Handle regular object data
        response = await ApiService.createProject(projectData, []);
      }
      
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

  const updateProject = async (id, updates) => {
    try {
      let response;
      let updatedProject;
      
      // Check if updates is FormData (contains files)
      if (updates instanceof FormData) {
        // Handle FormData directly
        const url = `http://localhost:5000/api/projects/${id}`;
        const fetchResponse = await fetch(url, {
          method: 'PUT',
          body: updates,
        });
        
        if (!fetchResponse.ok) {
          const errorData = await fetchResponse.json();
          throw new Error(errorData.error || `HTTP error! status: ${fetchResponse.status}`);
        }
        
        response = await fetchResponse.json();
        updatedProject = response.data;
      } else if (typeof updates === 'object' && updates.id) {
        // Handle direct project object update (from image management operations)
        updatedProject = updates;
      } else {
        // Handle regular object data via API
        response = await ApiService.updateProject(id, updates, []);
        updatedProject = response.data;
      }
      
      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === id ? updatedProject : p)
      }));
      
      // Refresh featured projects if featured status might have changed
      if (updates instanceof FormData && updates.has('featured')) {
        fetchFeaturedProjects();
      } else if (updates.hasOwnProperty && updates.hasOwnProperty('featured')) {
        fetchFeaturedProjects();
      } else if (updatedProject && updatedProject.featured !== undefined) {
        fetchFeaturedProjects();
      }
      
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

  const addClient = async (client) => {
    try {
      const response = await ApiService.createClient(client);
      const newClient = response.data;
      
      setData(prev => ({
        ...prev,
        clients: [...prev.clients, newClient]
      }));
      
      return newClient;
    } catch (err) {
      console.error('Error creating client:', err);
      throw err;
    }
  };

  const updateClient = async (id, updates) => {
    try {
      const response = await ApiService.updateClient(id, updates);
      const updatedClient = response.data;
      
      setData(prev => ({
        ...prev,
        clients: prev.clients.map(c => c.id === id ? updatedClient : c)
      }));
      
      return updatedClient;
    } catch (err) {
      console.error('Error updating client:', err);
      throw err;
    }
  };

  const deleteClient = async (id) => {
    try {
      await ApiService.deleteClient(id);
      
      setData(prev => ({
        ...prev,
        clients: prev.clients.filter(c => c.id !== id)
      }));
    } catch (err) {
      console.error('Error deleting client:', err);
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

  // Fetch projects from API on mount (after all functions are defined)
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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
    addClient,
    updateClient,
    deleteClient,
    addMedia,
    deleteMedia,
    fetchProjects,
    fetchFeaturedProjects,
    fetchBlogs,
    fetchClients,
    getRecentProjects,
    // Export individual data for easier access
    projects: data.projects,
    featuredProjects: data.featuredProjects,
    blogs: data.blogs,
    clients: data.clients,
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