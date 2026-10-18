
const service = require("../services/taskService");
const studentService = require("../services/studentService");
const applicationService = require("../services/applicationService");

const validPriorities = ["Low", "Medium", "High"];
const validStatuses = ["Pending", "In Progress", "Completed"];

function validDate(value) {
  if (typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
}

// GET ALL TASKS
exports.getAll = async (req, res) => {
  try {
    const tasks = await service.getAllTasks(
      req.query.studentId
    );

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch tasks"
    });
  }
};

// GET TASK BY ID
exports.getById = async (req, res) => {
  try {
    const task = await service.getTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
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
      priority
    } = req.body;

    if (!studentId || !taskTitle || !dueDate) {
      return res.status(400).json({
        message: "studentId, taskTitle, and dueDate are required"
      });
    }

    if (!validDate(dueDate)) {
      return res.status(400).json({
        message: "Invalid due date. Use YYYY-MM-DD"
      });
    }

    if (priority !== undefined &&
        !validPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid task priority"
      });
    }

    const student =
      await studentService.getStudentById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    if (applicationId) {
      const application =
        await applicationService.getApplicationById(
          applicationId
        );

      if (!application) {
        return res.status(404).json({
          message: "Application not found"
        });
      }

      if (application.studentId !== studentId) {
        return res.status(400).json({
          message: "Application does not belong to student"
        });
      }
    }

    const task = await service.createTask({
      studentId,
      applicationId,
      taskTitle,
      dueDate,
      priority
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create task"
    });
  }
};

// UPDATE TASK
exports.update = async (req, res) => {
  try {
    const { priority, taskStatus, dueDate } = req.body;

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

    if (dueDate !== undefined && !validDate(dueDate)) {
      return res.status(400).json({
        message: "Invalid due date. Use YYYY-MM-DD"
      });
    }

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
    console.error(error);
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
    console.error(error);
    res.status(500).json({
      message: "Failed to delete task"
    });
  }
};
