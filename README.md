# Hari-Saurabh Hostel Management System

A modern, high-performance web platform built for **Hari-Saurabh Hostel** administration, floor leader workflows, student directory management, and automated birthday celebrations via WhatsApp Cloud API.

---

## 🚀 Technology Stack

### Frontend (Vercel Ready)
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom Design System
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State & Context**: React Context API (`AuthContext`, `StudentContext`, `NotificationContext`)
- **API Client**: Universal Fetch Client with Render backend configuration & mock fallback

### Backend (Render Ready)
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL on Supabase (with Row Level Security)
- **Scheduler**: APScheduler for Birthday 24h/6h reminders and 9:00 AM WhatsApp auto-greetings
- **WhatsApp**: Meta WhatsApp Cloud API

---

## 🎨 Branding & Color Palette

- **Primary Gold**: `#E6A23C` (Buttons, highlights, active states)
- **Secondary Gold**: `#F2C46D` (Accents, cards, borders)
- **Dark Gray**: `#4A4A4A` (Typography, icons)
- **Background**: `#F7F8FA` (Clean light-theme canvas)
- **Card Radius**: `24px` / `28px`

---

## 📂 Project Structure

```bash
hostel/
├── frontend/
│   ├── public/
│   │   ├── logo.png               # Hari-Saurabh Hostel brand logo
│   │   └── favicon.png
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/                # AnimatedLogo, Button, Input, Card, Badge, Modal, Toast
│   │   │   └── layout/            # Navbar, Sidebar, Footer, DashboardLayout
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx    # Hero with animated logo, quick login, features & preview
│   │   │   ├── auth/              # Login, ForgotPassword
│   │   │   ├── dashboard/         # MainLeaderDashboard, WingLeaderDashboard
│   │   │   ├── students/          # StudentList, StudentCard (320x420px), Profile, Add, Edit
│   │   │   ├── birthdays/         # BirthdayDashboard & 24h/6h automations
│   │   │   ├── notifications/     # NotificationCenter
│   │   │   └── settings/          # Render backend link & status tester
│   │   ├── context/               # AuthContext, StudentContext, NotificationContext
│   │   ├── services/              # api.js, authService, studentService, birthdayService
│   │   ├── routes/                # AppRoutes, ProtectedRoute, RoleRoute
│   │   ├── utils/                 # constants.js, helpers.js
│   │   ├── styles/                # globals.css, animations.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json                # Vercel SPA routing configuration
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── vercel.json                    # Root build configuration
└── README.md
```

---

## 🌐 Deploying Frontend on Vercel

1. Push your repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com):
   - Click **Add New Project** and select your repository.
   - Set **Root Directory** to `frontend` (or keep root with included root `vercel.json`).
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-name.onrender.com/api`
4. Click **Deploy**.

---

## ⚡ Connecting to Render Backend

1. Deploy your FastAPI backend to [Render.com](https://render.com).
2. Copy your Render web service URL (e.g., `https://hari-saurabh-backend.onrender.com/api`).
3. Set `VITE_API_BASE_URL` in `frontend/.env` (or Vercel environment variables).
4. The frontend API client automatically passes JWT Bearer tokens and connects directly to your live endpoints!
