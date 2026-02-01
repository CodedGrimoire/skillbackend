# SkillBridge API Testing Checklist

## Base URL
```
http://localhost:3000
```
*Update with your actual server URL*

---

## Setup Instructions

### Environment Variables
Make sure your `.env` file has:
```
PORT=3000
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
DATABASE_URL=your-database-url
```

### Postman/Thunder Client Setup
1. Create a new collection: "SkillBridge API"
2. Set base URL as environment variable: `{{baseUrl}}` = `http://localhost:3000`
3. Create environment variable: `{{token}}` (will be set after login)

---

## 🔐 Authentication Endpoints

### 1. Register New User
**POST** `/api/auth/register`

#### Request Headers
```
Content-Type: application/json
```

#### Request Body (Student)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STUDENT"
}
```

#### Request Body (Tutor)
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "TUTOR"
}
```

#### Request Body (Minimal - defaults to STUDENT)
```json
{
  "name": "Bob Wilson",
  "email": "bob@example.com",
  "password": "password123"
}
```

#### Success Response (201 Created)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "createdAt": "2024-01-28T14:00:00.000Z",
    "updatedAt": "2024-01-28T14:00:00.000Z"
  }
}
```

#### Error Responses
- **400 Bad Request** - Missing fields:
```json
{
  "error": "Name, email, and password are required"
}
```

- **400 Bad Request** - Duplicate email:
```json
{
  "error": "User with this email already exists"
}
```

#### cURL Example
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "STUDENT"
  }'
```

#### Test Scenarios
- [ ] ✅ Register as STUDENT (default role)
- [ ] ✅ Register as TUTOR
- [ ] ✅ Register as ADMIN (if allowed)
- [ ] ❌ Missing name field
- [ ] ❌ Missing email field
- [ ] ❌ Missing password field
- [ ] ❌ Duplicate email
- [ ] ❌ Invalid email format
- [ ] ❌ Invalid role value

---

### 2. Login User
**POST** `/api/auth/login`

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Success Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "createdAt": "2024-01-28T14:00:00.000Z",
    "updatedAt": "2024-01-28T14:00:00.000Z"
  }
}
```

#### Error Responses
- **400 Bad Request** - Missing fields:
```json
{
  "error": "Email and password are required"
}
```

- **401 Unauthorized** - Invalid credentials:
```json
{
  "error": "Invalid email or password"
}
```

#### cURL Example
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Test Scenarios
- [ ] ✅ Valid credentials
- [ ] ❌ Missing email
- [ ] ❌ Missing password
- [ ] ❌ Wrong email
- [ ] ❌ Wrong password
- [ ] ❌ Non-existent user

#### Postman/Thunder Client Setup
After successful login, save the token:
- Set environment variable: `{{token}}` = response token value
- Use in Authorization header: `Bearer {{token}}`

---

### 3. Get Current User (Me)
**GET** `/api/auth/me`

#### Request Headers
```
Authorization: Bearer <token>
```

#### Success Response (200 OK)
```json
{
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "createdAt": "2024-01-28T14:00:00.000Z",
    "updatedAt": "2024-01-28T14:00:00.000Z"
  }
}
```

#### Error Responses
- **401 Unauthorized** - Missing token:
```json
{
  "error": "Authorization token required"
}
```

- **401 Unauthorized** - Invalid token:
```json
{
  "error": "Invalid token"
}
```

- **404 Not Found** - User not found:
```json
{
  "error": "User not found"
}
```

#### cURL Example
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Test Scenarios
- [ ] ✅ Valid token
- [ ] ❌ Missing Authorization header
- [ ] ❌ Invalid token
- [ ] ❌ Expired token
- [ ] ❌ Malformed token

---

## 👨‍🏫 Tutor Endpoints (Public)

### 4. Get All Tutors
**GET** `/api/tutors`

#### Request Headers
```
(No authentication required)
```

#### Success Response (200 OK)
```json
{
  "tutors": [
    {
      "id": "tutor-uuid-1",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "TUTOR",
      "createdAt": "2024-01-28T14:00:00.000Z",
      "tutorProfile": {
        "id": "profile-uuid",
        "bio": "Experienced math tutor",
        "skills": "Mathematics, Calculus, Algebra",
        "hourlyRate": 50.0,
        "availability": "Mon-Fri 9am-5pm",
        "rating": 4.5
      }
    },
    {
      "id": "tutor-uuid-2",
      "name": "Bob Tutor",
      "email": "bob@example.com",
      "role": "TUTOR",
      "createdAt": "2024-01-28T14:00:00.000Z",
      "tutorProfile": null
    }
  ]
}
```

#### Empty Response (200 OK)
```json
{
  "tutors": []
}
```

#### cURL Example
```bash
curl -X GET http://localhost:3000/api/tutors
```

#### Test Scenarios
- [ ] ✅ Get all tutors (with profiles)
- [ ] ✅ Get all tutors (some without profiles)
- [ ] ✅ Empty list (no tutors)
- [ ] ✅ Verify password never returned

---

### 5. Get Tutor Details
**GET** `/api/tutors/:id`

#### Request Headers
```
(No authentication required)
```

#### URL Parameters
- `id` - Tutor user ID (UUID)

#### Success Response (200 OK)
```json
{
  "tutor": {
    "id": "tutor-uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "TUTOR",
    "createdAt": "2024-01-28T14:00:00.000Z",
    "tutorProfile": {
      "id": "profile-uuid",
      "bio": "Experienced math tutor with 10 years of experience",
      "skills": "Mathematics, Calculus, Algebra, Geometry",
      "hourlyRate": 50.0,
      "availability": "Mon-Fri 9am-5pm",
      "rating": 4.5
    }
  }
}
```

#### Error Responses
- **404 Not Found** - Tutor not found:
```json
{
  "error": "Tutor not found"
}
```

#### cURL Example
```bash
curl -X GET http://localhost:3000/api/tutors/tutor-uuid-here
```

#### Test Scenarios
- [ ] ✅ Valid tutor ID
- [ ] ✅ Tutor with profile
- [ ] ✅ Tutor without profile
- [ ] ❌ Invalid UUID format
- [ ] ❌ Non-existent tutor ID
- [ ] ❌ User ID that is not a tutor (should return 404)
- [ ] ✅ Verify password never returned

---

## 📅 Booking Endpoints (Protected)

### 6. Create Booking
**POST** `/api/bookings`

#### Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```json
{
  "tutorId": "tutor-uuid-here",
  "dateTime": "2024-02-15T14:00:00.000Z"
}
```

#### Success Response (201 Created)
```json
{
  "booking": {
    "id": "booking-uuid",
    "studentId": "student-uuid",
    "tutorId": "tutor-uuid",
    "dateTime": "2024-02-15T14:00:00.000Z",
    "status": "PENDING",
    "createdAt": "2024-01-28T14:00:00.000Z",
    "student": {
      "id": "student-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "tutor": {
      "id": "tutor-uuid",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  }
}
```

#### Error Responses
- **400 Bad Request** - Missing fields:
```json
{
  "error": "Tutor ID and date/time are required"
}
```

- **400 Bad Request** - Self-booking:
```json
{
  "error": "Cannot book yourself"
}
```

- **401 Unauthorized** - Missing/invalid token:
```json
{
  "error": "Authorization token required"
}
```

- **404 Not Found** - Tutor not found:
```json
{
  "error": "Tutor not found"
}
```

#### cURL Example
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tutorId": "tutor-uuid-here",
    "dateTime": "2024-02-15T14:00:00.000Z"
  }'
```

#### Test Scenarios
- [ ] ✅ Valid booking (student books tutor)
- [ ] ❌ Missing tutorId
- [ ] ❌ Missing dateTime
- [ ] ❌ Invalid tutorId (not a tutor)
- [ ] ❌ Non-existent tutorId
- [ ] ❌ Self-booking (studentId === tutorId)
- [ ] ❌ Missing Authorization header
- [ ] ❌ Invalid token
- [ ] ❌ Invalid dateTime format

---

### 7. Get My Bookings
**GET** `/api/bookings/my`

#### Request Headers
```
Authorization: Bearer <token>
```

#### Success Response - Student (200 OK)
```json
{
  "bookings": [
    {
      "id": "booking-uuid-1",
      "studentId": "student-uuid",
      "tutorId": "tutor-uuid",
      "dateTime": "2024-02-15T14:00:00.000Z",
      "status": "PENDING",
      "createdAt": "2024-01-28T14:00:00.000Z",
      "tutor": {
        "id": "tutor-uuid",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "tutorProfile": {
          "bio": "Experienced tutor",
          "skills": "Math, Science",
          "hourlyRate": 50.0,
          "rating": 4.5
        }
      }
    }
  ]
}
```

#### Success Response - Tutor (200 OK)
```json
{
  "bookings": [
    {
      "id": "booking-uuid-1",
      "studentId": "student-uuid",
      "tutorId": "tutor-uuid",
      "dateTime": "2024-02-15T14:00:00.000Z",
      "status": "PENDING",
      "createdAt": "2024-01-28T14:00:00.000Z",
      "student": {
        "id": "student-uuid",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

#### Success Response - Admin (200 OK)
```json
{
  "bookings": [
    {
      "id": "booking-uuid-1",
      "studentId": "student-uuid",
      "tutorId": "tutor-uuid",
      "dateTime": "2024-02-15T14:00:00.000Z",
      "status": "PENDING",
      "createdAt": "2024-01-28T14:00:00.000Z",
      "student": {
        "id": "student-uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "tutor": {
        "id": "tutor-uuid",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "tutorProfile": {
          "bio": "Experienced tutor",
          "skills": "Math, Science",
          "hourlyRate": 50.0,
          "rating": 4.5
        }
      }
    }
  ]
}
```

#### Empty Response (200 OK)
```json
{
  "bookings": []
}
```

#### Error Responses
- **401 Unauthorized** - Missing/invalid token:
```json
{
  "error": "Authorization token required"
}
```

#### cURL Example
```bash
curl -X GET http://localhost:3000/api/bookings/my \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Test Scenarios
- [ ] ✅ Student sees their bookings (as student)
- [ ] ✅ Tutor sees their bookings (as tutor)
- [ ] ✅ Admin sees all bookings
- [ ] ✅ Empty bookings list
- [ ] ❌ Missing Authorization header
- [ ] ❌ Invalid token
- [ ] ✅ Verify bookings ordered by dateTime (desc)

---

## ⭐ Review Endpoints

### 8. Create Review
**POST** `/api/reviews`

#### Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body (with comment)
```json
{
  "tutorId": "tutor-uuid-here",
  "rating": 5,
  "comment": "Excellent tutor! Very patient and knowledgeable."
}
```

#### Request Body (without comment)
```json
{
  "tutorId": "tutor-uuid-here",
  "rating": 4
}
```

#### Success Response (201 Created)
```json
{
  "review": {
    "id": "review-uuid",
    "studentId": "student-uuid",
    "tutorId": "tutor-uuid",
    "rating": 5,
    "comment": "Excellent tutor! Very patient and knowledgeable.",
    "createdAt": "2024-01-28T14:00:00.000Z",
    "student": {
      "id": "student-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Error Responses
- **400 Bad Request** - Missing fields:
```json
{
  "error": "Tutor ID and rating are required"
}
```

- **400 Bad Request** - Invalid rating:
```json
{
  "error": "Rating must be an integer between 1 and 5"
}
```

- **400 Bad Request** - Self-review:
```json
{
  "error": "Cannot review yourself"
}
```

- **400 Bad Request** - Duplicate review:
```json
{
  "error": "You have already reviewed this tutor"
}
```

- **401 Unauthorized** - Missing/invalid token:
```json
{
  "error": "Authorization token required"
}
```

- **404 Not Found** - Tutor not found:
```json
{
  "error": "Tutor not found"
}
```

#### cURL Example
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tutorId": "tutor-uuid-here",
    "rating": 5,
    "comment": "Great tutor!"
  }'
```

#### Test Scenarios
- [ ] ✅ Valid review (with comment)
- [ ] ✅ Valid review (without comment)
- [ ] ❌ Missing tutorId
- [ ] ❌ Missing rating
- [ ] ❌ Rating < 1
- [ ] ❌ Rating > 5
- [ ] ❌ Rating not integer (e.g., 4.5)
- [ ] ❌ Self-review
- [ ] ❌ Duplicate review (same student, same tutor)
- [ ] ❌ Invalid tutorId
- [ ] ❌ Non-existent tutorId
- [ ] ❌ Missing Authorization header
- [ ] ❌ Invalid token
- [ ] ✅ Verify tutor rating updated after review

---

### 9. Get Tutor Reviews
**GET** `/api/reviews/tutor/:id`

#### Request Headers
```
(No authentication required)
```

#### URL Parameters
- `id` - Tutor user ID (UUID)

#### Success Response (200 OK)
```json
{
  "reviews": [
    {
      "id": "review-uuid-1",
      "studentId": "student-uuid-1",
      "tutorId": "tutor-uuid",
      "rating": 5,
      "comment": "Excellent tutor!",
      "createdAt": "2024-01-28T14:00:00.000Z",
      "student": {
        "id": "student-uuid-1",
        "name": "John Doe",
        "email": "john@example.com"
      }
    },
    {
      "id": "review-uuid-2",
      "studentId": "student-uuid-2",
      "tutorId": "tutor-uuid",
      "rating": 4,
      "comment": "Very helpful",
      "createdAt": "2024-01-27T10:00:00.000Z",
      "student": {
        "id": "student-uuid-2",
        "name": "Jane Student",
        "email": "jane@example.com"
      }
    }
  ],
  "averageRating": 4.5,
  "totalReviews": 2
}
```

#### Empty Response (200 OK)
```json
{
  "reviews": [],
  "averageRating": 0,
  "totalReviews": 0
}
```

#### Error Responses
- **404 Not Found** - Tutor not found:
```json
{
  "error": "Tutor not found"
}
```

#### cURL Example
```bash
curl -X GET http://localhost:3000/api/reviews/tutor/tutor-uuid-here
```

#### Test Scenarios
- [ ] ✅ Get reviews for valid tutor
- [ ] ✅ Empty reviews list
- [ ] ✅ Verify averageRating calculation
- [ ] ✅ Verify totalReviews count
- [ ] ✅ Verify reviews ordered by createdAt (desc)
- [ ] ❌ Invalid tutorId
- [ ] ❌ Non-existent tutorId
- [ ] ❌ User ID that is not a tutor

---

## 🧪 Complete Test Flow

### Recommended Test Sequence

1. **Setup**
   - [ ] Register a student user
   - [ ] Register a tutor user
   - [ ] Login as student (save token)
   - [ ] Login as tutor (save token)

2. **Tutor Profile Setup** (if needed)
   - [ ] Create tutor profile via database or future endpoint

3. **Booking Flow**
   - [ ] Student books tutor
   - [ ] Get student's bookings
   - [ ] Get tutor's bookings (login as tutor)

4. **Review Flow**
   - [ ] Student reviews tutor
   - [ ] Get tutor reviews
   - [ ] Verify tutor rating updated
   - [ ] Try duplicate review (should fail)

5. **Edge Cases**
   - [ ] Test all error scenarios
   - [ ] Test authentication failures
   - [ ] Test validation errors

---

## 📝 Postman Collection Variables

Create these variables in your Postman environment:

```
baseUrl: http://localhost:3000
studentToken: (set after student login)
tutorToken: (set after tutor login)
adminToken: (set after admin login)
studentId: (set after student registration)
tutorId: (set after tutor registration)
```

---

## 🔍 Response Format Standards

### Success Responses
- Always include `success: true` (if using response helper)
- Data wrapped in appropriate keys (`user`, `tutor`, `booking`, `review`, etc.)
- Never include password fields

### Error Responses
- Always include `success: false` (if using error handler)
- Error message in `error` field
- Appropriate HTTP status codes

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚨 Common Issues & Solutions

### Issue: "Authorization token required"
**Solution**: Add `Authorization: Bearer <token>` header

### Issue: "Invalid token"
**Solution**: Token may be expired or malformed. Re-login to get new token.

### Issue: "Tutor not found"
**Solution**: Verify the user ID is actually a tutor (role = TUTOR)

### Issue: "Cannot book yourself"
**Solution**: Ensure studentId and tutorId are different

### Issue: "You have already reviewed this tutor"
**Solution**: Each student can only review a tutor once

---

## 📊 Testing Checklist Summary

- [ ] **Authentication** (3 endpoints)
  - [ ] Register
  - [ ] Login
  - [ ] Get Me

- [ ] **Tutors** (2 endpoints)
  - [ ] List Tutors
  - [ ] Get Tutor Details

- [ ] **Bookings** (2 endpoints)
  - [ ] Create Booking
  - [ ] Get My Bookings

- [ ] **Reviews** (2 endpoints)
  - [ ] Create Review
  - [ ] Get Tutor Reviews

**Total: 9 endpoints to test**

---

*Last Updated: 2024-01-28*
*API Version: 1.0*
