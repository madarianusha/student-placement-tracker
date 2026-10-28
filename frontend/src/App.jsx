import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Check, ChevronDown, ChevronRight, GraduationCap, Menu, RefreshCw, Sparkles, Users, X } from 'lucide-react';
import { deleteRecord, getList, saveRecord } from './api.js';
import { KEYS, RESOURCES, isDone } from './format.js';
import { MENU } from './config/navigation.js';
import { SCHEMA, DEFAULTS } from './config/forms.js';
import { InlineError, Modal, SuccessToast } from './components/UI.jsx';
import Field from './components/RecordField.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StudentsPage from './pages/Students.jsx';
import ApplicationsPage from './pages/Applications.jsx';
import InterviewsPage from './pages/Interviews.jsx';
import OffersPage from './pages/Offers.jsx';
import TasksPage from './pages/Tasks.jsx';

const emptyLists = () => Object.fromEntries(RESOURCES.map(resource => [resource, []]));
const emptyAvailability = () => Object.fromEntries(RESOURCES.map(resource => [resource, false]));

export default function App() {
  const location = useLocation();
  const navigateRoute = useNavigate();
  const screen = MENU.some(item => item.id === location.pathname.slice(1)) ? location.pathname.slice(1) : 'dashboard';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [records, setRecords] = useState(emptyLists);
  const [availability, setAvailability] = useState(emptyAvailability);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [editor, setEditor] = useState(null);
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState('');

  const reload = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const results = await Promise.allSettled(RESOURCES.map(resource => getList(resource)));
    const nextRecords = {}, nextAvailable = {}, nextErrors = [];
    results.forEach((result, index) => {
      const resource = RESOURCES[index];
      nextAvailable[resource] = result.status === 'fulfilled';
      if (result.status === 'fulfilled') nextRecords[resource] = result.value;
      else nextErrors.push(`${resource}: ${result.reason?.message || 'Unable to load'}`);
    });
    setRecords(previous => ({ ...previous, ...nextRecords }));
    setAvailability(nextAvailable);
    setErrors(nextErrors);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const students = records.students;
  const applications = records.applications;
  const studentMap = useMemo(() => new Map(students.map(s => [s.studentId, s])), [students]);
  const appMap = useMemo(() => new Map(applications.map(a => [a.applicationId, a])), [applications]);
  const filteredApps = useMemo(() => selectedStudent ? applications.filter(a => a.studentId === selectedStudent) : applications, [applications, selectedStudent]);
  const appIDs = useMemo(() => new Set(filteredApps.map(a => a.applicationId)), [filteredApps]);
  const filtered = useMemo(() => ({
    students: selectedStudent ? students.filter(s => s.studentId === selectedStudent) : students,
    applications: filteredApps,
    interviews: selectedStudent ? records.interviews.filter(item => appIDs.has(item.applicationId)) : records.interviews,
    offers: selectedStudent ? records.offers.filter(item => appIDs.has(item.applicationId)) : records.offers,
    tasks: selectedStudent ? records.tasks.filter(item => item.studentId === selectedStudent || appIDs.has(item.applicationId)) : records.tasks
  }), [students, records, selectedStudent, filteredApps, appIDs]);

  function navigate(next) { navigateRoute(next === 'dashboard' ? '/' : `/${next}`); setSearch(''); setDrawerOpen(false); }
  function openEditor(resource, original=null, preset={}) {
    setModalError('');
    setEditor({
      resource,
      original,
      value: original ? { ...original } : { ...DEFAULTS[resource], ...(selectedStudent && ['applications','tasks'].includes(resource) ? { studentId:selectedStudent } : {}), ...preset }
    });
  }

  async function submitEditor(event) {
    event.preventDefault();
    if (!editor || saving) return;
    const { resource, original, value } = editor;
    if (resource === 'applications' && !value.studentId) { setModalError('Choose a student before saving an application.'); return; }
    if (resource === 'tasks' && value.applicationId) {
      const linked = appMap.get(value.applicationId);
      if (linked && linked.studentId !== value.studentId) { setModalError('The task student must match the related application student.'); return; }
    }
    if (resource === 'offers' && value.salary !== '' && !Number.isFinite(Number(value.salary))) { setModalError('Enter a valid salary.'); return; }
    setSaving(true);
    setModalError('');
    try {
      const key = KEYS[resource];
      const payload = { ...value };
      // Identifiers are generated and owned by Express; do not send an empty primary key.
      if (!original) delete payload[key];
      // Empty optional fields are omitted for creation, but retained for full PUT updates.
      if (!original) for (const [k,v] of Object.entries(payload)) if (v === '') delete payload[k];
      if (resource === 'offers' && payload.salary !== undefined && payload.salary !== '') payload.salary = Number(payload.salary);
      await saveRecord(resource, payload, original?.[key]);
      setEditor(null);
      setToast(`${SCHEMA[resource].singular} ${original ? 'updated' : 'created'} successfully.`);
      await reload(true);
    } catch(err) {
      setModalError(err.message || 'Unable to save.');
    } finally { setSaving(false); }
  }

  // Shared DELETE handler. ResourcePage already confirms student cascade deletion.
  async function remove(resource, item) {
    const id = item[KEYS[resource]];
    if (!id || !['students', 'applications', 'interviews', 'offers', 'tasks'].includes(resource)) return;
    if (busyId) return; // Avoid duplicate requests.

    const label = SCHEMA[resource].singular.toLowerCase();

    // Students get their detailed confirmation in ResourcePage.jsx.
    // Keep the original confirmation for all other resource types.
    if (resource !== 'students' &&
        !window.confirm(`Permanently delete this ${label}? This cannot be undone.`)) {
      return;
    }

    setBusyId(id);
    try {
      // The api.js helper must add ?confirm=DELETE for confirmed student deletions.
      await deleteRecord(resource, id, { confirmCascade: resource === 'students' });

      // Clear the global student filter if the selected student was deleted.
      if (resource === 'students') {
        setSelectedStudent(previous => previous === id ? '' : previous);
      }

      setToast(resource === 'students'
        ? 'Student and all linked records deleted successfully.'
        : `${SCHEMA[resource].singular} deleted successfully.`);

      // Refresh every collection: students, applications, interviews, offers and tasks.
      await reload(true);
    } catch (error) {
      setToast(`Could not delete ${label}: ${error.message || 'Unknown error'}`);
    } finally {
      setBusyId('');
    }
  }

  async function toggleTask(item) {
    const id = item.taskId;
    setBusyId(id);
    try {
      await saveRecord('tasks', { ...item, taskStatus:isDone(item) ? 'Pending' : 'Completed' }, id);
      setToast(`Task marked ${isDone(item) ? 'pending' : 'complete'}.`);
      await reload(true);
    } catch(err) { setToast(`Unable to update task: ${err.message}`); }
    finally { setBusyId(''); }
  }

  const studentName = (id) => studentMap.get(id)?.name || 'Unknown student';
  const activeResource = MENU.find(x => x.id === screen);
  const coreConnected = availability.students && availability.applications;
  const totalConnected = Object.values(availability).filter(Boolean).length;

  const resourceProps = (resource) => ({
    records: filtered[resource] || [], students, applications, appMap, studentMap,
    studentName, search, setSearch, onAdd:openEditor, onEdit:openEditor,
    onDelete:remove, onToggleTask:toggleTask,
    loading, available:availability[resource], busyId, selectedStudent
  });

  return <div className="app-shell">
    <aside className={`sidebar ${drawerOpen ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><GraduationCap size={25} strokeWidth={2.25}/></div>
        <div><strong>Placement<span>Hub</span></strong><small>STUDENT SUCCESS PLATFORM</small></div>
        <button className="mobile-nav-close" aria-label="Close navigation" onClick={()=>setDrawerOpen(false)}><X size={20}/></button>
      </div>
      <div className="sidebar-caption">WORKSPACE</div>
      <nav className="side-links" aria-label="Main navigation">
        {MENU.map(({ id, title, icon:Icon }) => <button key={id} className={`side-link ${screen === id ? 'side-link-active' : ''}`} onClick={()=>navigate(id)}>
          <Icon size={19} strokeWidth={screen === id ? 2.35 : 1.9}/><span>{title}</span>
          {id === 'tasks' && filtered.tasks.filter(t=>!isDone(t)).length > 0 && <span className="nav-count">{filtered.tasks.filter(t=>!isDone(t)).length}</span>}
        </button>)}
      </nav>
      <div className="sidebar-foot">
        <div className="help-box"><div className="help-glow"><Sparkles size={18}/></div><strong>Stay on track</strong><p>Keep your applications, interviews, and deadlines organized.</p><button onClick={()=>navigate('tasks')}>View my tasks <ArrowRight size={14}/></button></div>
        <div className="sidebar-user"><div className="side-avatar">ST</div><div><strong>Placement workspace</strong><small>Local project environment</small></div><ChevronDown size={15}/></div>
      </div>
    </aside>
    {drawerOpen && <div className="mobile-scrim" onClick={()=>setDrawerOpen(false)}/>}

    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left"><button className="mobile-toggle" aria-label="Open menu" onClick={()=>setDrawerOpen(true)}><Menu size={23}/></button><span className="crumb-home">Workspace</span><ChevronRight size={14}/><strong>{activeResource?.title}</strong></div>
        <div className="topbar-right">
          <label className="student-filter"><Users size={16}/><select aria-label="Filter records by student" value={selectedStudent} onChange={e=>setSelectedStudent(e.target.value)}><option value="">All students</option>{students.map(s=><option key={s.studentId} value={s.studentId}>{s.name || s.studentId}</option>)}</select><ChevronDown size={15}/></label>
          <button className="toolbar-refresh" title="Refresh records" aria-label="Refresh records" disabled={refreshing} onClick={()=>reload(true)}><RefreshCw size={19} className={refreshing ? 'spin' : ''}/></button>
          <span className={`connection-indicator ${coreConnected ? 'is-connected' : ''}`} title={`${totalConnected} of 5 API collections loaded`}><span/>{coreConnected ? 'Connected' : 'API unavailable'}</span>
          <div className="topbar-avatar">ST</div>
        </div>
      </header>

      <div className="content-area">
        {!loading && !coreConnected && <div className="connection-banner"><AlertCircle size={19}/><div><strong>Express backend not fully connected.</strong><span>Start DynamoDB Local and Express on port 5000, then refresh. This frontend never substitutes fake data.</span></div><button onClick={()=>reload(true)} disabled={refreshing}>Retry</button></div>}
        {!loading && coreConnected && errors.length > 0 && <div className="connection-banner partial-banner"><AlertCircle size={18}/><div><strong>Some API collections are unavailable.</strong><span>{errors.join(' · ')}</span></div><button onClick={()=>reload(true)}>Retry</button></div>}
        <Routes>
          <Route path="/" element={<Dashboard data={filtered} students={students} appMap={appMap} studentName={studentName} selectedStudent={selectedStudent} loading={loading} onNavigate={navigate} onAdd={openEditor} onTaskToggle={toggleTask} busyId={busyId}/>} />
          <Route path="/students" element={<StudentsPage {...resourceProps('students')} />} />
          <Route path="/applications" element={<ApplicationsPage {...resourceProps('applications')} />} />
          <Route path="/interviews" element={<InterviewsPage {...resourceProps('interviews')} />} />
          <Route path="/offers" element={<OffersPage {...resourceProps('offers')} />} />
          <Route path="/tasks" element={<TasksPage {...resourceProps('tasks')} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <footer className="footer"><span>PlacementHub · Student Placement Tracker</span><span>React + Express + DynamoDB Local</span></footer>
      </div>
    </main>

    {editor && <Modal title={`${editor.original ? 'Edit' : 'Add'} ${SCHEMA[editor.resource].singular}`} subtitle={editor.original ? 'Update the record in DynamoDB Local.' : 'This record will be saved through your Express API.'} onClose={()=>!saving && setEditor(null)} width="620px">
      <form className="editor-form" onSubmit={submitEditor}>
        <div className="form-grid">{SCHEMA[editor.resource].fields.map(field => <Field key={field.name} field={field} value={editor.value[field.name] ?? ''} data={editor.value} resource={editor.resource} students={students} applications={applications} onChange={v=>setEditor(prev=>({ ...prev, value:{ ...prev.value, [field.name]:v } }))} disabled={saving || (Boolean(editor.original) && ['studentId','applicationId'].includes(field.name))}/>)}</div>
        {modalError && <InlineError message={modalError}/>}
        {((editor.resource === 'applications' || editor.resource === 'tasks') && !students.length) && <p className="form-hint">Create a student first on the Students page.</p>}
        <div className="modal-actions"><button type="button" className="btn btn-secondary" disabled={saving} onClick={()=>setEditor(null)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="saving-indicator"/> : <Check size={17}/>} {saving ? 'Saving...' : editor.original ? 'Save changes' : 'Create record'}</button></div>
      </form>
    </Modal>}

    {toast && <SuccessToast message={toast} onClose={()=>setToast('')}/>}
  </div>;
}

