
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

const TABLE_NAME = "Interviews";

// GET ALL INTERVIEWS
async function getAllInterviews(applicationId) {
  const interviews = [];
  let lastKey;

  do {
    const params = applicationId
      ? {
          TableName: TABLE_NAME,
          IndexName: "applicationId-index",
          KeyConditionExpression: "applicationId = :id",
          ExpressionAttributeValues: {
            ":id": applicationId
          },
          ExclusiveStartKey: lastKey
        }
      : {
          TableName: TABLE_NAME,
          ExclusiveStartKey: lastKey
        };

    const result = await dynamoDB.send(
      applicationId
        ? new QueryCommand(params)
        : new ScanCommand(params)
    );

    interviews.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return interviews;
}

// GET INTERVIEW BY ID
async function getInterviewById(id) {
  const result = await dynamoDB.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { interviewId: id }
    })
  );

  return result.Item || null;
}

// CREATE INTERVIEW
async function createInterview(data) {
  const interview = {
    interviewId: randomUUID(),
    applicationId: data.applicationId,
    interviewDate: data.interviewDate,
    interviewType: data.interviewType,
    interviewStatus: "Scheduled",
    notes: data.notes || ""
  };

  await dynamoDB.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: interview,
      ConditionExpression: "attribute_not_exists(interviewId)"
    })
  );

  return interview;
}

// UPDATE INTERVIEW
async function updateInterview(id, data) {
  const existing = await getInterviewById(id);

  if (!existing) return null;

  const allowedFields = [
    "interviewDate",
    "interviewType",
    "interviewStatus",
    "notes"
  ];

  const updated = { ...existing };

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      updated[field] = data[field];
    }
  }

  await dynamoDB.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: updated,
      ConditionExpression: "attribute_exists(interviewId)"
    })
  );

  return updated;
}

// DELETE INTERVIEW
async function deleteInterview(id) {
  const existing = await getInterviewById(id);

  if (!existing) return false;

  await dynamoDB.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { interviewId: id },
      ConditionExpression: "attribute_exists(interviewId)"
    })
  );

  return true;
}

module.exports = {
  getAllInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview
};
