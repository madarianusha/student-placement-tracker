# PlacementHub — Separate-page React frontend

This is a **new frontend**, not Pavani’s frontend. Each of the six tabs has a separate React page file **and** its own URL. Shared components avoid duplicating tables and forms. No mock data is shown: saved records come from your existing Express API and DynamoDB Local.

## Folder structure

```text
frontend/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx       → /
│   │   ├── Students.jsx        → /students
│   │   ├── Applications.jsx    → /applications
│   │   ├── Interviews.jsx      → /interviews
│   │   ├── Offers.jsx          → /offers
│   │   └── Tasks.jsx           → /tasks
│   ├── components/
│   │   ├── RecordField.jsx     (shared input fields)
│   │   ├── ResourcePage.jsx    (shared CRUD table layout)
│   │   └── UI.jsx              (shared buttons, badges, dialogs)
│   ├── config/
│   │   ├── forms.js            (form fields, defaults)
│   │   └── navigation.js       (sidebar tabs)
│   ├── App.jsx                 (main layout, routes, API state)
│   ├── api.js                  (fetch functions for Express)
│   ├── format.js               (dates, statuses, helpers)
│   ├── main.jsx                (React Router entry point)
│   └── styles.css
└── scripts/
    └── verify-pages.mjs
```

## Install in your existing project

Keep your backend, database, docs, and docker-compose files as they are.

1. Rename the **existing** `student-placement-tracker/frontend` to `frontend-old` so you retain a backup.
2. Extract this ZIP into `student-placement-tracker/`. The archive contains the `frontend/` folder.
3. Start your DynamoDB Local Docker container as you usually do (`docker start placement-db` if that is its name).
4. Start your existing Express backend (port 5000) with your current backend start command.
5. Open a new PowerShell terminal inside `student-placement-tracker/frontend`.
6. Run:

```powershell
npm install
npm run verify:pages
npm run dev
```

Open http://localhost:5173. Click the sidebar or visit page URLs directly.

## Features

- **Dashboard (`/`)** — application totals, statuses, upcoming interviews, offers, and tasks.
- **Students (`/students`)** — add/edit student profiles. Create a student before creating an application.
- **Applications (`/applications`)** — add/edit/search/filter applications and update their status.
- **Interviews (`/interviews`)** — add/edit/delete interviews linked to an application.
- **Offers (`/offers`)** — add/edit/delete offers linked to an application.
- **Tasks (`/tasks`)** — add/edit/delete tasks and mark completed.

## Backend contract

The Vite development server forwards requests for `/api/*` to `http://localhost:5000` (configured in `vite.config.js`). The frontend expects:

```text
GET    /api/students
GET    /api/applications
GET    /api/interviews
GET    /api/offers
GET    /api/tasks
POST   /api/{students,applications,interviews,offers,tasks}
PUT    /api/{students,applications,interviews,offers,tasks}/:id
DELETE /api/{interviews,offers,tasks}/:id
```

IDs are created by Express, and an application requires `studentId`, `company`, and `jobTitle`. For edits the frontend sends a full item object. The backend contract used here does **not** support deletion of students or applications, so those buttons are absent.

**Troubleshooting:** If the top bar says **API unavailable**, check the Express server at `http://localhost:5000/api/students` and that DynamoDB Local is running. Check your actual backend routes; if you renamed them, update `src/api.js` and the backend accordingly. Never delete the database folder while troubleshooting.

This is a coursework/local development application without login or user-based access restrictions. Avoid sensitive personal information.

## Activity removed

This version does not include an Activity page, application-history modal, activity navigation item, or activity API calls. The backend and the `ApplicationActivity` DynamoDB table are left untouched.
