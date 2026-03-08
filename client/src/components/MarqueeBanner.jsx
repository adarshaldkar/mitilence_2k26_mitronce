import React from 'react';

const MarqueeBanner = () => {
  return (
    <div style={styles.container}>
      <div className="marquee-content">
        On-spot registration is also available, and pre-booking is also available.
      </div>
      <style>{`
        .marquee-content {
          display: inline-block;
          white-space: nowrap;
          animation: marquee-right-to-left 12s linear infinite;
        }
        @keyframes marquee-right-to-left {
          from { transform: translateX(100vw); }
          to { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 70, // Just below the 70px navbar
    left: 0,
    width: '100%',
    backgroundColor: '#FCCD04', // Bright yellow to match the reference and grab attention
    color: '#000000',
    padding: '8px 0',
    zIndex: 998,
    overflow: 'hidden',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 700,
    fontSize: '0.95rem',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  }
};

export default MarqueeBanner;
