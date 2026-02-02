const express = require('express');
const router = express.Router();
const { createReview, getTutorReviews, checkStudentReview, updateReview, deleteReview } = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');


router.post('/', authenticate, authorizeRoles('STUDENT'), createReview);


router.get('/check/:tutorId', authenticate, authorizeRoles('STUDENT'), checkStudentReview);


router.get('/tutor/:id', getTutorReviews);


router.put('/:id', authenticate, updateReview);
router.patch('/:id', authenticate, updateReview);


router.delete('/:id', authenticate, deleteReview);

module.exports = router;
