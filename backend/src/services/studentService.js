
const { randomUUID } = require("crypto");

const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const { client } = require("../config/db");

const dynamoDB = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "Students";

// Get all students
async function getAllStudents() {
  const students = [];
  let lastKey;

  do {
    const result = await dynamoDB.send(new ScanCommand({
      TableName: TABLE_NAME,
      ExclusiveStartKey: lastKey
    }));

    students.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return students;
}

// Get student by ID
async function getStudentById(id) {
  const result = await dynamoDB.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { studentId: id }
  }));

  return result.Item || null;
}

// Create student
async function createStudent(data) {
  const student = {
    studentId: randomUUID(),
    ...data
  };

  await dynamoDB.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: student,
    ConditionExpression: "attribute_not_exists(studentId)"
  }));

  return student;
}

// Update student
async function updateStudent(id, data) {
  const student = await getStudentById(id);
  if (!student) return null;

  const allowed = ["name", "email", "major", "graduationYear"];

  for (const field of allowed) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      student[field] = data[field];
    }
  }

  await dynamoDB.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: student,
    ConditionExpression: "attribute_exists(studentId)"
  }));

  return student;
}

// Delete student
async function deleteStudent(id) {
  const student = await getStudentById(id);
  if (!student) return false;

  await dynamoDB.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { studentId: id },
    ConditionExpression: "attribute_exists(studentId)"
  }));

  return true;
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
