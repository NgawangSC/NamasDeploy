import React, { useState, useEffect, useRef } from 'react';
import './StatisticsBox.css';

// Utility function to format numbers with commas
const formatNumber = (num) => {
  return num.toLocaleString();
};

const StatisticsBox = ({ 
  projectsDone = 157, 
  happyClients = 86, 
  workingHours = 924, 
  awards = 13,
  customStats = null,
  title = "Make with love all what we do.",
  subtitle = "NUMBERS",
  description = "Our team takes over everything, from an idea and concept development to realization. We believe in traditions and incorporate them within our innovations. All our projects incorporate a unique artistic image and functional solutions.",
  backgroundImage = "/images/statistics-pic.jpeg"
}) => {
  // Use custom stats if provided, otherwise use default props
  const defaultStats = [
    { key: 'projectsDone', value: projectsDone, label: 'PROJECTS DONE', x: '52%', numberY: '47%', titleY: '80%' },
    { key: 'happyClients', value: happyClients, label: 'HAPPY CLIENTS', x: '46%', numberY: '47%', titleY: '80%' },
    { key: 'workingHours', value: workingHours, label: 'WORKING HOURS', x: '52%', numberY: '35%', titleY: '68%' },
    { key: 'awards', value: awards, label: 'AWARDS', x: '46%', numberY: '35%', titleY: '68%' }
  ];

  const statsData = customStats || defaultStats;

  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState(
    statsData.reduce((acc, stat) => {
      acc[stat.key] = 0;
      return acc;
    }, {})
  );

  const sectionRef = useRef(null);

  const finalValues = statsData.reduce((acc, stat) => {
    acc[stat.key] = stat.value;
    return acc;
  }, {});

  // Intersection Observer to trigger animation when component is visible
  useEffect(() => {
    const currentRef = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isVisible]);

  // Counter animation effect
  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60; // 60 steps for smooth animation
    const stepDuration = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      const newCounters = {};
      statsData.forEach(stat => {
        newCounters[stat.key] = Math.floor(finalValues[stat.key] * easeOutQuart);
      });

      setCounters(newCounters);

      if (currentStep >= steps) {
        clearInterval(timer);
        // Ensure final values are set
        setCounters(finalValues);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, statsData, finalValues]);

  return (
    <section className="statistics-section" ref={sectionRef}>
      <div className="container">
        <div className="statistics-row">
          {/* Counter Section */}
          <div className="statistics-counter-column">
            <div className="prague-counter multi-item no-figure">
              <div className="counter-outer" style={{ backgroundImage: `url(${backgroundImage})` }}>
                <div className="numbers">
                  {statsData.map((stat, index) => (
                    <svg key={stat.key} className="stat-svg">
                      <defs>
                        <mask id={`coming_mask_${index}`} x="0" y="0">
                          <rect className="coming-alpha" x="0" y="0" width="100%" height="100%"></rect>
                          <text 
                            className="count number" 
                            x={stat.x} 
                            y={stat.numberY} 
                            textAnchor="middle" 
                            alignmentBaseline="middle"
                          >
                            {formatNumber(counters[stat.key] || 0)}
                          </text>
                          <text 
                            className="count title" 
                            x={stat.x} 
                            y={stat.titleY} 
                            textAnchor="middle" 
                            alignmentBaseline="middle"
                          >
                            {stat.label}
                          </text>
                        </mask>
                      </defs>
                      <rect 
                        style={{ 
                          WebkitMask: `url(#coming_mask_${index})`, 
                          mask: `url(#coming_mask_${index})` 
                        }} 
                        className="base" 
                        x="0" 
                        y="0" 
                        width="100%" 
                        height="100%"
                      ></rect>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Text Section */}
          <div className="statistics-text-column">
            <section className="heading left dark">
              <div className="subtitle">{subtitle}</div>
              <h1 className="title-main" dangerouslySetInnerHTML={{ __html: title }}></h1>
              <div className="content">
                <p>{description}</p>
                <p>Client is the soul of the project. Our main goal is to illustrate his/hers values and individuality through design. So we wait to hear your wishes.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatisticsBox;