import { useState, useEffect } from 'react';

/* ── Gold Cursor Glow Ring ── */
const GoldCursor = () => {
  useEffect(() => {
    // Create the ring element
    const ring = document.createElement('div');
    ring.id = 'cursor-ring';
    document.body.appendChild(ring);

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let rafId;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseOver = (e) => {
      if (e.target.closest('a, button, input, select, textarea, [role="button"], label')) {
        ring.classList.add('cursor-hover');
      } else {
        ring.classList.remove('cursor-hover');
      }
    };

    // Smooth lerp follow
    const animate = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = `${ringX}px`;
      ring.style.top  = `${ringY}px`;
      rafId = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    rafId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(rafId);
      ring.remove();
    };
  }, []);

  return null;
};
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import MarqueeBanner from './components/MarqueeBanner';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';

import AdminDashboard from './pages/AdminDashboard';

/* ═══════════════════════════════════════════
   Global Page Loader — matches original design
   ═══════════════════════════════════════════ */
const ChessKingSVG = ({ size = 68 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={size} height={size}>
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#E6C47A' }} />
        <stop offset="50%" style={{ stopColor: '#C6A15B' }} />
        <stop offset="100%" style={{ stopColor: '#A8893A' }} />
      </linearGradient>
    </defs>
    <rect x="29" y="4" width="6" height="14" rx="1.5" fill="url(#goldGrad)" />
    <rect x="24" y="7" width="16" height="6" rx="1.5" fill="url(#goldGrad)" />
    <circle cx="32" cy="22" r="6" fill="url(#goldGrad)" />
    <rect x="28" y="27" width="8" height="4" rx="1" fill="url(#goldGrad)" />
    <path d="M22 31 L42 31 L46 52 L18 52 Z" fill="url(#goldGrad)" />
    <rect x="24" y="36" width="16" height="2" rx="1" fill="#0B0B0B" opacity="0.25" />
    <rect x="22" y="42" width="20" height="2" rx="1" fill="#0B0B0B" opacity="0.2" />
    <rect x="15" y="52" width="34" height="4" rx="2" fill="url(#goldGrad)" />
    <rect x="13" y="55" width="38" height="5" rx="2.5" fill="url(#goldGrad)" />
  </svg>
);

const GlobalLoader = () => (
  <div style={loaderStyles.page}>
    <style>{`
      @keyframes loader-glow-pulse {
        0%, 100% {
          box-shadow:
            0 0 40px 20px rgba(198,161,91,0.35),
            0 0 80px 40px rgba(198,161,91,0.18),
            0 0 120px 60px rgba(198,161,91,0.07);
        }
        50% {
          box-shadow:
            0 0 60px 30px rgba(198,161,91,0.55),
            0 0 110px 55px rgba(198,161,91,0.28),
            0 0 160px 80px rgba(198,161,91,0.10);
        }
      }
      @keyframes loader-fade-up {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @media (max-width: 480px) {
        .loader-card {
          width: 70px !important;
          height: 82px !important;
        }
        .loader-title {
          font-size: 0.82rem !important;
          letter-spacing: 0.25em !important;
        }
      }
    `}</style>

    {/* Card with strong glow */}
    <div style={loaderStyles.card} className="loader-card">
      <ChessKingSVG size={window.innerWidth < 480 ? 46 : 68} />
    </div>

    {/* Title */}
    <h1 style={loaderStyles.title} className="loader-title">MITRONCE 2026</h1>

    {/* Decorative gold line */}
    <div style={loaderStyles.line} />
  </div>
);

const loaderStyles = {
  page: {
    position: 'fixed',
    inset: 0,
    zIndex: 99999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0B0B0B',
    fontFamily: 'Cinzel, serif',
  },
  card: {
    width: 100,
    height: 118,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    border: '1.5px solid rgba(198,161,91,0.45)',
    background: 'linear-gradient(160deg, #1a1408, #0e0c06)',
    marginBottom: 26,
    animation: 'loader-glow-pulse 2.4s ease-in-out infinite',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 500,
    color: '#C6A15B',
    letterSpacing: '0.35em',
    margin: '0 0 16px 0',
    animation: 'loader-fade-up 0.9s ease-out 0.2s both',
  },
  line: {
    width: 100,
    height: 2,
    background: 'linear-gradient(90deg, transparent, #C6A15B, transparent)',
    borderRadius: 2,
    animation: 'loader-fade-up 0.9s ease-out 0.4s both',
  },
};

/* ═══════════════════════════════════════════
   App Content  (rendered after auth loads)
   ═══════════════════════════════════════════ */
const MIN_LOADER_MS = 2500; // show loader for at least 2.5 seconds

const AppContent = () => {
  const { loading: authLoading } = useAuth();
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), MIN_LOADER_MS);
    return () => clearTimeout(timer);
  }, []);

  // Show loader until BOTH auth finishes AND minimum time has passed
  if (authLoading || !minTimePassed) {
    return <GlobalLoader />;
  }

  return (
    <>
      {/* Navbar renders on every page */}
      <Navbar />

      {/* Global Marquee Banner */}
      <MarqueeBanner />

      {/* Main content area with top margin to clear fixed marquee & navbar */}
      <main style={{ marginTop: '35px' }}>
        <Routes>
          {/* ─── Public Routes ─── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ─── Protected Routes (authenticated users) ─── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute>
                <Register />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-registration/:id"
            element={
              <ProtectedRoute>
                <Register />
              </ProtectedRoute>
            }
          />


          {/* ─── Admin-Only Route ─── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ─── 404 Catch-All ─── */}
          <Route
            path="*"
            element={
              <div
                style={{
                  minHeight: '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#0B0B0B',
                  color: '#C6A15B',
                  fontFamily: 'Cinzel, serif',
                  paddingTop: 70,
                }}
              >
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>♚</div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>404</h1>
                <p
                  style={{
                    fontFamily: 'Raleway, sans-serif',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '1rem',
                  }}
                >
                  The square you seek does not exist on this board.
                </p>
              </div>
            }
          />
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <GoldCursor />
      <AppContent />
      <Analytics />
    </AuthProvider>
  );
}

export default App;

