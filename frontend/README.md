# Student Placement Tracker — Frontend

## Run locally
1. Install Node.js 20 or newer.
2. Run `npm install` inside `frontend/`.
3. Run `npm run dev`.
4. Open the URL printed by Vite (usually http://localhost:5173).

The frontend displays sample data if the Express backend is not running. Demo changes are not persistent.

## Backend contract (coordinate with Student 2)
- GET /api/applications — array of applications (or `{ "items": [...] }`)
- POST /api/applications — create application, returns new application
- PUT /api/applications/:id — update application
- DELETE /api/applications/:id — delete application

Each application has `applicationId`, `company`, `jobTitle`, `location`, `status`, `appliedDate`.

## Integration notes
- Set VITE_API_URL in `.env` to the backend API base URL.
- Enable CORS in Express for http://localhost:5173.
- Interview and task changes are currently demo-only. Connect them to the agreed APIs before final submission.
- Offer and activity history forms still need backend integration.
