# Hari-Saurabh Hostel Management System

A modern, high-performance web platform built for **Hari-Saurabh Hostel** administration, floor leader workflows, student directory management, and automated birthday celebrations via WhatsApp Cloud API.

---

## 🚀 Technology Stack

### Frontend (GitHub Pages Ready)
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom Luxury Light Theme Design System
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Router**: HashRouter (Zero 404s on GitHub Pages direct refreshes)
- **State & Context**: React Context API (`AuthContext`, `StudentContext`, `NotificationContext`)
- **API Client**: Universal Fetch Client with Render backend configuration & mock fallback

### Backend (Render Ready)
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL on Supabase (with Row Level Security)
- **Scheduler**: APScheduler for Birthday 24h/6h reminders and 9:00 AM WhatsApp auto-greetings
- **WhatsApp**: Meta WhatsApp Cloud API

---

## 🎨 Branding & Color Palette

- **Primary Gold**: `#E6A23C` (Buttons, key actions, active states)
- **Secondary Gold**: `#F2C46D` (Accents, cards, borders)
- **Dark Gray**: `#4A4A4A` (Typography, navigation)
- **Background**: `#F7F8FA` (Clean light-theme canvas)
- **Card Radius**: `24px` / `28px`

---

## 📂 Project Structure

```bash
hostel/
├── .github/
│   └── workflows/
│       └── deploy.yml             # Automated GitHub Actions deployment to Pages
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
│   ├── vite.config.js             # Base relative path for GitHub Pages
│   ├── tailwind.config.js
│   └── .env.example
├── package.json
└── README.md
```

---

## 🌐 How to Enable GitHub Pages in Repository Settings

The automated deployment workflow is already committed at [`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml).

To activate it:
1. Go to your repository on GitHub: **[https://github.com/shrey-1802/hari-shaurab-hostel](https://github.com/shrey-1802/hari-shaurab-hostel)**
2. Click on **Settings** (top right tab).
3. In the left sidebar, click on **Pages**.
4. Under **Build and deployment** ➔ **Source**:
   - Select **GitHub Actions** (instead of Deploy from a branch).
5. That's it! GitHub Actions will automatically build the `frontend` and publish your live website to:
   👉 **`https://shrey-1802.github.io/hari-shaurab-hostel/`**

---

## ⚡ Connecting to Render Backend

1. Deploy your FastAPI backend to [Render.com](https://render.com).
2. Copy your Render web service URL (e.g., `https://hari-saurabh-backend.onrender.com/api`).
3. Set `VITE_API_BASE_URL` in `frontend/.env`.
4. The frontend API client automatically passes JWT Bearer tokens and connects directly to your live endpoints!
