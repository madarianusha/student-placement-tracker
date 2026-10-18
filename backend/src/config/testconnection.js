
const { ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");

const { client, dynamoDB } = require("../src/config/db");

async function testConnection() {
  try {
    console.log("Connecting to DynamoDB Local...");

    const result = await client.send(
      new ListTablesCommand({})
    );

    console.log("Connected successfully!");
    console.log("Available tables:", result.TableNames);

    const student = await dynamoDB.send(
      new GetCommand({
        TableName: "Students",
        Key: {
          studentId: "student-demo-001"
        }
      })
    );

    console.log(
      "Student record:",
      student.Item || "Not found"
    );

    console.log("Database connection test completed!");

  } catch (error) {
    console.error("Connection failed:", error);
    process.exitCode = 1;
  }
}

testConnection();
