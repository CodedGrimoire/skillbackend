const express = require('express');
const router = express.Router();
const { getAdminStats, getAdminUsers, getAdminBookings, getAdminCategories } = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

router.get('/stats', authenticate, authorizeRoles('ADMIN'), getAdminStats);
router.get('/users', authenticate, authorizeRoles('ADMIN'), getAdminUsers);
router.get('/bookings', authenticate, authorizeRoles('ADMIN'), getAdminBookings);
router.get('/categories', authenticate, authorizeRoles('ADMIN'), getAdminCategories);

/**
 * Test: curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/admin/stats
 * Test: curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/admin/users
 * Test: curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/admin/bookings
 * Test: curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/admin/categories
 */

module.exports = router;
