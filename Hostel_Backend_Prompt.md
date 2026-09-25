# Hari-Saurabh Hostel Management System
## Backend Development Prompt

### Tech Stack
- FastAPI
- PostgreSQL (Supabase)
- SQLAlchemy
- Alembic
- JWT Authentication
- APScheduler
- WhatsApp Cloud API

## Roles

### MAIN_LEADER
- Full access

### WING_LEADER
- Assigned floor access only

## Database Tables

### users
- id
- name
- email
- password_hash
- role
- assigned_floor

### students
- id
- profile_image_url
- full_name
- dob
- student_mobile
- parent_name
- parent_mobile
- college_name
- department
- semester_result
- hobby
- hostel_friends
- non_hostel_friends
- floor_number
- room_number

### notifications
### birthday_logs

## Features

### Birthday Alerts
- 1 day before birthday
- 6 hours before birthday
- Notify leaders

### WhatsApp Greetings
- Auto send at 9:00 AM
- Delivery logs

## APIs

POST /auth/login
POST /auth/register

GET /students
POST /students
PUT /students/{id}
DELETE /students/{id}

GET /birthdays/today
GET /birthdays/upcoming

GET /notifications

GET /dashboard/stats

## Security
- JWT
- bcrypt
- RBAC
- Floor restrictions

## Deployment
- Backend: Railway/Render
- Database: Supabase
- Storage: Supabase Storage
