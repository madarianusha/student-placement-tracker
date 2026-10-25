import React from 'react';
export default function Field({ field, value, data, resource, students, applications, onChange, disabled }) {
  const { name, label, type='text', required, placeholder } = field;
  const common = { id:`field-${name}`, value, onChange:e=>onChange(e.target.value), disabled, required: Boolean(required) };
  let element;
  if (type === 'textarea') element = <textarea {...common} rows={4} placeholder={placeholder}/>;
  else if (type === 'student') element = <select {...common}><option value="">Select a student</option>{students.map(s=><option key={s.studentId} value={s.studentId}>{s.name || s.email || s.studentId}</option>)}</select>;
  else if (type === 'application') {
    const related = resource === 'tasks' && data.studentId ? applications.filter(a=>a.studentId === data.studentId) : applications;
    // When editing a relationship, retain the current selection even if filters changed.
    const choices = related.some(a=>a.applicationId === value) ? related : [...related, ...applications.filter(a=>a.applicationId === value)];
    element = <select {...common}><option value="">{required ? 'Select an application' : 'No related application'}</option>{choices.map(a=><option key={a.applicationId} value={a.applicationId}>{a.company} — {a.jobTitle}</option>)}</select>;
  } else if (type === 'select') element = <select {...common}>{field.options.map(item=><option key={item} value={item}>{item}</option>)}</select>;
  else element = <input {...common} type={type} placeholder={placeholder} min={type === 'number' ? '0' : undefined} step={type === 'number' ? 'any' : undefined}/>;
  return <div className={`form-field ${type==='textarea' ? 'form-field-wide' : ''}`}><label htmlFor={`field-${name}`}>{label}{required && <span className="required"> *</span>}</label>{element}</div>;
}

