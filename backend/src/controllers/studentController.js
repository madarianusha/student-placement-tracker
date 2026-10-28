
const service = require("../services/studentService");
const taskService = require("../services/taskService");

// GET ALL STUDENTS
exports.getAll = async (req, res) => {
  try {
    const students = await service.getAllStudents();

    res.status(200).json(students);

  } catch (error) {
    console.error("Error fetching students:", error);

    res.status(500).json({
      message: "Failed to fetch students"
    });
  }
};

// GET STUDENT BY ID
exports.getById = async (req, res) => {
  try {
    const student = await service.getStudentById(
      req.params.id
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json(student);

  } catch (error) {
    console.error("Error fetching student:", error);

    res.status(500).json({
      message: "Failed to fetch student"
    });
  }
};

// CREATE STUDENT
exports.create = async (req, res) => {
  try {
    const {
      name,
      email,
      major,
      graduationYear
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        message: "Name and email are required"
      });
    }

    const studentData = {
      name: name.trim(),
      email: email.trim()
    };

    if (major !== undefined) {
      studentData.major = major;
    }

    if (graduationYear !== undefined) {
      studentData.graduationYear = graduationYear;
    }

    const student = await service.createStudent(
      studentData
    );

    res.status(201).json(student);

  } catch (error) {
    console.error("Error creating student:", error);

    res.status(500).json({
      message: "Failed to create student"
    });
  }
};

// UPDATE STUDENT
exports.update = async (req, res) => {
  try {
    const student = await service.updateStudent(
      req.params.id,
      req.body
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json(student);

  } catch (error) {
    console.error("Error updating student:", error);

    res.status(500).json({
      message: "Failed to update student"
    });
  }
};

// DELETE STUDENT

exports.remove = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Step 1: Check student exists
    const student = await service.getStudentById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Step 2: Retrieve applications and tasks
    const [applications, tasks] = await Promise.all([
      applicationService.getAllApplications(),
      taskService.getAllTasks()
    ]);

    // Step 3: Find records belonging to this student
    const linkedApplications = applications.filter(
      app => app.studentId === studentId
    );

    const linkedTasks = tasks.filter(
      task => task.studentId === studentId
    );

    // Debugging information
    console.log("Student deletion check:", {
      studentId,
      applications: linkedApplications.length,
      tasks: linkedTasks.length
    });

    // Step 4: Prevent deletion when records exist
    if (
      linkedApplications.length > 0 ||
      linkedTasks.length > 0
    ) {
      return res.status(409).json({
        message:
          "Cannot delete student. Delete linked applications and tasks first."
      });
    }

    // Step 5: Delete student only when safe
    const deleted = await service.deleteStudent(studentId);

    if (!deleted) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json({
      message: "Student deleted successfully"
    });

  } catch (error) {
    if (error.code === "STUDENT_HAS_LINKED_RECORDS") {
      return res.status(409).json({
        message:
          "Cannot delete student. Delete linked applications and tasks first."
      });
    }

    console.error("Student deletion error:", error);

    res.status(500).json({
      message: "Failed to delete student"
    });
  }
};
