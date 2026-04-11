const prisma = require('../config/prisma');

const toLabel = (row) => ({ label: row.label, value: Number(row.value) });

const getSessionsByMonth = async (tutorId) => {
  const rows = await prisma.$queryRaw`
    SELECT to_char(date_trunc('month', date_time), 'YYYY-MM') AS label, COUNT(*)::int AS value
    FROM bookings
    WHERE tutor_id = ${tutorId}
    GROUP BY 1
    ORDER BY 1 DESC
    LIMIT 12
  `;

  return rows.map(toLabel).sort((a, b) => (a.label > b.label ? 1 : -1));
};

const getStatusCounts = async (tutorId) => {
  const groups = await prisma.booking.groupBy({
    by: ['status'],
    where: { tutorId },
    _count: { status: true }
  });

  const base = { UPCOMING: 0, COMPLETED: 0, CANCELLED: 0, PENDING: 0, CONFIRMED: 0 };
  groups.forEach((g) => {
    base[g.status] = g._count.status;
  });

  return {
    upcoming: base.UPCOMING,
    completed: base.COMPLETED,
    cancelled: base.CANCELLED,
    pending: base.PENDING,
    confirmed: base.CONFIRMED
  };
};

const getRatingAndReviews = async (tutorId) => {
  const profile = await prisma.tutorProfile.findUnique({
    where: { userId: tutorId },
    select: { rating: true }
  });

  const reviewCount = await prisma.review.count({ where: { tutorId } });

  let rating = profile?.rating ?? null;
  if (rating === null) {
    const avg = await prisma.review.aggregate({
      where: { tutorId },
      _avg: { rating: true }
    });
    rating = avg._avg.rating ?? 0;
  }

  return { rating, reviewCount };
};

const getRecentSessions = async (tutorId, limit = 5) => {
  const bookings = await prisma.booking.findMany({
    where: { tutorId },
    orderBy: { dateTime: 'desc' },
    take: limit,
    include: {
      student: { select: { id: true, name: true } }
    }
  });

  return bookings.map((b) => ({
    id: b.id,
    studentName: b.student?.name || 'Unknown',
    subject: null,
    dateTime: b.dateTime,
    status: b.status,
    mode: 'Online'
  }));
};

const getTutorDashboard = async (tutorId) => {
  const [sessionsByMonth, statusCounts, { rating, reviewCount }, recentSessions] = await Promise.all([
    getSessionsByMonth(tutorId),
    getStatusCounts(tutorId),
    getRatingAndReviews(tutorId),
    getRecentSessions(tutorId)
  ]);

  return {
    sessionsByMonth,
    statusCounts,
    rating,
    reviewCount,
    recentSessions
  };
};

module.exports = {
  getTutorDashboard
};
