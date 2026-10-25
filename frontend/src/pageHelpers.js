export function referenceName(application, students) {
  if (!application) return 'Unknown application';
  const student = students.find(s => s.studentId === application.studentId);
  return `${application.company || 'Company'} · ${application.jobTitle || 'Role'}${student ? ` · ${student.name}` : ''}`;
}
export function matching(item, text) {
  if (!text.trim()) return true;
  return Object.values(item).some(v => String(v ?? '').toLowerCase().includes(text.trim().toLowerCase()));
}
