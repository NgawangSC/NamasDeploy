// Create this file: src/contexts/DataContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';
import { clearImageCache, compressImageToBase64, storeImageLocally, getStoredImage, removeStoredImage } from '../utils/imageUtils';

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
    // Team members data - will be fetched from API
    teamMembers: [],
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
    clients: false,
    teamMembers: false
  });



  const [error, setError] = useState({
    projects: null,
    featuredProjects: null,
    blogs: null,
    clients: null,
    teamMembers: null
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
          // Don't restore projects, blogs, clients, and teamMembers from localStorage, fetch from API instead
          projects: [],
          blogs: [],
          clients: [],
          teamMembers: []
        }));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever data changes (excluding projects, blogs, clients, and teamMembers)
  useEffect(() => {
    const { projects, blogs, clients, teamMembers, ...dataToSave } = data;
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
      
      // Restore stored images for blogs that have them
      const blogsWithRestoredImages = apiBlogs.map(blog => {
        const storedImage = getStoredImage(blog.id);
        if (storedImage) {
          return { ...blog, image: storedImage };
        }
        return blog;
      });
      
      setData(prev => ({
        ...prev,
        blogs: blogsWithRestoredImages
      }));
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(prev => ({ ...prev, blogs: err.message }));
      
      // If API fails, try to load locally stored blogs from a previous session
      try {
        const localBlogs = JSON.parse(localStorage.getItem('localBlogs') || '[]');
        const blogsWithRestoredImages = localBlogs.map(blog => {
          const storedImage = getStoredImage(blog.id);
          if (storedImage) {
            return { ...blog, image: storedImage };
          }
          return blog;
        });
        
        setData(prev => ({
          ...prev,
          blogs: blogsWithRestoredImages
        }));
      } catch (localError) {
        console.error('Error loading local blogs:', localError);
      }
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

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, teamMembers: true }));
      setError(prev => ({ ...prev, teamMembers: null }));
      
      const response = await ApiService.getTeamMembers();
      const apiTeamMembers = response.data || [];
      
      setData(prev => ({
        ...prev,
        teamMembers: apiTeamMembers
      }));
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(prev => ({ ...prev, teamMembers: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, teamMembers: false }));
    }
  }, []);

  const fetchFeaturedProjects = useCallback(async () => {
    try {
      console.log('DataContext: Starting fetchFeaturedProjects...');
      setLoading(prev => ({ ...prev, featuredProjects: true }));
      setError(prev => ({ ...prev, featuredProjects: null }));
      
      // Fetch featured projects from the API
      console.log('DataContext: Calling ApiService.getFeaturedProjects()...');
      const response = await ApiService.getFeaturedProjects();
      console.log('DataContext: API response:', response);
      const featured = response.data || [];
      console.log('DataContext: Featured projects data:', featured);
      
      setData(prev => ({
        ...prev,
        featuredProjects: featured
      }));
      console.log('DataContext: Featured projects set successfully');
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
        const url = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL.replace('/api', '')}/api/projects` : 'http://localhost:5000/api/projects';
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
      
      // Clear image cache to ensure fresh image URLs
      clearImageCache();
      
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
        const url = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL.replace('/api', '')}/api/projects/${id}` : `http://localhost:5000/api/projects/${id}`;
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
      
      // Clear image cache to ensure fresh image URLs
      clearImageCache();
      
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

  const addBlog = async (blog, imageFile = null) => {
    try {
      const response = await ApiService.createBlog(blog, imageFile);
      const newBlog = response.data;
      
      setData(prev => ({
        ...prev,
        blogs: [...prev.blogs, newBlog]
      }));
      
      // Clear image cache to ensure fresh image URLs
      clearImageCache();
      
      return newBlog;
    } catch (err) {
      console.error('Error creating blog (falling back to local storage):', err);
      
      // Fallback: Create blog locally if server is not available
      const blogId = Date.now().toString();
      let imageUrl = blog.image || '';
      
      if (imageFile) {
        try {
          // Compress and convert image to base64 for persistent storage
          const base64Image = await compressImageToBase64(imageFile);
          // Store in localStorage for persistence
          storeImageLocally(blogId, base64Image);
          imageUrl = base64Image;
        } catch (error) {
          console.error('Error processing image:', error);
          // Fallback to blob URL if base64 conversion fails
          imageUrl = URL.createObjectURL(imageFile);
        }
      }
      
      const newBlog = {
        ...blog,
        id: blogId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        image: imageUrl
      };
      
      setData(prev => {
        const updatedBlogs = [...prev.blogs, newBlog];
        // Save to localStorage for persistence
        localStorage.setItem('localBlogs', JSON.stringify(updatedBlogs));
        return {
          ...prev,
          blogs: updatedBlogs
        };
      });
      
      return newBlog;
    }
  };

  const updateBlog = async (id, updates, imageFile = null) => {
    try {
      const response = await ApiService.updateBlog(id, updates, imageFile);
      const updatedBlog = response.data;
      
      setData(prev => ({
        ...prev,
        blogs: prev.blogs.map(b => b.id === id ? updatedBlog : b)
      }));
      
      // Clear image cache to ensure fresh image URLs
      clearImageCache();
      
      return updatedBlog;
    } catch (err) {
      console.error('Error updating blog (falling back to local storage):', err);
      
      // Fallback: Update blog locally if server is not available
      let imageUrl = updates.image || '';
      
      if (imageFile) {
        try {
          // Compress and convert image to base64 for persistent storage
          const base64Image = await compressImageToBase64(imageFile);
          // Store in localStorage for persistence
          storeImageLocally(id, base64Image);
          imageUrl = base64Image;
        } catch (error) {
          console.error('Error processing image:', error);
          // Fallback to blob URL if base64 conversion fails
          imageUrl = URL.createObjectURL(imageFile);
        }
      }
      
      const updatedBlog = {
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
        image: imageUrl
      };
      
      setData(prev => {
        const updatedBlogs = prev.blogs.map(b => b.id === id ? { ...b, ...updatedBlog } : b);
        // Save to localStorage for persistence
        localStorage.setItem('localBlogs', JSON.stringify(updatedBlogs));
        return {
          ...prev,
          blogs: updatedBlogs
        };
      });
      
      return updatedBlog;
    }
  };

  const deleteBlog = async (id) => {
    try {
      await ApiService.deleteBlog(id);
      
      // Clean up stored image
      removeStoredImage(id);
      
      setData(prev => {
        const updatedBlogs = prev.blogs.filter(b => b.id !== id);
        // Save to localStorage for persistence
        localStorage.setItem('localBlogs', JSON.stringify(updatedBlogs));
        return {
          ...prev,
          blogs: updatedBlogs
        };
      });
    } catch (err) {
      console.error('Error deleting blog (falling back to local storage):', err);
      
      // Fallback: Delete blog locally if server is not available
      // Clean up stored image
      removeStoredImage(id);
      
      setData(prev => {
        const updatedBlogs = prev.blogs.filter(b => b.id !== id);
        // Save to localStorage for persistence
        localStorage.setItem('localBlogs', JSON.stringify(updatedBlogs));
        return {
          ...prev,
          blogs: updatedBlogs
        };
      });
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

  const addTeamMember = async (member) => {
    try {
      const response = await ApiService.createTeamMember(member);
      const newMember = response.data;
      
      setData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, newMember]
      }));
      
      return newMember;
    } catch (err) {
      console.error('Error creating team member:', err);
      throw err;
    }
  };

  const updateTeamMember = async (id, updates) => {
    try {
      const response = await ApiService.updateTeamMember(id, updates);
      const updatedMember = response.data;
      
      setData(prev => ({
        ...prev,
        teamMembers: prev.teamMembers.map(m => m.id === id ? updatedMember : m)
      }));
      
      return updatedMember;
    } catch (err) {
      console.error('Error updating team member:', err);
      throw err;
    }
  };

  const deleteTeamMember = async (id) => {
    try {
      await ApiService.deleteTeamMember(id);
      
      setData(prev => ({
        ...prev,
        teamMembers: prev.teamMembers.filter(m => m.id !== id)
      }));
    } catch (err) {
      console.error('Error deleting team member:', err);
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

  // Fetch data from API on mount (after all functions are defined)
  useEffect(() => {
    fetchProjects();
    fetchBlogs();
    fetchClients();
    fetchTeamMembers();
  }, [fetchProjects, fetchBlogs, fetchClients, fetchTeamMembers]);

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
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addMedia,
    deleteMedia,
    fetchProjects,
    fetchFeaturedProjects,
    fetchBlogs,
    fetchClients,
    fetchTeamMembers,
    getRecentProjects,
    // Export individual data for easier access
    projects: data.projects,
    featuredProjects: data.featuredProjects,
    blogs: data.blogs,
    clients: data.clients,
    teamMembers: data.teamMembers,
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