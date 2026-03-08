const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Helper: build user response object
const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  college: user.college || '',
  department: user.department || '',
  year: user.year || '',
  role: user.role,
  googleId: user.googleId || null,
});

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phone')
      .matches(/^[0-9]{10}$/)
      .withMessage('Please enter a valid 10-digit phone number'),
    body('college').trim().notEmpty().withMessage('College name is required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('year')
      .isIn(['1st', '2nd', '3rd', '4th', '1', '2', '3', '4'])
      .withMessage('Year must be 1st, 2nd, 3rd, or 4th'),
  ],
  async (req, res) => {
    try {
      console.log('[Signup] Request body:', JSON.stringify(req.body, null, 2));

      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const messages = errors.array().map((e) => e.msg);
        console.log('[Signup] Validation errors:', messages);
        return res.status(400).json({ message: messages.join(', '), errors: errors.array() });
      }

      let { name, email, password, phone, college, department, year } = req.body;

      // Normalize year values: '1' -> '1st', '2' -> '2nd', etc.
      const yearMap = { '1': '1st', '2': '2nd', '3': '3rd', '4': '4th' };
      if (yearMap[year]) year = yearMap[year];

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
        phone,
        college,
        department,
        year,
      });

      console.log('[Signup] User created successfully:', user.email);

      // Generate token
      const token = generateToken(user._id);

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: userResponse(user),
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        console.error('[Signup] Mongoose validation error:', messages);
        return res.status(400).json({ message: messages.join(', ') });
      }
      console.error('[Signup] Server error:', error);
      console.error('[Signup] Error name:', error.name);
      console.error('[Signup] Error message:', error.message);
      console.error('[Signup] Error stack:', error.stack);
      const devMsg = process.env.NODE_ENV !== 'production' 
        ? ` Debug: ${error.name}: ${error.message}` 
        : '';
      res.status(500).json({ message: `Server error during registration.${devMsg}` });
    }
  }
);

// @route   POST /api/auth/google
// @desc    Login or register with Google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Link Google ID if user exists by email but not by googleId
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
      });
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Google login successful',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ message: 'Google authentication failed. Please try again.' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user and return token
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const messages = errors.array().map((e) => e.msg);
        return res.status(400).json({ message: messages.join(', '), errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // If user signed up with Google and has no password
      if (!user.password && user.googleId) {
        return res.status(401).json({ message: 'This account uses Google login. Please sign in with Google.' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken(user._id);

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        message: 'Login successful',
        token,
        user: userResponse(user),
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current logged-in user profile
// @access  Protected
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.json({ user: userResponse(req.user) });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
