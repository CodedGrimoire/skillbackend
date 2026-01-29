const prisma = require('../config/prisma');

// Public: GET /api/categories
const getCategories = async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = { getCategories };
