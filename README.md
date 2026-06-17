# Produx — Employee Productivity Tracker

A full 3-tier web application: React + Node.js/Express + MongoDB.

## Features
- **Admin**: Create employees, assign credentials, assign tasks with time limits
- **Employee**: Login with admin-issued credentials, run task timers, track progress
- **Analytics**: Charts, KPIs, department breakdowns
- **JWT Auth**: Role-based access control

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/produx-tracker.git
cd produx-tracker

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure Environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and JWT secret
```

### 3. Seed the Database
```bash
cd backend
npm run seed
```

### 4. Run Development
```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm start
```

### 5. Login
- **Admin**: `admin@produx.io` / `Admin@123`
- **Employees**: Created by admin in the app (admin shares credentials)

## Project Structure
```
produx-tracker/
├── backend/
│   ├── config/         # DB connection, constants
│   ├── controllers/    # Route logic
│   ├── middleware/     # Auth, error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── seed.js         # Database seeder
│   └── server.js       # Entry point
└── frontend/
    └── src/
        ├── components/ # Reusable UI components
        │   ├── admin/  # Admin-only components
        │   ├── employee/ # Employee-only components
        │   └── shared/ # Shared UI
        ├── context/    # Auth context
        ├── hooks/      # Custom hooks
        ├── pages/      # Route pages
        ├── styles/     # Global CSS
        └── utils/      # API client, helpers
```

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18, React Router v6, Chart.js, Axios |
| Backend | Node.js, Express.js, JWT, bcryptjs |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (access token in memory, refresh in httpOnly cookie) |
