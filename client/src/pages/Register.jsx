import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createRegistration, getRegistration, updateRegistration } from '../services/api';
import {
  FaChessPawn,
  FaChessQueen,
  FaChessKnight,
  FaUserPlus,
  FaTrashAlt,
  FaPaperPlane,
  FaSpinner,
  FaExclamationTriangle,
  FaUsers,
  FaInfoCircle,
  FaUserTie,
  FaUniversity,
  FaPhone,
  FaCheckCircle,
  FaBuilding,
  FaGraduationCap,
  FaEnvelope,
} from 'react-icons/fa';

// ═══════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════
const gold = '#C6A15B';
const darkBg = '#0B0B0B';
const glassBg = 'rgba(20, 20, 20, 0.6)';
const glassBorder = 'rgba(198, 161, 91, 0.15)';
const glassHighlight = 'rgba(198, 161, 91, 0.08)';
const inputBg = 'rgba(255, 255, 255, 0.04)';
const inputBorder = 'rgba(255, 255, 255, 0.1)';

const EVENTS = [
  { name: 'Paper Presentation', icon: '📄', teamSize: 'Max 2', category: 'Technical' },
  { name: 'Connectify', icon: '🔗', teamSize: 'Max 2', category: 'Technical' },
  { name: 'Bot Marathon', icon: '🤖', teamSize: 'Max 3', category: 'Signature' },
  { name: 'Sustainable Concept Pitch', icon: '🌱', teamSize: 'Max 2', category: 'Non-Technical' },
  { name: 'Mindbender', icon: '🧠', teamSize: 'Individual', category: 'Non-Technical' },
  { name: 'Bug Busters', icon: '🐛', teamSize: 'Max 2', category: 'Technical' },
  { name: 'Code Clash in Embedded C', icon: '⚡', teamSize: 'Max 2', category: 'Technical' },
  { name: 'Fun Zone', icon: '🎮', teamSize: 'Individual', category: 'Non-Technical' },
];

const EMPTY_MEMBER = { name: '', college: '', degree: '', department: '', year: '', email: '', phone: '' };
const EMPTY_LEADER = { name: '', college: '', degree: '', department: '', year: '', email: '', phone: '' };

// ═══════════════════════════════════════════
// Register Page
// ═══════════════════════════════════════════
const Register = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { user, loading: authLoading } = useAuth();

  // ── Form State ──
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [teamLeader, setTeamLeader] = useState({ ...EMPTY_LEADER });
  const [teamMembers, setTeamMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [loadingData, setLoadingData] = useState(isEditMode);

  // Pre-fill team leader name from user data if new registration
  useEffect(() => {
    if (user && !isEditMode && !teamLeader.name) {
      setTeamLeader((prev) => ({ ...prev, name: user.name || user.fullName || '' }));
    }
  }, [user, isEditMode, teamLeader.name]);

  // Fetch registration data if in edit mode
  useEffect(() => {
    const fetchRegistration = async () => {
      if (!isEditMode) return;
      try {
        setLoadingData(true);
        const data = await getRegistration(id);
        const reg = data.registration;
        setSelectedEvents(reg.events || []);

        // Backward-compat: teamLeader may be a plain string in old records
        // Explicitly extract fields to avoid Mongoose subdocument issues
        const sanitize = (val) => {
          const s = String(val || '');
          return s === '[object Object]' ? '' : s;
        };

        if (typeof reg.teamLeader === 'string') {
          const raw = reg.teamLeader;
          setTeamLeader({
            ...EMPTY_LEADER,
            name: raw === '[object Object]' ? '' : raw,
          });
        } else if (reg.teamLeader && typeof reg.teamLeader === 'object') {
          setTeamLeader({
            name:       sanitize(reg.teamLeader.name),
            college:    sanitize(reg.teamLeader.college),
            degree:     sanitize(reg.teamLeader.degree),
            department: sanitize(reg.teamLeader.department),
            year:       sanitize(reg.teamLeader.year),
            email:      sanitize(reg.teamLeader.email),
            phone:      sanitize(reg.teamLeader.phone),
          });
        } else {
          setTeamLeader({ ...EMPTY_LEADER });
        }

        // Backward-compat: team members may not have degree field
        setTeamMembers(
          (reg.teamMembers || []).map((m) => ({ ...EMPTY_MEMBER, ...m }))
        );
      } catch (err) {
        console.error('Failed to fetch registration:', err);
        setError('Failed to load registration details for editing.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchRegistration();
  }, [id, isEditMode]);

  // ── Event Selection Handlers ──
  const toggleEvent = (eventName) => {
    setSelectedEvents((prev) =>
      prev.includes(eventName)
        ? prev.filter((e) => e !== eventName)
        : [...prev, eventName]
    );
  };

  const selectAll = () => {
    setSelectedEvents(EVENTS.map((e) => e.name));
  };

  const clearAll = () => {
    setSelectedEvents([]);
  };

  // ── Team Member Limit (based on selected events) ──
  // Parse team size from event config: 'Max 3' → 3, 'Individual' → 1
  const maxAllowedMembers = (() => {
    if (selectedEvents.length === 0) return 2; // default when nothing selected
    const maxTotal = selectedEvents.reduce((best, evName) => {
      const ev = EVENTS.find((e) => e.name === evName);
      if (!ev) return best;
      if (ev.teamSize === 'Individual') return Math.max(best, 1);
      const match = ev.teamSize.match(/\d+/);
      return match ? Math.max(best, parseInt(match[0], 10)) : best;
    }, 1);
    return maxTotal - 1; // subtract 1 for the team leader
  })();

  // ── Team Members Handlers ──
  const addMember = () => {
    if (teamMembers.length >= maxAllowedMembers) return; // enforce cap
    setTeamMembers((prev) => [...prev, { ...EMPTY_MEMBER }]);
  };

  const removeMember = (index) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMember = (index, field, value) => {
    setTeamMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const validMembersCount = teamMembers.filter((m) => m.name.trim()).length;
  const totalFee = 200 * (1 + validMembersCount);

  // ── Submit Handler ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (selectedEvents.length === 0) {
      setError('Please select at least one event.');
      return;
    }
    if (!teamLeader.name.trim()) {
      setError('Team leader name is required.');
      return;
    }
    if (!teamLeader.college.trim() || !teamLeader.degree.trim() || !teamLeader.department.trim() || !teamLeader.year.trim() || !teamLeader.email.trim() || !teamLeader.phone.trim()) {
      setError('Please fill out all Team Leader fields (Name, College, Degree, Department, Year, Email, Phone).');
      return;
    }

    const validMembers = teamMembers.filter((m) => m.name.trim() || m.college.trim() || m.degree.trim() || m.department.trim() || m.year.trim() || m.email.trim() || m.phone.trim());
    
    // If any member is partially or fully filled, ensure ALL 7 fields are filled
    const invalidMembers = validMembers.some(
      (m) => !m.name.trim() || !m.college.trim() || !m.degree.trim() || !m.department.trim() || !m.year.trim() || !m.email.trim() || !m.phone.trim()
    );
    if (invalidMembers) {
      setError('All team members must fill out all 7 fields (Name, College, Degree, Department, Year, Email, Phone).');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        events: selectedEvents,
        teamLeader: {
          name: teamLeader.name.trim(),
          college: teamLeader.college.trim(),
          degree: teamLeader.degree.trim(),
          department: teamLeader.department.trim(),
          year: teamLeader.year.trim(),
          email: teamLeader.email.trim(),
          phone: teamLeader.phone.trim(),
        },
        teamMembers: validMembers.map((m) => ({
          name: m.name.trim(),
          college: m.college.trim(),
          degree: m.degree.trim(),
          department: m.department.trim(),
          year: m.year.trim(),
          email: m.email.trim(),
          phone: m.phone.trim(),
        })),
      };

      let data;
      if (isEditMode) {
        data = await updateRegistration(id, payload);
      } else {
        data = await createRegistration(payload);
      }
      const newId = data._id || data.registration?._id || data.registrationId || data.id;

      setSuccess(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      console.error('Registration failed:', err);
      setError(
        err.response?.data?.message ||
          (isEditMode ? 'Update failed. Please try again.' : 'Registration failed. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div style={styles.page}>
        <div style={styles.bgPattern} />
        <div style={styles.loaderWrap}>
          <style>{`
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `}</style>
          <FaSpinner style={{ ...styles.spinner, fontSize: '3rem', animation: 'spin 1s linear infinite' }} />
          <p style={styles.loaderText}>{isEditMode ? 'Loading your moves...' : 'Setting up the board...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Background decorative elements */}
      <div style={styles.bgPattern} />
      <div style={styles.bgGlow} />

      <div style={styles.container}>
        {/* ── Page Header ── */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <FaChessKnight style={{ fontSize: '1.8rem', color: gold }} />
          </div>
          <div>
            <h1 style={styles.headerTitle}>
              {isEditMode ? 'Update Registration' : 'Register for MITRONCE 2026'}
            </h1>
            <p style={styles.headerSubtitle}>
              {isEditMode ? 'Adjust your team and strategy' : 'Select your events and make your move'}
            </p>
          </div>
        </div>

        {/* ── Fee Banner ── */}
        <div style={styles.feeBanner}>
          <div style={styles.feeBannerIcon}>♛</div>
          <div>
            <div style={styles.feeBannerTitle}>Total Registration Fee</div>
            <div style={styles.feeBannerAmount}>₹{totalFee}</div>
            <div style={styles.feeBannerNote}>
              ₹200 per person ({validMembersCount + 1} participant{validMembersCount > 0 ? 's' : ''})
            </div>
          </div>
        </div>

        {/* ── Main Form Card ── */}
        <div style={styles.formCard}>
          <div style={styles.formCardAccent} />

          {/* Success Overlay */}
          {success && (
            <div style={styles.successOverlay}>
              <div style={styles.successIcon}>♛</div>
              <h3 style={styles.successTitle}>
                {isEditMode ? 'Update Successful!' : 'Registration Successful!'}
              </h3>
              <p style={styles.successText}>Redirecting to dashboard...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Event Selection */}
            <div style={styles.fieldGroup}>
              <div style={styles.eventsHeader}>
                <label style={styles.label}>
                  <FaCheckCircle style={styles.labelIcon} />
                  Select Events
                </label>
                <div style={styles.eventsActions}>
                  <button type="button" onClick={selectAll} style={styles.selectAllBtn}>
                    Select All
                  </button>
                  <button type="button" onClick={clearAll} style={styles.clearAllBtn}>
                    Clear
                  </button>
                </div>
              </div>
              <div style={styles.eventsGrid}>
                {EVENTS.map((event) => {
                  const isSelected = selectedEvents.includes(event.name);
                  return (
                    <div
                      key={event.name}
                      style={{
                        ...styles.eventCheckbox,
                        ...(isSelected ? styles.eventCheckboxSelected : {}),
                      }}
                      onClick={() => toggleEvent(event.name)}
                    >
                      <div style={styles.eventCheckboxTop}>
                        <span style={styles.eventEmoji}>{event.icon}</span>
                        <div
                          style={{
                            ...styles.checkIndicator,
                            ...(isSelected ? styles.checkIndicatorActive : {}),
                          }}
                        >
                          {isSelected && <FaCheckCircle style={{ fontSize: '0.9rem' }} />}
                        </div>
                      </div>
                      <div style={styles.eventCheckboxName}>{event.name}</div>
                      <div style={styles.eventCheckboxMeta}>
                        <span style={styles.eventCategoryBadge}>{event.category}</span>
                        <span style={styles.eventTeamSize}>
                          <FaUsers style={{ fontSize: '0.6rem', marginRight: 3 }} />
                          {event.teamSize}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={styles.selectedCount}>
                {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} selected
              </p>
            </div>

            {/* Team Leader */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <FaUserTie style={styles.labelIcon} />
                Team Leader Details
              </label>
              <div style={styles.memberFields}>
                <div style={styles.memberField}>
                  <FaUserTie style={styles.memberFieldIcon} />
                  <input
                    type="text"
                    value={teamLeader.name}
                    onChange={(e) => setTeamLeader((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Full Name *"
                    style={styles.memberInput}
                    required
                  />
                </div>
                <div style={styles.memberField}>
                  <FaUniversity style={styles.memberFieldIcon} />
                  <input
                    type="text"
                    value={teamLeader.college}
                    onChange={(e) => setTeamLeader((prev) => ({ ...prev, college: e.target.value }))}
                    placeholder="College Name *"
                    style={styles.memberInput}
                    required
                  />
                </div>
                <div style={styles.memberField}>
                  <FaGraduationCap style={styles.memberFieldIcon} />
                  <input
                    type="text"
                    value={teamLeader.degree}
                    onChange={(e) => setTeamLeader((prev) => ({ ...prev, degree: e.target.value }))}
                    placeholder="Degree (e.g., B.Tech, M.E.) *"
                    style={styles.memberInput}
                    required
                  />
                </div>
                <div style={styles.memberField}>
                  <FaBuilding style={styles.memberFieldIcon} />
                  <input
                    type="text"
                    value={teamLeader.department}
                    onChange={(e) => setTeamLeader((prev) => ({ ...prev, department: e.target.value }))}
                    placeholder="Department (e.g., CSE, IT) *"
                    style={styles.memberInput}
                    required
                  />
                </div>
                <div style={styles.memberField}>
                   <span style={{...styles.memberFieldIcon, display: 'inline-flex'}}>
                     <FaGraduationCap />
                   </span>
                   <select
                      value={teamLeader.year}
                      onChange={(e) => setTeamLeader((prev) => ({ ...prev, year: e.target.value }))}
                      style={{
                        ...styles.memberInput,
                        ...styles.select,
                        color: teamLeader.year ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                        background: '#1a1a1a',
                      }}
                      required
                   >
                      <option value="" disabled style={{ background: '#1a1a1a', color: '#888' }}>Select Year *</option>
                      <option value="1st" style={{ background: '#1a1a1a', color: '#fff' }}>1st Year</option>
                      <option value="2nd" style={{ background: '#1a1a1a', color: '#fff' }}>2nd Year</option>
                      <option value="3rd" style={{ background: '#1a1a1a', color: '#fff' }}>3rd Year</option>
                      <option value="4th" style={{ background: '#1a1a1a', color: '#fff' }}>4th Year</option>
                   </select>
                </div>
                <div style={styles.memberField}>
                  <FaEnvelope style={styles.memberFieldIcon} />
                  <input
                    type="email"
                    value={teamLeader.email}
                    onChange={(e) => setTeamLeader((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Email ID *"
                    style={styles.memberInput}
                    required
                  />
                </div>
                <div style={styles.memberField}>
                  <FaPhone style={styles.memberFieldIcon} />
                  <input
                    type="tel"
                    value={teamLeader.phone}
                    onChange={(e) => setTeamLeader((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Mobile Number *"
                    style={styles.memberInput}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Team Members Section */}
            <div style={styles.teamSection}>
              <div style={styles.teamHeader}>
                <span style={styles.teamLabel}>
                  <FaUsers style={styles.labelIcon} />
                  Team Members
                  {maxAllowedMembers > 0 && (
                    <span style={{
                      marginLeft: 8,
                      fontSize: '0.72rem',
                      fontFamily: 'Raleway, sans-serif',
                      color: teamMembers.length >= maxAllowedMembers ? '#EF4444' : 'rgba(198,161,91,0.6)',
                      fontWeight: 500,
                    }}>
                      ({teamMembers.length}/{maxAllowedMembers})
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={addMember}
                  disabled={teamMembers.length >= maxAllowedMembers}
                  title={teamMembers.length >= maxAllowedMembers
                    ? `Max ${maxAllowedMembers} member${maxAllowedMembers === 1 ? '' : 's'} allowed for selected events`
                    : 'Add a team member'}
                  style={{
                    ...styles.addMemberBtn,
                    ...(teamMembers.length >= maxAllowedMembers
                      ? { opacity: 0.4, cursor: 'not-allowed', filter: 'grayscale(0.5)' }
                      : {}),
                  }}
                >
                  <FaUserPlus style={{ marginRight: 6 }} />
                  {teamMembers.length >= maxAllowedMembers ? 'Limit Reached' : 'Add Member'}
                </button>
              </div>

              {teamMembers.length === 0 ? (
                <div style={styles.noMembers}>
                  <FaChessPawn
                    style={{ fontSize: '1.4rem', marginBottom: 8, opacity: 0.3 }}
                  />
                  <p style={styles.noMembersText}>
                    No team members added yet. Click "Add Member" to build your team.
                  </p>
                </div>
              ) : (
                <div style={styles.membersList}>
                  {teamMembers.map((member, index) => (
                    <div key={index} style={styles.memberCard}>
                      <div style={styles.memberCardHeader}>
                        <span style={styles.memberNumber}>
                          <FaChessPawn style={{ marginRight: 6 }} />
                          Member {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMember(index)}
                          style={styles.removeMemberBtn}
                          title="Remove member"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                      <div style={styles.memberFields}>
                        <div style={styles.memberField}>
                          <FaUserTie style={styles.memberFieldIcon} />
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) =>
                              updateMember(index, 'name', e.target.value)
                            }
                            placeholder="Full name *"
                            style={styles.memberInput}
                            required
                          />
                        </div>
                        <div style={styles.memberField}>
                          <FaUniversity style={styles.memberFieldIcon} />
                          <input
                            type="text"
                            value={member.college}
                            onChange={(e) =>
                              updateMember(index, 'college', e.target.value)
                            }
                            placeholder="College Name *"
                            style={styles.memberInput}
                            required
                          />
                        </div>
                        <div style={styles.memberField}>
                          <FaGraduationCap style={styles.memberFieldIcon} />
                          <input
                            type="text"
                            value={member.degree}
                            onChange={(e) =>
                              updateMember(index, 'degree', e.target.value)
                            }
                            placeholder="Degree (e.g., B.Tech, M.E.) *"
                            style={styles.memberInput}
                            required
                          />
                        </div>
                        <div style={styles.memberField}>
                          <FaBuilding style={styles.memberFieldIcon} />
                          <input
                            type="text"
                            value={member.department}
                            onChange={(e) =>
                              updateMember(index, 'department', e.target.value)
                            }
                            placeholder="Department (e.g., CSE, IT) *"
                            style={styles.memberInput}
                            required
                          />
                        </div>
                        <div style={styles.memberField}>
                           <span style={{...styles.memberFieldIcon, display: 'inline-flex'}}>
                             <FaGraduationCap />
                           </span>
                           <select
                              value={member.year}
                              onChange={(e) =>
                                updateMember(index, 'year', e.target.value)
                              }
                              style={{
                                ...styles.memberInput,
                                ...styles.select,
                                color: member.year ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                                background: '#1a1a1a',
                               }}
                              required
                           >
                              <option value="" disabled style={{background:"#1a1a1a",color:"#888"}}>Select Year *</option>
                              <option value="1st" style={{background:"#1a1a1a",color:"#fff"}}>1st Year</option>
                              <option value="2nd" style={{background:"#1a1a1a",color:"#fff"}}>2nd Year</option>
                              <option value="3rd" style={{background:"#1a1a1a",color:"#fff"}}>3rd Year</option>
                              <option value="4th" style={{background:"#1a1a1a",color:"#fff"}}>4th Year</option>
                           </select>
                        </div>
                        <div style={styles.memberField}>
                          <FaEnvelope style={styles.memberFieldIcon} />
                          <input
                            type="email"
                            value={member.email}
                            onChange={(e) => updateMember(index, 'email', e.target.value)}
                            placeholder="Email ID *"
                            style={styles.memberInput}
                            required
                          />
                        </div>
                        <div style={styles.memberField}>
                          <FaPhone style={styles.memberFieldIcon} />
                          <input
                            type="tel"
                            value={member.phone}
                            onChange={(e) =>
                              updateMember(index, 'phone', e.target.value)
                            }
                            placeholder="Mobile Number *"
                            style={styles.memberInput}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div style={styles.errorBox}>
                <FaExclamationTriangle style={{ marginRight: 8, flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || success}
              style={{
                ...styles.submitBtn,
                ...(submitting || success ? styles.submitBtnDisabled : {}),
              }}
            >
              {submitting ? (
                <>
                  <FaSpinner style={styles.spinner} />
                  {isEditMode ? 'Updating...' : 'Registering...'}
                </>
              ) : success ? (
                <>
                  <FaChessQueen style={{ marginRight: 8 }} />
                  {isEditMode ? 'Updated!' : 'Registered!'}
                </>
              ) : (
                <>
                  <FaPaperPlane style={{ marginRight: 8 }} />
                  {isEditMode ? 'Save Changes' : 'Pre-book Now'}
                </>
              )}
            </button>

            {/* Cancel Button — only in edit mode */}
            {isEditMode && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            )}

            {/* Info note */}
            <p style={styles.infoNote}>
              <FaInfoCircle style={{ marginRight: 6, flexShrink: 0 }} />
              On-spot registration and payment are also available at the venue.
            </p>
          </form>
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
    top: '-15%',
    left: '-10%',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(198,161,91,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    maxWidth: 800,
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
    marginBottom: 28,
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
    fontSize: '1.8rem',
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

  /* ── Fee Banner ── */
  feeBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    background: 'linear-gradient(135deg, rgba(198,161,91,0.12), rgba(198,161,91,0.04))',
    border: `1px solid rgba(198,161,91,0.25)`,
    borderRadius: 16,
    padding: '20px 28px',
    marginBottom: 28,
  },
  feeBannerIcon: {
    fontSize: '2.5rem',
    color: gold,
    flexShrink: 0,
  },
  feeBannerTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  feeBannerAmount: {
    fontFamily: 'Cinzel, serif',
    fontSize: '2rem',
    fontWeight: 700,
    color: gold,
    lineHeight: 1.2,
  },
  feeBannerNote: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.82rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },

  /* ── Form Card ── */
  formCard: {
    background: glassBg,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${glassBorder}`,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  formCardAccent: {
    height: 3,
    background: `linear-gradient(90deg, ${gold}, transparent)`,
  },
  form: {
    padding: '32px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },

  /* ── Fields ── */
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  label: {
    fontFamily: 'Cinzel, serif',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: gold,
    display: 'flex',
    alignItems: 'center',
    letterSpacing: 0.5,
  },
  labelIcon: {
    marginRight: 8,
    fontSize: '0.8rem',
    opacity: 0.8,
  },
  input: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.9rem',
    color: '#FFFFFF',
    background: inputBg,
    border: `1px solid ${inputBorder}`,
    borderRadius: 10,
    padding: '12px 16px',
    outline: 'none',
    transition: 'border-color 0.25s',
    width: '100%',
    boxSizing: 'border-box',
  },

  /* ── Events Selection ── */
  eventsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  eventsActions: {
    display: 'flex',
    gap: 8,
  },
  selectAllBtn: {
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    fontSize: '0.72rem',
    color: gold,
    background: glassHighlight,
    border: `1px solid ${glassBorder}`,
    borderRadius: 6,
    padding: '5px 12px',
    cursor: 'pointer',
    transition: 'background 0.25s',
  },
  clearAllBtn: {
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    fontSize: '0.72rem',
    color: 'rgba(255,255,255,0.4)',
    background: 'transparent',
    border: `1px solid rgba(255,255,255,0.1)`,
    borderRadius: 6,
    padding: '5px 12px',
    cursor: 'pointer',
    transition: 'background 0.25s',
  },
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 12,
  },
  eventCheckbox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '14px 14px 12px',
    background: glassHighlight,
    border: `1.5px solid ${glassBorder}`,
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    position: 'relative',
  },
  eventCheckboxSelected: {
    borderColor: gold,
    background: 'rgba(198,161,91,0.1)',
    boxShadow: '0 0 16px rgba(198,161,91,0.12)',
  },
  eventCheckboxTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventEmoji: {
    fontSize: '1.4rem',
  },
  checkIndicator: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    border: `2px solid rgba(255,255,255,0.15)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'transparent',
    transition: 'all 0.25s ease',
  },
  checkIndicatorActive: {
    borderColor: gold,
    color: gold,
    background: 'rgba(198,161,91,0.15)',
  },
  eventCheckboxName: {
    fontFamily: 'Cinzel, serif',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#FFFFFF',
    lineHeight: 1.3,
  },
  eventCheckboxMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  eventCategoryBadge: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.62rem',
    fontWeight: 600,
    color: gold,
    background: 'rgba(198,161,91,0.12)',
    border: `1px solid rgba(198,161,91,0.2)`,
    borderRadius: 4,
    padding: '2px 7px',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  eventTeamSize: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.68rem',
    color: 'rgba(255,255,255,0.4)',
    display: 'flex',
    alignItems: 'center',
  },
  selectedCount: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.8rem',
    color: gold,
    fontWeight: 600,
    marginTop: 4,
    textAlign: 'center',
  },

  /* ── Team Section ── */
  teamSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  teamHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  teamLabel: {
    fontFamily: 'Cinzel, serif',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: gold,
    display: 'flex',
    alignItems: 'center',
    letterSpacing: 0.5,
  },
  addMemberBtn: {
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    fontSize: '0.78rem',
    color: gold,
    background: glassHighlight,
    border: `1px solid ${glassBorder}`,
    borderRadius: 8,
    padding: '8px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.25s, border-color 0.25s',
  },

  /* ── No Members ── */
  noMembers: {
    textAlign: 'center',
    padding: '28px 16px',
    color: 'rgba(255,255,255,0.3)',
  },
  noMembersText: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.82rem',
    color: 'rgba(255,255,255,0.35)',
    margin: 0,
    lineHeight: 1.5,
  },

  /* ── Members List ── */
  membersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  memberCard: {
    background: glassHighlight,
    border: `1px solid ${glassBorder}`,
    borderRadius: 12,
    padding: '14px 16px',
  },
  memberCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  memberNumber: {
    fontFamily: 'Cinzel, serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: gold,
    display: 'flex',
    alignItems: 'center',
    letterSpacing: 0.5,
  },
  removeMemberBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(239, 68, 68, 0.7)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
    transition: 'color 0.25s',
  },
  memberFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  memberField: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  memberFieldIcon: {
    color: gold,
    fontSize: '0.75rem',
    opacity: 0.6,
    flexShrink: 0,
    width: 16,
  },
  memberInput: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.85rem',
    color: '#FFFFFF',
    background: inputBg,
    border: `1px solid ${inputBorder}`,
    borderRadius: 8,
    padding: '10px 14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.25s',
  },

  /* ── Error ── */
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 10,
    padding: '12px 16px',
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.85rem',
    color: '#EF4444',
  },

  /* ── Submit Button ── */
  submitBtn: {
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 700,
    fontSize: '1rem',
    color: darkBg,
    background: `linear-gradient(135deg, ${gold}, #A8893A)`,
    border: 'none',
    borderRadius: 10,
    padding: '15px 24px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    letterSpacing: 0.5,
    transition: 'box-shadow 0.3s, transform 0.2s',
    boxShadow: '0 4px 24px rgba(198,161,91,0.25)',
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  cancelBtn: {
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.55)',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: '13px 24px',
    cursor: 'pointer',
    textAlign: 'center',
    letterSpacing: 0.5,
    transition: 'border-color 0.25s, color 0.25s',
    marginTop: 4,
  },
  spinner: {
    marginRight: 8,
    animation: 'spin 1s linear infinite',
  },

  /* ── Info Note ── */
  infoNote: {
    display: 'flex',
    alignItems: 'flex-start',
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.35)',
    margin: 0,
    lineHeight: 1.5,
  },

  /* ── Success Overlay ── */
  successOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(11, 11, 11, 0.95)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderRadius: 20,
  },
  successIcon: {
    fontSize: '3.5rem',
    color: gold,
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: 0,
  },
  successText: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },

  /* ── Loader ── */
  loaderWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    position: 'relative',
    zIndex: 2,
  },
  loaderText: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
    letterSpacing: 1,
  },
};

export default Register;
