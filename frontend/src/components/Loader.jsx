import React from 'react';

const Loader = ({ message = "Analyzing data with HERLaunch AI...", subtext = "Please wait a moment while our models compute projections." }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      color: '#fff',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(30, 41, 59, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '3rem',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        maxWidth: '480px',
        width: '100%'
      }}>
        {/* Animated Double Ring Spinner */}
        <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '2rem' }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: '4px solid transparent',
            borderTopColor: '#6C63FF',
            borderBottomColor: '#A855F7',
            borderRadius: '50%',
            animation: 'spin 1.5s linear infinite'
          }} />
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            bottom: '10px',
            border: '4px solid transparent',
            borderLeftColor: '#EC4899',
            borderRightColor: '#22C55E',
            borderRadius: '50%',
            animation: 'spin 1s linear reverse infinite'
          }} />
        </div>
        
        <h3 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '0.75rem',
          background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {message}
        </h3>
        
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.9rem',
          color: '#94A3B8',
          lineHeight: '1.6'
        }}>
          {subtext}
        </p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
