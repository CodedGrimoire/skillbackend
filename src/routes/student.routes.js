const express = require('express');
const router = express.Router();
const { getStudentProfile } = require('../controllers/student.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Get student profile (protected)
router.get('/profile', authenticate, getStudentProfile);

module.exports = router;
