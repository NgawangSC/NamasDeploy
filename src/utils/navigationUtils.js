// Navigation utility functions
import { useNavigate } from "react-router-dom"

/**
 * Safe navigation to project page with debugging
 * @param {Function} navigate - React Router navigate function
 * @param {string|number} projectId - Project ID to navigate to
 * @param {string} source - Source component for debugging
 */
export const navigateToProject = (navigate, projectId, source = 'Unknown') => {
  console.log(`${source}: Attempting to navigate to project with ID:`, projectId)
  
  if (!projectId) {
    console.error(`${source}: Project ID is undefined, null, or empty`)
    console.error(`${source}: Cannot navigate to project page`)
    return false
  }

  if (projectId === 'undefined' || projectId === 'null') {
    console.error(`${source}: Project ID is string 'undefined' or 'null'`)
    console.error(`${source}: This indicates a data issue`)
    return false
  }

  try {
    navigate(`/project/${projectId}`)
    console.log(`${source}: Successfully navigated to /project/${projectId}`)
    return true
  } catch (error) {
    console.error(`${source}: Navigation error:`, error)
    return false
  }
}

/**
 * Hook for safe project navigation
 * @param {string} source - Source component for debugging
 * @returns {Function} Safe navigation function
 */
export const useProjectNavigation = (source = 'Unknown') => {
  const navigate = useNavigate()
  
  return (projectId) => {
    return navigateToProject(navigate, projectId, source)
  }
}

/**
 * Validate project data has required fields for navigation
 * @param {Object} project - Project object
 * @param {string} source - Source component for debugging
 * @param {boolean} showUserAlert - Whether to show user-friendly alert
 * @returns {boolean} Whether project is valid for navigation
 */
export const validateProjectForNavigation = (project, source = 'Unknown', showUserAlert = false) => {
  if (!project) {
    console.warn(`${source}: Project object is null or undefined`)
    if (showUserAlert) {
      alert('Unable to navigate: Project data is missing. Please try refreshing the page.')
    }
    return false
  }

  if (!project.id) {
    console.warn(`${source}: Project missing ID field:`, project)
    if (showUserAlert) {
      alert(`Unable to navigate to project "${project.title || 'Unknown'}": Missing project ID. Please contact support.`)
    }
    return false
  }

  if (project.id === 'undefined' || project.id === 'null') {
    console.warn(`${source}: Project has invalid ID:`, project.id)
    if (showUserAlert) {
      alert(`Unable to navigate to project "${project.title || 'Unknown'}": Invalid project ID. Please contact support.`)
    }
    return false
  }

  return true
}

/**
 * Show user-friendly error message for navigation issues
 * @param {Object} project - Project object (may be null/undefined)
 * @param {string} source - Source component
 */
export const showNavigationError = (project, source) => {
  const projectName = project?.title || project?.name || 'Unknown Project'
  console.error(`${source}: Cannot navigate to project "${projectName}"`)
  
  // Show user-friendly message
  const message = project?.id 
    ? `Unable to open project "${projectName}". Please try again or contact support.`
    : `Project "${projectName}" is missing required information. Please try refreshing the page.`
  
  alert(message)
}