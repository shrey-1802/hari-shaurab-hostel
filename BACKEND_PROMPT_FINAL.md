# PROJECT

Build a production-ready Hostel Administration Management System for Hari-Saurabh Hostel.

Use:

Backend:
- FastAPI
- Python 3.12+

Database:
- Supabase PostgreSQL

Authentication:
- JWT Authentication

ORM:
- SQLAlchemy

Migration:
- Alembic

Scheduling:
- APScheduler

Storage:
- Supabase Storage

Architecture:
- Service Layer Architecture
- Repository Pattern
- Modular Structure

Generate complete production-ready code.

---

# IMPORTANT REQUIREMENTS

DO NOT IMPLEMENT:

❌ Automatic WhatsApp Messages

❌ Twilio Integration

❌ WhatsApp Cloud API

❌ Auto Birthday Greetings

---

IMPLEMENT:

✅ Birthday Alert System

✅ In-App Notifications

✅ Browser Push Notifications

✅ Manual WhatsApp Redirect

---

# BUSINESS OVERVIEW

The hostel has:

2 Main Leaders

4 Wing Leaders

Wing Leaders are assigned floors.

Example:

4th Floor

- Wing Leader 1
- Wing Leader 2

6th Floor

- Wing Leader 3
- Wing Leader 4

Wing Leaders should only access students from their assigned floor.

Main Leaders can access all floors.

---

# USER ROLES

## MAIN_LEADER

Permissions:

- View all students
- Create students
- Edit students
- Delete students
- View all floors
- View reports
- Receive birthday alerts
- Manage notifications

---

## WING_LEADER

Permissions:

- Create student profiles
- View assigned floor students
- Edit assigned floor students
- Receive birthday alerts

Restrictions:

- Cannot access other floors
- Cannot delete students outside floor
- Cannot access leader management

---

# STUDENT PROFILE

Store the following fields:

Profile Picture

Full Name

Date Of Birth

Student Number

Student Mobile Number

Parent Name

Parent Mobile Number

College Name

Department

Semester Result

Hobby

Hostel Friends

Non Hostel Friends

Floor Number

Room Number

Created By

Created At

Updated At

---

# AUTHENTICATION

Implement:

JWT Authentication

Refresh Tokens

Password Hashing using bcrypt

Role Based Access Control

Protected APIs

Middleware Authentication

Middleware Authorization

Generate:

- Login
- Logout
- Refresh Token
- Password Reset

---

# FLOOR BASED ACCESS CONTROL

IMPORTANT

Main Leader:

Can access every floor.

Wing Leader:

Can only access assigned floor.

Example:

Wing Leader Assigned Floor = 4

Can View:

students.floor_number = 4

Cannot View:

students.floor_number = 6

Implement at:

- API Layer
- Service Layer
- Database Layer

Use Supabase RLS.

---

# STUDENT MANAGEMENT

Generate complete CRUD.

Create Student

View Student

Update Student

Delete Student

Search Student

Filter Student

Sort Student

Support:

- Pagination
- Filtering
- Search

Search By:

- Full Name
- Room Number
- Student Number

Filter By:

- Floor
- Department

---

# PROFILE IMAGE UPLOAD

Use:

Supabase Storage

Bucket:

student-profiles

Allowed:

JPG

PNG

WEBP

Maximum:

5MB

Generate upload service.

---

# BIRTHDAY ALERT SYSTEM

IMPORTANT

The system should NEVER send WhatsApp messages automatically.

The system only sends alerts to leaders.

---

# ALERT TYPES

## Tomorrow Birthday

Trigger:

1 Day Before Birthday

Notification Example:

🎂 Birthday Reminder

Rahul Patel's birthday is tomorrow.

Room 602

Floor 6

---

## Birthday Today

Notification Example:

🎂 Birthday Today

Today is Rahul Patel's birthday.

---

# RECIPIENTS

Main Leaders

Assigned Wing Leaders

---

# APSCHEDULER

Generate Scheduler.

Run:

Every Hour

Check:

- Tomorrow Birthdays
- Today's Birthdays

Create:

Notification Records

Push Notification Events

Do NOT send WhatsApp messages.

---

# NOTIFICATION CENTER

Generate complete notification module.

Notification Types:

BIRTHDAY_TOMORROW

BIRTHDAY_TODAY

NEW_STUDENT

SYSTEM_NOTIFICATION

Features:

Unread Count

Mark Read

Mark All Read

Delete Notification

Notification History

---

# BROWSER PUSH NOTIFICATIONS

Implement support for:

Chrome

Edge

Firefox

Store Browser Subscription.

Create:

browser_subscriptions table

Generate:

PushNotificationService

Example Notification:

Title:

Birthday Reminder

Body:

Rahul Patel birthday tomorrow.

Action:

Open Student Profile

---

# MANUAL WHATSAPP WISH FLOW

Backend DOES NOT send messages.

Backend only stores student mobile number.

Frontend button:

Wish On WhatsApp

Frontend opens:

https://wa.me/{student_mobile}

Example:

https://wa.me/919876543210

Leader sends wishes manually.

---

# DASHBOARD

## MAIN LEADER DASHBOARD

Generate APIs for:

Total Students

Students By Floor

Upcoming Birthdays

Recent Students

Unread Notifications

Birthday Statistics

---

## WING LEADER DASHBOARD

Generate APIs for:

Assigned Floor Students

Upcoming Birthdays

Unread Notifications

Recent Students

---

# DATABASE TABLES

Generate:

users

students

student_documents

notifications

birthday_logs

browser_subscriptions

audit_logs

---

# AUDIT LOGS

Track:

Login

Logout

Create Student

Update Student

Delete Student

Notification Read

Store:

User

Action

Description

Timestamp

---

# API ENDPOINTS

AUTH

POST /auth/login

POST /auth/logout

POST /auth/refresh

POST /auth/forgot-password

---

STUDENTS

GET /students

GET /students/{id}

POST /students

PUT /students/{id}

DELETE /students/{id}

---

BIRTHDAYS

GET /birthdays/today

GET /birthdays/tomorrow

GET /birthdays/upcoming

---

NOTIFICATIONS

GET /notifications

PATCH /notifications/{id}/read

PATCH /notifications/read-all

DELETE /notifications/{id}

GET /notifications/unread-count

---

DASHBOARD

GET /dashboard/main-leader

GET /dashboard/wing-leader

---

# SECURITY

Generate:

JWT Security

Password Hashing

RBAC

RLS

Input Validation

Rate Limiting

CORS

Error Handling

Audit Logs

---

# SUPABASE RLS

Main Leader:

Full Student Access

Wing Leader:

Only Assigned Floor Access

Notifications:

Only Recipient Can View

Generate all SQL policies.

---

# OUTPUT REQUIRED

Generate:

1. Folder Structure

2. Database Models

3. Pydantic Schemas

4. API Routes

5. Services

6. Repositories

7. Middleware

8. Scheduler

9. Notification Engine

10. Browser Push Service

11. Supabase SQL Schema

12. Supabase RLS Policies

13. Docker Configuration

14. Environment Variables

15. Deployment Guide

Code must be production ready and scalable.