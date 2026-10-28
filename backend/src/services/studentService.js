
const { randomUUID } = require("crypto");

const {
  DescribeTableCommand
} = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  TransactWriteCommand
} = require("@aws-sdk/lib-dynamodb");

const { client } = require("../config/db");

const db = DynamoDBDocumentClient.from(client);

const STUDENTS_TABLE = "Students";

const RELATED_TABLES = [
  "ApplicationActivity",
  "Interviews",
  "Offers",
  "Tasks"
];

// GET all students
async function getAllStudents() {
  const students = [];
  let lastKey;

  do {
    const result = await db.send(
      new ScanCommand({
        TableName: STUDENTS_TABLE,
        ExclusiveStartKey: lastKey
      })
    );

    students.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return students;
}

// GET student by ID
async function getStudentById(studentId) {
  const result = await db.send(
    new GetCommand({
      TableName: STUDENTS_TABLE,
      Key: { studentId }
    })
  );

  return result.Item || null;
}

// CREATE student
async function createStudent(data) {
  const student = {
    ...data,
    studentId: randomUUID()
  };

  await db.send(
    new PutCommand({
      TableName: STUDENTS_TABLE,
      Item: student
    })
  );

  return student;
}

// UPDATE student
async function updateStudent(studentId, updates) {
  const student = await getStudentById(studentId);

  if (!student) {
    return null;
  }

  const allowedFields = [
    "name",
    "email",
    "major",
    "graduationYear"
  ];

  const updatedStudent = { ...student };

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updatedStudent[field] = updates[field];
    }
  }

  await db.send(
    new PutCommand({
      TableName: STUDENTS_TABLE,
      Item: updatedStudent
    })
  );

  return updatedStudent;
}

// Scan all pages and return matching records
async function scanMatching(tableName, matches) {
  const records = [];
  let lastKey;

  do {
    const result = await db.send(
      new ScanCommand({
        TableName: tableName,
        ConsistentRead: true,
        ExclusiveStartKey: lastKey
      })
    );

    for (const item of result.Items || []) {
      if (matches(item)) {
        records.push(item);
      }
    }

    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return records;
}

// Read the actual primary key of a table
async function getTableKeyNames(tableName) {
  const result = await client.send(
    new DescribeTableCommand({
      TableName: tableName
    })
  );

  const keyNames = result.Table.KeySchema.map(
    key => key.AttributeName
  );

  return keyNames;
}

// Build one safe transaction delete operation
async function buildDeleteOperation(
  tableName,
  item,
  studentId
) {
  const keyNames = await getTableKeyNames(tableName);

  const Key = {};

  for (const name of keyNames) {
    if (item[name] === undefined) {
      throw new Error(
        `Missing primary key ${name} in ${tableName}`
      );
    }

    Key[name] = item[name];
  }

  const names = {
    "#pk": keyNames[0]
  };

  let condition = "attribute_exists(#pk)";
  const values = {};

  // Verify a related record still belongs
  // to the student or one of their applications
  if (tableName !== STUDENTS_TABLE) {
    if (item.studentId === studentId) {
      names["#relation"] = "studentId";
      values[":relation"] = studentId;
    } else if (item.applicationId !== undefined) {
      names["#relation"] = "applicationId";
      values[":relation"] = item.applicationId;
    }

    if (names["#relation"]) {
      condition += " AND #relation = :relation";
    }
  }

  const Delete = {
    TableName: tableName,
    Key,
    ConditionExpression: condition,
    ExpressionAttributeNames: names
  };

  if (Object.keys(values).length > 0) {
    Delete.ExpressionAttributeValues = values;
  }

  return { Delete };
}

// DELETE student and all linked records
async function deleteStudent(studentId) {
  const student = await getStudentById(studentId);

  if (!student) {
    return false;
  }

  // Find the student's applications
  const applications = await scanMatching(
    "JobApplications",
    item => item.studentId === studentId
  );

  const applicationIds = new Set(
    applications
      .map(item => item.applicationId)
      .filter(id => id !== undefined && id !== null)
  );

  // Match by studentId OR linked applicationId
  const matchesStudent = item =>
    item.studentId === studentId ||
    (
      item.applicationId !== undefined &&
      applicationIds.has(item.applicationId)
    );

  const related = {};

  for (const tableName of RELATED_TABLES) {
    related[tableName] = await scanMatching(
      tableName,
      matchesStudent
    );
  }

  // Gather every record to delete
  const records = [
    ...applications.map(item => ({
      tableName: "JobApplications",
      item
    })),

    ...RELATED_TABLES.flatMap(tableName =>
      related[tableName].map(item => ({
        tableName,
        item
      }))
    ),

    {
      tableName: STUDENTS_TABLE,
      item: student
    }
  ];

  // DynamoDB transactions support at most
  // 100 actions in a single transaction.
  // Refuse rather than partially delete.
  if (records.length > 100) {
    const error = new Error(
      "Student has too many linked records for " +
      "one atomic deletion. No records were deleted."
    );

    error.code = "CASCADE_LIMIT_EXCEEDED";
    error.status = 409;
    throw error;
  }

  // Prepare all deletion operations first
  const operations = [];

  for (const record of records) {
    operations.push(
      await buildDeleteOperation(
        record.tableName,
        record.item,
        studentId
      )
    );
  }

  // All-or-nothing database deletion
  await db.send(
    new TransactWriteCommand({
      TransactItems: operations
    })
  );

  return {
    deleted: true,
    studentId,
    deletedRecords: {
      applications: applications.length,
      activity: related.ApplicationActivity.length,
      interviews: related.Interviews.length,
      offers: related.Offers.length,
      tasks: related.Tasks.length,
      students: 1
    }
  };
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
