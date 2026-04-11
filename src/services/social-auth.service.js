const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const clientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = clientId ? new OAuth2Client(clientId) : null;

const verifyGoogleToken = async (idToken) => {
  if (!googleClient) {
    const err = new Error('Google client not configured');
    err.code = 'CONFIG_MISSING';
    throw err;
  }

  const ticket = await googleClient.verifyIdToken({ idToken, audience: clientId });
  const payload = ticket.getPayload();
  const email = payload?.email;
  const name = payload?.name || payload?.email?.split('@')[0] || 'User';
  const sub = payload?.sub;
  if (!email || !sub) {
    const err = new Error('Invalid Google token payload');
    err.code = 'INVALID_TOKEN';
    throw err;
  }
  return { email, name, socialId: sub, provider: 'google' };
};

const generateToken = (user) =>
  jwt.sign({ id: user.id, userId: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

const socialAuth = async ({ provider, idToken }) => {
  if (!provider || !idToken) {
    const err = new Error('provider and idToken are required');
    err.code = 'BAD_INPUT';
    throw err;
  }

  let profile;
  if (provider === 'google') {
    profile = await verifyGoogleToken(idToken);
  } else if (provider === 'facebook') {
    const err = new Error('Facebook not supported yet');
    err.code = 'UNSUPPORTED';
    throw err;
  } else {
    const err = new Error('Unsupported provider');
    err.code = 'UNSUPPORTED';
    throw err;
  }

  const existing = await prisma.user.findUnique({ where: { email: profile.email } });

  if (existing) {
    if (existing.status === 'BANNED') {
      const err = new Error('User is banned');
      err.code = 'BANNED';
      throw err;
    }

    // Optionally backfill provider fields
    if (!existing.authProvider || !existing.socialId) {
      await prisma.user.update({ where: { id: existing.id }, data: { authProvider: provider, socialId: profile.socialId } });
    }

    const token = generateToken(existing);
    const { password, ...user } = existing;
    return { token, user };
  }

  const hashedPlaceholder = await bcrypt.hash(`social-${provider}-${profile.socialId}-${Date.now()}`, 10);

  const created = await prisma.user.create({
    data: {
      name: profile.name,
      email: profile.email,
      password: hashedPlaceholder,
      role: 'STUDENT',
      authProvider: provider,
      socialId: profile.socialId
    }
  });

  const token = generateToken(created);
  const { password, ...user } = created;
  return { token, user };
};

module.exports = {
  socialAuth
};
