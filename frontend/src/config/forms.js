
import { STATUS_CHOICES, todayISO } from '../format.js';

export const SCHEMA = {
  students: {
    singular: 'Student',
    fields: [
      { name:'name', label:'Full name', required:true, placeholder:'e.g. Alex Johnson' },
      { name:'email', label:'Email address', type:'email', required:true, placeholder:'alex@example.com' },
      { name:'major', label:'Major / program', placeholder:'Computer Science' },
      { name:'graduationYear', label:'Graduation year', placeholder:'2027' }
    ]
  },

  applications: {
    singular: 'Application',
    fields: [
      { name:'studentId', label:'Student', type:'student', required:true },
      { name:'company', label:'Company', required:true, placeholder:'e.g. Microsoft' },
      { name:'jobTitle', label:'Job title', required:true, placeholder:'Software Developer Intern' },
      { name:'location', label:'Location', placeholder:'Remote / City, State' },
      { name:'status', label:'Application status', type:'select', options:STATUS_CHOICES, required:true },
      { name:'appliedDate', label:'Date applied', type:'date', required:true }
    ]
  },

  interviews: {
    singular: 'Interview',
    fields: [
      { name:'applicationId', label:'Job application', type:'application', required:true },
      { name:'interviewDate', label:'Interview date', type:'date', required:true },
      { name:'interviewType', label:'Interview type', type:'select', options:['Online','Phone','In Person'], required:true },
      { name:'interviewStatus', label:'Interview status', type:'select', options:['Scheduled','Completed','Cancelled','Rescheduled'], required:true },
      { name:'notes', label:'Notes', type:'textarea', placeholder:'Preparation details, interviewers, or follow-up notes' }
    ]
  },

  offers: {
    singular: 'Offer',
    fields: [
      { name:'applicationId', label:'Job application', type:'application', required:true },
      { name:'offerDate', label:'Offer date', type:'date', required:true },
      { name:'salary', label:'Salary (USD)', type:'number', required:true, placeholder:'85000' },
      { name:'offerStatus', label:'Offer status', type:'select', options:['Pending','Accepted','Declined'], required:true },
      { name:'responseDeadline', label:'Response deadline', type:'date', required:true }
    ]
  },

  tasks: {
    singular: 'Task',
    fields: [
      { name:'studentId', label:'Student', type:'student', required:true },
      { name:'applicationId', label:'Related application (optional)', type:'application' },
      { name:'taskTitle', label:'Task title', required:true, placeholder:'Prepare for technical interview' },
      { name:'dueDate', label:'Due date', type:'date', required:true },
      { name:'priority', label:'Priority', type:'select', options:['Low','Medium','High'], required:true },
      { name:'taskStatus', label:'Task status', type:'select', options:['Pending','In Progress','Completed'], required:true }
    ]
  }
};

export const DEFAULTS = {
  students: { name:'', email:'', major:'', graduationYear:'' },
  applications: { studentId:'', company:'', jobTitle:'', location:'', status:'Applied', appliedDate:todayISO() },
  interviews: { applicationId:'', interviewDate:todayISO(), interviewType:'Online', interviewStatus:'Scheduled', notes:'' },
  offers: { applicationId:'', offerDate:todayISO(), salary:'', offerStatus:'Pending', responseDeadline:'' },
  tasks: { studentId:'', applicationId:'', taskTitle:'', dueDate:todayISO(), priority:'Medium', taskStatus:'Pending' }
};
