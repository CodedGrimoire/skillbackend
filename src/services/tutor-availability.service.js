const prisma = require('../config/prisma');

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_SET = new Set(DAY_ORDER);

const pad = (n) => String(n).padStart(2, '0');

const to24h = (hour, minute, meridiem) => {
  let h = Number(hour);
  const m = Number(minute);
  const mer = meridiem ? meridiem.toLowerCase() : null;
  if (mer) {
    if (mer === 'pm' && h !== 12) h += 12;
    if (mer === 'am' && h === 12) h = 0;
  }
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return `${pad(h)}:${pad(m)}`;
};

const normalizeSlot = (slot) => {
  if (!slot || typeof slot !== 'string') return null;
  const raw = slot.trim();
  if (!raw) return null;

  // Accept formats: HH:MM-HH:MM or HH:MM am - HH:MM pm
  const regex = /^(\d{1,2}):(\d{2})\s*(am|pm)?\s*[-–]\s*(\d{1,2}):(\d{2})\s*(am|pm)?$/i;
  const match = raw.match(regex);
  if (!match) return null;

  const [, sh, sm, sMer, eh, em, eMer] = match;
  const start = to24h(sh, sm, sMer);
  const end = to24h(eh, em, eMer);
  if (!start || !end) return null;
  if (start >= end) return null; // prevent zero/negative duration
  return `${start}-${end}`;
};

const normalizeAvailabilityInput = (input) => {
  if (!Array.isArray(input)) return null;

  const cleaned = [];

  for (const item of input) {
    if (!item || typeof item !== 'object') continue;
    const dayRaw = (item.day || '').trim();
    const day = DAY_ORDER.find((d) => d.toLowerCase() === dayRaw.toLowerCase());
    if (!day || !Array.isArray(item.slots)) continue;

    const slotSet = new Set();
    item.slots.forEach((s) => {
      const normalized = normalizeSlot(s);
      if (normalized) slotSet.add(normalized);
    });

    if (slotSet.size === 0) continue;

    const slots = Array.from(slotSet).sort();
    cleaned.push({ day, slots });
  }

  // sort by weekday order
  cleaned.sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));

  return cleaned;
};

const serializeAvailability = (availability) => JSON.stringify(availability);

const parseStoredAvailability = (stored) => {
  if (!stored) return [];
  if (Array.isArray(stored)) {
    const normalized = normalizeAvailabilityInput(stored);
    return normalized || [];
  }
  if (typeof stored !== 'string') return [];
  try {
    const parsed = JSON.parse(stored);
    const normalized = normalizeAvailabilityInput(parsed);
    return normalized || [];
  } catch (_e) {
    return [];
  }
};

const getTutorAvailability = async (tutorId) => {
  const profile = await prisma.tutorProfile.findUnique({
    where: { userId: tutorId },
    select: { availability: true }
  });

  const availability = parseStoredAvailability(profile?.availability);
  return availability;
};

const updateTutorAvailability = async (tutorId, availabilityInput) => {
  const normalized = normalizeAvailabilityInput(availabilityInput);
  if (!normalized) {
    const err = new Error('Invalid availability payload');
    err.code = 'BAD_PAYLOAD';
    throw err;
  }

  const serialized = serializeAvailability(normalized);

  const profile = await prisma.tutorProfile.upsert({
    where: { userId: tutorId },
    update: { availability: serialized },
    create: { userId: tutorId, availability: serialized }
  });

  return parseStoredAvailability(profile.availability);
};

module.exports = {
  getTutorAvailability,
  updateTutorAvailability,
  normalizeAvailabilityInput,
  parseStoredAvailability
};
