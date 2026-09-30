# Hari-Saurabh Hostel — Backend API

Production-ready FastAPI backend for the Hostel Administration Management System.

## Tech Stack

| Component     | Technology              |
|---------------|-------------------------|
| Framework     | FastAPI                 |
| Language      | Python 3.12+            |
| Database      | Supabase PostgreSQL     |
| ORM           | SQLAlchemy (async)      |
| Migrations    | Alembic                 |
| Auth          | JWT (python-jose)       |
| Scheduler     | APScheduler             |
| Push          | pywebpush (VAPID)       |
| Storage       | Supabase Storage        |
| Rate Limiting | slowapi                 |
| Logging       | loguru                  |

## Quick Start

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
copy .env.example .env
# Edit .env with your Supabase credentials
```

### 4. Set Up Database

Run the SQL schema in your Supabase SQL Editor:

1. Open `sql/schema.sql` → Execute in Supabase SQL Editor
2. Open `sql/rls_policies.sql` → Execute in Supabase SQL Editor
3. Create storage bucket `student-profiles` in Supabase Dashboard

### 5. Run Migrations (for future schema changes)

```bash
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

### 6. Seed Initial Users

```bash
python -m app.scripts.seed_users
```

Default credentials:

| Email                    | Password    | Role        | Floor |
|--------------------------|-------------|-------------|-------|
| mainleader1@hostel.com   | Leader@123  | MAIN_LEADER | —     |
| mainleader2@hostel.com   | Leader@123  | MAIN_LEADER | —     |
| wing4a@hostel.com        | Wing@1234   | WING_LEADER | 4     |
| wing4b@hostel.com        | Wing@1234   | WING_LEADER | 4     |
| wing6a@hostel.com        | Wing@1234   | WING_LEADER | 6     |
| wing6b@hostel.com        | Wing@1234   | WING_LEADER | 6     |

### 7. Run Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## API Endpoints

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/forgot-password`

### Students
- `GET    /api/v1/students`
- `GET    /api/v1/students/{id}`
- `POST   /api/v1/students`
- `PUT    /api/v1/students/{id}`
- `DELETE /api/v1/students/{id}`
- `POST   /api/v1/students/{id}/upload-photo`

### Birthdays
- `GET /api/v1/birthdays/today`
- `GET /api/v1/birthdays/tomorrow`
- `GET /api/v1/birthdays/upcoming`

### Notifications
- `GET    /api/v1/notifications`
- `GET    /api/v1/notifications/unread-count`
- `PATCH  /api/v1/notifications/{id}/read`
- `PATCH  /api/v1/notifications/read-all`
- `DELETE /api/v1/notifications/{id}`

### Dashboard
- `GET /api/v1/dashboard/main-leader`
- `GET /api/v1/dashboard/wing-leader`

### Push Notifications
- `GET  /api/v1/push/vapid-public-key`
- `POST /api/v1/push/subscribe`
- `POST /api/v1/push/unsubscribe`
- `POST /api/v1/push/test`

### Health
- `GET /health`

## Docker Deployment

```bash
docker compose up -d --build
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── students.py
│   │   │   ├── birthdays.py
│   │   │   ├── notifications.py
│   │   │   ├── dashboard.py
│   │   │   └── push.py
│   │   └── __init__.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── enums.py
│   │   └── exceptions.py
│   ├── db/
│   │   ├── session.py
│   │   └── supabase_client.py
│   ├── middleware/
│   │   └── auth.py
│   ├── models/
│   │   ├── user.py
│   │   ├── student.py
│   │   ├── notification.py
│   │   ├── birthday_log.py
│   │   ├── audit_log.py
│   │   └── browser_subscription.py
│   ├── repositories/
│   │   ├── user_repository.py
│   │   ├── student_repository.py
│   │   ├── notification_repository.py
│   │   ├── birthday_log_repository.py
│   │   ├── audit_log_repository.py
│   │   └── browser_subscription_repository.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── auth.py
│   │   ├── student.py
│   │   ├── notification.py
│   │   └── dashboard.py
│   ├── scheduler/
│   │   └── birthday_scheduler.py
│   ├── scripts/
│   │   └── seed_users.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── student_service.py
│   │   ├── notification_service.py
│   │   ├── birthday_service.py
│   │   ├── dashboard_service.py
│   │   ├── storage_service.py
│   │   ├── push_notification_service.py
│   │   └── audit_service.py
│   └── main.py
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── sql/
│   ├── schema.sql
│   └── rls_policies.sql
├── alembic.ini
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── .env.example
└── README.md
```
