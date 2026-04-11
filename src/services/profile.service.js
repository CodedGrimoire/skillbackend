const prisma = require('../config/prisma');

const sanitizeString = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : '';
};

const updateProfile = async (userId, payload) => {
  const name = sanitizeString(payload.name);
  const timezone = sanitizeString(payload.timezone);
  const preferences = sanitizeString(payload.preferences);

  const data = {};
  if (name !== undefined) {
    if (name === null) {
      const err = new Error('Invalid name');
      err.code = 'BAD_INPUT';
      throw err;
    }
    data.name = name;
  }
  if (timezone !== undefined) {
    if (timezone === null) {
      const err = new Error('Invalid timezone');
      err.code = 'BAD_INPUT';
      throw err;
    }
    data.timezone = timezone;
  }
  if (preferences !== undefined) {
    if (preferences === null) {
      const err = new Error('Invalid preferences');
      err.code = 'BAD_INPUT';
      throw err;
    }
    data.preferences = preferences;
  }

  if (Object.keys(data).length === 0) {
    const err = new Error('No valid fields');
    err.code = 'NO_FIELDS';
    throw err;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      timezone: true,
      preferences: true
    }
  });

  return updated;
};

module.exports = {
  updateProfile
};
