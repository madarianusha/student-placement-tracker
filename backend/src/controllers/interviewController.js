
const service = require("../services/interviewService");
const applicationService = require("../services/applicationService");

const validTypes = ["Online", "Phone", "In Person"];
const validStatuses = ["Scheduled", "Completed", "Cancelled"];

// GET ALL INTERVIEWS
exports.getAll = async (req, res) => {
  try {
    const interviews = await service.getAllInterviews(
      req.query.applicationId
    );

    res.json(interviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch interviews"
    });
  }
};

// GET INTERVIEW BY ID
exports.getById = async (req, res) => {
  try {
    const interview = await service.getInterviewById(
      req.params.id
    );

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found"
      });
    }

    res.json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch interview"
    });
  }
};

// CREATE INTERVIEW
exports.create = async (req, res) => {
  try {
    const {
      applicationId,
      interviewDate,
      interviewType,
      notes
    } = req.body;

    if (!applicationId || !interviewDate || !interviewType) {
      return res.status(400).json({
        message:
          "applicationId, interviewDate, and interviewType are required"
      });
    }

    if (
      typeof interviewDate !== "string" ||
      !Number.isFinite(Date.parse(interviewDate))
    ) {
      return res.status(400).json({
        message: "Invalid interview date"
      });
    }

    if (!validTypes.includes(interviewType)) {
      return res.status(400).json({
        message: "Invalid interview type"
      });
    }

    const application =
      await applicationService.getApplicationById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    const interview = await service.createInterview({
      applicationId,
      interviewDate,
      interviewType,
      notes
    });

    res.status(201).json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create interview"
    });
  }
};

// UPDATE INTERVIEW
exports.update = async (req, res) => {
  try {
    const { interviewStatus, interviewType, interviewDate } =
      req.body;

    if (
      interviewStatus !== undefined &&
      !validStatuses.includes(interviewStatus)
    ) {
      return res.status(400).json({
        message: "Invalid interview status"
      });
    }

    if (
      interviewType !== undefined &&
      !validTypes.includes(interviewType)
    ) {
      return res.status(400).json({
        message: "Invalid interview type"
      });
    }

    if (
      interviewDate !== undefined &&
      (typeof interviewDate !== "string" ||
       !Number.isFinite(Date.parse(interviewDate)))
    ) {
      return res.status(400).json({
        message: "Invalid interview date"
      });
    }

    const interview = await service.updateInterview(
      req.params.id,
      req.body
    );

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found"
      });
    }

    res.json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update interview"
    });
  }
};

// DELETE INTERVIEW
exports.remove = async (req, res) => {
  try {
    const deleted = await service.deleteInterview(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Interview not found"
      });
    }

    res.json({
      message: "Interview deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete interview"
    });
  }
};
