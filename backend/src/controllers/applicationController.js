
const service = require("../services/applicationService");
const studentService = require("../services/studentService");
const { db } = require("../../../database/db");

const {
  GetCommand,
  ScanCommand,
  TransactWriteCommand
} = require("@aws-sdk/lib-dynamodb");

// GET all applications
exports.getAll = async (req, res) => {
  try {
    const applications = await service.getAllApplications();
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch applications"
    });
  }
};

// GET application by ID
exports.getById = async (req, res) => {
  try {
    const application = await service.getApplicationById(
      req.params.id
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch application"
    });
  }
};

// POST create application
exports.create = async (req, res) => {
  try {
    const { studentId, company, jobTitle, appliedDate } = req.body;

    if (!studentId || !company || !jobTitle) {
      return res.status(400).json({
        message: "studentId, company, and jobTitle are required"
      });
    }

    const student = await studentService.getStudentById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const application = await service.createApplication({
      studentId,
      company,
      jobTitle,
      appliedDate
    });

    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create application"
    });
  }
};

// PUT update application
exports.update = async (req, res) => {
  try {
    const allowedFields = [
      "company",
      "jobTitle",
      "status",
      "appliedDate"
    ];

    const data = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        data[field] = req.body[field];
      }
    }

    if (
      data.status !== undefined &&
      !service.validStatuses.includes(data.status)
    ) {
      return res.status(400).json({
        message: "Invalid application status"
      });
    }

    const application = await service.updateApplication(
      req.params.id,
      data
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update application"
    });
  }
};

// Find records linked to an application
async function linkedItems(table, applicationId) {
  const items = [];
  let lastKey;

  do {
    const result = await db.send(
      new ScanCommand({
        TableName: table,
        FilterExpression: "applicationId = :id",
        ExpressionAttributeValues: {
          ":id": applicationId
        },
        ExclusiveStartKey: lastKey
      })
    );

    items.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;

  } while (lastKey);

  return items;
}

// DELETE application
exports.remove = async (req, res) => {
  const applicationId = req.params.id;

  try {
    // Check whether application exists
    const existing = await db.send(
      new GetCommand({
        TableName: "JobApplications",
        Key: { applicationId }
      })
    );

    if (!existing.Item) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    // Check related records
    const [interviews, offers, tasks, history] =
      await Promise.all([
        linkedItems("Interviews", applicationId),
        linkedItems("Offers", applicationId),
        linkedItems("Tasks", applicationId),
        linkedItems("ApplicationActivity", applicationId)
      ]);

    // Prevent deleting applications with linked records
    if (
      interviews.length > 0 ||
      offers.length > 0 ||
      tasks.length > 0
    ) {
      return res.status(409).json({
        message:
          "Delete linked interviews, offers, and tasks first"
      });
    }

    // DynamoDB transactions support up to 100 operations
    if (history.length > 99) {
      return res.status(409).json({
        message:
          "Too many history records to delete in one operation"
      });
    }

    // Delete internal history and application together
    const operations = history.map((item) => ({
      Delete: {
        TableName: "ApplicationActivity",
        Key: {
          activityId: item.activityId
        }
      }
    }));

    operations.push({
      Delete: {
        TableName: "JobApplications",
        Key: { applicationId },
        ConditionExpression:
          "attribute_exists(applicationId)"
      }
    });

    await db.send(
      new TransactWriteCommand({
        TransactItems: operations
      })
    );

    res.json({
      message: "Application deleted successfully"
    });

  } catch (error) {
    console.error("Delete application error:", error);

    if (error.name === "TransactionCanceledException") {
      return res.status(409).json({
        message:
          "Application deletion could not be completed. Refresh and try again."
      });
    }

    res.status(500).json({
      message: "Failed to delete application"
    });
  }
};

// GET application status history
exports.history = async (req, res) => {
  try {
    const application = await service.getApplicationById(
      req.params.id
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    const history = await service.getApplicationHistory(
      req.params.id
    );

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch application history"
    });
  }
};
