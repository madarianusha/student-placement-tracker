const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { db } = require("./db");

async function addRelatedData() {
  const records = [
    {
      TableName: "Interviews",
      Item: {
        interviewId: "I001",
        applicationId: "A001",
        interviewDate: "2026-10-20T15:00:00Z",
        interviewType: "Video",
        interviewStatus: "Scheduled",
        notes: "Prepare SQL and JavaScript questions."
      }
    },
    {
      TableName: "Offers",
      Item: {
        offerId: "O001",
        applicationId: "A001",
        offerDate: "2026-10-22",
        salary: 65000,
        offerStatus: "Pending",
        responseDeadline: "2026-10-26"
      }
    },
    {
      TableName: "Tasks",
      Item: {
        taskId: "T001",
        studentId: "S001",
        applicationId: "A001",
        taskTitle: "Prepare for interview",
        dueDate: "2026-10-19",
        priority: "High",
        taskStatus: "Pending"
      }
    },
    {
      TableName: "ApplicationActivity",
      Item: {
        activityId: "ACT001",
        applicationId: "A001",
        activityType: "StatusUpdated",
        activityDate: new Date().toISOString(),
        description: "Sample history: status changed from Applied to Interview."
      }
    }
  ];

  for (const record of records) {
    await db.send(new PutCommand(record));
    console.log(`Sample record saved in ${record.TableName}`);
  }
}

addRelatedData().catch(error => {
  console.error("Error:", error.message);
  process.exitCode = 1;
});