import React from 'react'

const SimpleFallbackLoading = ({ text = 'Loading...', size = 'medium' }) => {
  console.log('SimpleFallbackLoading rendering:', { text, size })
  
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: size === 'large' ? '40px' : size === 'small' ? '20px' : '30px',
    minHeight: size === 'large' ? '200px' : size === 'small' ? '80px' : '120px',
    textAlign: 'center'
  }
  
  const textStyle = {
    color: '#ffffff',
    fontSize: size === 'large' ? '18px' : size === 'small' ? '14px' : '16px',
    fontWeight: '400',
    marginBottom: '20px',
    fontFamily: 'Inter, sans-serif'
  }
  
  const dotsStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }
  
  const dotStyle = {
    width: size === 'large' ? '8px' : size === 'small' ? '4px' : '6px',
    height: size === 'large' ? '8px' : size === 'small' ? '4px' : '6px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    animation: 'bounce 1.4s ease-in-out infinite both'
  }
  
  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0.8);
              opacity: 0.5;
            }
            40% {
              transform: scale(1.2);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={textStyle}>{text}</div>
      <div style={dotsStyle}>
        <div style={{...dotStyle, animationDelay: '-0.32s'}}></div>
        <div style={{...dotStyle, animationDelay: '-0.16s'}}></div>
        <div style={{...dotStyle, animationDelay: '0s'}}></div>
      </div>
    </div>
  )
}

export default SimpleFallbackLoading