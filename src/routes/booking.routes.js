const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookings, getBookingById, getTutorBookings, getBookingStats, completeBooking } = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// All booking routes require authentication
router.post('/', authenticate, authorizeRoles('STUDENT'), createBooking);
router.get('/', authenticate, getBookings); // returns current user's bookings (or all if admin)
router.get('/my', authenticate, authorizeRoles('STUDENT'), getMyBookings);
router.get('/tutor', authenticate, authorizeRoles('TUTOR'), getTutorBookings);
router.get('/stats', authenticate, authorizeRoles('STUDENT'), getBookingStats);
// Specific routes must come before parameterized routes
router.patch('/complete', authenticate, completeBooking); // Mark booking as completed (bookingId in body)
router.patch('/complete/:id', authenticate, completeBooking); // Mark booking as completed (id in URL)
router.get('/:id', authenticate, getBookingById);

/**
 * Quick test commands:
 * curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/bookings/my
 * curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/bookings/tutor
 * curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/bookings/stats
 * curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/bookings
 * curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/bookings/<BOOKING_ID>
 */

module.exports = router;
