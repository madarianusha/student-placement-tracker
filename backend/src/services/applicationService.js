
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

const APPLICATION_TABLE = "JobApplications";
const ACTIVITY_TABLE = "ApplicationActivity";

const validStatuses = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected"
];

// GET ALL APPLICATIONS
async function getAllApplications() {
  const applications = [];
  let lastKey;

  do {
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: APPLICATION_TABLE,
        ExclusiveStartKey: lastKey
      })
    );

    applications.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return applications;
}

// GET APPLICATION BY ID
async function getApplicationById(id) {
  const result = await dynamoDB.send(
    new GetCommand({
      TableName: APPLICATION_TABLE,
      Key: {
        applicationId: id
      }
    })
  );

  return result.Item || null;
}

// CREATE APPLICATION
async function createApplication(data) {
  const application = {
    applicationId: randomUUID(),
    studentId: data.studentId,
    company: data.company,
    jobTitle: data.jobTitle,
    status: "Applied",
    appliedDate:
      data.appliedDate ||
      new Date().toISOString().slice(0, 10)
  };

  await dynamoDB.send(
    new PutCommand({
      TableName: APPLICATION_TABLE,
      Item: application,
      ConditionExpression:
        "attribute_not_exists(applicationId)"
    })
  );

  return application;
}

// UPDATE APPLICATION
async function updateApplication(id, data) {
  const application = await getApplicationById(id);

  if (!application) return null;

  const previousStatus = application.status;

  const allowedFields = [
    "company",
    "jobTitle",
    "status",
    "appliedDate"
  ];

  const updatedApplication = { ...application };

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      updatedApplication[field] = data[field];
    }
  }

  await dynamoDB.send(
    new PutCommand({
      TableName: APPLICATION_TABLE,
      Item: updatedApplication,
      ConditionExpression:
        "attribute_exists(applicationId)"
    })
  );

  // Record application status changes
  if (data.status && data.status !== previousStatus) {
    const activity = {
      activityId: randomUUID(),
      applicationId: id,
      activityType: "STATUS_CHANGED",
      activityDate: new Date().toISOString(),
      description:
        `${previousStatus} to ${data.status}`
    };

    await dynamoDB.send(
      new PutCommand({
        TableName: ACTIVITY_TABLE,
        Item: activity
      })
    );
  }

  return updatedApplication;
}

// DELETE APPLICATION
async function deleteApplication(id) {
  const application = await getApplicationById(id);

  if (!application) return false;

  await dynamoDB.send(
    new DeleteCommand({
      TableName: APPLICATION_TABLE,
      Key: {
        applicationId: id
      },
      ConditionExpression:
        "attribute_exists(applicationId)"
    })
  );

  return true;
}

// GET APPLICATION STATUS HISTORY
async function getApplicationHistory(id) {
  const activities = [];
  let lastKey;

  do {
    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: ACTIVITY_TABLE,
        IndexName: "applicationId-index",
        KeyConditionExpression:
          "applicationId = :id",
        ExpressionAttributeValues: {
          ":id": id
        },
        ExclusiveStartKey: lastKey
      })
    );

    activities.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return activities.sort(
    (a, b) =>
      a.activityDate.localeCompare(b.activityDate)
  );
}

module.exports = {
  validStatuses,
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationHistory
};
