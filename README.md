# TaskPro - Team Task Manager (Full-Stack)

TaskPro is a modern full-stack SaaS-style team task management platform inspired by Jira/Trello workflows with a cleaner analytics-first experience.

## Tech Stack

- Frontend: React, Tailwind CSS, Framer Motion, React Router DOM, Axios, Recharts, Lucide Icons
- Backend: Node.js, Express.js, JWT, bcrypt
- Database: MongoDB + Mongoose
- Deployment: Frontend on Vercel, Backend on Railway

## Features Implemented

- JWT auth (signup/login/logout) with persistent session
- Role-based access control (`admin`, `member`)
- Project CRUD (admin) with member assignment support
- Task CRUD, assignment, priority, deadlines, status updates
- Kanban board with drag-and-drop status changes
- Dashboard analytics:
  - KPI cards (total/completed/pending/overdue)
  - Weekly productivity bar chart
  - Status distribution donut chart
  - Team performance horizontal bar chart
  - Recent activity feed
- Search/filter for tasks by query, project, priority, and status
- Dark mode with:
  - toggle
  - system preference detection
  - localStorage persistence
- Responsive layout (mobile-first sidebar, adaptive grids, responsive chart containers)

## Folder Structure

```txt
TaskPro/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
      app.js
      server.js
  frontend/
    src/
      components/
      context/
      layouts/
      pages/
      services/
      App.jsx
      main.jsx
```

## API Endpoints

### Auth

- `POST /api/signup`
- `POST /api/login`

### Projects

- `POST /api/projects` (admin)
- `GET /api/projects`
- `PATCH /api/projects/:id` (admin)
- `DELETE /api/projects/:id` (admin)

### Tasks

- `POST /api/tasks` (admin)
- `GET /api/tasks`
- `PATCH /api/tasks/:id` (admin or assigned member)
- `DELETE /api/tasks/:id` (admin)

### Dashboard

- `GET /api/dashboard-stats`

## Local Setup

### 1) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure environment

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env`
- Fill valid MongoDB URI and JWT secret

### 3) Run development servers

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Deployment

### Backend -> Railway

1. Push `backend` to GitHub.
2. Create new Railway project from repo.
3. Set env variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` (your Vercel URL)
   - `PORT` (Railway provides this automatically, optional fallback)
4. Start command: `npm start`
5. Copy live backend URL.

### Frontend -> Vercel

1. Import repo to Vercel.
2. Set root as `frontend`.
3. Set env variable:
   - `VITE_API_URL=https://<your-railway-backend>/api`
4. Deploy and use the Vercel URL.

