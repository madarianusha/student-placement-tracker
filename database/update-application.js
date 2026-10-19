const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { db } = require("./db");

async function updateApplication() {
  const result = await db.send(new UpdateCommand({
    TableName: "JobApplications",
    Key: { applicationId: "A001" },
    UpdateExpression: "SET #status = :status",
    ConditionExpression: "attribute_exists(applicationId)",
    ExpressionAttributeNames: {
      "#status": "status"
    },
    ExpressionAttributeValues: {
      ":status": "Interview"
    },
    ReturnValues: "ALL_NEW"
  }));

  console.log("Application updated!");
  console.log(result.Attributes);
}

updateApplication().catch(error => {
  console.error("Error:", error.message);
  process.exitCode = 1;
});