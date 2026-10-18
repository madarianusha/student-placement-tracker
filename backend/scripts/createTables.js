
const {
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local"
  }
});

const tables = [
  { name: "Students", key: "studentId" },
  { name: "JobApplications", key: "applicationId" },
  { name: "Interviews", key: "interviewId" },
  { name: "Offers", key: "offerId" },
  { name: "Tasks", key: "taskId" },
  { name: "ApplicationActivity", key: "activityId" }
];

async function createTables() {
  for (const table of tables) {
    try {
      await client.send(
        new CreateTableCommand({
          TableName: table.name,
          AttributeDefinitions: [
            {
              AttributeName: table.key,
              AttributeType: "S"
            }
          ],
          KeySchema: [
            {
              AttributeName: table.key,
              KeyType: "HASH"
            }
          ],
          BillingMode: "PAY_PER_REQUEST"
        })
      );

      console.log(`${table.name} table created successfully!`);
    } catch (error) {
      if (error.name === "ResourceInUseException") {
        console.log(`${table.name} table already exists.`);
      } else {
        throw error;
      }
    }
  }

  const result = await client.send(
    new ListTablesCommand({})
  );

  console.log("\nAvailable tables:");
  console.log(result.TableNames);
}

createTables().catch(console.error);
