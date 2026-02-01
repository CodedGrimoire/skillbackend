const express = require('express');
const router = express.Router();
const { createReview, getTutorReviews, checkStudentReview, updateReview, deleteReview } = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// Create review (protected - STUDENT only)
router.post('/', authenticate, authorizeRoles('STUDENT'), createReview);

// Check if current student has reviewed a tutor (protected - STUDENT only)
router.get('/check/:tutorId', authenticate, authorizeRoles('STUDENT'), checkStudentReview);

// Get reviews for a tutor (public)
router.get('/tutor/:id', getTutorReviews);

// Update review (protected - STUDENT who created it or ADMIN)
router.put('/:id', authenticate, updateReview);
router.patch('/:id', authenticate, updateReview);

// Delete review (protected - STUDENT who created it or ADMIN)
router.delete('/:id', authenticate, deleteReview);

module.exports = router;
