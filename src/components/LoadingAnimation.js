import React from 'react'
import './LoadingAnimation.css'
import logo from '../logo.svg'

const LoadingAnimation = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="logo-container">
          <img src={logo} alt="Namas Architecture" className="loading-logo" />
          <div className="logo-glow"></div>
        </div>
        
        <div className="loading-text">
          <h2>NAMAS ARCHITECTURE</h2>
          <p>Crafting spaces, building dreams</p>
        </div>
        
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      
      <div className="loading-background">
        <div className="geometric-shape shape-1"></div>
        <div className="geometric-shape shape-2"></div>
        <div className="geometric-shape shape-3"></div>
      </div>
    </div>
  )
}

export default LoadingAnimation