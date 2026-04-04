# ⚖️ Online Legal Aid Appointment Portal

> **Note:** This project has been migrated from a Django architecture to a modern **MERN (MongoDB, Express, React, Node.js)** Stack.

A production-ready web application that simplifies legal aid access for citizens and provides a comprehensive tracking dashboard for lawyers and administrators.

![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

---

## 📋 Table of Contents

1. [System Architecture](#-system-architecture)
2. [Features](#-features)
3. [User Roles & Permissions](#-user-roles--permissions)
4. [Database Design](#-database-design)
5. [Project Structure](#-project-structure)
6. [Installation Guide](#-installation-guide)
7. [Appointment Workflow](#-appointment-workflow)
8. [API Reference](#-api-reference)

---

## 🏗 System Architecture

This application follows a **modern MERN Architecture**:

```
┌──────────────────────────────────────────────┐
│              PRESENTATION LAYER              │
│       React + Vite + Modern CSS / UI         │
│  ─ Responsive SPA (Single Page Application)  │
│  ─ State Management & Context API            │
└──────────────────────┬───────────────────────┘
                       │ HTTP/HTTPS (REST API)
┌──────────────────────┴───────────────────────┐
│              APPLICATION LAYER               │
│             Node.js + Express.js             │
│  ─ Controllers, Routes, Middleware           │
│  ─ JWT Authentication & Authorization        │
│  ─ Business Logic & Workflow Engine          │
└──────────────────────┬───────────────────────┘
                       │ Mongoose (ODM)
┌──────────────────────┴───────────────────────┐
│                DATA LAYER                    │
│             MongoDB Database                 │
│  ─ Users, Lawyers, Appointments              │
│  ─ Categories, Documents                     │
│  ─ Referencing and Embeddings                │
└──────────────────────────────────────────────┘
```

---

## ✨ Features

### 👤 Citizen Features
- ✅ Register and login securely via JWT
- ✅ Browse verified lawyers by category, name, experience
- ✅ Book appointments with preferred date/time
- ✅ Select legal category for each appointment
- ✅ Track appointment status (Pending → Accepted → Completed)
- ✅ View full appointment history
- ✅ Cancel pending/accepted appointments

### ⚖️ Lawyer Features
- ✅ Dedicated lawyer dashboard
- ✅ View incoming appointment requests
- ✅ Accept or reject appointments
- ✅ Mark appointments as completed
- ✅ Update professional profile and availability

### 🔧 Admin Features
- ✅ System-wide analytics dashboard
- ✅ Manage all users (citizens, lawyers, admins)
- ✅ Verify/reject lawyer registrations
- ✅ Manage legal categories
- ✅ Monitor all appointments across the platform

---

## 👥 User Roles & Permissions

| Feature                    | Citizen | Lawyer | Admin |
|:---------------------------|:-------:|:------:|:-----:|
| Register / Login           |    ✅   |   ✅   |   ✅  |
| Browse Lawyers             |    ✅   |   ❌   |   ✅  |
| Book Appointment           |    ✅   |   ❌   |   ❌  |
| Accept/Reject Appointments |    ❌   |   ✅   |   ❌  |
| Lawyer Dashboard           |    ❌   |   ✅   |   ❌  |
| Admin Dashboard            |    ❌   |   ❌   |   ✅  |
| Verify Lawyers             |    ❌   |   ❌   |   ✅  |
| Manage Categories          |    ❌   |   ❌   |   ✅  |

---

## 🗄 Database Design (MongoDB via Mongoose)

### Collections

#### `users`
- Inherits core fields: `username`, `email`, `password` (hashed with bcrypt), `role` (`CITIZEN`, `LAWYER`, `ADMIN`)
- Includes citizen-specific details if registered as Citizen.

#### `lawyers_profiles`
- Created upon registering as a `LAWYER`.
- Includes `userId` (Ref: `User`), `barCouncilId`, `experience`, `consultationFee`, `bio`, `isVerified` (Boolean).

#### `categories`
- Pre-seeded legal categories (e.g., Family Law, Criminal Law).
- Used to tag appointments and lawyer specialties.

#### `appointments`
- Tied to `citizenId` (Ref: `User`) and `lawyerId` (Ref: `User`).
- Includes tracking status (`PENDING`, `ACCEPTED`, `COMPLETED`, `REJECTED`).
- Stores `date`, `time`, and `subject`.

---

## 📁 Project Structure

The project is split into a discrete client-server architecture:

```
legal-aid-portal/
├── client/                     # React Frontend (Vite)
│   ├── public/                 # Static assets
│   ├── src/                    
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Routing pages (Home, Login, Dashboard, etc.)
│   │   ├── context/            # React context for state management (Auth)
│   │   ├── App.jsx             # Root component
│   │   └── main.jsx            # Entry point
│   ├── package.json            # Client dependencies
│   └── vite.config.js          # Vite configuration
│
├── server/                     # Express Backend
│   ├── controllers/            # Route handlers
│   ├── models/                 # Mongoose schema definitions
│   ├── routes/                 # API routing endpoints
│   ├── middleware/             # Auth/Error/Upload middlewares
│   ├── config/                 # Database and environment configurations
│   ├── server.js               # Main Express entry point
│   └── package.json            # Server dependencies
│
└── README.md
```

---

## 🚀 Installation Guide

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local installation or MongoDB Atlas cluster)

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd legal-aid-portal
```

### Step 2: Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Run the backend development server:
```bash
npm run dev
```
*(The server will start on port 5000)*

### Step 3: Frontend Setup
Open a new terminal window for the frontend.
```bash
cd client
npm install
```

Run the frontend development server:
```bash
npm run dev
```
*(The frontend will start on port 5173)*

### Step 4: Visit the App
Navigate to **http://localhost:5173** in your browser.

---

## 🔄 Appointment Workflow

1. **Citizen registers** → Creates account with `CITIZEN` role.
2. **Citizen browses** → Views available verified lawyers.
3. **Citizen books** → Selects date, time → Status: `PENDING`.
4. **Lawyer receives** → Sees request in dashboard.
5. **Lawyer decides** → Accepts or Rejects.
6. **Consultation happens** → Lawyer marks complete (`COMPLETED`).
7. **Citizen tracks** → Full visibility from the citizen dashboard.

---

## 🔌 API Reference (Express.js)

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & get token
- `GET /api/auth/me` - Get current logged-in user profile

### Lawyers
- `GET /api/lawyers` - Public - List verified lawyers
- `GET /api/lawyers/:id` - Public - Get a single lawyer profile
- `PUT /api/lawyers/verify/:id` - Admin - Verify lawyer profile

### Appointments
- `GET /api/appointments` - Private - Get user's appointments
- `POST /api/appointments` - Private - Create an appointment (Citizen only)
- `PUT /api/appointments/:id/status` - Private - Update appointment status (Lawyer only)

### Categories
- `GET /api/categories` - Public - List all categories

---

**Built with ❤️ using MongoDB, Express, React, and Node.js**