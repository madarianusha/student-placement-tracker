
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

async function findRelatedRecords(tableName, field, value) {
  const items = [];
  let lastKey;

  do {
    const result = await db.send(new ScanCommand({
      TableName: tableName,
      FilterExpression: "#field = :value",
      ExpressionAttributeNames: {
        "#field": field
      },
      ExpressionAttributeValues: {
        ":value": value
      },
      ExclusiveStartKey: lastKey
    }));

    items.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return items;
}

async function testRelationships() {
  const studentId = "student-demo-001";
  const applicationId = "application-demo-001";

  const checks = [
    ["JobApplications", "studentId", studentId],
    ["Interviews", "applicationId", applicationId],
    ["Offers", "applicationId", applicationId],
    ["Tasks", "studentId", studentId],
    ["ApplicationActivity", "applicationId", applicationId]
  ];

  for (const [table, field, value] of checks) {
    const records = await findRelatedRecords(table, field, value);

    console.log(`\n${table}: ${records.length} record(s)`);
    console.log(records);
  }

  console.log("\nRelationship testing completed!");
}

testRelationships().catch(error => {
  console.error("Relationship test failed:", error);
  process.exitCode = 1;
});
