"use client"

import { useState, useEffect, useRef } from "react"
import { Link as RouterLink, useLocation } from "react-router-dom"
import { ChevronDown, ChevronRight, Link, Menu, X, Facebook, Instagram, Youtube } from "lucide-react"
import "./Header.css"

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesignDropdownOpen, setIsDesignDropdownOpen] = useState(false)
  const [isBuildDropdownOpen, setIsBuildDropdownOpen] = useState(false)
  const [isConstructionSubmenuOpen, setIsConstructionSubmenuOpen] = useState(false)
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false)

  const location = useLocation()
  const designDropdownRef = useRef(null)
  const buildDropdownRef = useRef(null)
  const constructionSubmenuRef = useRef(null)
  const settingsDropdownRef = useRef(null)
  const designTimeoutRef = useRef(null)
  const buildTimeoutRef = useRef(null)
  const constructionTimeoutRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    const handleClickOutside = (event) => {
      if (designDropdownRef.current && !designDropdownRef.current.contains(event.target)) {
        setIsDesignDropdownOpen(false)
      }
      if (buildDropdownRef.current && !buildDropdownRef.current.contains(event.target)) {
        setIsBuildDropdownOpen(false)
        setIsConstructionSubmenuOpen(false)
      }
      if (constructionSubmenuRef.current && !constructionSubmenuRef.current.contains(event.target)) {
        setIsConstructionSubmenuOpen(false)
      }
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target)) {
        setIsSettingsDropdownOpen(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleSettingsDropdown = () => {
    setIsSettingsDropdownOpen(!isSettingsDropdownOpen)
  }

  const handleDesignHover = () => {
    if (designTimeoutRef.current) {
      clearTimeout(designTimeoutRef.current)
    }
    setIsDesignDropdownOpen(true)
    setIsBuildDropdownOpen(false)
    setIsConstructionSubmenuOpen(false)
  }

  const handleDesignLeave = () => {
    designTimeoutRef.current = setTimeout(() => {
      setIsDesignDropdownOpen(false)
    }, 200)
  }

  const handleBuildHover = () => {
    if (buildTimeoutRef.current) {
      clearTimeout(buildTimeoutRef.current)
    }
    setIsBuildDropdownOpen(true)
    setIsDesignDropdownOpen(false)
    setIsConstructionSubmenuOpen(false)
  }

  const handleBuildLeave = () => {
    buildTimeoutRef.current = setTimeout(() => {
      setIsBuildDropdownOpen(false)
      setIsConstructionSubmenuOpen(false)
    }, 200)
  }

  const handleConstructionHover = () => {
    if (constructionTimeoutRef.current) {
      clearTimeout(constructionTimeoutRef.current)
    }
    setIsConstructionSubmenuOpen(true)
  }

  const handleConstructionLeave = () => {
    constructionTimeoutRef.current = setTimeout(() => {
      setIsConstructionSubmenuOpen(false)
    }, 200)
  }

  const closeAllDropdowns = () => {
    setIsDesignDropdownOpen(false)
    setIsBuildDropdownOpen(false)
    setIsConstructionSubmenuOpen(false)
    setIsSettingsDropdownOpen(false)
  }

  const isDesignActive =
    location.pathname.includes("/design") ||
    location.pathname.includes("/architecture") ||
    location.pathname.includes("/planning") ||
    location.pathname.includes("/interior") ||
    location.pathname.includes("/landscape")

  const isBuildActive =
    location.pathname.includes("/build") ||
    location.pathname.includes("/construction") ||
    location.pathname.includes("/supervision") ||
    location.pathname.includes("/management") ||
    location.pathname.includes("/real-estate")

  // Check if we're on a construction page to force header visibility
  const isConstructionPage = location.pathname.includes("/construction/")

  // Update the headerClass logic
  const headerClass = `header ${isScrolled || isConstructionPage ? "header-scrolled" : "header-transparent"}`

  return (
    <header className={headerClass}>
      <div className="header-container">
        <div className="header-content">
          <RouterLink to="/" className="logo" onClick={closeAllDropdowns}>
            <img src="/images/logo.png" alt="Logo" className="logo-image" />
          </RouterLink>

          <nav className="nav-desktop">
            <RouterLink
              to="/"
              className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
              onClick={closeAllDropdowns}
            >
              HOME
            </RouterLink>
            <RouterLink
              to="/about"
              className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}
              onClick={closeAllDropdowns}
            >
              ABOUT
            </RouterLink>

            <div
              className="design-dropdown-container"
              ref={designDropdownRef}
              onMouseEnter={handleDesignHover}
              onMouseLeave={handleDesignLeave}
            >
              <button className={`design-dropdown-trigger nav-link ${isDesignActive ? "active" : ""}`}>
                DESIGN
                <ChevronDown size={16} className={`dropdown-icon ${isDesignDropdownOpen ? "rotated" : ""}`} />
              </button>
              {isDesignDropdownOpen && (
                <div className="design-dropdown-menu" onMouseEnter={handleDesignHover} onMouseLeave={handleDesignLeave}>
                  <RouterLink to="/architecture" className="dropdown-item" onClick={closeAllDropdowns}>
                    Architecture
                  </RouterLink>
                  <RouterLink to="/planning" className="dropdown-item" onClick={closeAllDropdowns}>
                    Planning
                  </RouterLink>
                  <RouterLink to="/interior" className="dropdown-item" onClick={closeAllDropdowns}>
                    Interior
                  </RouterLink>
                  <RouterLink to="/landscape" className="dropdown-item" onClick={closeAllDropdowns}>
                    Landscape
                  </RouterLink>
                </div>
              )}
            </div>

            <div
              className="build-dropdown-container"
              ref={buildDropdownRef}
              onMouseEnter={handleBuildHover}
              onMouseLeave={handleBuildLeave}
            >
              <button className={`build-dropdown-trigger nav-link ${isBuildActive ? "active" : ""}`}>
                BUILD
                <ChevronDown size={16} className={`dropdown-icon ${isBuildDropdownOpen ? "rotated" : ""}`} />
              </button>
              {isBuildDropdownOpen && (
                <div className="build-dropdown-menu" onMouseEnter={handleBuildHover} onMouseLeave={handleBuildLeave}>
                  <div
                    className="dropdown-item-container"
                    onMouseEnter={handleConstructionHover}
                    onMouseLeave={handleConstructionLeave}
                  >
                    <div className="dropdown-item has-submenu construction-trigger">
                      Construction
                      <ChevronRight size={14} className="submenu-icon" />
                    </div>
                    {isConstructionSubmenuOpen && (
                      <div
                        className="construction-submenu"
                        ref={constructionSubmenuRef}
                        onMouseEnter={handleConstructionHover}
                        onMouseLeave={handleConstructionLeave}
                      >
                        <RouterLink to="/construction/private-homes" className="submenu-item" onClick={closeAllDropdowns}>
                          Private Homes
                        </RouterLink>
                        <RouterLink
                          to="/construction/commercial-buildings"
                          className="submenu-item"
                          onClick={closeAllDropdowns}
                        >
                          Commercial Buildings
                        </RouterLink>
                        <RouterLink to="/construction/office" className="submenu-item" onClick={closeAllDropdowns}>
                          Office
                        </RouterLink>
                        <RouterLink to="/construction/institute" className="submenu-item" onClick={closeAllDropdowns}>
                          Institute
                        </RouterLink>
                        <RouterLink to="/construction/hospitality" className="submenu-item" onClick={closeAllDropdowns}>
                          Hospitality
                        </RouterLink>
                        <RouterLink to="/construction/interior" className="submenu-item" onClick={closeAllDropdowns}>
                          Interior
                        </RouterLink>
                        <RouterLink to="/construction/renovation" className="submenu-item" onClick={closeAllDropdowns}>
                          Renovation
                        </RouterLink>
                      </div>
                    )}
                  </div>
                  <RouterLink to="/supervision" className="dropdown-item" onClick={closeAllDropdowns}>
                    Supervision
                  </RouterLink>
                  <RouterLink to="/management" className="dropdown-item" onClick={closeAllDropdowns}>
                    Management
                  </RouterLink>
                  <RouterLink to="/real-estate" className="dropdown-item" onClick={closeAllDropdowns}>
                    Real Estate
                  </RouterLink>
                </div>
              )}
            </div>

            <RouterLink
              to="/blog"
              className={`nav-link ${location.pathname === "/blog" ? "active" : ""}`}
              onClick={closeAllDropdowns}
            >
              BLOG
            </RouterLink>
          </nav>

          <div className="settings-dropdown-container" ref={settingsDropdownRef}>
            <button className="settings-btn" onClick={toggleSettingsDropdown}>
              <Link size={16} />
            </button>
            {isSettingsDropdownOpen && (
              <div className="settings-dropdown-menu">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="settings-dropdown-item">
                  <Facebook size={20} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="settings-dropdown-item">
                  <Instagram size={20} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="settings-dropdown-item">
                  <Youtube size={20} />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="settings-dropdown-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 112.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
              </div>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <nav className="nav-mobile">
            <RouterLink
              to="/"
              className={`nav-mobile-link ${location.pathname === "/" ? "active" : ""}`}
              onClick={toggleMobileMenu}
            >
              HOME
            </RouterLink>
            <RouterLink
              to="/about"
              className={`nav-mobile-link ${location.pathname === "/about" ? "active" : ""}`}
              onClick={toggleMobileMenu}
            >
              ABOUT
            </RouterLink>

            <div className="mobile-design-section">
              <div className="design-header">DESIGN</div>
              <RouterLink to="/architecture" className="nav-mobile-link design-sub-item" onClick={toggleMobileMenu}>
                Architecture
              </RouterLink>
              <RouterLink to="/planning" className="nav-mobile-link design-sub-item" onClick={toggleMobileMenu}>
                Planning
              </RouterLink>
              <RouterLink to="/interior" className="nav-mobile-link design-sub-item" onClick={toggleMobileMenu}>
                Interior
              </RouterLink>
              <RouterLink to="/landscape" className="nav-mobile-link design-sub-item" onClick={toggleMobileMenu}>
                Landscape
              </RouterLink>
            </div>

            <div className="mobile-build-section">
              <div className="build-header">BUILD</div>
              <div className="nav-mobile-link build-sub-item construction-mobile-trigger">Construction</div>
              <div className="mobile-construction-subsection">
                <RouterLink
                  to="/construction/private-homes"
                  className="nav-mobile-link construction-sub-item"
                  onClick={toggleMobileMenu}
                >
                  Private Homes
                </RouterLink>
                <RouterLink
                  to="/construction/commercial-buildings"
                  className="nav-mobile-link construction-sub-item"
                  onClick={toggleMobileMenu}
                >
                  Commercial Buildings
                </RouterLink>
                <RouterLink
                  to="/construction/office"
                  className="nav-mobile-link construction-sub-item"
                  onClick={toggleMobileMenu}
                >
                  Office
                </RouterLink>
                <RouterLink
                  to="/construction/institute"
                  className="nav-mobile-link construction-sub-item"
                  onClick={toggleMobileMenu}
                >
                  Institute
                </RouterLink>
                <RouterLink
                  to="/construction/hospitality"
                  className="nav-mobile-link construction-sub-item"
                  onClick={toggleMobileMenu}
                >
                  Hospitality
                </RouterLink>
                <RouterLink
                  to="/construction/interior"
                  className="nav-mobile-link construction-sub-item"
                  onClick={toggleMobileMenu}
                >
                  Interior
                </RouterLink>
                <RouterLink
                  to="/construction/renovation"
                  className="nav-mobile-link construction-sub-item"
                  onClick={toggleMobileMenu}
                >
                  Renovation
                </RouterLink>
              </div>
              <RouterLink to="/supervision" className="nav-mobile-link build-sub-item" onClick={toggleMobileMenu}>
                Supervision
              </RouterLink>
              <RouterLink to="/management" className="nav-mobile-link build-sub-item" onClick={toggleMobileMenu}>
                Management
              </RouterLink>
              <RouterLink to="/real-estate" className="nav-mobile-link build-sub-item" onClick={toggleMobileMenu}>
                Real Estate
              </RouterLink>
            </div>

            <RouterLink
              to="/blog"
              className={`nav-mobile-link ${location.pathname === "/blog" ? "active" : ""}`}
              onClick={toggleMobileMenu}
            >
              BLOG
            </RouterLink>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header