// Create this file: src/contexts/DataContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Projects data
    projects: [
      {
        id: 1,
        title: "Sample Project",
        description: "Project description",
        image: "/project1.jpg",
        category: "architecture",
        date: "2024-01-01"
      }
    ],
    // Blog posts
    blogs: [
      {
        id: 1,
        title: "Sample Blog Post",
        excerpt: "Blog post excerpt",
        content: "Full blog content here...",
        image: "/blog1.jpg",
        date: "2024-01-01",
        author: "Admin"
      }
    ],
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

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('websiteData');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('websiteData', JSON.stringify(data));
  }, [data]);

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

  const addProject = (project) => {
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, { ...project, id: Date.now() }]
    }));
  };

  const updateProject = (id, updates) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deleteProject = (id) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  const addBlog = (blog) => {
    setData(prev => ({
      ...prev,
      blogs: [...prev.blogs, { ...blog, id: Date.now() }]
    }));
  };

  const updateBlog = (id, updates) => {
    setData(prev => ({
      ...prev,
      blogs: prev.blogs.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  };

  const deleteBlog = (id) => {
    setData(prev => ({
      ...prev,
      blogs: prev.blogs.filter(b => b.id !== id)
    }));
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

  const contextValue = {
    data,
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
    deleteMedia
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