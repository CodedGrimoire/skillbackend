const prisma = require('../config/prisma');

const toPositiveInt = (value, defaultValue, { min = 1, max = 100 } = {}) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < min) return defaultValue;
  return Math.min(parsed, max);
};

const toNumber = (value, fallback, { min, max } = {}) => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  if (min !== undefined && parsed < min) return fallback;
  if (max !== undefined && parsed > max) return fallback;
  return parsed;
};

const buildOrderBy = (sort) => {
  switch (sort) {
    case 'price_asc':
      return [
        { tutorProfile: { hourlyRate: 'asc' } },
        { name: 'asc' }
      ];
    case 'price_desc':
      return [
        { tutorProfile: { hourlyRate: 'desc' } },
        { name: 'asc' }
      ];
    case 'name_asc':
      return [{ name: 'asc' }];
    case 'rating_desc':
    default:
      return [
        { tutorProfile: { rating: 'desc' } },
        { name: 'asc' }
      ];
  }
};

const parseCSV = (value) => {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const deriveBadges = ({ rating, availability, createdAt }) => {
  const badges = [];
  if (rating >= 4.8) badges.push('Top rated');
  if (availability && /online/i.test(availability)) badges.push('Online');
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  if (createdAt && createdAt > thirtyDaysAgo) badges.push('New tutor');
  return badges;
};

const getTutorDetail = async (id) => {
  const tutor = await prisma.user.findUnique({
    where: { id, role: 'TUTOR' },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      tutorProfile: {
        select: {
          bio: true,
          skills: true,
          hourlyRate: true,
          availability: true,
          rating: true
        }
      }
    }
  });

  if (!tutor) return null;

  const [reviewsAgg, reviewsList] = await Promise.all([
    prisma.review.aggregate({
      where: { tutorId: id },
      _avg: { rating: true },
      _count: { id: true }
    }),
    prisma.review.findMany({
      where: { tutorId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { name: true } }
      }
    })
  ]);

  const profile = tutor.tutorProfile || {};
  const rating = profile.rating ?? reviewsAgg._avg.rating ?? 0;
  const reviewCount = reviewsAgg._count.id || 0;

  const skills = parseCSV(profile.skills);
  const languages = []; // not stored yet

  const badges = deriveBadges({ rating, availability: profile.availability, createdAt: tutor.createdAt });

  const reviews = reviewsList.map((r) => ({
    id: r.id,
    reviewer: r.student?.name || 'Anonymous',
    rating: r.rating,
    comment: r.comment || '',
    date: r.createdAt
  }));

  return {
    id: tutor.id,
    name: tutor.name,
    email: tutor.email,
    subject: null,
    category: null,
    hourlyRate: profile.hourlyRate ?? 0,
    rating,
    reviewCount,
    bio: profile.bio || '',
    headline: '',
    badges,
    mode: profile.availability && /online/i.test(profile.availability) ? 'Online' : null,
    location: null,
    languages,
    experience: '',
    skills,
    reviews,
    media: [],
    availability: profile.availability || null
  };
};

const getRelatedTutors = async (id, limit = 4) => {
  const base = await prisma.user.findUnique({
    where: { id },
    select: { tutorProfile: { select: { skills: true } } }
  });
  if (!base || !base.tutorProfile?.skills) return [];
  const firstSkill = parseCSV(base.tutorProfile.skills)[0];
  if (!firstSkill) return [];

  const tutors = await prisma.user.findMany({
    where: {
      role: 'TUTOR',
      id: { not: id },
      tutorProfile: { skills: { contains: firstSkill, mode: 'insensitive' } }
    },
    take: limit,
    select: {
      id: true,
      name: true,
      tutorProfile: { select: { hourlyRate: true, rating: true, skills: true } }
    }
  });

  return tutors.map((t) => ({
    id: t.id,
    name: t.name,
    hourlyRate: t.tutorProfile?.hourlyRate ?? 0,
    rating: t.tutorProfile?.rating ?? 0,
    skills: parseCSV(t.tutorProfile?.skills)
  }));
};

const listTutors = async (query = {}) => {
  const page = toPositiveInt(query.page, 1, { min: 1, max: 1000 });
  const pageSize = toPositiveInt(query.pageSize, 12, { min: 1, max: 100 });

  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const category = typeof query.category === 'string' ? query.category.trim() : '';
  const mode = typeof query.mode === 'string' ? query.mode.trim() : '';

  // Backwards-compatible aliases: minRate/maxRate map to minPrice/maxPrice
  const minPrice = toNumber(query.minPrice ?? query.minRate, null, { min: 0 });
  const maxPrice = toNumber(query.maxPrice ?? query.maxRate, null, { min: 0 });
  const minRating = toNumber(query.minRating, null, { min: 0, max: 5 });

  const profileFilter = {};
  if (minPrice !== null || maxPrice !== null) {
    profileFilter.hourlyRate = {
      ...(minPrice !== null ? { gte: minPrice } : {}),
      ...(maxPrice !== null ? { lte: maxPrice } : {})
    };
  }
  if (minRating !== null) {
    profileFilter.rating = { gte: minRating };
  }
  if (category) {
    profileFilter.skills = { contains: category, mode: 'insensitive' };
  }
  if (mode) {
    profileFilter.availability = { contains: mode, mode: 'insensitive' };
  }

  const filters = [];

  if (search) {
    filters.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { tutorProfile: { skills: { contains: search, mode: 'insensitive' } } }
      ]
    });
  }

  if (Object.keys(profileFilter).length) {
    filters.push({ tutorProfile: profileFilter });
  }

  const where = {
    role: 'TUTOR',
    ...(filters.length ? { AND: filters } : {})
  };

  const orderBy = buildOrderBy(query.sort);

  const [total, tutors] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        tutorProfile: {
          select: {
            id: true,
            bio: true,
            skills: true,
            hourlyRate: true,
            availability: true,
            rating: true
          }
        }
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return {
    data: tutors,
    tutors, // backward compatibility with legacy shape
    page,
    pageSize,
    total
  };
};

module.exports = {
  listTutors,
  getTutorDetail,
  getRelatedTutors
};
