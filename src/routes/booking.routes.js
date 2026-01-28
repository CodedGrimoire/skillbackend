const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getTutorBookings, getBookingStats } = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// All booking routes require authentication
router.post('/', authenticate, authorizeRoles('STUDENT'), createBooking);
router.get('/my', authenticate, authorizeRoles('STUDENT'), getMyBookings);
router.get('/tutor', authenticate, authorizeRoles('TUTOR'), getTutorBookings);
router.get('/stats', authenticate, authorizeRoles('STUDENT'), getBookingStats);

/**
 * Quick test commands:
 * curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/bookings/my
 * curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/bookings/tutor
 * curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/bookings/stats
 */

module.exports = router;
