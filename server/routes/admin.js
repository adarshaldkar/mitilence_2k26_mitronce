const express = require('express');
const Registration = require('../models/Registration');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(verifyToken, isAdmin);

// @route   GET /api/admin/registrations
// @desc    Get all registrations with populated user data
// @access  Admin only
router.get('/registrations', async (req, res) => {
  try {
    const { eventName, paymentStatus, search } = req.query;

    const filter = {};

    if (eventName && Registration.VALID_EVENTS.includes(eventName)) {
      filter.events = eventName;
    }


    let registrations = await Registration.find(filter)
      .populate('userId', 'name email phone college department year')
      .sort({ createdAt: -1 });

    // Optional search by registration ID, team leader, or user name
    if (search) {
      const searchLower = search.toLowerCase();
      registrations = registrations.filter((reg) => {
        const matchRegId = reg.registrationId.toLowerCase().includes(searchLower);
        const matchTeamLeader = (typeof reg.teamLeader === 'string' ? reg.teamLeader : reg.teamLeader?.name || '').toLowerCase().includes(searchLower);
        const matchUserName = reg.userId && reg.userId.name.toLowerCase().includes(searchLower);
        const matchUserEmail = reg.userId && reg.userId.email.toLowerCase().includes(searchLower);
        const matchTxnId = reg.transactionId && reg.transactionId.toLowerCase().includes(searchLower);
        return matchRegId || matchTeamLeader || matchUserName || matchUserEmail || matchTxnId;
      });
    }

    // Summary stats
    const stats = {
      total: registrations.length,
    };

    res.json({ registrations, stats });
  } catch (error) {
    console.error('Admin get registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
