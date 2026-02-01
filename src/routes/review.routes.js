const express = require('express');
const router = express.Router();
const { createReview, getTutorReviews, checkStudentReview } = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// Create review (protected - STUDENT only)
router.post('/', authenticate, authorizeRoles('STUDENT'), createReview);

// Check if current student has reviewed a tutor (protected - STUDENT only)
router.get('/check/:tutorId', authenticate, authorizeRoles('STUDENT'), checkStudentReview);

// Get reviews for a tutor (public)
router.get('/tutor/:id', getTutorReviews);

module.exports = router;
