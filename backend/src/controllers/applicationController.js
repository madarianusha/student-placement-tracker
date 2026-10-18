
const service = require("../services/applicationService");
const studentService = require("../services/studentService");

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

// DELETE application
exports.remove = async (req, res) => {
  try {
    const deleted = await service.deleteApplication(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    res.json({
      message: "Application deleted successfully"
    });
  } catch (error) {
    console.error(error);
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
