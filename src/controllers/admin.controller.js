const prisma = require('../config/prisma');
const {
  getStats,
  updateUserStatus,
  updateBookingStatus,
  ALLOWED_USER_STATUSES,
  ALLOWED_BOOKING_STATUSES
} = require('../services/admin.service');

const getAdminStats = async (_req, res) => {
  try {
    const data = await getStats();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const getAdminBookings = async (_req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        student: { select: { id: true, name: true, email: true, role: true } },
        tutor: { select: { id: true, name: true, email: true, role: true, tutorProfile: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// GET /api/admin/categories
const getAdminCategories = async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// GET /api/admin/users
const getAdminUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const users = await prisma.user.findMany({
      where: role ? { role } : {},
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        tutorProfile: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// PATCH /api/admin/users/:id (update role or status fields)
const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;
    if (!role && !status) {
      return res.status(400).json({ success: false, error: 'role or status is required' });
    }

    const data = {};
    if (role) data.role = role;
    if (status) data.status = status;

    const updated = await prisma.user.update({
      where: { id },
      data
    });

    res.json({ success: true, user: updated });
  } catch (error) {
    console.error('Update admin user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const setUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!status) {
    return res.status(400).json({ success: false, error: 'status is required' });
  }
  if (!ALLOWED_USER_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status. Allowed: ${ALLOWED_USER_STATUSES.join(', ')}` });
  }

  try {
    const user = await updateUserStatus(id, status);
    res.json({ success: true, message: 'User status updated successfully', data: user });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (error.code === 'BAD_STATUS') {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const setBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!status) {
    return res.status(400).json({ success: false, error: 'status is required' });
  }
  if (!ALLOWED_BOOKING_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status. Allowed: ${ALLOWED_BOOKING_STATUSES.join(', ')}` });
  }

  try {
    const booking = await updateBookingStatus(id, status);
    res.json({ success: true, message: 'Booking status updated successfully', data: booking });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    if (error.code === 'BAD_STATUS') {
      return res.status(400).json({ success: false, error: 'Invalid booking status' });
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = { getAdminStats, getAdminUsers, getAdminBookings, getAdminCategories, updateAdminUser, setUserStatus, setBookingStatus };
