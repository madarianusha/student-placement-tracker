\# Student Placement Tracker — Database



\## Requirements

\- Docker Desktop running

\- Node.js installed



\## Connection

Endpoint: http://localhost:8000

Region: us-east-1

Dummy credentials: local / local



Connection code is in db.js.

This project uses DynamoDB Local.



\## Start the existing database

docker start placement-db



\## Install Node.js dependencies

npm.cmd install



\## Create tables

node create-tables.js



\## Add sample data — run in this order

node add-student.js

node add-application.js

node update-application.js

node add-related-data.js



These scripts use fixed sample IDs.

Running them again overwrites those sample records.



\## Tables and keys

Students: studentId

JobApplications: applicationId

Interviews: interviewId

Offers: offerId

Tasks: taskId

ApplicationActivity: activityId



All primary keys are strings.



\## Secondary indexes

JobApplications: studentId-index

Interviews: applicationId-index

Offers: applicationId-index

Tasks: studentId-index, applicationId-index

ApplicationActivity: applicationId-index



\## Test commands

node test-connection.js

node read-application.js

node query-applications.js

node test-delete.js

node check-related-data.js



\## Tests completed

\- Connected to DynamoDB Local

\- Created six tables

\- Created and read sample records

\- Updated application status

\- Queried applications by student

\- Deleted a temporary application

\- Queried related records by application

\- Confirmed data survives a container restart



\## Backend integration notes

Use db.js to connect through AWS SDK v3.

Agree on status values with the team.

Backend must validate studentId and applicationId references.

Backend must implement automatic application history logging.

The current activity record is manually inserted sample data.

