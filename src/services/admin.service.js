const prisma = require('../config/prisma');

const ALLOWED_USER_STATUSES = ['ACTIVE', 'BANNED'];
const ALLOWED_BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'UPCOMING', 'COMPLETED', 'CANCELLED'];

const getStats = async () => {
  const [totalUsers, totalTutors, totalStudents, totalBookings, totalCategories, roleGroups, bookingsByMonthRaw, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'TUTOR' } }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.booking.count(),
    prisma.category.count(),
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    }),
    prisma.$queryRaw`SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS label, COUNT(*)::int AS value FROM bookings GROUP BY 1 ORDER BY 1 DESC LIMIT 12`,
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
    })
  ]);

  const roleCounts = roleGroups.reduce((acc, curr) => {
    acc[curr.role] = curr._count.role;
    return acc;
  }, { STUDENT: 0, TUTOR: 0, ADMIN: 0 });

  const bookingsByMonth = bookingsByMonthRaw.map((row) => ({ label: row.label, value: Number(row.value) }))
    .sort((a, b) => (a.label > b.label ? 1 : -1));

  return {
    totalUsers,
    totalTutors,
    totalStudents,
    totalBookings,
    totalCategories,
    bookingsByMonth,
    roleCounts,
    recentUsers
  };
};

const updateUserStatus = async (id, status) => {
  if (!ALLOWED_USER_STATUSES.includes(status)) {
    const err = new Error('Invalid status value');
    err.code = 'BAD_STATUS';
    throw err;
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, updatedAt: true }
    });
    return updated;
  } catch (error) {
    if (error.code === 'P2025') {
      const err = new Error('User not found');
      err.code = 'NOT_FOUND';
      throw err;
    }
    throw error;
  }
};

const updateBookingStatus = async (id, status) => {
  if (!ALLOWED_BOOKING_STATUSES.includes(status)) {
    const err = new Error('Invalid booking status value');
    err.code = 'BAD_STATUS';
    throw err;
  }

  try {
    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, dateTime: true, createdAt: true, studentId: true, tutorId: true }
    });
    return updated;
  } catch (error) {
    if (error.code === 'P2025') {
      const err = new Error('Booking not found');
      err.code = 'NOT_FOUND';
      throw err;
    }
    throw error;
  }
};

const sanitizeCategoryName = (name) => {
  if (name === undefined || name === null) return null;
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  return trimmed.length ? trimmed : null;
};

const listCategoriesWithUsage = async () => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return categories.map((c) => ({ ...c, usageCount: 0 }));
};

const createCategory = async (name) => {
  const clean = sanitizeCategoryName(name);
  if (!clean) {
    const err = new Error('Invalid name');
    err.code = 'BAD_INPUT';
    throw err;
  }

  const existing = await prisma.category.findFirst({ where: { name: { equals: clean, mode: 'insensitive' } } });
  if (existing) {
    const err = new Error('Category name already exists');
    err.code = 'DUPLICATE';
    throw err;
  }

  return prisma.category.create({ data: { name: clean }, select: { id: true, name: true } });
};

const updateCategory = async (id, name) => {
  const clean = sanitizeCategoryName(name);
  if (!clean) {
    const err = new Error('Invalid name');
    err.code = 'BAD_INPUT';
    throw err;
  }

  const existing = await prisma.category.findFirst({
    where: {
      name: { equals: clean, mode: 'insensitive' },
      id: { not: id }
    }
  });
  if (existing) {
    const err = new Error('Category name already exists');
    err.code = 'DUPLICATE';
    throw err;
  }

  try {
    return await prisma.category.update({ where: { id }, data: { name: clean }, select: { id: true, name: true } });
  } catch (error) {
    if (error.code === 'P2025') {
      const err = new Error('Category not found');
      err.code = 'NOT_FOUND';
      throw err;
    }
    throw error;
  }
};

const deleteCategory = async (id) => {
  try {
    await prisma.category.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2025') {
      const err = new Error('Category not found');
      err.code = 'NOT_FOUND';
      throw err;
    }
    throw error;
  }
};

module.exports = {
  getStats,
  updateUserStatus,
  updateBookingStatus,
  ALLOWED_USER_STATUSES,
  ALLOWED_BOOKING_STATUSES,
  listCategoriesWithUsage,
  createCategory,
  updateCategory,
  deleteCategory
};
