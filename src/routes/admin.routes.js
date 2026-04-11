const express = require('express');
const router = express.Router();
const { getAdminStats, getAdminUsers, getAdminBookings, getAdminCategories, updateAdminUser, setUserStatus, setBookingStatus, createAdminCategory, updateAdminCategory, deleteAdminCategory } = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

router.get('/stats', authenticate, authorizeRoles('ADMIN'), getAdminStats);
router.get('/users', authenticate, authorizeRoles('ADMIN'), getAdminUsers);
router.get('/bookings', authenticate, authorizeRoles('ADMIN'), getAdminBookings);
router.get('/categories', authenticate, authorizeRoles('ADMIN'), getAdminCategories);
router.post('/categories', authenticate, authorizeRoles('ADMIN'), createAdminCategory);
router.put('/categories/:id', authenticate, authorizeRoles('ADMIN'), updateAdminCategory);
router.delete('/categories/:id', authenticate, authorizeRoles('ADMIN'), deleteAdminCategory);
router.patch('/users/:id', authenticate, authorizeRoles('ADMIN'), updateAdminUser);
router.post('/users/:id/status', authenticate, authorizeRoles('ADMIN'), setUserStatus);
router.post('/bookings/:id/status', authenticate, authorizeRoles('ADMIN'), setBookingStatus);



module.exports = router;
