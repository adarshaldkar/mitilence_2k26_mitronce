import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#0B0B0B',
          fontFamily: 'Cinzel, serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Inject animations */}
        <style>{`
          @keyframes splashPulse {
            0%, 100% { box-shadow: 0 0 30px rgba(198,161,91,0.2), 0 0 60px rgba(198,161,91,0.1); }
            50% { box-shadow: 0 0 50px rgba(198,161,91,0.4), 0 0 100px rgba(198,161,91,0.2); }
          }
          @keyframes splashGlow {
            0%, 100% { filter: drop-shadow(0 0 10px rgba(198,161,91,0.4)); }
            50% { filter: drop-shadow(0 0 25px rgba(198,161,91,0.8)); }
          }
          @keyframes splashBar {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
          @keyframes splashFadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes splashShimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}</style>

        {/* Subtle background radial glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(198,161,91,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          textAlign: 'center',
          animation: 'splashFadeIn 0.8s ease-out',
        }}>
          {/* Chess piece card */}
          <div style={{
            width: 120,
            height: 140,
            margin: '0 auto 2rem',
            background: 'linear-gradient(180deg, rgba(198,161,91,0.08) 0%, rgba(198,161,91,0.02) 100%)',
            border: '1.5px solid rgba(198,161,91,0.3)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'splashPulse 2.5s ease-in-out infinite',
            position: 'relative',
          }}>
            {/* Corner accents */}
            <div style={{ position:'absolute', top:6, left:6, width:12, height:12, borderTop:'1.5px solid rgba(198,161,91,0.5)', borderLeft:'1.5px solid rgba(198,161,91,0.5)', borderRadius:'2px 0 0 0' }} />
            <div style={{ position:'absolute', top:6, right:6, width:12, height:12, borderTop:'1.5px solid rgba(198,161,91,0.5)', borderRight:'1.5px solid rgba(198,161,91,0.5)', borderRadius:'0 2px 0 0' }} />
            <div style={{ position:'absolute', bottom:6, left:6, width:12, height:12, borderBottom:'1.5px solid rgba(198,161,91,0.5)', borderLeft:'1.5px solid rgba(198,161,91,0.5)', borderRadius:'0 0 0 2px' }} />
            <div style={{ position:'absolute', bottom:6, right:6, width:12, height:12, borderBottom:'1.5px solid rgba(198,161,91,0.5)', borderRight:'1.5px solid rgba(198,161,91,0.5)', borderRadius:'0 0 2px 0' }} />

            <span style={{
              fontSize: '3.5rem',
              color: '#C6A15B',
              animation: 'splashGlow 2s ease-in-out infinite',
            }}>♚</span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '2rem',
            fontWeight: 700,
            background: 'linear-gradient(90deg, #C6A15B, #E6C47A, #D4AF37, #E6C47A, #C6A15B)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: 8,
            textTransform: 'uppercase',
            margin: '0 0 1.5rem 0',
            animation: 'splashShimmer 3s linear infinite',
          }}>
            MITRONCE 2026
          </h1>

          {/* Loading bar */}
          <div style={{
            width: 200,
            height: 2,
            background: 'rgba(198,161,91,0.15)',
            borderRadius: 4,
            margin: '0 auto',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #C6A15B, #E6C47A)',
              borderRadius: 4,
              animation: 'splashBar 1.8s ease-in-out infinite',
            }} />
          </div>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to login (preserve intended destination)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but not admin when adminOnly is required
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
