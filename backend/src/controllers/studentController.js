const service = require("../services/studentService");

exports.getAll = (req, res) => {
  res.json(service.getAllStudents());
};

exports.getById = (req, res) => {
  const student = service.getStudentById(req.params.id);

  if (!student) {
    return res.status(404).json({
      message: "Student not found"
    });
  }

  res.json(student);
};

exports.create = (req, res) => {
  const { name, email, major, graduationYear } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: "Name and email are required"
    });
  }

  const student = service.createStudent({
    name,
    email,
    major,
    graduationYear
  });

  res.status(201).json(student);
};

exports.update = (req, res) => {
  const student = service.updateStudent(
    req.params.id,
    req.body
  );

  if (!student) {
    return res.status(404).json({
      message: "Student not found"
    });
  }

  res.json(student);
};

exports.remove = (req, res) => {
  const deleted = service.deleteStudent(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      message: "Student not found"
    });
  }

  res.json({
    message: "Student deleted successfully"
  });
};