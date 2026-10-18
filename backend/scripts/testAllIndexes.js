
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  QueryCommand
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

const testCases = [
  {
    table: "JobApplications",
    index: "studentId-index",
    field: "studentId",
    value: "student-demo-001"
  },
  {
    table: "Interviews",
    index: "applicationId-index",
    field: "applicationId",
    value: "application-demo-001"
  },
  {
    table: "Offers",
    index: "applicationId-index",
    field: "applicationId",
    value: "application-demo-001"
  },
  {
    table: "Tasks",
    index: "studentId-index",
    field: "studentId",
    value: "student-demo-001"
  },
  {
    table: "ApplicationActivity",
    index: "applicationId-index",
    field: "applicationId",
    value: "application-demo-001"
  }
];

async function testAllIndexes() {
  for (const test of testCases) {
    console.log(`\nChecking ${test.table}...`);

    const items = [];
    let lastKey;

    do {
      const result = await db.send(new QueryCommand({
        TableName: test.table,
        IndexName: test.index,
        KeyConditionExpression: "#field = :value",
        ExpressionAttributeNames: {
          "#field": test.field
        },
        ExpressionAttributeValues: {
          ":value": test.value
        },
        ExclusiveStartKey: lastKey
      }));

      items.push(...(result.Items || []));
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    console.log("Records found:", items.length);
    console.log(items);
  }

  console.log("\nAll five index queries completed!");
}

testAllIndexes().catch(error => {
  console.error("Index test failed:", error);
  process.exitCode = 1;
});
