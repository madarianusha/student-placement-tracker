export const RESOURCES = ['students', 'applications', 'interviews', 'offers', 'tasks'];
export const KEYS = { students:'studentId', applications:'applicationId', interviews:'interviewId', offers:'offerId', tasks:'taskId' };
export const STATUS_CHOICES = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

export const todayISO = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0,10);
};

export function dateLabel(value) {
  if (!value) return '—';
  const raw = String(value).slice(0,10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return String(value);
  return new Date(Number(match[1]), Number(match[2])-1, Number(match[3])).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

export function currency(value) {
  if (value === null || value === undefined || value === '') return '—';
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0}) : String(value);
}

export function isDone(task) {
  return ['completed', 'done', 'finished'].includes(String(task.taskStatus || '').toLowerCase());
}
export function isUpcoming(date) { return Boolean(date) && String(date).slice(0,10) >= todayISO(); }
export function initials(name='') { return String(name).trim().split(/\s+/).slice(0,2).map(s=>s.charAt(0)).join('').toUpperCase() || 'ST'; }
export function statusClass(status) {
  const key = String(status || 'unknown').toLowerCase().replace(/\s+/g,'-');
  return ['applied','screening','interview','offer','accepted','rejected','withdrawn','scheduled','completed','done','pending','high','medium','low','cancelled'].includes(key) ? `status-${key}` : 'status-neutral';
}
export function sortByDate(items, key, descending=true) {
  return [...items].sort((a,b) => (descending ? -1 : 1) * String(a[key]||'').localeCompare(String(b[key]||'')));
}
