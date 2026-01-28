const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings } = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All booking routes require authentication
router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getMyBookings);

module.exports = router;
