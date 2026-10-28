# Student Placement Tracker

**PlacementHub — a full-stack placement management application built with React, Express, and DynamoDB Local.**

![React](https://img.shields.io/badge/Frontend-React-149ECA?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Backend-Express-333333?logo=express&logoColor=white)
![DynamoDB Local](https://img.shields.io/badge/Database-DynamoDB%20Local-4053D6?logo=amazondynamodb&logoColor=white)
![Docker](https://img.shields.io/badge/Environment-Docker-2496ED?logo=docker&logoColor=white)

Student Placement Tracker centralizes student profiles, job applications, interviews, offers, and placement tasks in a single interface. It was developed as an academic NoSQL application to demonstrate NoSQL data modeling, RESTful API design, record relationships, and end-to-end integration between a React client and a DynamoDB database.

**Project:** Academic NoSQL application  
**Repository:** [github.com/madarianusha/student-placement-tracker](https://github.com/madarianusha/student-placement-tracker)  
**Deployment:** Local development and demonstration

---

## Contents

- [Overview](#overview)
- [Key features](#key-features)
- [Technology stack](#technology-stack)
- [System architecture](#system-architecture)
- [Data model](#data-model)
- [Getting started](#getting-started)
- [Application workflow](#application-workflow)
- [API reference](#api-reference)
- [Testing](#testing)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Scope and limitations](#scope-and-limitations)

## Overview

Managing student placement information across spreadsheets and separate records can make it difficult to track applications, interviews, offers, and outstanding tasks consistently. PlacementHub provides one workspace in which these records can be created, updated, searched, and related to one another.

The application uses a **three-tier architecture**: a React frontend presents the user interface; an Express server validates requests and implements business rules; and DynamoDB Local stores the data. The database runs in Docker, so the project can be demonstrated without provisioning an AWS-hosted DynamoDB service.

### Project objectives

- Centralize student placement data in one application.
- Model relationships between students, applications, interviews, offers, and tasks in a NoSQL database.
- Provide CRUD operations through a consistent REST API.
- Track the progression of an application while retaining interview and offer records separately.
- Support record validation, status history, and controlled deletion of related data.
- Present summary metrics and searchable records in a responsive dashboard.

## Key features

| Module | Functionality |
| --- | --- |
| **Dashboard** | Application summary, in-progress applications, upcoming interviews, offers received, and recent activity views. |
| **Students** | Create, view, edit, search, and delete student profiles. |
| **Applications** | Record company, position, location, application date, and application stage; search and filter by status. |
| **Interviews** | Schedule interviews, maintain interview type and date, update status, and save notes. |
| **Offers** | Record salary, offer date, decision deadline, and offer decision. |
| **Tasks** | Add student-related tasks, optionally associate them with an application, assign priorities and deadlines, and track completion. |
| **Status history** | Retain application status changes in a separate activity table. |
| **Record relationships** | Validate linked records and handle student deletion with related-data cleanup. |

### Supported status values

| Record type | Values |
| --- | --- |
| Application | `Applied`, `Screening`, `Interview`, `Offer`, `Rejected`, `Withdrawn` |
| Interview | `Scheduled`, `Completed`, `Cancelled` |
| Offer decision | `Pending`, `Accepted`, `Declined` |
| Task | `Pending`, `In Progress`, `Completed` |
| Task priority | `Low`, `Medium`, `High` |

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, React Router, JavaScript, CSS, Lucide React |
| Backend | Node.js, Express.js, REST APIs |
| Database | Amazon DynamoDB Local |
| Database integration | AWS SDK for JavaScript v3 |
| Local infrastructure | Docker Desktop, Docker Compose |
| Development tools | Visual Studio Code, Git, GitHub |

## System architecture

```text
┌─────────────────────────────────────────┐
│ React + Vite                            │
│ Dashboard · Students · Applications     │
│ Interviews · Offers · Tasks             │
│ http://localhost:5173                   │
└──────────────────┬──────────────────────┘
                   │ HTTP / JSON
                   ▼
┌─────────────────────────────────────────┐
│ Node.js + Express                       │
│ Routes → Controllers → Services         │
│ Validation · Business rules · REST API  │
│ http://localhost:5000/api               │
└──────────────────┬──────────────────────┘
                   │ AWS SDK v3
                   ▼
┌─────────────────────────────────────────┐
│ DynamoDB Local (Docker)                 │
│ Host endpoint: http://localhost:8002    │
│                                         │
│ Students          JobApplications       │
│ Interviews        Offers                │
│ Tasks             ApplicationActivity   │
└─────────────────────────────────────────┘
```

The browser communicates with the Express API; database operations are performed by backend services rather than directly from React.

## Data model

DynamoDB Local stores six tables. Related records use identifiers rather than SQL foreign keys; the backend is responsible for checking those relationships.

| Table | Primary key | Purpose | Secondary index(es) |
| --- | --- | --- | --- |
| `Students` | `studentId` | Student profile information | — |
| `JobApplications` | `applicationId` | Job applications belonging to students | `studentId-index` |
| `Interviews` | `interviewId` | Interview records linked to applications | `applicationId-index` |
| `Offers` | `offerId` | Offers linked to applications | `applicationId-index` |
| `Tasks` | `taskId` | Student tasks, optionally linked to applications | `studentId-index`, `applicationId-index` |
| `ApplicationActivity` | `activityId` | Application status-change history | `applicationId-index` |

### Record relationships

```text
Student (studentId)
├── Job Application (applicationId, studentId)
│   ├── Interviews (applicationId)
│   ├── Offers (applicationId)
│   ├── Application activity (applicationId)
│   └── Tasks (optional applicationId)
└── Tasks (studentId)
```

**Deletion policy:** Deleting a student requires explicit confirmation and is designed to delete its linked applications, interviews, offers, tasks, and application history. The backend uses a DynamoDB transaction for up to **100 records in one delete operation**, including the student, and rejects larger deletions rather than attempting a partial transaction. This is a permanent operation; test it using disposable data.

## Getting started

### Prerequisites

Install the following before running the project:

- **Node.js** (current LTS) and npm
- **Docker Desktop**, with the Docker engine running
- **Git**
- **Visual Studio Code** or another editor (optional)

The instructions below use a PowerShell or VS Code terminal on Windows. Run commands from the stated directory.

### 1. Clone the repository

```powershell
git clone https://github.com/madarianusha/student-placement-tracker.git
cd student-placement-tracker
```

### 2. Start DynamoDB Local

From the repository root:

```powershell
docker compose up -d
```

Check the container:

```powershell
docker ps
```

The project's local setup uses **port 8002 on the host**, mapped to DynamoDB's **port 8000 inside the container**. If a container named `student-placement-db` already exists outside this Compose project, inspect it with `docker ps -a` and start it with `docker start student-placement-db` instead of creating a duplicate. Avoid deleting Docker volumes to resolve a container-name conflict.

### 3. Initialize the database (first run only)

A fresh DynamoDB Local instance does **not** automatically contain the six application tables. From the `database/` directory, use the table-creation script provided in your checkout:

```powershell
cd database
node create-tables.js
cd ..
```

> Check that `database/create-tables.js` exists before running this step. If the script is absent from your checkout, the tables and indexes listed in [Data model](#data-model) must be created before using the app. Skip initialization when all six tables already exist. Do not run optional sample-data scripts against records you want to preserve.

### 4. Configure the backend

Create `backend/.env` if you need to set the local connection explicitly:

```dotenv
PORT=5000
DYNAMODB_ENDPOINT=http://localhost:8002
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
```

The AWS credential values above are placeholders for **DynamoDB Local**; no AWS account is required. The repository's database client should use the same endpoint as Docker. Do not commit real secrets or private `.env` files.

### 5. Start the backend

Open a terminal in the repository root:

```powershell
cd backend
npm install
npm run dev
```

The Express API should be available at `http://localhost:5000/api`. Verify its connection from another terminal:

```powershell
Invoke-RestMethod http://localhost:5000/api/students
```

An empty array is a valid result for a database with no students.

### 6. Start the frontend

Open a **separate terminal** in the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local address Vite displays, normally **http://localhost:5173**.

The frontend uses the API base URL configured in `frontend/src/api.js`. For a direct connection to the local Express server, set `VITE_API_URL=http://localhost:5000/api` in `frontend/.env` if needed, then restart Vite. A Vite `/api` proxy may alternatively be configured in the frontend project.

### Services at a glance

| Service | Local address |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:5000/api` |
| DynamoDB Local | `http://localhost:8002` |

## Application workflow

A job application represents the **stage reached** in the hiring process. Interviews and offers are separate records with their own statuses.

```text
Create student
     ↓
Create application → Applied
     ↓
Schedule interview → Application stage: Interview
     ↓
Receive offer → Application stage: Offer
     ↓
Record decision → Offer: Pending / Accepted / Declined
```

**Important behavior:**

- Creating an interview can advance an application from `Applied` or `Screening` to `Interview`.
- Creating or updating an offer sets the associated application's stage to `Offer`.
- A declined offer remains an **offer received**; the offer's decision becomes `Declined`, while the application's stage remains `Offer`.
- Interview status is independent. The interview remains `Scheduled`, `Completed`, or `Cancelled` until explicitly updated; it is not deleted when an offer is received.
- Application and interview records are retained so the placement journey can be reviewed later.

### Example use case

A student creates an application for a QA Analyst position at Dell, schedules an online interview, and then receives an offer. The application stage becomes `Offer`; the interview record remains visible; the offer stores its salary, deadline, and final acceptance/decline decision.

## API reference

**Base URL:** `http://localhost:5000/api`

| Resource | GET collection | POST | GET by ID | PUT by ID | DELETE by ID |
| --- | --- | --- | --- | --- | --- |
| Students | `/students` | `/students` | `/students/:id` | `/students/:id` | `/students/:id` |
| Applications | `/applications` | `/applications` | `/applications/:id` | `/applications/:id` | `/applications/:id` |
| Interviews | `/interviews` | `/interviews` | `/interviews/:id` | `/interviews/:id` | `/interviews/:id` |
| Offers | `/offers` | `/offers` | `/offers/:id` | `/offers/:id` | `/offers/:id` |
| Tasks | `/tasks` | `/tasks` | `/tasks/:id` | `/tasks/:id` | `/tasks/:id` |

Additional application history endpoint:

```http
GET /api/applications/:id/history
```

Permanent student deletion requires the explicit query parameter used by the frontend confirmation flow:

```http
DELETE /api/students/:id?confirm=DELETE
```

**Common HTTP results:** `200` (success), `201` (created), `400` (invalid request), `404` (missing record), `409` (conflict), and `500` (unexpected server/database error).

### Example: create a student

```powershell
$body = @{
  name = "Sample Student"
  email = "sample.student@example.com"
  major = "Computer Science"
  graduationYear = "2027"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:5000/api/students" `
  -ContentType "application/json" `
  -Body $body
```

The backend generates the student identifier. Use the returned `studentId` when creating related applications or tasks.

## Testing

The application has been developed and manually exercised through the frontend and API. The checklist below is intended for **final verification** on a running local instance; it is not a claim of automated test coverage.

| Test | Expected result |
| --- | --- |
| Create/edit a student | Student information persists after refresh. |
| Add an application | The application belongs to the selected student. |
| Schedule an interview | Interview is saved; the parent application advances to `Interview` when eligible. |
| Create/update an offer | Offer is saved; the parent application stage is `Offer`. |
| Decline an offer | Offer decision becomes `Declined`; the application remains at stage `Offer`. |
| Create and complete a task | Task status and dashboard counts update correctly. |
| Delete a temporary student with linked records | Confirmation is required, linked records are removed, and affected lists refresh. |
| Restart Express and refresh the browser | Previously saved records remain in DynamoDB Local. |
| Use an empty database | Lists and dashboard show zero/empty states without sample records. |

A frontend production build can be checked with:

```powershell
cd frontend
npm run build
```

For API troubleshooting, inspect **Developer Tools → Network** in the browser and the Express server terminal. Run destructive tests only with temporary records.

## Project structure

```text
student-placement-tracker/
├── backend/
│   ├── src/
│   │   ├── config/          # DynamoDB client and configuration
│   │   ├── controllers/     # Request validation and HTTP responses
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Database operations and business logic
│   │   └── server.js        # Backend entry point
│   └── package.json
├── database/                # DynamoDB initialization and development scripts
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── config/          # Forms and navigation definitions
│   │   ├── pages/           # Dashboard and resource pages
│   │   ├── App.jsx          # Application routing and orchestration
│   │   └── api.js           # HTTP client helper
│   └── package.json
├── docs/                    # Project documentation
├── presentation/            # Presentation material
├── docker-compose.yml       # DynamoDB Local container configuration
└── README.md
```

## Troubleshooting

| Symptom | Recommended check |
| --- | --- |
| `API unavailable` in frontend | Confirm Express is running on port `5000`; verify the frontend API URL or proxy. |
| DynamoDB connection error | Start Docker, confirm host port `8002`, and inspect `DYNAMODB_ENDPOINT`. |
| Missing-table error | Initialize all six tables and their indexes against the same DynamoDB Local instance. |
| Docker container name already in use | Inspect existing containers with `docker ps -a`; do not delete persistent volumes to clear the error. |
| `400` on create/update | Check required fields, supported status values, and associated record IDs. |
| Student deletion says confirmation required | Ensure the DELETE request contains `?confirm=DELETE`. |
| Records disappear after a restart | Check that DynamoDB Local uses persistent storage and that the same container/endpoint is being used. |
| UI shows stale counts | Refresh the data and inspect the API response in the browser's Network panel. |

## Scope and limitations

PlacementHub is intended for **local development, coursework, and demonstration**. It is not presented as a production-ready student information system.

- **No hosted database is required:** DynamoDB Local runs on the development machine.
- **No authentication or role-based authorization is claimed:** Add access controls before deploying with real student information.
- **Deletion is permanent:** The student cascade-delete operation is limited to a single DynamoDB transaction of up to 100 records. Concurrent writes during a delete require additional safeguards for production use.
- **Data privacy:** Do not commit real student information, `.env` files, credentials, or local database files to the repository.
- **Validation:** Final checks should be performed against the latest code and database configuration before submission or deployment.

---

**Repository:** [Student Placement Tracker](https://github.com/madarianusha/student-placement-tracker)  
**Built for:** NoSQL database course project
