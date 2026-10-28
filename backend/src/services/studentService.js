
const { randomUUID } = require("crypto");

const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
  QueryCommand
} = require("@aws-sdk/lib-dynamodb");

const { client } = require("../config/db");

const dynamoDB = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "Students";

// GET ALL STUDENTS
async function getAllStudents() {
  const students = [];
  let lastKey;

  do {
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        ExclusiveStartKey: lastKey
      })
    );

    students.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;

  } while (lastKey);

  return students;
}

// GET STUDENT BY ID
async function getStudentById(id) {
  const result = await dynamoDB.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { studentId: id }
    })
  );

  return result.Item || null;
}

// CREATE STUDENT
async function createStudent(data) {
  const student = {
    studentId: randomUUID(),
    ...data
  };

  await dynamoDB.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: student,
      ConditionExpression:
        "attribute_not_exists(studentId)"
    })
  );

  return student;
}

// UPDATE STUDENT
async function updateStudent(id, data) {
  const student = await getStudentById(id);

  if (!student) return null;

  const allowed = [
    "name",
    "email",
    "major",
    "graduationYear"
  ];

  for (const field of allowed) {
    if (
      Object.prototype.hasOwnProperty.call(data, field)
    ) {
      student[field] = data[field];
    }
  }

  await dynamoDB.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: student,
      ConditionExpression:
        "attribute_exists(studentId)"
    })
  );

  return student;
}

// CHECK FOR RELATED RECORDS

async function hasLinkedRecords(tableName, studentId) {
  let lastKey;

  do {
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: tableName,
        ConsistentRead: true,
        FilterExpression: "#sid = :studentId",
        ExpressionAttributeNames: {
          "#sid": "studentId"
        },
        ExpressionAttributeValues: {
          ":studentId": studentId
        },
        ProjectionExpression: "#sid",
        ExclusiveStartKey: lastKey
      })
    );

    // Found a related record
    if (result.Items && result.Items.length > 0) {
      return true;
    }

    lastKey = result.LastEvaluatedKey;

  } while (lastKey);

  // No related records found
  return false;
}


// DELETE STUDENT

async function deleteStudent(id) {
  const student = await getStudentById(id);

  if (!student) {
    return false;
  }

  // Check applications and tasks
  const [hasApplications, hasTasks] = await Promise.all([
    hasLinkedRecords("JobApplications", id),
    hasLinkedRecords("Tasks", id)
  ]);

  // Temporary log for testing
  console.log("Student deletion check:", {
    studentId: id,
    hasApplications,
    hasTasks
  });

  // Stop deletion if related records exist
  if (hasApplications || hasTasks) {
    const error = new Error(
      "Cannot delete student. Delete linked applications and tasks first."
    );

    error.code = "STUDENT_HAS_LINKED_RECORDS";
    throw error;
  }

  // Delete only if no related records exist
  try {
    await dynamoDB.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { studentId: id },
        ConditionExpression:
          "attribute_exists(studentId)"
      })
    );
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      return false;
    }

    throw error;
  }

  return true;
}


  // Check related applications and tasks
  const [hasApplications, hasTasks] =
    await Promise.all([
      hasLinkedRecords("JobApplications", id),
      hasLinkedRecords("Tasks", id)
    ]);

  // Prevent deletion when linked records exist
  if (hasApplications || hasTasks) {
    const error = new Error(
      "Cannot delete student. Delete linked applications and tasks first."
    );

    error.code = "STUDENT_HAS_LINKED_RECORDS";

    throw error;
  }

  // Delete student when no linked records exist
  try {
    await dynamoDB.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { studentId: id },
        ConditionExpression:
          "attribute_exists(studentId)"
      })
    );
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      return false;
    }

    throw error;
  }

  return true;
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
