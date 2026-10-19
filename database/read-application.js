const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { db } = require("./db");

async function readApplication() {
  const result = await db.send(new GetCommand({
    TableName: "JobApplications",
    Key: {
      applicationId: "A001"
    }
  }));

  console.log("Your saved application:");
  console.log(result.Item);
}

readApplication().catch(error => {
  console.error("Error:", error.message);
  process.exitCode = 1;
});