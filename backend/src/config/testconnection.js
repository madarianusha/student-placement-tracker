require("dotenv").config();

const { ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const { client } = require("./db");

async function testConnection() {
  try {
    const result = await client.send(new ListTablesCommand({}));

    console.log("Connected to DynamoDB Local!");
    console.log("Available tables:", result.TableNames);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.destroy();
  }
}

testConnection();