# StaffSync HRM

A MERN-stack Human Resource Management system with three roles: **Employee**, **Manager** and **HR**.

| Role | What they can do |
| --- | --- |
| Employee | Register/login, update profile, mark attendance, apply for leave and see its status, read announcements, see assigned training |
| Manager | Everything an employee can, plus: view team, review (approve/reject) team leaves, view team attendance, rate performance, create training programs |
| HR | Manage all employees and managers, view all attendance, manage all leave requests, post announcements, see headcount reports |

**Stack:** MongoDB + Mongoose, Express, React (Vite), Node.js, JWT, bcryptjs, Axios, React Router, Bootstrap.

## Project layout

```
server/   Express API  (models, routes, JWT + role middleware, seed script)
client/   React app    (pages for each module)
```

## Run it (GitHub Codespaces or locally)

### 1. Database
Create a free **M0** cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), add a database user, allow access from anywhere (`0.0.0.0/0`) under Network Access, and copy the connection string.

### 2. Backend
```bash
cd server
cp .env.example .env      # then edit .env and paste your MONGO_URI
npm install
npm run seed              # creates demo HR, manager and employee accounts
npm run dev               # API on http://localhost:5000
```

### 3. Frontend (second terminal)
```bash
cd client
npm install
npm run dev               # app on http://localhost:5173
```
In Codespaces, open the forwarded port **5173** in your browser. The frontend forwards `/api` calls to the backend automatically.

### Demo logins (created by `npm run seed`)
| Role | Email | Password |
| --- | --- | --- |
| HR | hr@staffsync.com | hr1234 |
| Manager | manager@staffsync.com | manager1234 |
| Employee | employee@staffsync.com | employee1234 |

Change or delete these before using the app for real.

## How roles work
- Public registration always creates an **employee**. HR creates managers and other HR accounts from the **Employees** page.
- HR assigns each employee to a manager. That link decides which leaves and attendance a manager can see.
- Every API route is protected by a JWT, and role checks run on the server (`server/middleware/auth.js`), not just in the UI.

## API overview
| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Users | `GET/POST /api/users` (HR), `PUT/DELETE /api/users/:id` (HR), `PUT /api/users/me`, `GET /api/users/team`, `GET /api/users/stats` |
| Attendance | `POST /api/attendance/check-in`, `POST /api/attendance/check-out`, `GET /api/attendance/my`, `GET /api/attendance` (manager/HR) |
| Leaves | `POST /api/leaves`, `GET /api/leaves/my`, `GET /api/leaves` (manager/HR), `PUT /api/leaves/:id/review` |
| Announcements | `GET /api/announcements`, `POST/DELETE` (HR) |
| Training | `GET /api/trainings`, `POST/DELETE` (manager/HR) |
| Notifications | `GET /api/notifications`, `PUT /api/notifications/read-all` |

## Deploying (optional)
Backend on Render (root `server`, start command `npm start`, add the `.env` values). Frontend on Vercel (root `client`, set `VITE_API_URL` to your Render URL plus `/api`).
