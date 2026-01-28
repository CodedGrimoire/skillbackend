require('dotenv').config();
const seedData = require('../src/utils/seedData');
const prisma = require('../src/config/prisma');

async function main() {
  try {
    await seedData();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
