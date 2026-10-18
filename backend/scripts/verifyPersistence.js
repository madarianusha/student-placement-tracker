
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  GetCommand
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

async function verifyPersistence() {
  const result = await db.send(new GetCommand({
    TableName: "Students",
    Key: {
      studentId: "student-demo-001"
    }
  }));

  if (result.Item) {
    console.log("Student record found!");
    console.log(result.Item);
  } else {
    console.log("Student record not found.");
  }
}

verifyPersistence().catch(console.error);
