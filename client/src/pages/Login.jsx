import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { FaChessKing, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const googleWrapperRef = useRef(null);
  const [googleBtnWidth, setGoogleBtnWidth] = useState(360);

  useEffect(() => {
    const measure = () => {
      if (googleWrapperRef.current) {
        setGoogleBtnWidth(googleWrapperRef.current.offsetWidth);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please try again.'
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
        'Google login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Decorative background elements */}
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.card}>
        {/* Chess King Icon */}
        <div style={styles.iconWrapper}>
          <FaChessKing style={styles.kingIcon} />
        </div>

        {/* Heading */}
        <h1 style={styles.heading}>Login to MITRONCE 2026</h1>
        <p style={styles.subtitle}>Make your opening move</p>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {/* Google Login Button */}
        <div ref={googleWrapperRef} style={styles.googleBtnWrapper}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed. Please try again.')}
            theme="filled_black"
            shape="rectangular"
            text="signin_with"
            size="large"
            width={String(googleBtnWidth)}
          />
        </div>

        {/* Divider */}
        <div style={styles.orDivider}>
          <div style={styles.orDividerLine} />
          <span style={styles.orDividerText}>or</span>
          <div style={styles.orDividerLine} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <FaEnvelope style={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={styles.input}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <FaLock style={styles.inputIcon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={styles.input}
                required
              />
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
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>♟</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Signup Link */}
        <p style={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.switchLink}>
            Sign Up
          </Link>
        </p>
      </div>

      {/* Inline keyframes via style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500;600&display=swap');

        input::placeholder {
          color: rgba(255, 255, 255, 0.3) !important;
        }

        input:focus {
          outline: none;
          border-color: #C6A15B !important;
          box-shadow: 0 0 0 2px rgba(198, 161, 91, 0.25) !important;
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
    top: '-20%',
    right: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(198,161,91,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-15%',
    left: '-10%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(198,161,91,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    padding: '45px 40px',
    paddingLeft: 'clamp(18px, 5vw, 40px)',
    paddingRight: 'clamp(18px, 5vw, 40px)',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(198, 161, 91, 0.15)',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(198, 161, 91, 0.1)',
    position: 'relative',
    zIndex: 1,
    boxSizing: 'border-box',
  },
  iconWrapper: {
    textAlign: 'center',
    marginBottom: '20px',
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
    margin: '0 0 28px 0',
    fontStyle: 'italic',
  },
  errorBox: {
    background: 'rgba(220, 53, 69, 0.12)',
    border: '1px solid rgba(220, 53, 69, 0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '20px',
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
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: 'Raleway, sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.8rem',
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
  },
  input: {
    width: '100%',
    padding: '13px 16px 13px 42px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.04)',
    color: '#FFFFFF',
    fontSize: '0.95rem',
    fontFamily: 'Raleway, sans-serif',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
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
    marginTop: '8px',
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
    margin: '28px 0 20px',
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

export default Login;
