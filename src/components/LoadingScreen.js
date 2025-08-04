import React, { useState, useEffect } from 'react';
import logo from '../logo.svg';
import './LoadingScreen.css';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Add a small delay before hiding
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
              onLoadingComplete();
            }, 500); // Wait for fade out animation
          }, 200);
          return 100;
        }
        return prev + Math.random() * 15 + 5; // Random increment between 5-20
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="loading-logo" />
        </div>
        <div className="loading-text">
          <h2>Welcome</h2>
          <p>Loading your experience...</p>
        </div>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;