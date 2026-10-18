
const service = require("../services/studentService");

// GET - Retrieve all students
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

// GET - Retrieve student by ID
exports.getById = async (req, res) => {
  try {
    const student = await service.getStudentById(req.params.id);

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

// POST - Create a student
exports.create = async (req, res) => {
  try {
    const { name, email, major, graduationYear } = req.body;

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

    if (major !== undefined) studentData.major = major;
    if (graduationYear !== undefined) {
      studentData.graduationYear = graduationYear;
    }

    const student = await service.createStudent(studentData);

    res.status(201).json(student);
  } catch (error) {
    console.error("Error creating student:", error);

    res.status(500).json({
      message: "Failed to create student"
    });
  }
};

// PUT - Update student information
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

// DELETE - Delete student
exports.remove = async (req, res) => {
  try {
    const deleted = await service.deleteStudent(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json({
      message: "Student deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting student:", error);

    res.status(500).json({
      message: "Failed to delete student"
    });
  }
};
