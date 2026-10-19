const {
  PutCommand,
  DeleteCommand,
  GetCommand
} = require("@aws-sdk/lib-dynamodb");

const { db } = require("./db");

async function testDelete() {
  const key = { applicationId: "DELETE_TEST_001" };

  await db.send(new PutCommand({
    TableName: "JobApplications",
    Item: {
      ...key,
      studentId: "S001",
      company: "Temporary Test Company",
      jobTitle: "Test Job",
      status: "Applied"
    },
    ConditionExpression: "attribute_not_exists(applicationId)"
  }));

  console.log("Temporary application created.");

  await db.send(new DeleteCommand({
    TableName: "JobApplications",
    Key: key
  }));

  const result = await db.send(new GetCommand({
    TableName: "JobApplications",
    Key: key,
    ConsistentRead: true
  }));

  if (!result.Item) {
    console.log("Delete test passed!");
  } else {
    throw new Error("The temporary application still exists.");
  }
}

testDelete().catch(error => {
  console.error("Error:", error.message);
  process.exitCode = 1;
});