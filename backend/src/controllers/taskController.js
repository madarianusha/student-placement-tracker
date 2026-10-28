
const service = require("../services/taskService");
const studentService = require("../services/studentService");
const applicationService = require("../services/applicationService");

const validPriorities = ["Low", "Medium", "High"];

const validStatuses = [
  "Pending",
  "In Progress",
  "Completed"
];

// VALIDATE DATE
function validDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(value);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

// GET ALL TASKS
exports.getAll = async (req, res) => {
  try {
    const tasks = await service.getAllTasks(
      req.query.studentId
    );

    res.json(tasks);

  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      message: "Failed to fetch tasks"
    });
  }
};

// GET TASK BY ID
exports.getById = async (req, res) => {
  try {
    const task = await service.getTaskById(
      req.params.id
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json(task);

  } catch (error) {
    console.error("Get task error:", error);

    res.status(500).json({
      message: "Failed to fetch task"
    });
  }
};

// CREATE TASK
exports.create = async (req, res) => {
  try {
    const {
      studentId,
      applicationId,
      taskTitle,
      dueDate,
      priority = "Medium",
      taskStatus = "Pending"
    } = req.body;

    // Validate required fields
    if (
      !studentId ||
      !taskTitle ||
      !dueDate
    ) {
      return res.status(400).json({
        message:
          "studentId, taskTitle, and dueDate are required"
      });
    }

    // Validate due date
    if (!validDate(dueDate)) {
      return res.status(400).json({
        message: "Invalid due date. Use YYYY-MM-DD"
      });
    }

    // Validate priority
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid task priority"
      });
    }

    // Validate task status
    if (!validStatuses.includes(taskStatus)) {
      return res.status(400).json({
        message: "Invalid task status"
      });
    }

    // Check if student exists
    const student =
      await studentService.getStudentById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Validate optional application ID
    if (
      applicationId != null &&
      typeof applicationId !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid application ID"
      });
    }

    const normalizedApplicationId =
      typeof applicationId === "string"
        ? applicationId.trim()
        : "";

    // Check application if one was selected
    if (normalizedApplicationId) {
      const application =
        await applicationService.getApplicationById(
          normalizedApplicationId
        );

      if (!application) {
        return res.status(404).json({
          message: "Application not found"
        });
      }

      if (application.studentId !== studentId) {
        return res.status(400).json({
          message:
            "Application does not belong to student"
        });
      }
    }

    // Prepare task data
    const taskData = {
      studentId,
      taskTitle,
      dueDate,
      priority,
      taskStatus
    };

    // Include application only when selected
    if (normalizedApplicationId) {
      taskData.applicationId = normalizedApplicationId;
    }

    // Save task
    const task = await service.createTask(taskData);

    res.status(201).json(task);

  } catch (error) {
    console.error("Create task error:", error);

    res.status(500).json({
      message: "Failed to create task"
    });
  }
};

// UPDATE TASK
exports.update = async (req, res) => {
  try {
    const {
      priority,
      taskStatus,
      dueDate
    } = req.body;

    // Validate priority
    if (
      priority !== undefined &&
      !validPriorities.includes(priority)
    ) {
      return res.status(400).json({
        message: "Invalid priority"
      });
    }

    // Validate task status
    if (
      taskStatus !== undefined &&
      !validStatuses.includes(taskStatus)
    ) {
      return res.status(400).json({
        message: "Invalid task status"
      });
    }

    // Validate due date
    if (
      dueDate !== undefined &&
      !validDate(dueDate)
    ) {
      return res.status(400).json({
        message: "Invalid due date. Use YYYY-MM-DD"
      });
    }

    // Update task
    const task = await service.updateTask(
      req.params.id,
      req.body
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json(task);

  } catch (error) {
    console.error("Update task error:", error);

    res.status(500).json({
      message: "Failed to update task"
    });
  }
};

// DELETE TASK
exports.remove = async (req, res) => {
  try {
    const deleted = await service.deleteTask(
      req.params.id
    );

    if (!deleted) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json({
      message: "Task deleted successfully"
    });

  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      message: "Failed to delete task"
    });
  }
};
