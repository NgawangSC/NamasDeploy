import React, { useState, useEffect } from 'react'
import './MiniLoadingAnimation.css'
import logo from '../logo.svg'
import SimpleFallbackLoading from './SimpleFallbackLoading'

const MiniLoadingAnimation = ({ 
  size = 'medium', 
  showText = true, 
  text = 'Loading...', 
  className = '',
  variant = 'default' // default, minimal, dots-only
}) => {
  console.log('MiniLoadingAnimation rendering:', { size, showText, text, variant, className })
  console.log('Environment:', process.env.NODE_ENV)
  console.log('Public URL:', process.env.PUBLIC_URL)
  const [useFallback, setUseFallback] = useState(false)
  
  // Check if CSS is loaded properly
  useEffect(() => {
    const timer = setTimeout(() => {
      const testElement = document.createElement('div')
      testElement.className = 'mini-loading-container'
      document.body.appendChild(testElement)
      
      const styles = window.getComputedStyle(testElement)
      const hasStyles = styles.display === 'flex' || styles.position === 'relative'
      
      document.body.removeChild(testElement)
      
      if (!hasStyles) {
        console.warn('MiniLoadingAnimation CSS not loaded, using fallback')
        setUseFallback(true)
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Use fallback if CSS didn't load or if there's an error
  if (useFallback) {
    return <SimpleFallbackLoading text={showText ? text : ''} size={size} />
  }
  
  const getContainerClass = () => {
    let classes = `mini-loading-container ${size} ${variant}`
    if (className) classes += ` ${className}`
    return classes
  }

  return (
    <div className={getContainerClass()} style={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {variant === 'dots-only' ? (
        <div className="mini-loading-dots-only">
          <span></span>
          <span></span>
          <span></span>
        </div>
      ) : (
        <>
          <div className="mini-logo-container">
            <img 
              src={logo} 
              alt="Loading" 
              className="mini-loading-logo"
              onLoad={() => console.log('Mini logo loaded successfully')}
              onError={(e) => console.error('Mini logo failed to load:', e)}
            />
            <div className="mini-logo-glow"></div>
          </div>
          
          {showText && (
            <div className="mini-loading-text">
              <span>{text}</span>
            </div>
          )}
          
          {variant === 'default' && (
            <div className="mini-loading-progress">
              <div className="mini-progress-bar">
                <div className="mini-progress-fill"></div>
              </div>
            </div>
          )}
          
          <div className="mini-loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </>
      )}
    </div>
  )
}

export default MiniLoadingAnimation