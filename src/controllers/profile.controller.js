const { updateProfile } = require('../services/profile.service');

const putProfile = async (req, res) => {
  const userId = req.user?.id || req.user?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const updated = await updateProfile(userId, req.body || {});
    res.json({ success: true, message: 'Profile updated successfully', data: updated });
  } catch (error) {
    if (error.code === 'NO_FIELDS') {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }
    if (error.code === 'BAD_INPUT') {
      return res.status(400).json({ success: false, error: error.message });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = { putProfile };
