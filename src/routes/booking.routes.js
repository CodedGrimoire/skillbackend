const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookings, getBookingById, getTutorBookings, getBookingStats, completeBooking } = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// All booking routes require authentication
router.post('/', authenticate, authorizeRoles('STUDENT'), createBooking);
router.get('/', authenticate, getBookings); 
router.get('/my', authenticate, authorizeRoles('STUDENT'), getMyBookings);



router.get('/tutor', authenticate, authorizeRoles('TUTOR'), getTutorBookings);



router.get('/stats', authenticate, authorizeRoles('STUDENT'), getBookingStats);

router.patch('/complete', authenticate, completeBooking); 
router.patch('/complete/:id', authenticate, completeBooking);
router.get('/:id', authenticate, getBookingById);


module.exports = router;
