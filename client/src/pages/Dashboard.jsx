import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRegistrations } from '../services/api';
import {
  FaChessKing,
  FaChessRook,
  FaUser,
  FaEnvelope,
  FaUniversity,
  FaFlask,
  FaCalendarAlt,
  FaChessBoard,
  FaIdBadge,
  FaUserTie,
  FaTrophy,
  FaCheckCircle,
  FaClock,
} from 'react-icons/fa';

// ═══════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════
const gold = '#C6A15B';
const darkBg = '#0B0B0B';
const glassBg = 'rgba(20, 20, 20, 0.6)';
const glassBorder = 'rgba(198, 161, 91, 0.15)';
const glassHighlight = 'rgba(198, 161, 91, 0.08)';


// ═══════════════════════════════════════════
// Skeleton Loader
// ═══════════════════════════════════════════
const SkeletonCard = () => (
  <div style={styles.skeletonCard}>
    <div style={{ ...styles.skeletonLine, width: '60%', height: 20 }} />
    <div style={{ ...styles.skeletonLine, width: '80%', height: 14, marginTop: 12 }} />
    <div style={{ ...styles.skeletonLine, width: '45%', height: 14, marginTop: 8 }} />
    <div style={{ ...styles.skeletonLine, width: '35%', height: 28, marginTop: 16, borderRadius: 14 }} />
  </div>
);

const SkeletonProfile = () => (
  <div style={styles.profileCard}>
    <div style={{ ...styles.skeletonLine, width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px' }} />
    <div style={{ ...styles.skeletonLine, width: '50%', height: 22, margin: '0 auto 12px' }} />
    <div style={{ ...styles.skeletonLine, width: '70%', height: 14, margin: '0 auto 8px' }} />
    <div style={{ ...styles.skeletonLine, width: '60%', height: 14, margin: '0 auto' }} />
  </div>
);

// ═══════════════════════════════════════════
// Profile Card Component
// ═══════════════════════════════════════════
const ProfileCard = ({ user }) => {
  const fields = [
    { icon: FaEnvelope, label: 'Email', value: user.email },
    { icon: FaUniversity, label: 'College', value: user.college || user.collegeName },
    { icon: FaFlask, label: 'Department', value: user.department },
    { icon: FaCalendarAlt, label: 'Year', value: user.year },
  ].filter((f) => f.value);

  return (
    <div style={styles.profileCard}>
      {/* Chess piece avatar */}
      <div style={styles.avatarContainer}>
        <div style={styles.avatar}>
          <FaChessKing style={styles.avatarIcon} />
        </div>
      </div>
      <h2 style={styles.profileName}>{user.name || user.fullName || 'Player'}</h2>
      {user.role === 'admin' && (
        <span style={styles.adminBadge}>♛ Admin</span>
      )}
      <div style={styles.profileFields}>
        {fields.map(({ icon: Icon, label, value }) => (
          <div key={label} style={styles.profileField}>
            <Icon style={styles.profileFieldIcon} />
            <div>
              <span style={styles.profileFieldLabel}>{label}</span>
              <span style={styles.profileFieldValue}>{value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// Registration Card Component
// ═══════════════════════════════════════════
const RegistrationCard = ({ registration }) => {

  return (
    <div style={styles.regCard}>
      {/* Gold top accent */}
      <div style={styles.regCardAccent} />

      {/* Header row */}
      <div style={styles.regCardHeader}>
        <div style={styles.regCardEventIcon}>
          <FaTrophy style={{ fontSize: '1.2rem', color: gold }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.regCardEventsList}>
            {(registration.events || [registration.eventName]).map((ev) => (
              <span key={ev} style={styles.regCardEventTag}>{ev}</span>
            ))}
          </div>
          <div style={styles.regCardId}>
            <FaIdBadge style={{ marginRight: 6, fontSize: '0.7rem' }} />
            {registration._id || registration.registrationId || '—'}
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={styles.regCardBody}>
        <div style={styles.regCardDetail}>
          <FaUserTie style={styles.regCardDetailIcon} />
          <span style={styles.regCardDetailLabel}>Team Leader:</span>
          <span style={styles.regCardDetailValue}>
            {typeof registration.teamLeader === 'string'
              ? registration.teamLeader
              : registration.teamLeader?.name || registration.teamLeaderName || '—'}
          </span>
        </div>

        {registration.teamMembers && registration.teamMembers.length > 0 && (
          <div style={styles.regCardDetail}>
            <FaUser style={styles.regCardDetailIcon} />
            <span style={styles.regCardDetailLabel}>Team:</span>
            <span style={styles.regCardDetailValue}>
              {registration.teamMembers.map((m) => m.name || m).join(', ')}
            </span>
          </div>
        )}

        {(registration.createdAt || registration.registeredAt) && (
          <div style={styles.regCardDetail}>
            <FaClock style={styles.regCardDetailIcon} />
            <span style={styles.regCardDetailLabel}>Registered:</span>
            <span style={styles.regCardDetailValue}>
              {new Date(registration.createdAt || registration.registeredAt).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true,
              })}
            </span>
          </div>
        )}
      </div>

      {/* Footer: Status */}
      <div style={styles.regCardFooter}>
        <div style={styles.registeredBadge}>
          <FaCheckCircle style={{ marginRight: 6, fontSize: '0.85rem' }} />
          Pre-Registered
        </div>
        <Link 
          to={`/edit-registration/${registration._id || registration.registrationId}`} 
          style={styles.editBtn}
        >
          Edit
        </Link>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// Empty State Component
// ═══════════════════════════════════════════
const EmptyState = () => (
  <div style={styles.emptyState}>
    <div style={styles.emptyChessIcon}>♟</div>
    <h3 style={styles.emptyTitle}>No Registrations Yet</h3>
    <p style={styles.emptyText}>
      Your board is empty. Make your opening move and register for an event!
    </p>
    <Link to="/register" style={styles.emptyBtn}>
      <FaChessBoard style={{ marginRight: 8 }} />
      Register for an Event
    </Link>
  </div>
);

// ═══════════════════════════════════════════
// Dashboard Page
// ═══════════════════════════════════════════
const Dashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyRegistrations();
        setRegistrations(data.registrations || data || []);
      } catch (err) {
        console.error('Failed to fetch registrations:', err);
        setError(
          err.response?.data?.message ||
            'Failed to load registrations. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  return (
    <div style={styles.page}>
      {/* Background decorative elements */}
      <div style={styles.bgPattern} />
      <div style={styles.bgGlow} />

      <div style={styles.container}>
        {/* ── Page Header ── */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <FaChessRook style={{ fontSize: '1.8rem', color: gold }} />
          </div>
          <div>
            <h1 style={styles.headerTitle}>Dashboard</h1>
            <p style={styles.headerSubtitle}>Command your tournament journey</p>
          </div>
        </div>

        {/* ── Profile Section ── */}
        {loading ? (
          <SkeletonProfile />
        ) : user ? (
          <ProfileCard user={user} />
        ) : null}

        {/* ── Registrations Section ── */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <FaChessBoard style={{ marginRight: 10, fontSize: '1.1rem' }} />
              My Registration
            </h2>
            {!loading && registrations.length === 0 && (
              <Link to="/register" style={styles.newRegBtn}>
                + New Registration
              </Link>
            )}
          </div>

          {loading ? (
            <div style={styles.regGrid}>
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div style={styles.errorBox}>
              <FaTimesCircle style={{ marginRight: 8, color: '#EF4444' }} />
              {error}
            </div>
          ) : registrations.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={styles.regGrid}>
              {registrations.map((reg) => (
                <RegistrationCard
                  key={reg._id || reg.registrationId || reg.id}
                  registration={reg}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════
const styles = {
  /* ── Page ── */
  page: {
    minHeight: '100vh',
    backgroundColor: darkBg,
    fontFamily: 'Raleway, sans-serif',
    paddingTop: 90,
    paddingBottom: 60,
    position: 'relative',
    overflow: 'hidden',
  },
  bgPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(198,161,91,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(198,161,91,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  },
  bgGlow: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(198,161,91,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    maxWidth: 1000,
    margin: '0 auto',
    padding: '0 24px',
    position: 'relative',
    zIndex: 1,
  },

  /* ── Header ── */
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    marginBottom: 36,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: glassBg,
    border: `1px solid ${glassBorder}`,
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '2rem',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: 0,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.45)',
    margin: '4px 0 0 0',
    letterSpacing: 0.5,
  },

  /* ── Profile Card ── */
  profileCard: {
    background: glassBg,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${glassBorder}`,
    borderRadius: 20,
    padding: '36px 32px',
    marginBottom: 36,
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${gold}, #A8893A)`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 30px rgba(198,161,91,0.2)`,
  },
  avatarIcon: {
    fontSize: '1.8rem',
    color: darkBg,
  },
  profileName: {
    fontFamily: 'Cinzel, serif',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: '0 0 6px 0',
  },
  adminBadge: {
    display: 'inline-block',
    fontFamily: 'Cinzel, serif',
    fontSize: '0.7rem',
    color: gold,
    background: 'rgba(198,161,91,0.12)',
    border: `1px solid rgba(198,161,91,0.25)`,
    borderRadius: 20,
    padding: '4px 14px',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  profileFields: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  profileField: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: glassHighlight,
    border: `1px solid ${glassBorder}`,
    borderRadius: 12,
    padding: '10px 18px',
    minWidth: 180,
  },
  profileFieldIcon: {
    color: gold,
    fontSize: '0.95rem',
    flexShrink: 0,
  },
  profileFieldLabel: {
    display: 'block',
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 600,
  },
  profileFieldValue: {
    display: 'block',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.9)',
    fontWeight: 500,
    marginTop: 1,
  },

  /* ── Section ── */
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '1.3rem',
    fontWeight: 700,
    color: gold,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
  },
  newRegBtn: {
    textDecoration: 'none',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    fontSize: '0.8rem',
    color: darkBg,
    background: `linear-gradient(135deg, ${gold}, #A8893A)`,
    padding: '8px 20px',
    borderRadius: 8,
    letterSpacing: 0.5,
    transition: 'opacity 0.25s',
  },

  /* ── Registration Grid ── */
  regGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
  },

  /* ── Registration Card ── */
  regCard: {
    background: glassBg,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${glassBorder}`,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  },
  regCardAccent: {
    height: 3,
    background: `linear-gradient(90deg, ${gold}, transparent)`,
  },
  regCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    padding: '20px 20px 0',
  },
  regCardEventIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: glassHighlight,
    border: `1px solid ${glassBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  regCardEventsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '8px',
  },
  regCardEventTag: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: darkBg,
    background: gold,
    padding: '3px 8px',
    borderRadius: '4px',
  },
  regCardId: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.35)',
    marginTop: 4,
    fontFamily: 'monospace',
    letterSpacing: 0.3,
  },
  regCardBody: {
    padding: '14px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  regCardDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.82rem',
  },
  regCardDetailIcon: {
    color: gold,
    fontSize: '0.75rem',
    flexShrink: 0,
    opacity: 0.7,
  },
  regCardDetailLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: 500,
    flexShrink: 0,
  },
  regCardDetailValue: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: 500,
  },
  regCardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px 18px',
    borderTop: `1px solid ${glassBorder}`,
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 10,
  },

  /* ── Status Badge ── */
  registeredBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    fontSize: '0.8rem',
    color: '#22C55E',
    background: 'rgba(34, 197, 94, 0.12)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    padding: '6px 16px',
    borderRadius: 20,
    letterSpacing: 0.5,
  },
  
  /* ── Edit Button ── */
  editBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    fontSize: '0.75rem',
    color: gold,
    textDecoration: 'none',
    background: 'rgba(198, 161, 91, 0.1)',
    border: `1px solid rgba(198, 161, 91, 0.3)`,
    padding: '6px 16px',
    borderRadius: 20,
    letterSpacing: 0.5,
    transition: 'all 0.2s',
  },


  /* ── Empty State ── */
  emptyState: {
    background: glassBg,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${glassBorder}`,
    borderRadius: 20,
    padding: '60px 32px',
    textAlign: 'center',
  },
  emptyChessIcon: {
    fontSize: '4rem',
    color: 'rgba(198,161,91,0.25)',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: '0 0 8px 0',
  },
  emptyText: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.45)',
    margin: '0 0 28px 0',
    maxWidth: 360,
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: 1.6,
  },
  emptyBtn: {
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    fontSize: '0.9rem',
    color: darkBg,
    background: `linear-gradient(135deg, ${gold}, #A8893A)`,
    padding: '12px 28px',
    borderRadius: 10,
    letterSpacing: 0.5,
    boxShadow: `0 4px 24px rgba(198,161,91,0.2)`,
    transition: 'transform 0.25s, box-shadow 0.25s',
  },

  /* ── Error ── */
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 12,
    padding: '20px 24px',
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.9rem',
    color: '#EF4444',
  },

  /* ── Skeleton ── */
  skeletonCard: {
    background: glassBg,
    border: `1px solid ${glassBorder}`,
    borderRadius: 16,
    padding: 24,
  },
  skeletonLine: {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 6,
    height: 14,
  },
};

export default Dashboard;
