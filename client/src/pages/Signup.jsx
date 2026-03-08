import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import {
  FaChessKing,
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaUniversity,
  FaBuilding,
  FaGraduationCap,
} from 'react-icons/fa';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    college: '',
    department: '',
    year: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const { name, email, password, confirmPassword, phone, college, department, year } =
      formData;

    if (!name || !email || !password || !confirmPassword || !phone || !college || !department || !year) {
      return 'All fields are required.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    if (!/^\d{10}$/.test(phone)) {
      return 'Phone number must be exactly 10 digits.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      await signup(submitData);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Signup failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Google signup failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (name, label, icon, type = 'text', placeholder = '') => (
    <div style={styles.inputGroup}>
      <label style={styles.label}>{label}</label>
      <div style={styles.inputWrapper}>
        <span style={styles.inputIcon}>{icon}</span>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          style={styles.input}
          required
        />
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Decorative background elements */}
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />
      <div style={styles.bgGlow3} />

      <div style={styles.card}>
        {/* Chess King Icon */}
        <div style={styles.iconWrapper}>
          <FaChessKing style={styles.kingIcon} />
        </div>

        {/* Heading */}
        <h1 style={styles.heading}>Join MITRONCE 2026</h1>
        <p style={styles.subtitle}>Your game begins here</p>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {/* Google Login Button */}
        <div style={styles.googleBtnWrapper}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google signup failed. Please try again.')}
            theme="filled_black"
            shape="rectangular"
            text="signup_with"
            size="large"
            width={isMobile ? "250" : "360"}
          />
        </div>

        {/* Or Divider */}
        <div style={styles.orDivider}>
          <div style={styles.orDividerLine} />
          <span style={styles.orDividerText}>or sign up with email</span>
          <div style={styles.orDividerLine} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Row 1: Full Name & Email */}
          <div style={isMobile ? styles.gridSingle : styles.gridDouble}>
            {renderInput('name', 'Full Name', <FaUser style={styles.iconStyle} />, 'text', 'John Doe')}
            {renderInput('email', 'Email', <FaEnvelope style={styles.iconStyle} />, 'email', 'john@example.com')}
          </div>

          {/* Row 2: Password & Confirm Password */}
          <div style={isMobile ? styles.gridSingle : styles.gridDouble}>
            {renderInput('password', 'Password', <FaLock style={styles.iconStyle} />, 'password', 'Min 6 characters')}
            {renderInput('confirmPassword', 'Confirm Password', <FaLock style={styles.iconStyle} />, 'password', 'Re-enter password')}
          </div>

          {/* Row 3: Phone & College Name */}
          <div style={isMobile ? styles.gridSingle : styles.gridDouble}>
            {renderInput('phone', 'Phone', <FaPhone style={styles.iconStyle} />, 'tel', '10-digit number')}
            {renderInput('college', 'College Name', <FaUniversity style={styles.iconStyle} />, 'text', 'MIT, Anna University...')}
          </div>

          {/* Row 4: Department & Year */}
          <div style={isMobile ? styles.gridSingle : styles.gridDouble}>
            {renderInput('department', 'Department', <FaBuilding style={styles.iconStyle} />, 'text', 'CSE, ECE, EEE...')}

            {/* Year Select */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Year</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  <FaGraduationCap style={styles.iconStyle} />
                </span>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...styles.select,
                    color: formData.year ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                  }}
                  required
                >
                  <option value="" disabled>
                    Select Year
                  </option>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              ...(loading ? styles.submitBtnDisabled : {}),
            }}
          >
            {loading ? (
              <span style={styles.loadingText}>
                <span style={styles.spinner} />
                Creating Account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>♟</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Login Link */}
        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.switchLink}>
            Login
          </Link>
        </p>
      </div>

      {/* Inline keyframes & overrides */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500;600&display=swap');

        input::placeholder, select option[value=""] {
          color: rgba(255, 255, 255, 0.3) !important;
        }

        input:focus, select:focus {
          outline: none;
          border-color: #C6A15B !important;
          box-shadow: 0 0 0 2px rgba(198, 161, 91, 0.25) !important;
        }

        select option {
          background: #1a1a1a;
          color: #ffffff;
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(198, 161, 91, 0.4) !important;
        }

        a:hover {
          color: #d4b36a !important;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0B0B',
    fontFamily: 'Raleway, sans-serif',
    padding: '100px 20px 40px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow1: {
    position: 'absolute',
    top: '-15%',
    right: '-8%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(198,161,91,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-10%',
    left: '-8%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(198,161,91,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGlow3: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(198,161,91,0.03) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '680px',
    padding: '40px 38px',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(198, 161, 91, 0.15)',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(198, 161, 91, 0.1)',
    position: 'relative',
    zIndex: 1,
  },
  iconWrapper: {
    textAlign: 'center',
    marginBottom: '16px',
    animation: 'float 3s ease-in-out infinite',
  },
  kingIcon: {
    fontSize: '48px',
    color: '#C6A15B',
    filter: 'drop-shadow(0 4px 12px rgba(198, 161, 91, 0.4))',
  },
  heading: {
    fontFamily: 'Cinzel, serif',
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#C6A15B',
    textAlign: 'center',
    margin: '0 0 6px 0',
    letterSpacing: '1px',
  },
  subtitle: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '0.85rem',
    margin: '0 0 24px 0',
    fontStyle: 'italic',
  },
  errorBox: {
    background: 'rgba(220, 53, 69, 0.12)',
    border: '1px solid rgba(220, 53, 69, 0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '18px',
  },
  errorText: {
    color: '#ff6b7a',
    fontSize: '0.85rem',
  },
  googleBtnWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '0',
  },
  orDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    margin: '20px 0',
  },
  orDividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(198, 161, 91, 0.15)',
  },
  orDividerText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: 'Raleway, sans-serif',
    whiteSpace: 'nowrap',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  gridDouble: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  gridSingle: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'rgba(198, 161, 91, 0.5)',
    fontSize: '14px',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  iconStyle: {
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 40px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.04)',
    color: '#FFFFFF',
    fontSize: '0.9rem',
    fontFamily: 'Raleway, sans-serif',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  },
  select: {
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    cursor: 'pointer',
    backgroundImage:
      "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(198,161,91,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: '36px',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #C6A15B 0%, #9A7B3E 100%)',
    color: '#0B0B0B',
    fontSize: '1rem',
    fontWeight: 700,
    fontFamily: 'Cinzel, serif',
    letterSpacing: '1.5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '6px',
    textTransform: 'uppercase',
  },
  submitBtnDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    display: 'inline-block',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(11, 11, 11, 0.3)',
    borderTopColor: '#0B0B0B',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    margin: '24px 0 18px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(198, 161, 91, 0.15)',
  },
  dividerText: {
    color: 'rgba(198, 161, 91, 0.4)',
    fontSize: '1rem',
  },
  switchText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.9rem',
    margin: 0,
  },
  switchLink: {
    color: '#C6A15B',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'color 0.3s ease',
  },
};

export default Signup;
