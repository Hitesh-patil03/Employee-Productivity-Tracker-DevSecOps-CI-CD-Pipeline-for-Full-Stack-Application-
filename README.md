# Produx — Employee Productivity Tracker

A full-stack 3-tier web application built using **React, Node.js/Express, and MongoDB** to monitor and analyze employee productivity.

---

##  Features

* **Admin Panel**

  * Create employees and assign credentials
  * Assign tasks with deadlines
  * Monitor productivity metrics

* **Employee Dashboard**

  * Login with admin-provided credentials
  * Track tasks with timers
  * View progress and performance

* **Analytics**

  * Interactive charts and KPIs
  * Department-wise performance insights

* **Authentication**

  * Secure JWT-based authentication
  * Role-based access control (Admin / Employee)

---

##  Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/produx-tracker.git
cd produx-tracker
```

---

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 3. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

 **Important:** Never commit `.env` file to GitHub.

---

### 4. Seed Database

```bash
cd backend
npm run seed
```

---

### 5. Run Application

```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 3000)
cd frontend
npm start
```

---

##  Default Login

* **Admin**
  Email: `admin@produx.io`
  Password: `Admin@123`

* **Employees**
  Created and managed by admin

---

##  Project Structure

```
produx-tracker/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── hooks/
        ├── pages/
        ├── styles/
        └── utils/
```

---

##  Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Frontend | React 18, React Router, Chart.js, Axios |
| Backend  | Node.js, Express.js                     |
| Database | MongoDB Atlas, Mongoose                 |
| Auth     | JWT, bcryptjs                           |

---

##  Security Notes

* Secrets are managed via `.env` (not committed)
* Docker and CI/CD pipelines use environment variables
* Integrated DevSecOps pipeline:

  * Code quality checks
  * Secret scanning (Gitleaks)
  * Dependency scanning
  * Docker image scanning (Trivy)

---

##  Deployment

* Dockerized frontend & backend
* CI/CD using GitHub Actions
* Deployed on AWS EC2 using Docker Compose

---

##  Author

Hitesh Patil
Aspiring DevOps Engineer 
