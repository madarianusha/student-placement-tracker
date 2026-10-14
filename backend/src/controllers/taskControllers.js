const service = require("../services/taskService");
const studentService = require("../services/studentService");
const applicationService = require("../services/applicationService");

const validPriorities = ["Low", "Medium", "High"];
const validStatuses = ["Pending", "In Progress", "Completed"];

exports.getAll = (req, res) => {
  const tasks = service.getAllTasks(req.query.studentId);
  res.json(tasks);
};

exports.getById = (req, res) => {
  const task = service.getTaskById(req.params.id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found"
    });
  }

  res.json(task);
};

exports.create = (req, res) => {
  const {
    studentId,
    applicationId,
    taskTitle,
    dueDate,
    priority
  } = req.body;

  if (!studentId || !taskTitle || !dueDate) {
    return res.status(400).json({
      message: "studentId, taskTitle, and dueDate are required"
    });
  }

  if (!studentService.getStudentById(studentId)) {
    return res.status(404).json({
      message: "Student not found"
    });
  }

  if (applicationId) {
    const application =
      applicationService.getApplicationById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    if (application.studentId !== studentId) {
      return res.status(400).json({
        message: "Application does not belong to this student"
      });
    }
  }

  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({
      message: "Invalid priority"
    });
  }

  const task = service.createTask({
    studentId,
    applicationId,
    taskTitle,
    dueDate,
    priority
  });

  res.status(201).json(task);
};

exports.update = (req, res) => {
  const { priority, taskStatus } = req.body;

  if (priority !== undefined &&
      !validPriorities.includes(priority)) {
    return res.status(400).json({
      message: "Invalid priority"
    });
  }

  if (taskStatus !== undefined &&
      !validStatuses.includes(taskStatus)) {
    return res.status(400).json({
      message: "Invalid task status"
    });
  }

  const task = service.updateTask(req.params.id, req.body);

  if (!task) {
    return res.status(404).json({
      message: "Task not found"
    });
  }

  res.json(task);
};

exports.remove = (req, res) => {
  const deleted = service.deleteTask(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      message: "Task not found"
    });
  }

  res.json({
    message: "Task deleted successfully"
  });
};