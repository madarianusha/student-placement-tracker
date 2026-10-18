
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

const TABLE_NAME = "Offers";

// GET ALL OFFERS
async function getAllOffers(applicationId) {
  const offers = [];
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

    offers.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return offers;
}

// GET OFFER BY ID
async function getOfferById(id) {
  const result = await dynamoDB.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { offerId: id }
    })
  );

  return result.Item || null;
}

// CREATE OFFER
async function createOffer(data) {
  const offer = {
    offerId: randomUUID(),
    applicationId: data.applicationId,
    offerDate: data.offerDate,
    salary: data.salary,
    offerStatus: "Pending",
    responseDeadline: data.responseDeadline
  };

  await dynamoDB.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: offer,
      ConditionExpression: "attribute_not_exists(offerId)"
    })
  );

  return offer;
}

// UPDATE OFFER
async function updateOffer(id, data) {
  const existing = await getOfferById(id);

  if (!existing) return null;

  const allowedFields = [
    "offerDate",
    "salary",
    "offerStatus",
    "responseDeadline"
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
      ConditionExpression: "attribute_exists(offerId)"
    })
  );

  return updated;
}

// DELETE OFFER
async function deleteOffer(id) {
  const existing = await getOfferById(id);

  if (!existing) return false;

  await dynamoDB.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { offerId: id },
      ConditionExpression: "attribute_exists(offerId)"
    })
  );

  return true;
}

module.exports = {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer
};
