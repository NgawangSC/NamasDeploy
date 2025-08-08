import React from 'react'
import './MiniLoadingAnimation.css'
import logo from '../logo.svg'

const MiniLoadingAnimation = ({ 
  size = 'medium', 
  showText = true, 
  text = 'Loading...', 
  className = '',
  variant = 'default' // default, minimal, dots-only
}) => {
  const getContainerClass = () => {
    let classes = `mini-loading-container ${size} ${variant}`
    if (className) classes += ` ${className}`
    return classes
  }

  return (
    <div className={getContainerClass()}>
      {variant === 'dots-only' ? (
        <div className="mini-loading-dots-only">
          <span></span>
          <span></span>
          <span></span>
        </div>
      ) : (
        <>
          <div className="mini-logo-container">
            <img src={logo} alt="Loading" className="mini-loading-logo" />
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