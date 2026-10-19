const { ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const { client } = require("./db");

async function testConnection() {
  try {
    const result = await client.send(new ListTablesCommand({}));
    console.log("Connected successfully!");
    console.log("Tables:", result.TableNames);
  } catch (error) {
    console.error("Connection failed:", error.message);
  }
}

testConnection();