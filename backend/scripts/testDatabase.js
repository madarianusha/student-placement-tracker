
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
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

async function testDatabase() {
  const tableName = "Tasks";
  const taskId = "task-crud-test-001";

  // 1. CREATE
  console.log("\n1. Creating task...");

  await db.send(new PutCommand({
    TableName: tableName,
    Item: {
      taskId: taskId,
      studentId: "student-demo-001",
      taskTitle: "Prepare resume",
      dueDate: "2026-10-22",
      priority: "High",
      taskStatus: "Pending"
    }
  }));

  console.log("Task created successfully!");

  // 2. READ
  console.log("\n2. Reading task...");

  const readResult = await db.send(new GetCommand({
    TableName: tableName,
    Key: { taskId: taskId }
  }));

  console.log(readResult.Item);

  // 3. UPDATE
  console.log("\n3. Updating task...");

  const updateResult = await db.send(new UpdateCommand({
    TableName: tableName,
    Key: { taskId: taskId },
    UpdateExpression: "SET taskStatus = :status",
    ExpressionAttributeValues: {
      ":status": "Completed"
    },
    ConditionExpression: "attribute_exists(taskId)",
    ReturnValues: "ALL_NEW"
  }));

  console.log("Updated record:", updateResult.Attributes);

  // 4. SCAN
  console.log("\n4. Viewing tasks...");

  const scanResult = await db.send(new ScanCommand({
    TableName: tableName
  }));

  console.log(scanResult.Items);

  // 5. DELETE
  console.log("\n5. Deleting test task...");

  await db.send(new DeleteCommand({
    TableName: tableName,
    Key: { taskId: taskId }
  }));

  console.log("Task deleted successfully!");

  // 6. VERIFY DELETION
  const verifyResult = await db.send(new GetCommand({
    TableName: tableName,
    Key: { taskId: taskId }
  }));

  console.log(
    "Record after deletion:",
    verifyResult.Item || "Not found"
  );

  console.log("\nDatabase CRUD testing completed!");
}

testDatabase().catch(error => {
  console.error("Database test failed:", error);
  process.exitCode = 1;
});
