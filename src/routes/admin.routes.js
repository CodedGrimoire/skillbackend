const express = require('express');
const router = express.Router();
const { getAdminStats, getAdminUsers, getAdminBookings, getAdminCategories, updateAdminUser } = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

router.get('/stats', authenticate, authorizeRoles('ADMIN'), getAdminStats);
router.get('/users', authenticate, authorizeRoles('ADMIN'), getAdminUsers);
router.get('/bookings', authenticate, authorizeRoles('ADMIN'), getAdminBookings);
router.get('/categories', authenticate, authorizeRoles('ADMIN'), getAdminCategories);
router.patch('/users/:id', authenticate, authorizeRoles('ADMIN'), updateAdminUser);

/**
 * Test: curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/admin/stats
 * Test: curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/admin/users
 * Test: curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/admin/bookings
 * Test: curl -H "Authorization: Bearer <TOKEN>" http://localhost:5001/api/admin/categories
 * Test: curl -X PATCH -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
 *        -d '{"role":"TUTOR"}' http://localhost:5001/api/admin/users/<USER_ID>
 */

module.exports = router;
