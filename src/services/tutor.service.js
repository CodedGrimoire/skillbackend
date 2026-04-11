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
  listTutors
};
