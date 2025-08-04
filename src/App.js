import { useState, useEffect, Suspense, lazy } from "react"
import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import { DataProvider, useData } from "./contexts/DataContext" // Modified import
import Header from "./components/Header"
import Footer from "./components/Footer"
import LoadingAnimation from "./components/LoadingAnimation"
import MiniLoadingAnimation from "./components/MiniLoadingAnimation"
import "./App.css"

// Lazy load all page components for code splitting
const HomePage = lazy(() => import("./pages/HomePage"))
const AboutPage = lazy(() => import("./pages/AboutPage"))
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"))
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage"))
const BlogPage = lazy(() => import("./pages/BlogPage"))
const DesignPage = lazy(() => import("./pages/DesignPage"))
const BuildPage = lazy(() => import("./pages/BuildPage"))
const PlanningPage = lazy(() => import("./pages/PlanningPage"))
const InteriorBuildPage = lazy(() => import("./pages/InteriorBuildPage"))
const ArchitecturePage = lazy(() => import("./pages/ArchitecturePage"))
const LandscapePage = lazy(() => import("./pages/LandscapePage"))
const SupervisionPage = lazy(() => import("./pages/SupervisionPage"))
const ManagementPage = lazy(() => import("./pages/ManagementPage"))
const RealEstatePage = lazy(() => import("./pages/RealEstatePage"))
const PrivateHomesPage = lazy(() => import("./pages/PrivateHomesPage"))
const CommercialBuildingsPage = lazy(() => import("./pages/CommercialBuildingsPage"))
const OfficePage = lazy(() => import("./pages/OfficePage"))
const InstitutePage = lazy(() => import("./pages/InstitutePage"))
const HospitalityPage = lazy(() => import("./pages/HospitalityPage"))
const InteriorDesignPage = lazy(() => import("./pages/InteriorDesignPage"))
const RenovationPage = lazy(() => import("./pages/RenovationPage"))
const AboutExteriorPage = lazy(() => import("./pages/AboutExteriorPage"))
const AboutInteriorPage = lazy(() => import("./pages/AboutInteriorPage"))
const AboutPlanningPage = lazy(() => import("./pages/AboutPlanningPage"))
const ContactPage = lazy(() => import("./pages/ContactPage"))

// Lazy load dashboard components
const DashboardLayout = lazy(() => import("./dashboard/DashboardLayout"))
const DashboardHome = lazy(() => import("./dashboard/DashboardHome"))
const ProjectsManager = lazy(() => import("./dashboard/ProjectsManager"))
const HeroBannerManager = lazy(() => import("./dashboard/HeroBannerManager"))
const RecentProjectsManager = lazy(() => import("./dashboard/RecentProjectsManager"))
const BlogsManager = lazy(() => import("./dashboard/BlogsManager"))
const ClientsManager = lazy(() => import("./dashboard/ClientsManager"))
const TeamManager = lazy(() => import("./dashboard/TeamManager"))
const MediaManager = lazy(() => import("./dashboard/MediaManager"))
const DashboardLogin = lazy(() => import("./dashboard/DashboardLogin"))

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
          <Suspense fallback={<LoadingAnimation />}>
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
          </Suspense>
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
    console.log('Showing MiniLoadingAnimation - Homepage data loading:', isHomepageLoading)
    return <MiniLoadingAnimation size="large" text="Loading projects..." />
  }

  return <HomePage />
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
                <Suspense fallback={<LoadingAnimation />}>
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
                </Suspense>
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


