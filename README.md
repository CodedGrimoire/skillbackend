# SkillBridge Backend API

Express.js backend API for SkillBridge - a tutoring platform connecting students with tutors.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL database (Neon recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npm run seed

# Start development server
npm run dev
```

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5001
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
DATABASE_URL=your-postgresql-connection-string

# Admin credentials (optional - for auto-seeding)
ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@skillbridge.com
ADMIN_PASSWORD=admin123
```

## 🔑 Test Credentials

All test accounts use the password: **`password123`**

### Student Account
```
Email: alice.student@example.com
Password: password123
Name: Alice Johnson
```

### Tutor Account
```
Email: sarah.tutor@example.com
Password: password123
Name: Sarah Math Tutor
Profile: Mathematics tutor with 10+ years experience
Hourly Rate: $45/hr
Rating: 4.5
```

### Admin Account
```
Email: (Set in .env as ADMIN_EMAIL)
Password: (Set in .env as ADMIN_PASSWORD)
```

*Note: Admin account is auto-created on server startup if ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are set in .env*

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Tutors (Public)
- `GET /api/tutors` - List all tutors
- `GET /api/tutors/:id` - Get tutor details

### Tutors (Protected - TUTOR role)
- `GET /api/tutor/profile` - Get current tutor's profile
- `PUT /api/tutor/profile` - Update tutor profile
- `GET /api/tutor/availability` - Get tutor availability
- `PUT /api/tutor/availability` - Update tutor availability

### Students (Protected - STUDENT role)
- `GET /api/students/profile` - Get student profile with stats

### Bookings (Protected)
- `POST /api/bookings` - Create booking (STUDENT)
- `GET /api/bookings/my` - Get my bookings

### Reviews
- `POST /api/reviews` - Create review (STUDENT, protected)
- `GET /api/reviews/tutor/:id` - Get tutor reviews (public)

### Categories (Public)
- `GET /api/categories` - List all categories

### Admin (Protected - ADMIN role)
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/bookings` - Get all bookings
- `PATCH /api/admin/users/:id` - Update user role

## 🛠️ Scripts

```bash
# Development
npm run dev          # Start with nodemon (auto-reload)

# Production
npm start            # Start server

# Database
npm run seed         # Seed database with sample data
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate dev # Run migrations
```

## 🗄️ Database Schema

- **User** - Users (STUDENT, TUTOR, ADMIN)
- **TutorProfile** - Tutor profiles (bio, skills, hourlyRate, availability, rating)
- **Booking** - Bookings between students and tutors
- **Review** - Reviews from students to tutors
- **Category** - Subject categories

## 🔒 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained via `/api/auth/login` and expire after 7 days.

## 📖 API Documentation

See [API_TESTING_CHECKLIST.md](./API_TESTING_CHECKLIST.md) for detailed API testing documentation with examples.

## 🧪 Testing

Use the provided test credentials to test the API endpoints. You can use:
- Postman
- Thunder Client (VS Code extension)
- curl commands
- The API testing checklist document

## 📦 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Built-in Express validation

## 🏗️ Project Structure

```
skillbackend/
├── src/
│   ├── config/
│   │   ├── prisma.js          # Prisma client singleton
│   │   └── server.js           # Express app configuration
│   ├── controllers/           # Route controllers
│   ├── middlewares/            # Auth, error handling
│   ├── routes/                 # Route definitions
│   └── utils/                  # Utilities (seeding, etc.)
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── scripts/
│   └── seed.js                # Database seeding script
├── index.js                    # Application entry point
└── package.json
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure your Neon database is active (it may auto-pause)
- Verify DATABASE_URL in .env is correct
- Check network connectivity

### Port Already in Use
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

### Migration Issues
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## 📄 License

ISC

---

**Happy Coding! 🎓**
