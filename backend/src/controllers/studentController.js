
const studentService = require("../services/studentService");

// GET all students
exports.getAll = async (req, res) => {
  try {
    const students = await studentService.getAllStudents();

    res.status(200).json(students);
  } catch (error) {
    console.error("Get students error:", error);

    res.status(500).json({
      message: "Failed to fetch students"
    });
  }
};

// GET student by ID
exports.getById = async (req, res) => {
  try {
    const student = await studentService.getStudentById(
      req.params.id
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Get student error:", error);

    res.status(500).json({
      message: "Failed to fetch student"
    });
  }
};

// CREATE student
exports.create = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required"
      });
    }

    const student = await studentService.createStudent(
      req.body
    );

    res.status(201).json(student);
  } catch (error) {
    console.error("Create student error:", error);

    res.status(500).json({
      message: "Failed to create student"
    });
  }
};

// UPDATE student
exports.update = async (req, res) => {
  try {
    const updatedStudent =
      await studentService.updateStudent(
        req.params.id,
        req.body
      );

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent
    });
  } catch (error) {
    console.error("Update student error:", error);

    res.status(500).json({
      message: "Failed to update student"
    });
  }
};

// DELETE student

exports.remove = async (req, res) => {
  try {
    // Require explicit confirmation for permanent deletion
    if (req.query.confirm !== "DELETE") {
      return res.status(400).json({
        message:
          "Permanent deletion requires confirmation."
      });
    }

    const result = await studentService.deleteStudent(
      req.params.id
    );

    if (!result) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    return res.status(200).json({
      message:
        "Student and all linked records deleted successfully.",
      deletedRecords: result.deletedRecords
    });

  } catch (error) {
    console.error("Delete student error:", error);

    if (error.code === "CASCADE_LIMIT_EXCEEDED") {
      return res.status(409).json({
        message: error.message
      });
    }

    if (error.name === "TransactionCanceledException") {
      return res.status(409).json({
        message:
          "Records changed during deletion. Nothing was deleted. Please retry."
      });
    }

    return res.status(500).json({
      message: "Failed to delete student and linked records"
    });
  }
};

exports.delete = exports.remove;
