const express = require('express');
const { body, validationResult } = require('express-validator');
const Registration = require('../models/Registration');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/registrations
// @desc    Create a new registration (one-time, multi-event)
// @access  Protected
router.post(
  '/',
  verifyToken,
  [
    body('events')
      .isArray({ min: 1 })
      .withMessage('Please select at least one event'),
    body('events.*')
      .isIn(Registration.VALID_EVENTS)
      .withMessage(
        'Invalid event. Choose from: ' + Registration.VALID_EVENTS.join(', ')
      ),
    body('teamLeader.name').trim().notEmpty().withMessage('Team leader name is required'),
    body('teamLeader.college').trim().notEmpty().withMessage('Team leader college is required'),
    body('teamLeader.degree').trim().notEmpty().withMessage('Team leader degree is required'),
    body('teamLeader.department').trim().notEmpty().withMessage('Team leader department is required'),
    body('teamLeader.year').trim().notEmpty().withMessage('Team leader year is required'),
    body('teamLeader.email').trim().isEmail().withMessage('Team leader email is required'),
    body('teamLeader.phone').trim().matches(/^[0-9]{10}$/).withMessage('Team leader phone must be 10 digits'),
    body('teamMembers')
      .optional()
      .isArray()
      .withMessage('Team members must be an array'),
    body('teamMembers.*.name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Team member name is required'),
    body('teamMembers.*.college')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Team member college is required'),
    body('teamMembers.*.degree')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Team member degree is required'),
    body('teamMembers.*.department')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Team member department is required'),
    body('teamMembers.*.year')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Team member year of study is required'),
    body('teamMembers.*.email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('A valid email address is required for team members'),
    body('teamMembers.*.phone')
      .optional()
      .trim()
      .matches(/^[0-9]{10}$/)
      .withMessage('A valid 10-digit phone number is required for team members'),
  ],
  async (req, res) => {
    try {
      console.log('[Registration] Request body:', JSON.stringify(req.body, null, 2));
      console.log('[Registration] User:', req.user?._id, req.user?.email);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('[Registration] Validation errors:', errors.array());
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { events, teamLeader, teamMembers } = req.body;

      // Calculate total amount: ₹200 for leader + ₹200 for each member
      const memberCount = teamMembers ? teamMembers.length : 0;
      const totalAmount = 200 * (1 + memberCount);

      // Check if user already has a registration (one per user)
      const existingRegistration = await Registration.findOne({
        userId: req.user._id,
      });

      if (existingRegistration) {
        return res.status(400).json({
          message: 'You have already registered for MITRONCE 2026. Check your dashboard for details.',
        });
      }

      const registration = await Registration.create({
        userId: req.user._id,
        events,
        amount: totalAmount,
        teamLeader,
        teamMembers: teamMembers || [],
      });

      console.log('[Registration] Success:', registration.registrationId);

      res.status(201).json({
        message: 'Registration successful',
        registration,
      });
    } catch (error) {
      console.error('[Registration] Error:', error.name, error.message);
      console.error('[Registration] Stack:', error.stack);
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return res.status(400).json({ message: messages.join(', '), errors: messages });
      }
      res.status(500).json({ 
        message: 'Server error during registration',
        ...(process.env.NODE_ENV !== 'production' && { debug: `${error.name}: ${error.message}` })
      });
    }
  }
);

// @route   GET /api/registrations/my
// @desc    Get all registrations for the logged-in user
// @access  Protected
router.get('/my', verifyToken, async (req, res) => {
  try {
    const registrations = await Registration.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ registrations });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/registrations/:id
// @desc    Get a single registration by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate(
      'userId',
      'name email phone college department year'
    );

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.json({ registration });
  } catch (error) {
    console.error('Get registration error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/registrations/:id
// @desc    Update an existing registration
// @access  Protected
router.put(
  '/:id',
  verifyToken,
  [
    body('events')
      .isArray({ min: 1 })
      .withMessage('Please select at least one event'),
    body('events.*')
      .isIn(Registration.VALID_EVENTS)
      .withMessage(
        'Invalid event. Choose from: ' + Registration.VALID_EVENTS.join(', ')
      ),
    body('teamLeader.name').trim().notEmpty().withMessage('Team leader name is required'),
    body('teamLeader.college').trim().notEmpty().withMessage('Team leader college is required'),
    body('teamLeader.degree').trim().notEmpty().withMessage('Team leader degree is required'),
    body('teamLeader.department').trim().notEmpty().withMessage('Team leader department is required'),
    body('teamLeader.year').trim().notEmpty().withMessage('Team leader year is required'),
    body('teamLeader.email').trim().isEmail().withMessage('Team leader email is required'),
    body('teamLeader.phone').trim().matches(/^[0-9]{10}$/).withMessage('Team leader phone must be 10 digits'),
    body('teamMembers')
      .optional()
      .isArray()
      .withMessage('Team members must be an array'),
    body('teamMembers.*.name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Team member name is required'),
    body('teamMembers.*.college')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Team member college is required'),
    body('teamMembers.*.degree')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Team member degree is required'),
    body('teamMembers.*.department')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Team member department is required'),
    body('teamMembers.*.year')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Team member year of study is required'),
    body('teamMembers.*.email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('A valid email address is required for team members'),
    body('teamMembers.*.phone')
      .optional()
      .trim()
      .matches(/^[0-9]{10}$/)
      .withMessage('A valid 10-digit phone number is required for team members'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { events, teamLeader, teamMembers } = req.body;

      // Find registration and check ownership
      const registration = await Registration.findById(req.params.id);
      
      if (!registration) {
        return res.status(404).json({ message: 'Registration not found' });
      }

      if (registration.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this registration' });
      }

      // Calculate total amount: ₹200 for leader + ₹200 for each member
      const memberCount = teamMembers ? teamMembers.length : 0;
      const totalAmount = 200 * (1 + memberCount);

      registration.events = events;
      registration.teamLeader = teamLeader;
      registration.teamMembers = teamMembers || [];
      registration.amount = totalAmount;

      await registration.save();

      res.json({
        message: 'Registration updated successfully',
        registration,
      });
    } catch (error) {
      console.error('Update registration error:', error);
      res.status(500).json({ message: 'Server error during update' });
    }
  }
);

module.exports = router;
