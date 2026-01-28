const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Students
    const students = await Promise.all([
      prisma.user.upsert({
        where: { email: 'alice.student@example.com' },
        update: {},
        create: {
          name: 'Alice Johnson',
          email: 'alice.student@example.com',
          password: hashedPassword,
          role: 'STUDENT'
        }
      }),
      prisma.user.upsert({
        where: { email: 'bob.student@example.com' },
        update: {},
        create: {
          name: 'Bob Williams',
          email: 'bob.student@example.com',
          password: hashedPassword,
          role: 'STUDENT'
        }
      }),
      prisma.user.upsert({
        where: { email: 'charlie.student@example.com' },
        update: {},
        create: {
          name: 'Charlie Brown',
          email: 'charlie.student@example.com',
          password: hashedPassword,
          role: 'STUDENT'
        }
      })
    ]);

    console.log(`✅ Created ${students.length} students`);

    // Create Tutors with Profiles
    const tutors = await Promise.all([
      prisma.user.upsert({
        where: { email: 'sarah.tutor@example.com' },
        update: {},
        create: {
          name: 'Sarah Math Tutor',
          email: 'sarah.tutor@example.com',
          password: hashedPassword,
          role: 'TUTOR',
          tutorProfile: {
            create: {
              bio: 'Experienced mathematics tutor with 10+ years of teaching experience. Specialized in Algebra, Calculus, and Geometry.',
              skills: 'Mathematics, Algebra, Calculus, Geometry, Statistics',
              hourlyRate: 45.0,
              availability: 'Mon-Fri 9am-6pm, Sat 10am-2pm',
              rating: 0
            }
          }
        }
      }),
      prisma.user.upsert({
        where: { email: 'mike.tutor@example.com' },
        update: {},
        create: {
          name: 'Mike Science Pro',
          email: 'mike.tutor@example.com',
          password: hashedPassword,
          role: 'TUTOR',
          tutorProfile: {
            create: {
              bio: 'PhD in Physics. Passionate about making science accessible and fun for all students.',
              skills: 'Physics, Chemistry, Biology, Science',
              hourlyRate: 60.0,
              availability: 'Mon-Wed 2pm-8pm, Thu-Fri 10am-4pm',
              rating: 0
            }
          }
        }
      }),
      prisma.user.upsert({
        where: { email: 'emily.tutor@example.com' },
        update: {},
        create: {
          name: 'Emily Language Expert',
          email: 'emily.tutor@example.com',
          password: hashedPassword,
          role: 'TUTOR',
          tutorProfile: {
            create: {
              bio: 'Native English speaker with TESOL certification. Expert in ESL, writing, and literature.',
              skills: 'English, ESL, Writing, Literature, Grammar',
              hourlyRate: 40.0,
              availability: 'Mon-Fri 8am-5pm',
              rating: 0
            }
          }
        }
      }),
      prisma.user.upsert({
        where: { email: 'david.tutor@example.com' },
        update: {},
        create: {
          name: 'David Code Master',
          email: 'david.tutor@example.com',
          password: hashedPassword,
          role: 'TUTOR',
          tutorProfile: {
            create: {
              bio: 'Software engineer with 15 years of experience. Teaching programming and web development.',
              skills: 'JavaScript, Python, React, Node.js, Web Development',
              hourlyRate: 55.0,
              availability: 'Mon-Sat 6pm-10pm',
              rating: 0
            }
          }
        }
      })
    ]);

    console.log(`✅ Created ${tutors.length} tutors with profiles`);

    // Create Bookings
    const bookings = await Promise.all([
      prisma.booking.create({
        data: {
          studentId: students[0].id,
          tutorId: tutors[0].id,
          dateTime: new Date('2024-02-20T10:00:00Z'),
          status: 'COMPLETED'
        }
      }),
      prisma.booking.create({
        data: {
          studentId: students[0].id,
          tutorId: tutors[1].id,
          dateTime: new Date('2024-02-22T14:00:00Z'),
          status: 'UPCOMING'
        }
      }),
      prisma.booking.create({
        data: {
          studentId: students[1].id,
          tutorId: tutors[0].id,
          dateTime: new Date('2024-02-18T16:00:00Z'),
          status: 'COMPLETED'
        }
      }),
      prisma.booking.create({
        data: {
          studentId: students[1].id,
          tutorId: tutors[2].id,
          dateTime: new Date('2024-02-25T11:00:00Z'),
          status: 'UPCOMING'
        }
      }),
      prisma.booking.create({
        data: {
          studentId: students[2].id,
          tutorId: tutors[3].id,
          dateTime: new Date('2024-02-19T19:00:00Z'),
          status: 'COMPLETED'
        }
      })
    ]);

    console.log(`✅ Created ${bookings.length} bookings`);

    // Create Reviews
    const reviews = await Promise.all([
      prisma.review.create({
        data: {
          studentId: students[0].id,
          tutorId: tutors[0].id,
          rating: 5,
          comment: 'Sarah is an amazing math tutor! She explains complex concepts in a way that\'s easy to understand.'
        }
      }),
      prisma.review.create({
        data: {
          studentId: students[1].id,
          tutorId: tutors[0].id,
          rating: 4,
          comment: 'Very patient and knowledgeable. Helped me improve my grades significantly.'
        }
      }),
      prisma.review.create({
        data: {
          studentId: students[0].id,
          tutorId: tutors[1].id,
          rating: 5,
          comment: 'Mike makes science fun and interesting. Highly recommend!'
        }
      }),
      prisma.review.create({
        data: {
          studentId: students[1].id,
          tutorId: tutors[2].id,
          rating: 5,
          comment: 'Emily is the best English tutor I\'ve had. My writing improved so much!'
        }
      }),
      prisma.review.create({
        data: {
          studentId: students[2].id,
          tutorId: tutors[3].id,
          rating: 5,
          comment: 'David is an excellent programming tutor. Learned React in no time!'
        }
      })
    ]);

    console.log(`✅ Created ${reviews.length} reviews`);

    // Update tutor ratings based on reviews
    for (const tutor of tutors) {
      const tutorReviews = await prisma.review.findMany({
        where: { tutorId: tutor.id },
        select: { rating: true }
      });

      if (tutorReviews.length > 0) {
        const averageRating = tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutorReviews.length;
        
        await prisma.tutorProfile.update({
          where: { userId: tutor.id },
          data: { rating: Math.round(averageRating * 10) / 10 }
        });
      }
    }

    console.log('✅ Updated tutor ratings');

    console.log('\n🎉 Data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${students.length} students`);
    console.log(`   - ${tutors.length} tutors with profiles`);
    console.log(`   - ${bookings.length} bookings`);
    console.log(`   - ${reviews.length} reviews`);
    console.log('\n🔑 Test credentials (password: password123):');
    console.log('   Students:');
    students.forEach(s => console.log(`     - ${s.email}`));
    console.log('   Tutors:');
    tutors.forEach(t => console.log(`     - ${t.email}`));

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

module.exports = seedData;
