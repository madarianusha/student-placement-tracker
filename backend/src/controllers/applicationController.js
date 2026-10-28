
const service = require("../services/applicationService");
const studentService = require("../services/studentService");
const { db } = require("../../../database/db");

const {
  GetCommand,
  ScanCommand,
  TransactWriteCommand
} = require("@aws-sdk/lib-dynamodb");

// GET ALL APPLICATIONS
exports.getAll = async (req, res) => {
  try {
    const applications = await service.getAllApplications();
    res.json(applications);
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      message: "Failed to fetch applications"
    });
  }
};

// GET APPLICATION BY ID
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
    console.error("Get application error:", error);
    res.status(500).json({
      message: "Failed to fetch application"
    });
  }
};

// CREATE APPLICATION
exports.create = async (req, res) => {
  try {
    const {
      studentId,
      company,
      jobTitle,
      location,
      appliedDate
    } = req.body;

    // Validate required fields
    if (!studentId || !company || !jobTitle) {
      return res.status(400).json({
        message:
          "studentId, company, and jobTitle are required"
      });
    }

    // Validate optional location
    if (
      location !== undefined &&
      typeof location !== "string"
    ) {
      return res.status(400).json({
        message: "Location must be a string"
      });
    }

    // Check student exists
    const student = await studentService.getStudentById(
      studentId
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Create application with location
    const application = await service.createApplication({
      studentId,
      company,
      jobTitle,
      location: location?.trim() || "",
      appliedDate
    });

    res.status(201).json(application);

  } catch (error) {
    console.error("Create application error:", error);
    res.status(500).json({
      message: "Failed to create application"
    });
  }
};

// UPDATE APPLICATION
exports.update = async (req, res) => {
  try {
    const allowedFields = [
      "company",
      "jobTitle",
      "location",
      "status",
      "appliedDate"
    ];

    const data = {};

    for (const field of allowedFields) {
      if (
        Object.prototype.hasOwnProperty.call(
          req.body,
          field
        )
      ) {
        data[field] = req.body[field];
      }
    }

    // Validate location
    if (
      data.location !== undefined &&
      typeof data.location !== "string"
    ) {
      return res.status(400).json({
        message: "Location must be a string"
      });
    }

    if (data.location !== undefined) {
      data.location = data.location.trim();
    }

    // Validate application status
    if (
      data.status !== undefined &&
      !service.validStatuses.includes(data.status)
    ) {
      return res.status(400).json({
        message: "Invalid application status"
      });
    }

    // Update application
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
    console.error("Update application error:", error);
    res.status(500).json({
      message: "Failed to update application"
    });
  }
};

// FIND RECORDS LINKED TO AN APPLICATION
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

// DELETE APPLICATION
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

    // Prevent deletion when linked records exist
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

    // Check transaction limit
    if (history.length > 99) {
      return res.status(409).json({
        message:
          "Too many history records to delete in one operation"
      });
    }

    // Prepare history deletion operations
    const operations = history.map((item) => ({
      Delete: {
        TableName: "ApplicationActivity",
        Key: {
          activityId: item.activityId
        }
      }
    }));

    // Include application deletion
    operations.push({
      Delete: {
        TableName: "JobApplications",
        Key: { applicationId },
        ConditionExpression:
          "attribute_exists(applicationId)"
      }
    });

    // Execute transaction
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

    if (
      error.name === "TransactionCanceledException"
    ) {
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

// GET APPLICATION STATUS HISTORY
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
    console.error("Get application history error:", error);
    res.status(500).json({
      message: "Failed to fetch application history"
    });
  }
};
