
const studentService = require("./studentService");
const applicationService = require("./applicationService");
const interviewService = require("./interviewService");
const offerService = require("./offerService");
const taskService = require("./taskService");

async function getDashboard(studentId) {
  // Retrieve records from DynamoDB through existing services
  const [
    students,
    allApplications,
    allInterviews,
    allOffers,
    allTasks
  ] = await Promise.all([
    studentService.getAllStudents(),
    applicationService.getAllApplications(),
    interviewService.getAllInterviews(),
    offerService.getAllOffers(),
    taskService.getAllTasks()
  ]);

  // Filter records for a student if studentId is provided
  const applications = studentId
    ? allApplications.filter(app => app.studentId === studentId)
    : allApplications;

  const applicationIds = new Set(
    applications.map(app => app.applicationId)
  );

  const interviews = studentId
    ? allInterviews.filter(item =>
        applicationIds.has(item.applicationId)
      )
    : allInterviews;

  const offers = studentId
    ? allOffers.filter(item =>
        applicationIds.has(item.applicationId)
      )
    : allOffers;

  const tasks = studentId
    ? allTasks.filter(task => task.studentId === studentId)
    : allTasks;

  // Calculate dashboard statistics
  return {
    totalStudents: studentId ? 1 : students.length,

    totalApplications: applications.length,

    applicationsByStatus: {
      Applied: applications.filter(
        app => app.status === "Applied"
      ).length,

      Screening: applications.filter(
        app => app.status === "Screening"
      ).length,

      Interview: applications.filter(
        app => app.status === "Interview"
      ).length,

      Offer: applications.filter(
        app => app.status === "Offer"
      ).length,

      Rejected: applications.filter(
        app => app.status === "Rejected"
      ).length
    },

    totalInterviews: interviews.length,

    scheduledInterviews: interviews.filter(
      item => item.interviewStatus === "Scheduled"
    ).length,

    totalOffers: offers.length,

    pendingOffers: offers.filter(
      item => item.offerStatus === "Pending"
    ).length,

    acceptedOffers: offers.filter(
      item => item.offerStatus === "Accepted"
    ).length,

    declinedOffers: offers.filter(
      item => item.offerStatus === "Declined"
    ).length,

    totalTasks: tasks.length,

    pendingTasks: tasks.filter(
      task => task.taskStatus === "Pending"
    ).length,

    inProgressTasks: tasks.filter(
      task => task.taskStatus === "In Progress"
    ).length,

    completedTasks: tasks.filter(
      task => task.taskStatus === "Completed"
    ).length
  };
}

module.exports = {
  getDashboard
};
