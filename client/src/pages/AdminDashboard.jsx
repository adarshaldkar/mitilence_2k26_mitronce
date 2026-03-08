import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminGetRegistrations } from '../services/api';
import {
  FaChessKing,
  FaSearch,
  FaFilter,
  FaUsers,
  FaChessBoard,
  FaUserShield,
  FaIdBadge,
  FaUserTie,
  FaEnvelope,
  FaTrophy,
  FaTimesCircle,
  FaPhone,
  FaUniversity,
  FaBuilding,
  FaGraduationCap,
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

const EVENT_OPTIONS = [
  'All Events',
  'Paper Presentation',
  'Connectify',
  'Bot Marathon',
  'Sustainable Concept Pitch',
  'Mindbender',
  'Bug Busters',
  'Code Clash in Embedded C',
  'Fun Zone',
];

const STAT_CARDS = [
  {
    key: 'total',
    label: 'Total Registrations',
    icon: FaUsers,
    color: gold,
    bg: 'rgba(198, 161, 91, 0.10)',
    border: 'rgba(198, 161, 91, 0.25)',
  },
];

// ═══════════════════════════════════════════
// Skeleton Loader
// ═══════════════════════════════════════════
const SkeletonRow = () => (
  <div style={styles.skeletonRow}>
    <div style={{ ...styles.skeletonLine, width: '15%', height: 14 }} />
    <div style={{ ...styles.skeletonLine, width: '18%', height: 14 }} />
    <div style={{ ...styles.skeletonLine, width: '20%', height: 14 }} />
    <div style={{ ...styles.skeletonLine, width: '12%', height: 24, borderRadius: 12 }} />
    <div style={{ ...styles.skeletonLine, width: '20%', height: 14 }} />
  </div>
);

const SkeletonStatCard = () => (
  <div style={styles.skeletonStatCard}>
    <div style={{ ...styles.skeletonLine, width: 40, height: 40, borderRadius: 10 }} />
    <div style={{ ...styles.skeletonLine, width: '60%', height: 14, marginTop: 12 }} />
    <div style={{ ...styles.skeletonLine, width: '40%', height: 28, marginTop: 8 }} />
  </div>
);

// ═══════════════════════════════════════════
// Stat Card Component
// ═══════════════════════════════════════════
const StatCard = ({ stat, value }) => {
  const Icon = stat.icon;
  return (
    <div
      style={{
        ...styles.statCard,
        background: stat.bg,
        border: `1px solid ${stat.border}`,
      }}
    >
      <div style={{ ...styles.statIconWrap, background: stat.bg, border: `1px solid ${stat.border}` }}>
        <Icon style={{ fontSize: '1.1rem', color: stat.color }} />
      </div>
      <span style={styles.statLabel}>{stat.label}</span>
      <span style={{ ...styles.statValue, color: stat.color }}>{value}</span>
    </div>
  );
};

// ═══════════════════════════════════════════
// Registration Row Component
// ═══════════════════════════════════════════
const DetailCell = ({ icon: Icon, label, value }) => (
  <div style={styles.regRowDetail}>
    <Icon style={styles.regRowDetailIcon} />
    <div>
      <span style={styles.regRowDetailLabel}>{label}</span>
      <span style={styles.regRowDetailValue}>{value || '—'}</span>
    </div>
  </div>
);

const RegistrationRow = ({ reg }) => {
  const regId = reg._id || reg.registrationId || reg.id;
  const user = reg.userId || {};

  return (
    <div style={styles.regRow}>
      {/* Gold left accent */}
      <div style={styles.regRowAccent} />

      <div style={styles.regRowContent}>
        {/* Top section: ID + Event */}
        <div style={styles.regRowTop}>
          <div style={styles.regRowEventSection}>
            <div style={styles.regRowEventIcon}>
              <FaTrophy style={{ fontSize: '1.2rem', color: gold }} />
            </div>
            <div>
              <div style={styles.regRowEventsList}>
                {(reg.events || [reg.eventName]).map((ev) => (
                  <span key={ev} style={styles.regRowEventTag}>
                    {ev}
                  </span>
                ))}
              </div>
              <div style={styles.regRowId}>
                <FaIdBadge style={{ marginRight: 4, fontSize: '0.65rem' }} />
                {regId || '—'}
              </div>
              {(reg.createdAt || reg.registeredAt) && (
                <div style={{ ...styles.regRowId, marginTop: 2, opacity: 0.65 }}>
                  <FaClock style={{ marginRight: 4, fontSize: '0.6rem' }} />
                  {new Date(reg.createdAt || reg.registeredAt).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true,
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Participant / Team Leader Details ── */}
        {/* The registrant IS the team leader — all registration fields are in reg.teamLeader */}
        <div style={{ marginBottom: 12 }}>
          <span style={styles.adminSectionLabel}>
            <FaChessKing style={{ marginRight: 6, fontSize: '0.7rem' }} />
            Participant &amp; Team Leader Details
          </span>
          <div style={styles.regRowDetails}>
            {/* Name and Email come from the user account */}
            <DetailCell icon={FaUserTie} label="Full Name" value={user.name || (typeof reg.teamLeader === 'string' ? reg.teamLeader : reg.teamLeader?.name) || '—'} />
            <DetailCell icon={FaEnvelope} label="Account Email" value={user.email} />
            {/* All other details come from the registration form (stored in teamLeader) */}
            <DetailCell icon={FaUniversity} label="College" value={typeof reg.teamLeader === 'object' ? reg.teamLeader?.college : undefined} />
            <DetailCell icon={FaGraduationCap} label="Degree" value={typeof reg.teamLeader === 'object' ? reg.teamLeader?.degree : undefined} />
            <DetailCell icon={FaBuilding} label="Department" value={typeof reg.teamLeader === 'object' ? reg.teamLeader?.department : undefined} />
            <DetailCell icon={FaGraduationCap} label="Year" value={typeof reg.teamLeader === 'object' ? reg.teamLeader?.year : undefined} />
            <DetailCell icon={FaEnvelope} label="Reg. Email" value={typeof reg.teamLeader === 'object' ? reg.teamLeader?.email : undefined} />
            <DetailCell icon={FaPhone} label="Phone" value={typeof reg.teamLeader === 'object' ? reg.teamLeader?.phone : undefined} />
          </div>
        </div>

        {/* ── Team Members ── */}
        {reg.teamMembers && reg.teamMembers.length > 0 && (
          <div>
            <span style={styles.adminSectionLabel}>
              <FaUsers style={{ marginRight: 6, fontSize: '0.7rem' }} />
              Team Members ({reg.teamMembers.length})
            </span>
            {reg.teamMembers.map((m, idx) => (
              <div key={idx} style={styles.teamMemberCard}>
                <span style={styles.teamMemberIndex}>Member {idx + 1}</span>
                <div style={styles.regRowDetails}>
                  <DetailCell icon={FaUserTie} label="Name" value={m.name} />
                  <DetailCell icon={FaUniversity} label="College" value={m.college} />
                  <DetailCell icon={FaGraduationCap} label="Degree" value={m.degree} />
                  <DetailCell icon={FaBuilding} label="Department" value={m.department} />
                  <DetailCell icon={FaGraduationCap} label="Year" value={m.year} />
                  <DetailCell icon={FaEnvelope} label="Email" value={m.email} />
                  <DetailCell icon={FaPhone} label="Phone" value={m.phone} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// Empty State Component
// ═══════════════════════════════════════════
const EmptyState = ({ hasFilters }) => (
  <div style={styles.emptyState}>
    <div style={styles.emptyChessIcon}>♜</div>
    <h3 style={styles.emptyTitle}>
      {hasFilters ? 'No Matching Registrations' : 'No Registrations Yet'}
    </h3>
    <p style={styles.emptyText}>
      {hasFilters
        ? 'No registrations match your current filters. Try adjusting the search criteria.'
        : 'The board is empty. No participants have registered yet.'}
    </p>
  </div>
);

// ═══════════════════════════════════════════
// Admin Dashboard Page
// ═══════════════════════════════════════════
const AdminDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState('All Events');

  // ── Fetch registrations ──
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminGetRegistrations();
      setRegistrations(data.registrations || []);
      setStats(
        data.stats || {
          total: (data.registrations || []).length,
        }
      );
    } catch (err) {
      console.error('Failed to fetch admin registrations:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load registrations. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Filter registrations ──
  const filteredRegistrations = registrations.filter((reg) => {
    const regId = reg._id || reg.registrationId || reg.id || '';
    const eventsStr = (reg.events || [reg.eventName || '']).join(' ');
    const teamLeader = typeof reg.teamLeader === 'string' ? reg.teamLeader : (reg.teamLeader?.name || '');
    const userName = reg.userName || reg.userId?.name || reg.name || '';
    const userEmail = reg.userEmail || reg.userId?.email || reg.email || '';

    // Event filter
    if (eventFilter !== 'All Events') {
      const evs = reg.events || [reg.eventName || ''];
      if (!evs.includes(eventFilter)) return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const searchable = `${regId} ${eventsStr} ${teamLeader} ${userName} ${userEmail}`.toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    return true;
  });

  const hasFilters = searchQuery.trim() || eventFilter !== 'All Events';

  return (
    <div style={styles.page}>
      {/* Inject keyframes for spinner */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      {/* Background decorative elements */}
      <div style={styles.bgPattern} />
      <div style={styles.bgGlow} />

      <div style={styles.container}>
        {/* ── Page Header ── */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <FaUserShield style={{ fontSize: '1.8rem', color: gold }} />
          </div>
          <div>
            <h1 style={styles.headerTitle}>Admin Dashboard</h1>
            <p style={styles.headerSubtitle}>
              Command center — manage registrations
            </p>
          </div>
        </div>

        {/* ── Stats Overview ── */}
        <div style={styles.statsGrid}>
          {loading
            ? <SkeletonStatCard />
            : STAT_CARDS.map((stat) => (
                <StatCard key={stat.key} stat={stat} value={stats[stat.key] || stats.total || 0} />
              ))}
        </div>

        {/* ── Filters Section ── */}
        <div style={styles.filtersCard}>
          <div style={styles.filtersHeader}>
            <FaFilter style={{ color: gold, marginRight: 8, fontSize: '0.9rem' }} />
            <span style={styles.filtersTitle}>Filters</span>
          </div>
          <div style={styles.filtersRow}>
            {/* Search Input */}
            <div style={styles.searchWrap}>
              <FaSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name, email, ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* Event Filter */}
            <div style={styles.selectWrap}>
              <FaChessBoard style={styles.selectIcon} />
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                style={styles.selectInput}
              >
                {EVENT_OPTIONS.map((ev) => (
                  <option key={ev} value={ev}>
                    {ev}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Registrations Section ── */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <FaChessBoard style={{ marginRight: 10, fontSize: '1.1rem' }} />
              Registrations
              {!loading && (
                <span style={styles.sectionCount}>
                  ({filteredRegistrations.length}
                  {hasFilters ? ` of ${registrations.length}` : ''})
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div style={styles.regList}>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : error ? (
            <div style={styles.errorBox}>
              <FaTimesCircle style={{ marginRight: 8, color: '#EF4444' }} />
              {error}
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : (
            <div style={styles.regList}>
              {filteredRegistrations.map((reg) => (
                <RegistrationRow
                  key={reg._id || reg.registrationId || reg.id}
                  reg={reg}
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
    maxWidth: 1200,
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

  /* ── Stats Grid ── */
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: 16,
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  statIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  statValue: {
    fontFamily: 'Cinzel, serif',
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.1,
  },

  /* ── Filters ── */
  filtersCard: {
    background: glassBg,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${glassBorder}`,
    borderRadius: 16,
    padding: '20px 24px',
    marginBottom: 28,
  },
  filtersHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '0.9rem',
    fontWeight: 700,
    color: gold,
    letterSpacing: 0.5,
  },
  filtersRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  searchWrap: {
    flex: '1 1 280px',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '0.85rem',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 16px 11px 40px',
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.9)',
    background: glassHighlight,
    border: `1px solid ${glassBorder}`,
    borderRadius: 10,
    outline: 'none',
    transition: 'border-color 0.25s',
  },
  selectWrap: {
    flex: '0 1 220px',
    position: 'relative',
  },
  selectIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '0.8rem',
    pointerEvents: 'none',
  },
  selectInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 16px 11px 38px',
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.9)',
    background: glassHighlight,
    border: `1px solid ${glassBorder}`,
    borderRadius: 10,
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.4)' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    backgroundSize: '12px',
  },

  /* ── Action Error ── */
  actionErrorBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 12,
    padding: '12px 18px',
    marginBottom: 20,
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.85rem',
    color: '#EF4444',
  },
  actionErrorDismiss: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: 'rgba(239,68,68,0.6)',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0 0 0 12px',
    lineHeight: 1,
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
    marginBottom: 20,
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
  sectionCount: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.4)',
    marginLeft: 10,
  },

  /* ── Registration List ── */
  regList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },

  /* ── Registration Row ── */
  regRow: {
    background: glassBg,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${glassBorder}`,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  },
  regRowAccent: {
    width: 3,
    flexShrink: 0,
    background: `linear-gradient(180deg, ${gold}, transparent)`,
  },
  regRowContent: {
    flex: 1,
    padding: '20px 24px',
    minWidth: 0,
  },
  regRowTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  regRowEventSection: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
  },
  regRowEventIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: glassHighlight,
    border: `1px solid ${glassBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  regRowEventsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '6px',
  },
  regRowEventTag: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: darkBg,
    background: gold,
    padding: '3px 8px',
    borderRadius: '4px',
  },
  regRowId: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.68rem',
    color: 'rgba(255,255,255,0.3)',
    marginTop: 3,
    fontFamily: 'monospace',
    letterSpacing: 0.3,
  },

  /* ── Row Details ── */
  regRowDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12,
  },
  regRowDetail: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    background: glassHighlight,
    border: `1px solid ${glassBorder}`,
    borderRadius: 10,
    padding: '10px 14px',
  },
  regRowDetailIcon: {
    color: gold,
    fontSize: '0.8rem',
    flexShrink: 0,
    marginTop: 2,
    opacity: 0.7,
  },
  regRowDetailLabel: {
    display: 'block',
    fontSize: '0.62rem',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 600,
  },
  regRowDetailValue: {
    display: 'block',
    fontSize: '0.82rem',
    color: 'rgba(255,255,255,0.88)',
    fontWeight: 500,
    marginTop: 2,
    wordBreak: 'break-all',
  },

  /* ── Admin Section Labels ── */
  adminSectionLabel: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'Cinzel, serif',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: gold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 4,
  },
  teamMemberCard: {
    background: 'rgba(198, 161, 91, 0.04)',
    border: '1px solid rgba(198, 161, 91, 0.12)',
    borderRadius: 12,
    padding: '14px 16px',
    marginBottom: 10,
  },
  teamMemberIndex: {
    display: 'block',
    fontFamily: 'Cinzel, serif',
    fontSize: '0.68rem',
    fontWeight: 700,
    color: 'rgba(198, 161, 91, 0.6)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* ── Error Box ── */
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: 12,
    padding: '20px 24px',
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.95rem',
    color: '#EF4444',
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

  /* ── Skeleton ── */
  skeletonRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    background: glassBg,
    border: `1px solid ${glassBorder}`,
    borderRadius: 16,
    padding: '24px',
  },
  skeletonStatCard: {
    background: glassBg,
    border: `1px solid ${glassBorder}`,
    borderRadius: 16,
    padding: '24px 20px',
  },
  skeletonLine: {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 6,
  },
};

export default AdminDashboard;
