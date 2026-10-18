
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local"
  }
});

const db = DynamoDBDocumentClient.from(client);

// Read all records, including additional pages
async function readTable(tableName) {
  const items = [];
  let lastKey;

  do {
    const result = await db.send(new ScanCommand({
      TableName: tableName,
      ExclusiveStartKey: lastKey
    }));

    items.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return items;
}

async function testDataIntegrity() {
  const students = await readTable("Students");
  const applications = await readTable("JobApplications");
  const interviews = await readTable("Interviews");
  const offers = await readTable("Offers");
  const tasks = await readTable("Tasks");
  const activities = await readTable("ApplicationActivity");

  const studentMap = new Map(
    students.map(s => [s.studentId, s])
  );

  const applicationMap = new Map(
    applications.map(a => [a.applicationId, a])
  );

  const issues = [];

  // Check each application belongs to a student
  for (const app of applications) {
    if (!studentMap.has(app.studentId)) {
      issues.push(
        `Application ${app.applicationId}: student not found`
      );
    }
  }

  // Check each interview belongs to an application
  for (const interview of interviews) {
    if (!applicationMap.has(interview.applicationId)) {
      issues.push(
        `Interview ${interview.interviewId}: application not found`
      );
    }
  }

  // Check each offer belongs to an application
  for (const offer of offers) {
    if (!applicationMap.has(offer.applicationId)) {
      issues.push(
        `Offer ${offer.offerId}: application not found`
      );
    }
  }

  // Check each task's student and optional application
  for (const task of tasks) {
    if (!studentMap.has(task.studentId)) {
      issues.push(
        `Task ${task.taskId}: student not found`
      );
    }

    if (task.applicationId) {
      const app = applicationMap.get(task.applicationId);

      if (!app) {
        issues.push(
          `Task ${task.taskId}: application not found`
        );
      } else if (app.studentId !== task.studentId) {
        issues.push(
          `Task ${task.taskId}: student/application mismatch`
        );
      }
    }
  }

  // Check application status history
  for (const activity of activities) {
    if (!applicationMap.has(activity.applicationId)) {
      issues.push(
        `Activity ${activity.activityId}: application not found`
      );
    }
  }

  console.log("\nDatabase records checked:");
  console.log("Students:", students.length);
  console.log("Applications:", applications.length);
  console.log("Interviews:", interviews.length);
  console.log("Offers:", offers.length);
  console.log("Tasks:", tasks.length);
  console.log("Activities:", activities.length);

  if (issues.length === 0) {
    console.log("\nNo broken relationships found!");
    console.log("Data integrity test PASSED.");
  } else {
    console.log("\nData integrity problems:");
    issues.forEach(issue => console.log("-", issue));
    console.log("Data integrity test FAILED.");
    process.exitCode = 1;
  }
}

testDataIntegrity().catch(error => {
  console.error("Test failed:", error);
  process.exitCode = 1;
});
