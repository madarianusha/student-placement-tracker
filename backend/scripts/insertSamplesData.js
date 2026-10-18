
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand
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

const records = [
  {
    table: "Students",
    key: { studentId: "student-demo-001" },
    item: {
      studentId: "student-demo-001",
      name: "Test Student",
      email: "student@example.com",
      major: "Computer Science",
      graduationYear: 2026
    }
  },
  {
    table: "JobApplications",
    key: { applicationId: "application-demo-001" },
    item: {
      applicationId: "application-demo-001",
      studentId: "student-demo-001",
      company: "Microsoft",
      jobTitle: "Software Developer Intern",
      status: "Offer",
      appliedDate: "2026-10-01"
    }
  },
  {
    table: "Interviews",
    key: { interviewId: "interview-demo-001" },
    item: {
      interviewId: "interview-demo-001",
      applicationId: "application-demo-001",
      interviewDate: "2026-10-10T10:00:00",
      interviewType: "Online",
      interviewStatus: "Completed",
      notes: "Technical interview completed"
    }
  },
  {
    table: "Offers",
    key: { offerId: "offer-demo-001" },
    item: {
      offerId: "offer-demo-001",
      applicationId: "application-demo-001",
      offerDate: "2026-10-14",
      salary: 75000,
      offerStatus: "Pending",
      responseDeadline: "2026-10-25"
    }
  },
  {
    table: "Tasks",
    key: { taskId: "task-demo-001" },
    item: {
      taskId: "task-demo-001",
      studentId: "student-demo-001",
      applicationId: "application-demo-001",
      taskTitle: "Review job offer",
      dueDate: "2026-10-20",
      priority: "High",
      taskStatus: "Pending"
    }
  },
  {
    table: "ApplicationActivity",
    key: { activityId: "activity-demo-001" },
    item: {
      activityId: "activity-demo-001",
      applicationId: "application-demo-001",
      activityType: "STATUS_CHANGED",
      activityDate: "2026-10-14T12:00:00Z",
      description: "Interview to Offer"
    }
  }
];

async function insertSampleData() {
  for (const record of records) {
    await db.send(new PutCommand({
      TableName: record.table,
      Item: record.item
    }));

    console.log(`Inserted record into ${record.table}`);

    const result = await db.send(new GetCommand({
      TableName: record.table,
      Key: record.key
    }));

    console.log("Retrieved:", result.Item);
    console.log("-------------------------");
  }

  console.log("All six sample records saved and verified!");
}

insertSampleData().catch(error => {
  console.error("Database error:", error);
  process.exitCode = 1;
});
