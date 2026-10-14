const { randomUUID } = require("crypto");

const students = [];

function getAllStudents() {
  return students;
}

function getStudentById(id) {
  return students.find(student => student.studentId === id);
}

function createStudent(data) {
  const student = {
    studentId: randomUUID(),
    ...data
  };

  students.push(student);
  return student;
}

function updateStudent(id, data) {
  const student = getStudentById(id);

  if (!student) return null;

  Object.assign(student, data);
  return student;
}

function deleteStudent(id) {
  const index = students.findIndex(
    student => student.studentId === id
  );

  if (index === -1) return false;

  students.splice(index, 1);
  return true;
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};