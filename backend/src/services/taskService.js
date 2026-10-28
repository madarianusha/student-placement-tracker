
const { randomUUID } = require("crypto");

const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  QueryCommand,
  DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const { client } = require("../config/db");

const dynamoDB = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "Tasks";

// GET ALL TASKS
async function getAllTasks(studentId) {
  const tasks = [];
  let lastKey;

  do {
    const params = studentId
      ? {
          TableName: TABLE_NAME,
          IndexName: "studentId-index",
          KeyConditionExpression: "studentId = :id",
          ExpressionAttributeValues: {
            ":id": studentId
          },
          ExclusiveStartKey: lastKey
        }
      : {
          TableName: TABLE_NAME,
          ExclusiveStartKey: lastKey
        };

    const result = await dynamoDB.send(
      studentId
        ? new QueryCommand(params)
        : new ScanCommand(params)
    );

    tasks.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;

  } while (lastKey);

  return tasks;
}

// GET TASK BY ID
async function getTaskById(id) {
  const result = await dynamoDB.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        taskId: id
      }
    })
  );

  return result.Item || null;
}

// CREATE TASK
async function createTask(data) {
  const task = {
    taskId: randomUUID(),
    studentId: data.studentId,
    taskTitle: data.taskTitle,
    dueDate: data.dueDate,
    priority: data.priority || "Medium",
    taskStatus: data.taskStatus || "Pending"
  };

  // Add applicationId only when an application is selected
  if (
    typeof data.applicationId === "string" &&
    data.applicationId.trim() !== ""
  ) {
    task.applicationId = data.applicationId.trim();
  }

  await dynamoDB.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: task,
      ConditionExpression:
        "attribute_not_exists(taskId)"
    })
  );

  return task;
}

// UPDATE TASK
async function updateTask(id, data) {
  const existing = await getTaskById(id);

  if (!existing) {
    return null;
  }

  const allowedFields = [
    "taskTitle",
    "dueDate",
    "priority",
    "taskStatus"
  ];

  const updated = { ...existing };

  for (const field of allowedFields) {
    if (
      Object.prototype.hasOwnProperty.call(
        data,
        field
      )
    ) {
      updated[field] = data[field];
    }
  }

  await dynamoDB.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: updated,
      ConditionExpression:
        "attribute_exists(taskId)"
    })
  );

  return updated;
}

// DELETE TASK
async function deleteTask(id) {
  const existing = await getTaskById(id);

  if (!existing) {
    return false;
  }

  await dynamoDB.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        taskId: id
      },
      ConditionExpression:
        "attribute_exists(taskId)"
    })
  );

  return true;
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
