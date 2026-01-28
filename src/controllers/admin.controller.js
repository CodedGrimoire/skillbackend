const prisma = require('../config/prisma');

// GET /api/admin/stats
const getAdminStats = async (_req, res) => {
  try {
    const [totalUsers, totalTutors, totalStudents, totalBookings] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'TUTOR' } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.booking.count()
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTutors,
        totalStudents,
        totalBookings
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// GET /api/admin/bookings
const getAdminBookings = async (_req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        student: { select: { id: true, name: true, email: true, role: true } },
        tutor:   { select: { id: true, name: true, email: true, role: true, tutorProfile: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Get admin bookings error:', error);
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
    console.error('Get admin categories error:', error);
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

module.exports = { getAdminStats, getAdminUsers, getAdminBookings, getAdminCategories };
