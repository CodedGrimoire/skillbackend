const express = require('express');
const router = express.Router();
const { createReview, getTutorReviews } = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Create review (protected)
router.post('/', authenticate, createReview);

// Get reviews for a tutor (public)
router.get('/tutor/:id', getTutorReviews);

module.exports = router;
