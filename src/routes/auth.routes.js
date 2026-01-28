const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/me', authenticate, getMe);

/**
 * Test: curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/auth/me
 */

module.exports = router;
