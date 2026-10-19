const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { db } = require("./db");

async function addApplication() {
  await db.send(new PutCommand({
    TableName: "JobApplications",
    Item: {
      applicationId: "A001",
      studentId: "S001",
      company: "Example Company",
      jobTitle: "Data Analyst",
      status: "Applied",
      appliedDate: "2026-10-17"
    }
  }));

  console.log("Job application saved successfully!");
}

addApplication().catch(error => {
  console.error("Error:", error.message);
  process.exitCode = 1;
});