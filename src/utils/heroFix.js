// Hero Banner Fix Utility
// This module provides enhanced data fetching and error handling for featured projects

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const heroUtils = {
  // Direct API call with comprehensive error handling
  async fetchFeaturedProjectsDirect() {
    console.log('heroUtils: Starting direct featured projects fetch...');
    
    try {
      const url = `${API_BASE_URL}/projects/featured`;
      console.log('heroUtils: Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-cache', // Ensure fresh data
      });

      console.log('heroUtils: Response status:', response.status);
      console.log('heroUtils: Response headers:', Object.fromEntries(response.headers));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('heroUtils: Parsed response data:', data);

      if (!data.success) {
        throw new Error(data.error || 'API returned success: false');
      }

      const projects = data.data || [];
      console.log('heroUtils: Extracted projects:', projects);
      console.log('heroUtils: Projects count:', projects.length);

      return {
        success: true,
        projects,
        count: projects.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('heroUtils: Error in fetchFeaturedProjectsDirect:', error);
      return {
        success: false,
        error: error.message,
        projects: [],
        count: 0,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Test server connectivity
  async testServerConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      return {
        connected: response.ok,
        status: response.status,
        message: response.ok ? 'Server reachable' : `Server error: ${response.status}`
      };
    } catch (error) {
      return {
        connected: false,
        status: 0,
        message: `Connection failed: ${error.message}`
      };
    }
  },

  // Get fallback/sample data if API fails
  getFallbackData() {
    return [
      {
        id: 1,
        title: "Dechen Barwa Wangi Phodrang",
        image: "/images/project1.png",
        category: "Residential",
        location: "Bhutan",
        year: "2023",
        status: "Completed",
        client: "Private Client",
        designTeam: "NAMAS Architecture",
        description: "A traditional Bhutanese residential project combining modern amenities with cultural heritage.",
        featured: true,
        createdAt: new Date().toISOString(),
      }
    ];
  },

  // Enhanced fetch with retry and fallback
  async fetchWithRetryAndFallback(maxRetries = 3, useFallback = true) {
    console.log('heroUtils: Starting enhanced fetch with retry...');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`heroUtils: Attempt ${attempt}/${maxRetries}`);
      
      const result = await this.fetchFeaturedProjectsDirect();
      
      if (result.success && result.projects.length > 0) {
        console.log('heroUtils: Successful fetch on attempt', attempt);
        return result;
      }
      
      if (attempt < maxRetries) {
        console.log('heroUtils: Retrying in 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // All retries failed
    console.log('heroUtils: All retries failed');
    
    if (useFallback) {
      console.log('heroUtils: Using fallback data');
      return {
        success: true,
        projects: this.getFallbackData(),
        count: this.getFallbackData().length,
        timestamp: new Date().toISOString(),
        source: 'fallback'
      };
    }
    
    return {
      success: false,
      projects: [],
      count: 0,
      timestamp: new Date().toISOString(),
      error: 'All attempts failed and no fallback requested'
    };
  }
};

export default heroUtils;