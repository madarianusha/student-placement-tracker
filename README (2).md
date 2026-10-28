# Student Placement Tracker

## About the project

We developed Student Placement Tracker for our NoSQL course project. The main idea was to keep student placement information in one application instead of managing job applications, interviews, offers, and reminders in different places.

The frontend is built using React, the backend uses Node.js and Express, and the data is stored in DynamoDB Local. We use Docker Desktop to run DynamoDB on our computers. The application is meant to run locally for our course demonstration.

### Features

- **Students:** Add, view, edit, and delete student profiles.
- **Job applications:** Record the company, job title, location, date applied, and application status.
- **Interviews:** Save interview dates, types, statuses, and notes.
- **Offers:** Save salary, offer date, response deadline, and offer decision.
- **Tasks:** Track tasks and deadlines. A task can be created with or without a related application.
- **Dashboard:** View counts and placement information, with student filtering.
- **Application history:** Record changes made to an application's status.

The application also supports searching and filtering records.

## Technologies used

| Part | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, JavaScript, CSS |
| Backend | Node.js, Express.js, REST APIs |
| Database | Amazon DynamoDB Local |
| Database connection | AWS SDK for JavaScript v3 |
| Database container | Docker Desktop and Docker Compose |
| Development | VS Code, Git, GitHub |

## Project structure

```text
student-placement-tracker/
├── backend/                 # Express server, routes, controllers, services
├── database/                # DynamoDB setup and test scripts
├── frontend/                # React application
├── docs/                    # Project documents
├── presentation/            # Presentation materials
├── docker-compose.yml       # DynamoDB Local Docker configuration
├── .gitignore
└── README.md                # Main project documentation
```

This is the only README needed in the repository. Database setup instructions are included below.

---

# Complete installation and setup (Windows)

These are the steps we follow to set up the project on a new Windows computer. Use **PowerShell** or the **VS Code terminal** for the commands.

## Step 1 — Install the required software

Install the following applications if they are not already on your computer:

1. **Git:** https://git-scm.com/downloads
   - Download Git for Windows and run the installer. The default installation options are fine for this project.
2. **Node.js:** https://nodejs.org/
   - Install a current **LTS** version of Node.js. npm is installed along with Node.js.
3. **Docker Desktop:** https://www.docker.com/products/docker-desktop/
   - Install Docker Desktop for Windows.
   - If Docker requests WSL 2 or Windows virtualization support, enable it as instructed by Docker. On a supported Windows system, `wsl --install` can be run in an Administrator PowerShell terminal if WSL is not installed. Restart Windows if the installation asks you to.
   - Start Docker Desktop and wait until the Docker engine is running.
4. **Visual Studio Code (recommended):** https://code.visualstudio.com/
   - Install VS Code to view and edit the project files.

Open a new PowerShell terminal and check the installations:

```powershell
git --version
node --version
npm --version
docker --version
docker compose version
```

If all commands return version information, the required tools are installed. If Docker reports that its daemon cannot be reached, open Docker Desktop and make sure it has finished starting.

**PowerShell note:** If Windows blocks `npm.ps1`, use `npm.cmd` instead of `npm` in the commands below. This avoids changing your PowerShell execution policy.

## Step 2 — Download the project from GitHub

Open PowerShell in the directory where you want to keep the project. Clone the repository:

```powershell
git clone https://github.com/madarianusha/student-placement-tracker.git
cd student-placement-tracker
```

If you already downloaded the repository, open its folder in VS Code instead of cloning it again.

Check that you are in the main project folder:

```powershell
Get-ChildItem
```

You should see `backend`, `frontend`, `database`, and `docker-compose.yml`.

To open the project in VS Code from the terminal, run:

```powershell
code .
```

If `code` is not recognized, open VS Code and select **File > Open Folder**, then choose `student-placement-tracker`.

## Step 3 — Start Docker Desktop and DynamoDB Local

Keep Docker Desktop running. From the **main project folder**, first check for an existing database container:

```powershell
docker ps -a --filter "name=student-placement-db"
```

**On a new computer:** If no container named `student-placement-db` exists, create and start DynamoDB Local:

```powershell
docker compose up -d
```

**If the container already exists but is stopped:** Use:

```powershell
docker start student-placement-db
```

**If it is already running:** You do not need to start another one.

Verify the running container:

```powershell
docker ps --filter "name=student-placement-db"
```

Our `docker-compose.yml` maps port `8002` on Windows to port `8000` inside the container:

```yaml
ports:
  - "127.0.0.1:8002:8000"
```

The endpoint to use from the backend on your computer is:

```text
http://localhost:8002
```

You can also check whether the port is reachable:

```powershell
Test-NetConnection localhost -Port 8002
```

The `TcpTestSucceeded` result should be `True` when DynamoDB Local is listening.

**Important:** We previously encountered a Docker container-name conflict because `student-placement-db` was already running outside the current Compose project. If you see that error, check the existing container with `docker ps -a` instead of removing it. Do not run `docker compose down -v`, `docker volume prune`, or delete an existing database container unless its data has been backed up.

## Step 4 — Install the database script dependencies

Open another VS Code terminal. From the project root, move into the database folder:

```powershell
cd database
Get-ChildItem
```

Check for `package.json` and the table-creation script. If `package.json` is present, install the dependencies:

```powershell
npm.cmd install
```

If there is no `package.json` in `database`, do not run `npm install` there. Use the dependencies and instructions associated with the scripts in that folder.

## Step 5 — Create the DynamoDB tables (first-time setup only)

This step is for a **new, empty DynamoDB Local database**. You do not need to recreate tables if the existing database already contains them.

From inside the `database` folder, check that the setup script exists:

```powershell
Test-Path .\create-tables.js
```

If it returns `True`, run:

```powershell
node create-tables.js
```

The database uses these six tables:

| Table | Primary key |
| --- | --- |
| Students | `studentId` |
| JobApplications | `applicationId` |
| Interviews | `interviewId` |
| Offers | `offerId` |
| Tasks | `taskId` |
| ApplicationActivity | `activityId` |

All of these primary keys are strings.

The secondary indexes used by the project are:

| Table | Index |
| --- | --- |
| JobApplications | `studentId-index` |
| Interviews | `applicationId-index` |
| Offers | `applicationId-index` |
| Tasks | `studentId-index`, `applicationId-index` |
| ApplicationActivity | `applicationId-index` |

If `create-tables.js` is missing, the repository does not contain the documented table-creation command at that path. Add or restore the database initialization script before trying to run the application with a completely fresh database; starting Docker alone does not create these tables.

### Optional: Add sample records

The database folder has been used with the following sample-data scripts:

```powershell
node add-student.js
node add-application.js
node update-application.js
node add-related-data.js
```

Run only scripts that are actually present, and use them in this order on a test database if you want example records. They are **not required** if you plan to add students and applications through the frontend. Some scripts use fixed IDs and may overwrite sample data when run again.

### Optional: Run database test scripts

Previously used test commands include:

```powershell
node test-connection.js
node read-application.js
node query-applications.js
node check-related-data.js
```

Again, run these only if the corresponding files exist. Review any delete-test script carefully before running it because it may remove records.

## Step 6 — Configure the backend environment

Open a terminal in the project root, then go to the backend folder:

```powershell
cd backend
```

Our connection configuration is in `backend/src/config/db.js`. It reads the `DYNAMODB_ENDPOINT` environment variable, or uses `http://localhost:8002` by default.

If you want to set the values explicitly, create a file named `.env` **inside the `backend` folder** with the following contents:

```dotenv
PORT=5000
AWS_REGION=us-east-1
DYNAMODB_ENDPOINT=http://localhost:8002
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
```

The `local` credentials are dummy credentials for DynamoDB Local. No real AWS account is needed for this project.

If you already have a working `backend/.env`, check its endpoint rather than replacing the file blindly. Also check any separate database connection file used by the backend so both use the same local endpoint.

**Do not commit `.env` files or real secrets to GitHub.**

## Step 7 — Install backend dependencies

From the `backend` folder, run:

```powershell
npm.cmd install
```

This installs the Node.js packages listed in `backend/package.json`.

## Step 8 — Start the backend server

Still inside `backend`, run:

```powershell
npm.cmd run dev
```

The backend should start on port `5000`. During our tests, the terminal displayed:

```text
Backend running on port 5000
```

Keep this terminal running while using the application.

Open a **new** PowerShell terminal and test the API:

```powershell
Invoke-RestMethod http://localhost:5000/api/students
```

A successful request should return student data or an empty list. If this returns a server error, check the backend terminal and confirm that DynamoDB Local is running and its tables are available.

Other API collections are:

```text
http://localhost:5000/api/applications
http://localhost:5000/api/interviews
http://localhost:5000/api/offers
http://localhost:5000/api/tasks
```

## Step 9 — Install frontend dependencies

Open a **third terminal** in VS Code. Start from the main project folder and enter:

```powershell
cd frontend
npm.cmd install
```

The frontend packages are installed using `frontend/package.json`.

## Step 10 — Start the React frontend

In that same `frontend` terminal, run:

```powershell
npm.cmd run dev
```

Vite normally displays a local URL such as:

```text
http://localhost:5173/
```

Open the URL shown in your terminal. Our frontend sends requests to `/api`, which the local Vite setup is intended to forward to the Express backend on port `5000`.

The three parts need to be available at the same time:

| Part | Where it runs |
| --- | --- |
| DynamoDB Local | `http://localhost:8002` |
| Express backend | `http://localhost:5000` |
| React frontend | `http://localhost:5173` |

**Frontend API setting:** The frontend's `src/api.js` uses `/api` by default. If your Vite proxy is not configured, you can instead create `frontend/.env` containing `VITE_API_URL=http://localhost:5000/api` and restart the frontend. The backend must also allow requests from the frontend's origin for direct cross-origin calls.

## Step 11 — Use the application

Once the frontend opens:

1. Go to **Students** and create a student record.
2. Go to **Applications** and add a job application for that student.
3. Add an **Interview** or **Offer** to an existing application if needed.
4. Use **Tasks** to set reminders, either with or without a related application.
5. Open the **Dashboard** to view the stored information.
6. Edit a record and refresh the page to confirm the information was saved to DynamoDB Local.

Application statuses include `Applied`, `Screening`, `Interview`, `Offer`, `Rejected`, and `Withdrawn`. Interview types include `Online`, `Phone`, and `In Person`. Offer decisions include `Pending`, `Accepted`, and `Declined`. Task statuses include `Pending`, `In Progress`, and `Completed`.

## Step 12 — Stop and restart the project

When finished, press **Ctrl + C** in the backend and frontend terminals.

You can leave the DynamoDB container running, or stop it with:

```powershell
docker stop student-placement-db
```

To use the project again later:

```powershell
# In the project root, if the database container is stopped:
docker start student-placement-db
```

Then open two terminals:

**Backend terminal:**

```powershell
cd backend
npm.cmd run dev
```

**Frontend terminal:**

```powershell
cd frontend
npm.cmd run dev
```

You do not have to run `npm install` every time, unless dependencies changed or `node_modules` was removed.

---

## Main API routes

| Feature | Endpoint | Common operations |
| --- | --- | --- |
| Students | `/api/students` | GET, POST, PUT, DELETE |
| Applications | `/api/applications` | GET, POST, PUT, DELETE |
| Interviews | `/api/interviews` | GET, POST, PUT, DELETE |
| Offers | `/api/offers` | GET, POST, PUT, DELETE |
| Tasks | `/api/tasks` | GET, POST, PUT, DELETE |

Requests for an individual record use an ID in the URL. The application also provides status-history data for job applications.

## What we tested

During development, we tested adding and editing students and applications, saving interview and offer records, changing application statuses, creating tasks without a related application, and viewing saved records after refreshing the page.

We also fixed differences between frontend and backend values, such as interview types and offer statuses. The application location field and optional task application field were updated so their values could be saved correctly.

Student deletion with linked applications or tasks should still be checked carefully before final submission.

## Problems we encountered

### Docker says the container name is already in use

This means a container called `student-placement-db` already exists. Check it with:

```powershell
docker ps -a --filter "name=student-placement-db"
```

If it is stopped, use `docker start student-placement-db`. If it is running, use the existing container. Do not delete it just to remove the error.

### Docker container is running, but the backend cannot access the database

Check the `DYNAMODB_ENDPOINT` value in `backend/.env` and `backend/src/config/db.js`. It should resolve to `http://localhost:8002` for this local setup. Then check whether the six database tables have been created.

### Backend does not start

Check that you ran `npm.cmd install` inside `backend`, that port `5000` is available, and that the backend terminal shows the full error message.

### Frontend shows that the API is unavailable

Make sure the backend is running on port `5000`. Check `frontend/src/api.js` and the Vite proxy setting, then refresh the browser.

### A record does not save or update

Open **F12 > Network** in the browser, select the API request, and compare its **Payload** and **Response**. The backend terminal usually provides more detail about validation or database errors.

### The installation scripts cannot be found

Check which files are actually present in `database/`. If a script listed in this README was removed or renamed, use the existing equivalent script or restore the missing setup file. Do not execute a similarly named file without checking what it changes.

---

## How to push the project to GitHub

From the main `student-placement-tracker` folder:

```powershell
git status
git add README.md
git commit -m "Update project README with installation instructions"
git push origin main
```

If an older `database/README.md` still exists, remove it after checking that all useful information is included in this main README:

```powershell
Remove-Item database/README.md
git add -A -- README.md database/README.md
git commit -m "Keep one README for the project"
git push origin main
```

Use the second commit sequence **only if there are changes left to commit**; if Git says the working tree is clean, there is nothing new to commit.

Avoid pushing `.env`, `node_modules`, or local database files.

## Project repository

https://github.com/madarianusha/student-placement-tracker
