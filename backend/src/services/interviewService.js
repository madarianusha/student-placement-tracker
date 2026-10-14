const { randomUUID } = require("crypto");

const interviews = [];

function getAllInterviews() {
  return interviews;
}

function getInterviewById(id) {
  return interviews.find(i => i.interviewId === id);
}

function createInterview(data) {
  const interview = {
    interviewId: randomUUID(),
    applicationId: data.applicationId,
    interviewDate: data.interviewDate,
    interviewType: data.interviewType,
    interviewStatus: "Scheduled",
    notes: data.notes || ""
  };

  interviews.push(interview);
  return interview;
}

function updateInterview(id, data) {
  const interview = getInterviewById(id);
  if (!interview) return null;

  const allowed = [
    "interviewDate",
    "interviewType",
    "interviewStatus",
    "notes"
  ];

  for (const field of allowed) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      interview[field] = data[field];
    }
  }

  return interview;
}

function deleteInterview(id) {
  const index = interviews.findIndex(
    i => i.interviewId === id
  );

  if (index === -1) return false;

  interviews.splice(index, 1);
  return true;
}

module.exports = {
  getAllInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview
};