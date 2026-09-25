# DATABASE_SCHEMA.md
# Hari-Saurabh Hostel Management System
## Detailed Supabase Database Schema

---

# Database Overview

Database: PostgreSQL (Supabase)

Features:
- Role-Based Access Control (RBAC)
- Floor-Based Student Access
- Birthday Automation
- WhatsApp Notifications
- Audit Logging
- Supabase Storage Integration

---

# ENUMS

## user_role

```sql
CREATE TYPE user_role AS ENUM (
  'MAIN_LEADER',
  'WING_LEADER'
);
```

## notification_type

```sql
CREATE TYPE notification_type AS ENUM (
  'BIRTHDAY_REMINDER',
  'BIRTHDAY_GREETING',
  'SYSTEM_ALERT',
  'NEW_STUDENT'
);
```

---

# TABLE: users

Stores leaders and wing leaders.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    assigned_floor INTEGER,
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

Rules:
- MAIN_LEADER can view all floors.
- WING_LEADER only sees assigned floor.

---

# TABLE: students

Main student profile table.

```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_image_url TEXT,

    full_name VARCHAR(200) NOT NULL,

    dob DATE NOT NULL,

    student_mobile VARCHAR(20),

    parent_name VARCHAR(200),

    parent_mobile VARCHAR(20),

    college_name VARCHAR(255),

    department VARCHAR(150),

    semester_result VARCHAR(100),

    hobby TEXT,

    hostel_friends TEXT,

    non_hostel_friends TEXT,

    floor_number INTEGER NOT NULL,

    room_number VARCHAR(20),

    whatsapp_number VARCHAR(20),

    created_by UUID REFERENCES users(id),

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# TABLE: student_documents

Store uploaded documents.

```sql
CREATE TABLE student_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID REFERENCES students(id) ON DELETE CASCADE,

    document_name VARCHAR(255),

    document_url TEXT,

    uploaded_at TIMESTAMP DEFAULT NOW()
);
```

Examples:
- Aadhaar
- College ID
- Semester Result PDF

---

# TABLE: notifications

Stores system notifications.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID REFERENCES students(id),

    recipient_user_id UUID REFERENCES users(id),

    notification_type notification_type,

    title VARCHAR(255),

    message TEXT,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW()
);
```

---

# TABLE: birthday_logs

Tracks birthday reminders and greetings.

```sql
CREATE TABLE birthday_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID REFERENCES students(id),

    reminder_type VARCHAR(50),

    reminder_sent BOOLEAN DEFAULT FALSE,

    greeting_sent BOOLEAN DEFAULT FALSE,

    sent_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()
);
```

Reminder Types:
- 24_HOUR_REMINDER
- 6_HOUR_REMINDER
- BIRTHDAY_GREETING

---

# TABLE: whatsapp_logs

Tracks WhatsApp messages.

```sql
CREATE TABLE whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID REFERENCES students(id),

    phone_number VARCHAR(20),

    message_body TEXT,

    status VARCHAR(50),

    provider_message_id TEXT,

    sent_at TIMESTAMP DEFAULT NOW()
);
```

Status:
- SENT
- FAILED
- DELIVERED
- READ

---

# TABLE: audit_logs

Tracks every important action.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id),

    action VARCHAR(100),

    target_type VARCHAR(100),

    target_id UUID,

    description TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);
```

Examples:
- CREATE_STUDENT
- UPDATE_STUDENT
- DELETE_STUDENT

---

# TABLE: floor_assignments

Optional future scalability table.

```sql
CREATE TABLE floor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    floor_number INTEGER NOT NULL,

    wing_leader_id UUID REFERENCES users(id),

    created_at TIMESTAMP DEFAULT NOW()
);
```

---

# STORAGE BUCKETS

## student-profiles

Purpose:
- Profile photos

Folder Structure:

student-profiles/
  student-id/profile.jpg

## student-documents

Purpose:
- PDFs
- ID cards
- Result sheets

---

# INDEXES

```sql
CREATE INDEX idx_students_floor
ON students(floor_number);

CREATE INDEX idx_students_dob
ON students(dob);

CREATE INDEX idx_notifications_user
ON notifications(recipient_user_id);

CREATE INDEX idx_birthday_logs_student
ON birthday_logs(student_id);
```

---

# ROW LEVEL SECURITY (RLS)

MAIN_LEADER:
- Full access

WING_LEADER:
- Access only assigned floor students

Example Policy:

```sql
SELECT *
FROM students
WHERE floor_number = assigned_floor;
```

---

# DASHBOARD QUERIES

Total Students

```sql
SELECT COUNT(*)
FROM students;
```

Students By Floor

```sql
SELECT floor_number, COUNT(*)
FROM students
GROUP BY floor_number;
```

Upcoming Birthdays

```sql
SELECT *
FROM students
WHERE EXTRACT(MONTH FROM dob)=EXTRACT(MONTH FROM CURRENT_DATE);
```

---

# FUTURE MODULES

- Hostel Fees
- Attendance
- Visitor Management
- Complaint Management
- Room Allocation
- Leave Requests
- QR Student ID Cards
- Event Management
- Emergency Contacts

---

# Recommended Supabase Structure

Authentication:
- Supabase Auth

Database:
- PostgreSQL

Storage:
- student-profiles
- student-documents

Realtime:
- Notifications
- Birthday Alerts

Edge Functions:
- WhatsApp Scheduler
- Birthday Reminder Jobs

