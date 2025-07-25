"use client"

import { useState, useEffect } from "react"
import ApiService from "../services/api"

// Custom hook for API calls with loading and error states
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiCall()
        setData(result.data || result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, dependencies)

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result.data || result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

// Hook for projects
export const useProjects = () => {
  return useApi(() => ApiService.getProjects())
}

// Hook for single project
export const useProject = (id) => {
  return useApi(() => ApiService.getProject(id), [id])
}

// Hook for blogs
export const useBlogs = () => {
  return useApi(() => ApiService.getBlogs())
}

// Hook for single blog
export const useBlog = (id) => {
  return useApi(() => ApiService.getBlog(id), [id])
}

// Hook for contacts (admin only)
export const useContacts = () => {
  return useApi(() => ApiService.getContacts())
}

// Hook for search
export const useSearch = (query, type = null) => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = async (searchQuery, searchType = null) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await ApiService.search(searchQuery, searchType)
      setResults(result.data || [])
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (query) {
      search(query, type)
    } else {
      setResults([])
    }
  }, [query, type])

  return { results, loading, error, search }
}

// Hook for form submissions
export const useFormSubmission = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const submitForm = async (apiCall) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      await apiCall()
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setError(null)
    setSuccess(false)
    setLoading(false)
  }

  return { loading, error, success, submitForm, reset }
}

// Hook for project operations (CRUD operations)
export const useProjectOperations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const createProject = async (projectData, files = []) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      const result = await ApiService.createProject(projectData, files)
      setSuccess(true)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProject = async (id, projectData, files = []) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      const result = await ApiService.updateProject(id, projectData, files)
      setSuccess(true)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (id) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      const result = await ApiService.deleteProject(id)
      setSuccess(true)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setError(null)
    setSuccess(false)
    setLoading(false)
  }

  return { 
    loading, 
    error, 
    success, 
    createProject, 
    updateProject, 
    deleteProject,
    reset 
  }
}

// Hook for blog operations (CRUD operations)
export const useBlogOperations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const createBlog = async (blogData, imageFile = null) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      const result = await ApiService.createBlog(blogData, imageFile)
      setSuccess(true)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateBlog = async (id, blogData, imageFile = null) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      const result = await ApiService.updateBlog(id, blogData, imageFile)
      setSuccess(true)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteBlog = async (id) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      const result = await ApiService.deleteBlog(id)
      setSuccess(true)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setError(null)
    setSuccess(false)
    setLoading(false)
  }

  return { 
    loading, 
    error, 
    success, 
    createBlog, 
    updateBlog, 
    deleteBlog,
    reset 
  }
}