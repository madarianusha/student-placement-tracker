const { randomUUID } = require("crypto");

const tasks = [];

function getAllTasks(studentId) {
  if (studentId) {
    return tasks.filter(task => task.studentId === studentId);
  }
  return tasks;
}

function getTaskById(id) {
  return tasks.find(task => task.taskId === id);
}

function createTask(data) {
  const task = {
    taskId: randomUUID(),
    studentId: data.studentId,
    applicationId: data.applicationId || null,
    taskTitle: data.taskTitle,
    dueDate: data.dueDate,
    priority: data.priority || "Medium",
    taskStatus: "Pending"
  };

  tasks.push(task);
  return task;
}

function updateTask(id, data) {
  const task = getTaskById(id);
  if (!task) return null;

  const allowed = [
    "taskTitle",
    "dueDate",
    "priority",
    "taskStatus"
  ];

  for (const field of allowed) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      task[field] = data[field];
    }
  }

  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex(
    task => task.taskId === id
  );

  if (index === -1) return false;

  tasks.splice(index, 1);
  return true;
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};