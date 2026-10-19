const { QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { db } = require("./db");

async function checkRelatedData() {
  const tables = [
    "Interviews",
    "Offers",
    "Tasks",
    "ApplicationActivity"
  ];

  for (const table of tables) {
    const result = await db.send(new QueryCommand({
      TableName: table,
      IndexName: "applicationId-index",
      KeyConditionExpression: "applicationId = :id",
      ExpressionAttributeValues: {
        ":id": "609c94aa-4449-4b87-b1c7-3cf925b63a7a"
      }
    }));

    console.log(`\n${table}:`);
    console.log(result.Items);
  }
}

checkRelatedData().catch(error => {
  console.error("Error:", error.message);
  process.exitCode = 1;
});