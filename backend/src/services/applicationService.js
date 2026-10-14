const { randomUUID } = require("crypto");

const applications = [];
const activities = [];

const validStatuses = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected"
];

function getAllApplications() {
  return applications;
}

function getApplicationById(id) {
  return applications.find(app => app.applicationId === id);
}

function createApplication(data) {
  const application = {
    applicationId: randomUUID(),
    studentId: data.studentId,
    company: data.company,
    jobTitle: data.jobTitle,
    status: "Applied",
    appliedDate: data.appliedDate || new Date().toISOString().slice(0, 10)
  };

  applications.push(application);
  return application;
}

function updateApplication(id, data) {
  const application = getApplicationById(id);
  if (!application) return null;

  const previousStatus = application.status;

  Object.assign(application, data);

  if (data.status && data.status !== previousStatus) {
    activities.push({
      activityId: randomUUID(),
      applicationId: id,
      activityType: "STATUS_CHANGED",
      activityDate: new Date().toISOString(),
      description: `${previousStatus} to ${data.status}`
    });
  }

  return application;
}

function deleteApplication(id) {
  const index = applications.findIndex(
    app => app.applicationId === id
  );

  if (index === -1) return false;

  applications.splice(index, 1);
  return true;
}

function getApplicationHistory(id) {
  return activities.filter(
    activity => activity.applicationId === id
  );
}

module.exports = {
  validStatuses,
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationHistory
};