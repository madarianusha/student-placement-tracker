const {
  CreateTableCommand,
  waitUntilTableExists
} = require("@aws-sdk/client-dynamodb");

const { client } = require("./db");

const tables = [
  ["Students", "studentId", []],
  ["JobApplications", "applicationId", ["studentId"]],
  ["Interviews", "interviewId", ["applicationId"]],
  ["Offers", "offerId", ["applicationId"]],
  ["Tasks", "taskId", ["studentId", "applicationId"]],
  ["ApplicationActivity", "activityId", ["applicationId"]]
];

async function createTables() {
  for (const [name, primaryKey, indexKeys] of tables) {
    const definition = {
      TableName: name,
      BillingMode: "PAY_PER_REQUEST",
      KeySchema: [
        { AttributeName: primaryKey, KeyType: "HASH" }
      ],
      AttributeDefinitions: [primaryKey, ...indexKeys].map(
        key => ({ AttributeName: key, AttributeType: "S" })
      )
    };

    if (indexKeys.length > 0) {
      definition.GlobalSecondaryIndexes = indexKeys.map(key => ({
        IndexName: `${key}-index`,
        KeySchema: [
          { AttributeName: key, KeyType: "HASH" }
        ],
        Projection: { ProjectionType: "ALL" }
      }));
    }

    try {
      await client.send(new CreateTableCommand(definition));
    } catch (error) {
      if (error.name !== "ResourceInUseException") {
        throw error;
      }
    }

    await waitUntilTableExists(
      { client, maxWaitTime: 60 },
      { TableName: name }
    );

    console.log(`${name} is ready`);
  }
}

createTables().catch(error => {
  console.error("Error:", error.message);
  process.exitCode = 1;
});