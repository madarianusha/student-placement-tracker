const service = require("../services/applicationService");
const studentService = require("../services/studentService");

exports.getAll = (req, res) => {
  res.json(service.getAllApplications());
};

exports.getById = (req, res) => {
  const application = service.getApplicationById(req.params.id);

  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  res.json(application);
};

exports.create = (req, res) => {
  const { studentId, company, jobTitle, appliedDate } = req.body;

  if (!studentId || !company || !jobTitle) {
    return res.status(400).json({
      message: "studentId, company, and jobTitle are required"
    });
  }

  if (!studentService.getStudentById(studentId)) {
    return res.status(404).json({ message: "Student not found" });
  }

  const application = service.createApplication({
    studentId,
    company,
    jobTitle,
    appliedDate
  });

  res.status(201).json(application);
};

exports.update = (req, res) => {
  const allowed = ["company", "jobTitle", "status", "appliedDate"];
  const data = {};

  for (const field of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      data[field] = req.body[field];
    }
  }

  if (data.status && !service.validStatuses.includes(data.status)) {
    return res.status(400).json({ message: "Invalid application status" });
  }

  const application = service.updateApplication(req.params.id, data);

  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  res.json(application);
};

exports.remove = (req, res) => {
  const deleted = service.deleteApplication(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: "Application not found" });
  }

  res.json({ message: "Application deleted successfully" });
};

exports.history = (req, res) => {
  if (!service.getApplicationById(req.params.id)) {
    return res.status(404).json({ message: "Application not found" });
  }

  res.json(service.getApplicationHistory(req.params.id));
};