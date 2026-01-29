# SkillBridge API Reference

Base URL: `http://localhost:5001`

Authentication: Bearer JWT in `Authorization` header. Endpoints marked 🔒 require a valid token; role-guarded endpoints list required roles.

## Auth
- `POST /api/auth/register`  
  Body: `{ name, email, password, role? = "STUDENT" }`  
  Response: `{ success: true, token, user }`

- `POST /api/auth/login`  
  Body: `{ email, password }`  
  Response: `{ success: true, token, user }`

- `GET /api/auth/me` 🔒 any role  
  Response: `{ success: true, user: { id, name, email, role, tutorProfile? } }`  
  cURL: `curl -H "Authorization: Bearer $TOKEN" $BASE/api/auth/me`

## Bookings
- `POST /api/bookings` 🔒 role=STUDENT  
  Body: `{ tutorId, dateTime }` (ISO string)  
  Response: `{ success: true, booking }`

- `GET /api/bookings` 🔒 any role  
  Returns current user’s bookings (student → their bookings, tutor → their sessions, admin → all).  

- `GET /api/bookings/my` 🔒 role=STUDENT  
  Returns bookings for logged-in student.  
  cURL: `curl -H "Authorization: Bearer $TOKEN" $BASE/api/bookings/my`

- `GET /api/bookings/tutor` 🔒 role=TUTOR  
  Returns bookings for logged-in tutor.  
  cURL: `curl -H "Authorization: Bearer $TOKEN" $BASE/api/bookings/tutor`

- `GET /api/bookings/stats` 🔒 role=STUDENT  
  Returns counts: `{ stats: { upcoming, completed, cancelled } }`  
  cURL: `curl -H "Authorization: Bearer $TOKEN" $BASE/api/bookings/stats`

- `GET /api/bookings/:id` 🔒 any role (must be student/tutor on booking or admin)  
  Returns booking detail with student/tutor info.

Booking status enum: `UPCOMING | COMPLETED | CANCELLED | PENDING | CONFIRMED` (default is UPCOMING).

## Admin
- `GET /api/admin/stats` 🔒 role=ADMIN  
  Response: `{ success: true, stats: { totalUsers, totalTutors, totalStudents, totalBookings } }`  
  cURL: `curl -H "Authorization: Bearer $TOKEN" $BASE/api/admin/stats`

- `GET /api/admin/users` 🔒 role=ADMIN  
  Query optional: `role=ADMIN|TUTOR|STUDENT`  
  Response: `{ success: true, users: [{ id, name, email, role, createdAt, updatedAt, tutorProfile? }] }`  
  cURL: `curl -H "Authorization: Bearer $TOKEN" "$BASE/api/admin/users?role=TUTOR"`

- `GET /api/admin/bookings` 🔒 role=ADMIN  
  Returns all bookings with student and tutor info.  
  cURL: `curl -H "Authorization: Bearer $TOKEN" $BASE/api/admin/bookings`

- `GET /api/admin/categories` 🔒 role=ADMIN  
  Returns all categories (name, id, timestamps).  
  cURL: `curl -H "Authorization: Bearer $TOKEN" $BASE/api/admin/categories`

- `PATCH /api/admin/users/:id` 🔒 role=ADMIN  
  Body: `{ role: "ADMIN|TUTOR|STUDENT" }` (alias `status` accepted).  
  Updates user role/status.

## Tutors
- `GET /api/tutors` — list tutors with profiles; filters: `search`, `minRate`, `maxRate`, `minRating`.  
- `GET /api/tutors/:id` — tutor detail.  
- `GET /api/tutors/search?query=...` — search tutors.
- `PUT /api/tutor/profile` 🔒 role=TUTOR — update bio/skills/hourlyRate.  
- `PUT /api/tutor/availability` 🔒 role=TUTOR — update availability string.

## Categories
- `GET /api/categories` — public list of all categories.

## Reviews
- `POST /api/reviews` 🔒 role=STUDENT  
  Body: `{ tutorId, rating (1-5), comment? }`  
  Response: `{ success: true, review }`
- `GET /api/reviews/tutor/:tutorId` — list reviews for a tutor.

## Error format
Errors return appropriate HTTP status and `{ success: false, error: "message" }`.

## Quick test setup
```bash
export BASE=http://localhost:5001
export TOKEN=<your_jwt>
curl -H "Authorization: Bearer $TOKEN" $BASE/api/auth/me
curl -H "Authorization: Bearer $TOKEN" $BASE/api/bookings/my
curl -H "Authorization: Bearer $TOKEN" $BASE/api/bookings/tutor
curl -H "Authorization: Bearer $TOKEN" $BASE/api/bookings/stats
curl -H "Authorization: Bearer $TOKEN" $BASE/api/admin/stats
curl -H "Authorization: Bearer $TOKEN" $BASE/api/admin/users
```
