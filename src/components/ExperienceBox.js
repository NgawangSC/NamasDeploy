import React, { useState, useEffect, useRef } from 'react';
import './ExperienceBox.css';

// Custom hook for counter animation
const useCounter = (end, duration = 2000, startAnimation = false) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!startAnimation || hasAnimated) return;

    let startTime;
    const startCount = 0;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * (end - startCount) + startCount);
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
        setHasAnimated(true);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, startAnimation, hasAnimated]);

  return count;
};

// Counter component
const AnimatedCounter = ({ end, suffix = "", startAnimation }) => {
  const count = useCounter(end, 2000, startAnimation);
  return <span>{count}{suffix}</span>;
};

const ExperienceBox = () => {
  const [startAnimation, setStartAnimation] = useState(false);
  const boxRef = useRef(null);

  // Calculate years of experience since 2022
  const currentYear = new Date().getFullYear();
  const foundingYear = 2022;
  const yearsOfExperience = currentYear - foundingYear + 1; // +1 to include the founding year

  // Intersection Observer to trigger animation when component is visible
  useEffect(() => {
    const currentRef = boxRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startAnimation) {
          setStartAnimation(true);
        }
      },
      { threshold: 0.5 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [startAnimation]);

  return (
    <div className="experience-box-container" ref={boxRef}>
      <div className="experience-box">
        <div className="experience-content">
          <h4>
            <AnimatedCounter 
              end={yearsOfExperience} 

              startAnimation={startAnimation} 
            />
          </h4>
          <p>YEARS OF EXPERIENCE</p>
        </div>
      </div>
    </div>
  );
};

export default ExperienceBox;