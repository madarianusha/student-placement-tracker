
const {
  DynamoDBClient,
  DescribeTableCommand,
  UpdateTableCommand
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local"
  }
});

const indexes = [
  {
    table: "JobApplications",
    indexName: "studentId-index",
    key: "studentId"
  },
  {
    table: "Interviews",
    indexName: "applicationId-index",
    key: "applicationId"
  },
  {
    table: "Offers",
    indexName: "applicationId-index",
    key: "applicationId"
  },
  {
    table: "Tasks",
    indexName: "studentId-index",
    key: "studentId"
  },
  {
    table: "ApplicationActivity",
    indexName: "applicationId-index",
    key: "applicationId"
  }
];

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

async function waitForIndex(tableName, indexName) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const result = await client.send(
      new DescribeTableCommand({
        TableName: tableName
      })
    );

    const table = result.Table;
    const index = (table.GlobalSecondaryIndexes || [])
      .find(i => i.IndexName === indexName);

    if (table.TableStatus === "ACTIVE" &&
        index?.IndexStatus === "ACTIVE") {
      return;
    }

    await sleep(1000);
  }

  throw new Error(
    `Timed out waiting for ${tableName}/${indexName}`
  );
}

async function addIndexes() {
  for (const item of indexes) {
    const result = await client.send(
      new DescribeTableCommand({
        TableName: item.table
      })
    );

    const existingIndexes =
      result.Table.GlobalSecondaryIndexes || [];

    const exists = existingIndexes.some(
      index => index.IndexName === item.indexName
    );

    if (exists) {
      console.log(
        `${item.table}: index already exists`
      );
    } else {
      await client.send(
        new UpdateTableCommand({
          TableName: item.table,

          AttributeDefinitions: [
            {
              AttributeName: item.key,
              AttributeType: "S"
            }
          ],

          GlobalSecondaryIndexUpdates: [
            {
              Create: {
                IndexName: item.indexName,

                KeySchema: [
                  {
                    AttributeName: item.key,
                    KeyType: "HASH"
                  }
                ],

                Projection: {
                  ProjectionType: "ALL"
                }
              }
            }
          ]
        })
      );

      console.log(
        `${item.table}: index creation started`
      );
    }

    await waitForIndex(
      item.table,
      item.indexName
    );

    console.log(
      `${item.table}: ${item.indexName} is ACTIVE`
    );
  }

  console.log("\nAll five indexes are ready!");
}

addIndexes().catch(error => {
  console.error("Index setup failed:", error);
  process.exitCode = 1;
});
