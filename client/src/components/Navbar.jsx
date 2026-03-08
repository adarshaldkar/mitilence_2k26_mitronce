import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaChessKing,
  FaHome,
  FaInfoCircle,
  FaChessBoard,
  FaClock,
  FaImages,
  FaEnvelope,
  FaSignInAlt,
  FaUserPlus,
  FaTachometerAlt,
  FaSignOutAlt,
  FaUserShield,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

const NAV_SECTIONS = [
  { label: 'Home', hash: '#home', icon: <FaHome /> },
  { label: 'About', hash: '#about', icon: <FaInfoCircle /> },
  { label: 'Events', hash: '#events', icon: <FaChessBoard /> },
  { label: 'Schedule', hash: '#schedule', icon: <FaClock /> },
  { label: 'Contact', hash: '#contact', icon: <FaEnvelope /> },
];

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll to add backdrop effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isHomePage = location.pathname === '/';

  // Build correct href for section links
  const getSectionHref = (hash) => (isHomePage ? hash : `/${hash}`);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav style={{ ...styles.navbar, ...(scrolled ? styles.navbarScrolled : {}) }}>
        <div style={styles.container}>
          {/* ─── Brand ─── */}
          <Link to="/" style={styles.brand}>
            <FaChessKing style={styles.brandIcon} />
            <span style={styles.brandText}>MITRONCE</span>
          </Link>

          {/* ─── Desktop Nav Links ─── */}
          <ul style={styles.navLinks}>
            {NAV_SECTIONS.map(({ label, hash }) => (
              <li key={label}>
                <a href={getSectionHref(hash)} style={styles.navLink}>
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* ─── Desktop Auth Buttons ─── */}
          <div style={styles.authButtons}>
            {user ? (
              <>
                <Link to="/dashboard" style={styles.authLink}>
                  <FaTachometerAlt style={{ marginRight: 6 }} />
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/admin" style={styles.authLink}>
                    <FaUserShield style={{ marginRight: 6 }} />
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} style={styles.logoutBtn}>
                  <FaSignOutAlt style={{ marginRight: 6 }} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={styles.loginBtn}>
                  <FaSignInAlt style={{ marginRight: 6 }} />
                  Login
                </Link>
                <Link to="/signup" style={styles.registerBtn}>
                  <FaUserPlus style={{ marginRight: 6 }} />
                  Register
                </Link>
              </>
            )}
          </div>

          {/* ─── Hamburger ─── */}
          <button
            style={styles.hamburger}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* ─── Mobile Overlay ─── */}
      {mobileOpen && (
        <div style={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* ─── Mobile Menu ─── */}
      <aside style={{ ...styles.mobileMenu, ...(mobileOpen ? styles.mobileMenuOpen : {}) }}>
        {/* Mobile Header */}
        <div style={styles.mobileHeader}>
          <Link to="/" style={styles.brand} onClick={() => setMobileOpen(false)}>
            <FaChessKing style={styles.brandIcon} />
            <span style={styles.brandText}>MITRONCE</span>
          </Link>
          <button
            style={styles.mobileCloseBtn}
            onClick={() => setMobileOpen(false)}
            aria-label="Close mobile menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* Mobile Section Links */}
        <ul style={styles.mobileLinks}>
          {NAV_SECTIONS.map(({ label, hash, icon }) => (
            <li key={label}>
              <a
                href={getSectionHref(hash)}
                style={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                <span style={styles.mobileLinkIcon}>{icon}</span>
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Auth */}
        <div style={styles.mobileAuth}>
          {user ? (
            <>
              <Link
                to="/dashboard"
                style={styles.mobileAuthLink}
                onClick={() => setMobileOpen(false)}
              >
                <FaTachometerAlt style={{ marginRight: 8 }} />
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  style={styles.mobileAuthLink}
                  onClick={() => setMobileOpen(false)}
                >
                  <FaUserShield style={{ marginRight: 8 }} />
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                style={styles.mobileLogoutBtn}
              >
                <FaSignOutAlt style={{ marginRight: 8 }} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={styles.mobileAuthLink}
                onClick={() => setMobileOpen(false)}
              >
                <FaSignInAlt style={{ marginRight: 8 }} />
                Login
              </Link>
              <Link
                to="/signup"
                style={{ ...styles.mobileAuthLink, ...styles.mobileRegisterLink }}
                onClick={() => setMobileOpen(false)}
              >
                <FaUserPlus style={{ marginRight: 8 }} />
                Register Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile Footer */}
        <div style={styles.mobileFooter}>
          <p style={styles.mobileTagline}>Strategize. Innovate. Dominate.</p>
        </div>
      </aside>
    </>
  );
};

// ════════════════════════════════════════
// Inline styles — dark glass morphism + gold
// ════════════════════════════════════════
const gold = '#C6A15B';
const darkBg = '#0B0B0B';
const glassBg = 'rgba(11, 11, 11, 0.85)';
const glassBorder = 'rgba(198, 161, 91, 0.15)';

const styles = {
  /* ── Navbar ── */
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 1000,
    background: glassBg,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: `1px solid ${glassBorder}`,
    transition: 'background 0.3s ease, box-shadow 0.3s ease',
  },
  navbarScrolled: {
    background: 'rgba(11, 11, 11, 0.95)',
    boxShadow: `0 4px 30px rgba(198, 161, 91, 0.08)`,
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    height: 70,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /* ── Brand ── */
  brand: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    gap: 10,
  },
  brandIcon: {
    fontSize: '1.6rem',
    color: gold,
  },
  brandText: {
    fontFamily: 'Cinzel, serif',
    fontWeight: 700,
    fontSize: '1.25rem',
    color: '#FFFFFF',
    letterSpacing: 2,
  },

  /* ── Desktop Nav Links ── */
  navLinks: {
    display: 'flex',
    listStyle: 'none',
    gap: 28,
    margin: 0,
    padding: 0,
    /* Hide on mobile via media query below (handled by @media in CSS) —
       we use a responsive approach with the hamburger instead */
  },
  navLink: {
    textDecoration: 'none',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 500,
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.5,
    transition: 'color 0.25s ease',
    cursor: 'pointer',
  },

  /* ── Desktop Auth ── */
  authButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  authLink: {
    textDecoration: 'none',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 500,
    fontSize: '0.85rem',
    color: gold,
    display: 'flex',
    alignItems: 'center',
    transition: 'opacity 0.25s',
  },
  loginBtn: {
    textDecoration: 'none',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 500,
    fontSize: '0.85rem',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    border: `1px solid ${glassBorder}`,
    borderRadius: 6,
    transition: 'border-color 0.25s',
  },
  registerBtn: {
    textDecoration: 'none',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    fontSize: '0.85rem',
    color: darkBg,
    display: 'flex',
    alignItems: 'center',
    padding: '8px 18px',
    background: `linear-gradient(135deg, ${gold}, #A8893A)`,
    borderRadius: 6,
    border: 'none',
    letterSpacing: 0.5,
  },
  logoutBtn: {
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 500,
    fontSize: '0.85rem',
    color: '#ff6b6b',
    background: 'transparent',
    border: '1px solid rgba(255,107,107,0.3)',
    borderRadius: 6,
    padding: '8px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'border-color 0.25s',
  },

  /* ── Hamburger (shown on mobile via CSS override) ── */
  hamburger: {
    display: 'none', /* overridden by CSS @media */
    background: 'transparent',
    border: 'none',
    color: gold,
    fontSize: '1.4rem',
    cursor: 'pointer',
    padding: 8,
  },

  /* ── Mobile Overlay ── */
  mobileOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 1001,
  },

  /* ── Mobile Menu ── */
  mobileMenu: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: 300,
    height: '100vh',
    background: 'rgba(11, 11, 11, 0.98)',
    borderLeft: `1px solid ${glassBorder}`,
    zIndex: 1002,
    display: 'flex',
    flexDirection: 'column',
    transform: 'translateX(100%)',
    transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    overflowY: 'auto',
  },
  mobileMenuOpen: {
    transform: 'translateX(0)',
  },
  mobileHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: `1px solid ${glassBorder}`,
  },
  mobileCloseBtn: {
    background: 'transparent',
    border: 'none',
    color: gold,
    fontSize: '1.3rem',
    cursor: 'pointer',
    padding: 8,
  },
  mobileLinks: {
    listStyle: 'none',
    margin: 0,
    padding: '16px 0',
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 500,
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.8)',
    padding: '14px 28px',
    transition: 'background 0.2s, color 0.2s',
  },
  mobileLinkIcon: {
    marginRight: 12,
    color: gold,
    fontSize: '1rem',
    width: 20,
    display: 'inline-flex',
    justifyContent: 'center',
  },
  mobileAuth: {
    padding: '16px 24px',
    borderTop: `1px solid ${glassBorder}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  mobileAuthLink: {
    textDecoration: 'none',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 500,
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.85)',
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: 8,
    border: `1px solid ${glassBorder}`,
    transition: 'background 0.2s',
  },
  mobileRegisterLink: {
    background: `linear-gradient(135deg, ${gold}, #A8893A)`,
    color: darkBg,
    fontWeight: 600,
    border: 'none',
    justifyContent: 'center',
  },
  mobileLogoutBtn: {
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 500,
    fontSize: '0.9rem',
    color: '#ff6b6b',
    background: 'transparent',
    border: '1px solid rgba(255,107,107,0.3)',
    borderRadius: 8,
    padding: '12px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  mobileFooter: {
    marginTop: 'auto',
    padding: '24px',
    borderTop: `1px solid ${glassBorder}`,
    textAlign: 'center',
  },
  mobileTagline: {
    fontFamily: 'Cinzel, serif',
    fontSize: '0.75rem',
    color: gold,
    letterSpacing: 2,
    margin: 0,
  },
};

export default Navbar;
