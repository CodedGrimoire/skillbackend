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



module.exports = router;
