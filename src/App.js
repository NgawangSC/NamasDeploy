import { useState, useEffect } from "react"
import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import { DataProvider, useData } from "./contexts/DataContext" // Modified import
import Header from "./components/Header"
import Footer from "./components/Footer"
import LoadingAnimation from "./components/LoadingAnimation"
import HomePage from "./pages/HomePage"
import AboutPage from "./pages/AboutPage"
import ProjectDetailPage from "./pages/ProjectDetailPage"
import BlogDetailPage from "./pages/BlogDetailPage"
import BlogPage from "./pages/BlogPage"
import DesignPage from "./pages/DesignPage"
import BuildPage from "./pages/BuildPage"
import PlanningPage from "./pages/PlanningPage"
import InteriorBuildPage from "./pages/InteriorBuildPage"
import ArchitecturePage from "./pages/ArchitecturePage"
import LandscapePage from "./pages/LandscapePage"
import SupervisionPage from "./pages/SupervisionPage"
import ManagementPage from "./pages/ManagementPage"
import RealEstatePage from "./pages/RealEstatePage"
import PrivateHomesPage from "./pages/PrivateHomesPage"
import CommercialBuildingsPage from "./pages/CommercialBuildingsPage"
import OfficePage from "./pages/OfficePage"
import InstitutePage from "./pages/InstitutePage"
import HospitalityPage from "./pages/HospitalityPage"
import InteriorDesignPage from "./pages/InteriorDesignPage"
import RenovationPage from "./pages/RenovationPage"
import AboutExteriorPage from "./pages/AboutExteriorPage"
import AboutInteriorPage from "./pages/AboutInteriorPage"
import AboutPlanningPage from "./pages/AboutPlanningPage"
import ContactPage from "./pages/ContactPage"
import DashboardLayout from "./dashboard/DashboardLayout"
import DashboardHome from "./dashboard/DashboardHome"
import ProjectsManager from "./dashboard/ProjectsManager"
import HeroBannerManager from "./dashboard/HeroBannerManager"
import RecentProjectsManager from "./dashboard/RecentProjectsManager"
import BlogsManager from "./dashboard/BlogsManager"
import ClientsManager from "./dashboard/ClientsManager"
import TeamManager from "./dashboard/TeamManager"
import MediaManager from "./dashboard/MediaManager"

import DashboardLogin from "./dashboard/DashboardLogin"
import "./App.css"

// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

// Dashboard Route Component
function DashboardRoute({ isAuthenticated, setIsAuthenticated }) {
  const location = useLocation()
  
  // If not authenticated and trying to access any dashboard route except login
  if (!isAuthenticated && location.pathname !== '/dashboard/login') {
    return <Navigate to="/dashboard/login" replace />
  }
  
  // If authenticated and trying to access login page, redirect to dashboard home
  if (isAuthenticated && location.pathname === '/dashboard/login') {
    return <Navigate to="/dashboard" replace />
  }
  
  // If authenticated, show the dashboard
  if (isAuthenticated) {
    return (
      <DataProvider>
        <DashboardLayout setIsAuthenticated={setIsAuthenticated}>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/projects" element={<ProjectsManager />} />
            <Route path="/hero-banner" element={<HeroBannerManager />} />
            <Route path="/recent-projects" element={<RecentProjectsManager />} />
            <Route path="/blogs" element={<BlogsManager />} />
            <Route path="/clients" element={<ClientsManager />} />
            <Route path="/team" element={<TeamManager />} />
            <Route path="/media" element={<MediaManager />} />
          </Routes>
        </DashboardLayout>
      </DataProvider>
    )
  }
  
  // Show login page
  return <DashboardLogin setIsAuthenticated={setIsAuthenticated} />
}

// Homepage Loading Wrapper Component
function HomePageWithLoading() {
  const { isHomepageLoading } = useData()
  const [showInitialLoading, setShowInitialLoading] = useState(true)
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false)

  useEffect(() => {
    // Check for force loading parameter
    const urlParams = new URLSearchParams(window.location.search)
    const forceLoading = urlParams.get('loading') === 'true'
    const resetVisited = urlParams.get('reset') === 'true'
    
    // Reset visited status if requested
    if (resetVisited) {
      sessionStorage.removeItem('hasVisited')
      sessionStorage.removeItem('lastVisit')
      console.log('Reset visited status')
    }
    
    if (forceLoading) {
      console.log('Force loading animation enabled via URL parameter')
      // Force show loading animation for at least 2.5 seconds
      const timer = setTimeout(() => {
        setShowInitialLoading(false)
      }, 2500)
      return () => clearTimeout(timer)
    }

    // Check session storage for first visit logic
    const hasVisited = sessionStorage.getItem("hasVisited")
    const lastVisit = sessionStorage.getItem("lastVisit")
    const now = Date.now()
    
    // Show loading if never visited, or if last visit was more than 30 minutes ago
    const shouldShowLoadingBasedOnVisit = !hasVisited || !lastVisit || (now - parseInt(lastVisit)) > 30 * 60 * 1000
    
    if (!shouldShowLoadingBasedOnVisit && !isHomepageLoading) {
      // Skip loading animation if user has visited recently and data is already loaded
      setShowInitialLoading(false)
      setHasCompletedInitialLoad(true)
      return
    }

    // Show loading animation until data is loaded
    if (!isHomepageLoading && !hasCompletedInitialLoad) {
      // Data has finished loading, but show loading for minimum time
      const timer = setTimeout(() => {
        setShowInitialLoading(false)
        setHasCompletedInitialLoad(true)
        sessionStorage.setItem("hasVisited", "true")
        sessionStorage.setItem("lastVisit", now.toString())
      }, 1500) // Minimum loading time
      
      return () => clearTimeout(timer)
    }
  }, [isHomepageLoading, hasCompletedInitialLoad])

  // Show loading animation while data is loading or during minimum display time
  if (showInitialLoading || (isHomepageLoading && !hasCompletedInitialLoad)) {
    console.log('Showing LoadingAnimation - Homepage data loading:', isHomepageLoading)
    return <LoadingAnimation />
  }

  return <HomePage />
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authStatus = localStorage.getItem("dashboardAuth")
        const authTimestamp = localStorage.getItem("dashboardAuthTime")
        
        if (authStatus === "true" && authTimestamp) {
          const now = new Date().getTime()
          const authTime = parseInt(authTimestamp)
          const hoursPassed = (now - authTime) / (1000 * 60 * 60)
          
          // Auto-logout after 24 hours for security
          if (hoursPassed > 24) {
            localStorage.removeItem("dashboardAuth")
            localStorage.removeItem("dashboardAuthTime")
            setIsAuthenticated(false)
          } else {
            setIsAuthenticated(true)
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Handle initial loading animation
  useEffect(() => {
    // Check for force loading parameter
    const urlParams = new URLSearchParams(window.location.search)
    const forceLoading = urlParams.get('loading') === 'true'
    const resetVisited = urlParams.get('reset') === 'true'
    
    // Reset visited status if requested
    if (resetVisited) {
      sessionStorage.removeItem('hasVisited')
      sessionStorage.removeItem('lastVisit')
      console.log('Reset visited status')
    }
    
    if (forceLoading) {
      console.log('Force loading animation enabled via URL parameter')
      // Force show loading animation
      const timer = setTimeout(() => {
        setIsInitialLoad(false)
      }, 2500)
      return () => clearTimeout(timer)
    }
    
    // Show loading animation for at least 2 seconds on first visit
    const hasVisited = sessionStorage.getItem("hasVisited")
    const lastVisit = sessionStorage.getItem("lastVisit")
    const now = Date.now()
    
    // Show loading if never visited, or if last visit was more than 30 minutes ago
    // For testing: always show loading (uncomment next line to always show)
    // const shouldShowLoading = true
    
    // Alternative: Show loading on every page load (uncomment next line)
    // const shouldShowLoading = true
    
    const shouldShowLoading = !hasVisited || !lastVisit || (now - parseInt(lastVisit)) > 30 * 60 * 1000
    
    console.log('Loading animation decision:', { hasVisited, lastVisit, shouldShowLoading, forceLoading: false })
    
    if (shouldShowLoading) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false)
        sessionStorage.setItem("hasVisited", "true")
        sessionStorage.setItem("lastVisit", now.toString())
      }, 2500) // Show for 2.5 seconds
      
      return () => clearTimeout(timer)
    } else {
      setIsInitialLoad(false)
    }
  }, [])

  // Show initial loading animation on first visit
  if (isInitialLoad) {
    console.log('Showing LoadingAnimation component')
    return <LoadingAnimation />
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div className="App">
      <ScrollToTop />
      <Routes>
        {/* Dashboard Routes */}
        <Route 
          path="/dashboard/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <DashboardLogin setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        <Route
          path="/dashboard/*"
          element={<DashboardRoute isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />}
        />

        {/* Public Routes */}
        <Route
          path="/*"
          element={
            <DataProvider>
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<HomePageWithLoading />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/design" element={<DesignPage />} />
                  <Route path="/build" element={<BuildPage />} />
                  <Route path="/architecture" element={<ArchitecturePage />} />
                  <Route path="/planning" element={<PlanningPage />} />
                  <Route path="/interior" element={<InteriorDesignPage />} />
                  <Route path="/landscape" element={<LandscapePage />} />
                  <Route path="/supervision" element={<SupervisionPage />} />
                  <Route path="/management" element={<ManagementPage />} />
                  <Route path="/real-estate" element={<RealEstatePage />} />
                  <Route path="/project/:id" element={<ProjectDetailPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:id" element={<BlogDetailPage />} />
                  <Route path="/private-homes" element={<PrivateHomesPage />} />
                  <Route path="/commercial-buildings" element={<CommercialBuildingsPage />} />
                  <Route path="/office" element={<OfficePage />} />
                  <Route path="/institute" element={<InstitutePage />} />
                  <Route path="/hospitality" element={<HospitalityPage />} />
                  <Route path="/interior-design" element={<InteriorDesignPage />} />
                  <Route path="/renovation" element={<RenovationPage />} />
                  <Route path="/construction/private-homes" element={<PrivateHomesPage />} />
                  <Route path="/construction/commercial-buildings" element={<CommercialBuildingsPage />} />
                  <Route path="/construction/office" element={<OfficePage />} />
                  <Route path="/construction/institute" element={<InstitutePage />} />
                  <Route path="/construction/hospitality" element={<HospitalityPage />} />
                  <Route path="/construction/interior" element={<InteriorBuildPage />} />
                  <Route path="/construction/renovation" element={<RenovationPage />} />
                  <Route path="/about/about-exterior" element={<AboutExteriorPage />} />
                  <Route path="/about/about-interior" element={<AboutInteriorPage />} />
                  <Route path="/about/about-planning" element={<AboutPlanningPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                </Routes>
              </main>
              <Footer />
            </DataProvider>
          }
        />
      </Routes>
    </div>
  )
}

export default App


