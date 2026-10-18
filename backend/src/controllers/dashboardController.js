
const dashboardService = require("../services/dashboardService");
const studentService = require("../services/studentService");

// GET DASHBOARD
exports.getDashboard = async (req, res) => {
  try {
    const { studentId } = req.query;

    if (studentId !== undefined) {
      if (typeof studentId !== "string" || !studentId.trim()) {
        return res.status(400).json({
          message: "Valid studentId is required"
        });
      }

      const student = await studentService.getStudentById(studentId);

      if (!student) {
        return res.status(404).json({
          message: "Student not found"
        });
      }
    }

    const dashboard = await dashboardService.getDashboard(studentId);

    res.json(dashboard);

  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      message: "Failed to fetch dashboard"
    });
  }
};
