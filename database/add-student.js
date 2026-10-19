const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { db } = require("./db");

async function addStudent() {
  await db.send(new PutCommand({
    TableName: "Students",
    Item: {
      studentId: "S001",
      name: "Sample Student",
      email: "student@example.com",
      major: "Computer Science",
      graduationYear: 2026
    }
  }));

  console.log("Sample student saved successfully!");
}

addStudent().catch(error => {
  console.error("Error:", error.message);
  process.exitCode = 1;
});