
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

async function testIndex() {
  const result = await db.send(
    new QueryCommand({
      TableName: "JobApplications",
      IndexName: "studentId-index",
      KeyConditionExpression: "studentId = :id",
      ExpressionAttributeValues: {
        ":id": "student-demo-001"
      }
    })
  );

  console.log("Student applications:");
  console.log(result.Items);
  console.log("Records found:", result.Count);
}

testIndex().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
