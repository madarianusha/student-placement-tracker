const { QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { db } = require("./db");

async function queryApplications() {
  const result = await db.send(new QueryCommand({
    TableName: "JobApplications",
    IndexName: "studentId-index",
    KeyConditionExpression: "studentId = :student",
    ExpressionAttributeValues: {
      ":student": "6520eb83-035f-4c73-be75-13a6b313522c"
    }
  }));

  console.log("Applications for student S001:");
  console.log(result.Items);
}

queryApplications().catch(error => {
  console.error("Error:", error.message);
  process.exitCode = 1;
});