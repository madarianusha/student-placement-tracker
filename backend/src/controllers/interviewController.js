const service = require("../services/interviewService");
const applicationService = require("../services/applicationService");

exports.getAll = (req, res) => {
  res.json(service.getAllInterviews());
};

exports.getById = (req, res) => {
  const interview = service.getInterviewById(req.params.id);

  if (!interview) {
    return res.status(404).json({
      message: "Interview not found"
    });
  }

  res.json(interview);
};

exports.create = (req, res) => {
  const {
    applicationId,
    interviewDate,
    interviewType,
    notes
  } = req.body;

  if (!applicationId || !interviewDate || !interviewType) {
    return res.status(400).json({
      message: "applicationId, interviewDate, and interviewType are required"
    });
  }

  if (!applicationService.getApplicationById(applicationId)) {
    return res.status(404).json({
      message: "Application not found"
    });
  }

  const interview = service.createInterview({
    applicationId,
    interviewDate,
    interviewType,
    notes
  });

  res.status(201).json(interview);
};

exports.update = (req, res) => {
  const interview = service.updateInterview(
    req.params.id,
    req.body
  );

  if (!interview) {
    return res.status(404).json({
      message: "Interview not found"
    });
  }

  res.json(interview);
};

exports.remove = (req, res) => {
  const deleted = service.deleteInterview(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      message: "Interview not found"
    });
  }

  res.json({
    message: "Interview deleted successfully"
  });
};