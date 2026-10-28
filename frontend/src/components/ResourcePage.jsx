
import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ListTodo,
  Trophy,
  Users
} from 'lucide-react';

import {
  KEYS,
  currency,
  dateLabel,
  initials,
  isDone,
  sortByDate
} from '../format.js';

import { SCHEMA } from '../config/forms.js';
import { matching } from '../pageHelpers.js';

import {
  Badge,
  Empty,
  PageHeader,
  Panel,
  PrimaryButton,
  RowActions,
  SearchBox
} from './UI.jsx';

const RESOURCE_INFO = {
  students: {
    eyebrow: 'PEOPLE & PROFILES',
    title: 'Students',
    description: 'Manage student profiles linked to applications and tasks.',
    icon: Users,
    columns: ['Student', 'Major', 'Graduation', 'ID']
  },
  applications: {
    eyebrow: 'OPPORTUNITY TRACKER',
    title: 'Job applications',
    description: 'Manage every opportunity from applying to receiving an offer.',
    icon: BriefcaseBusiness
  },
  interviews: {
    eyebrow: 'INTERVIEW PLANNER',
    title: 'Interviews',
    description: 'Schedule interviews and keep track of preparation notes.',
    icon: CalendarDays
  },
  offers: {
    eyebrow: 'YOUR OPPORTUNITIES',
    title: 'Job offers',
    description: 'Review offers, deadlines, and acceptance decisions.',
    icon: Trophy
  },
  tasks: {
    eyebrow: 'ACTION ITEMS',
    title: 'Placement tasks',
    description: 'Organize preparation tasks and important deadlines.',
    icon: ListTodo
  }
};

export default function ResourcePage({
  resource,
  records,
  students,
  applications,
  appMap,
  studentMap,
  studentName,
  search,
  setSearch,
  onAdd,
  onEdit,
  onDelete,
  onToggleTask,
  loading,
  available,
  busyId,
  selectedStudent
}) {

  const info = RESOURCE_INFO[resource];

  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    setStatusFilter('All');
  }, [resource]);

  const statusKey = {
    applications: 'status',
    interviews: 'interviewStatus',
    offers: 'offerStatus',
    tasks: 'taskStatus'
  }[resource];

  const statusOptions = statusKey
    ? [...new Set(records.map(r => r[statusKey]).filter(Boolean))]
    : [];

  const visible = records.filter(
    item =>
      matching(item, search) &&
      (
        statusFilter === 'All' ||
        item[statusKey] === statusFilter
      )
  );

  const sorted =
    resource === 'applications'
      ? sortByDate(visible, 'appliedDate')
      : resource === 'tasks'
        ? sortByDate(visible, 'dueDate', false)
        : visible;

  // NEW: Confirm permanent student deletion
  const handleDeleteClick = (item) => {

    if (resource === 'students') {

      const confirmed = window.confirm(
        `Are you sure you want to permanently delete ` +
        `${item.name || 'this student'}?\n\n` +
        `This will also delete all linked:\n` +
        `- Job applications\n` +
        `- Interviews\n` +
        `- Offers\n` +
        `- Tasks\n` +
        `- Application history\n\n` +
        `This action cannot be undone.`
      );

      if (!confirmed) {
        return;
      }
    }

    // Call the existing deletion handler
    onDelete(resource, item);
  };

  return (
    <>
      <PageHeader
        eyebrow={info.eyebrow}
        title={info.title}
        description={info.description}
        action={
          <PrimaryButton onClick={() => onAdd(resource)}>
            Add {SCHEMA[resource].singular.toLowerCase()}
          </PrimaryButton>
        }
      />

      <div className="resource-summary">
        <div className="resource-summary-icon">
          <info.icon size={24} />
        </div>

        <div>
          <strong>{records.length}</strong>
          <span>Total {resource}</span>
        </div>

        <div className="summary-separator" />

        <p>
          {resource === 'applications'
            ? 'Track the status of each application in one place.'
            : resource === 'tasks'
              ? 'Mark tasks complete as you make progress.'
              : 'Records are loaded directly from DynamoDB Local through Express.'}
        </p>
      </div>

      <Panel
        className="resource-panel"
        title={`${info.title} directory`}
        subtitle={`Showing ${sorted.length} of ${records.length} records`}
        action={
          <div className="table-tools">

            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder={`Search ${resource}...`}
            />

            {statusKey && (
              <select
                className="filter-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">All statuses</option>

                {statusOptions.map(x => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            )}
          </div>
        }
      >

        {loading ? (
          <div className="loading-state">
            Loading {resource}...
          </div>

        ) : !available ? (
          <Empty
            title="API collection unavailable"
            message={`The /api/${resource} endpoint could not be loaded. Check Express and try refreshing.`}
          />

        ) : !sorted.length ? (
          <Empty
            title={
              search || statusFilter !== 'All'
                ? 'No matching records'
                : `No ${resource} yet`
            }
            message={
              search
                ? 'Try changing your search or filter.'
                : `Use “Add ${SCHEMA[resource]?.singular.toLowerCase()}” to create your first record.`
            }
            action={
              !search && (
                <button
                  className="btn btn-secondary"
                  onClick={() => onAdd(resource)}
                >
                  Add {SCHEMA[resource].singular.toLowerCase()}
                </button>
              )
            }
          />

        ) : (

          <div className="table-wrap">
            <table className="data-table">

              <thead>
                <tr>
                  {tableHeaders(resource).map(h => (
                    <th key={h}>{h}</th>
                  ))}

                  <th className="action-th">Actions</th>
                </tr>
              </thead>

              <tbody>
                {sorted.map(item => {

                  const key = item[KEYS[resource]];
                  const app = appMap.get(item.applicationId);
                  const student = studentMap.get(item.studentId);

                  return (
                    <tr key={key}>

                      {resource === 'students' && (
                        <>
                          <td>
                            <div className="person-cell">
                              <div className="person-avatar">
                                {initials(item.name)}
                              </div>

                              <div>
                                <strong>
                                  {item.name || 'Unnamed student'}
                                </strong>

                                <small>
                                  {item.email || 'No email'}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>{item.major || '—'}</td>

                          <td className="muted-cell">
                            {item.graduationYear || '—'}
                          </td>

                          <td
                            className="id-cell"
                            title={item.studentId}
                          >
                            {item.studentId?.slice(0, 8) || '—'}
                          </td>
                        </>
                      )}

                      {resource === 'applications' && (
                        <>
                          <td>
                            <div className="company-cell">
                              <div className="company-logo">
                                {initials(item.company)}
                              </div>

                              <div>
                                <strong>{item.company}</strong>
                                <small>{item.jobTitle}</small>
                              </div>
                            </div>
                          </td>

                          <td>{studentName(item.studentId)}</td>
                          <td>{item.location || '—'}</td>

                          <td className="muted-cell">
                            {dateLabel(item.appliedDate)}
                          </td>

                          <td>
                            <Badge>{item.status}</Badge>
                          </td>
                        </>
                      )}

                      {resource === 'interviews' && (
                        <>
                          <td>
                            <strong className="cell-strong">
                              {app?.company || 'Unknown application'}
                            </strong>

                            <small className="cell-sub">
                              {app?.jobTitle || item.applicationId}
                            </small>
                          </td>

                          <td className="muted-cell">
                            {dateLabel(item.interviewDate)}
                          </td>

                          <td>{item.interviewType || '—'}</td>

                          <td>
                            <Badge>{item.interviewStatus}</Badge>
                          </td>

                          <td
                            className="notes-cell"
                            title={item.notes}
                          >
                            {item.notes || '—'}
                          </td>
                        </>
                      )}

                      {resource === 'offers' && (
                        <>
                          <td>
                            <strong className="cell-strong">
                              {app?.company || 'Unknown application'}
                            </strong>

                            <small className="cell-sub">
                              {app?.jobTitle || item.applicationId}
                            </small>
                          </td>

                          <td>{currency(item.salary)}</td>

                          <td className="muted-cell">
                            {dateLabel(item.offerDate)}
                          </td>

                          <td className="muted-cell">
                            {dateLabel(item.responseDeadline)}
                          </td>

                          <td>
                            <Badge>{item.offerStatus}</Badge>
                          </td>
                        </>
                      )}

                      {resource === 'tasks' && (
                        <>
                          <td>
                            <div className="task-title-cell">

                              <button
                                className={`task-checkbox ${isDone(item) ? 'checked' : ''}`}
                                title={
                                  isDone(item)
                                    ? 'Mark pending'
                                    : 'Mark completed'
                                }
                                disabled={busyId === item.taskId}
                                onClick={() => onToggleTask(item)}
                              >
                                {isDone(item) && <Check size={14} />}
                              </button>

                              <div>
                                <strong
                                  className={
                                    isDone(item) ? 'crossed' : ''
                                  }
                                >
                                  {item.taskTitle}
                                </strong>

                                <small>
                                  {app
                                    ? app.company
                                    : studentName(item.studentId)}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td className="muted-cell">
                            {dateLabel(item.dueDate)}
                          </td>

                          <td>
                            <Badge>{item.priority}</Badge>
                          </td>

                          <td>
                            <Badge>{item.taskStatus}</Badge>
                          </td>
                        </>
                      )}

                      <td className="action-cell">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 6
                          }}
                        >

                          <RowActions
                            onEdit={() => onEdit(resource, item)}
                            onDelete={
                              ['interviews', 'offers', 'tasks']
                                .includes(resource)
                                ? () => onDelete(resource, item)
                                : undefined
                            }
                          />

                          {['students', 'applications'].includes(resource) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(item)}
                              disabled={busyId === key}
                              title={`Delete ${SCHEMA[resource].singular.toLowerCase()}`}
                              style={{
                                border: '1px solid #f5c4cd',
                                borderRadius: 8,
                                background: '#fff1f3',
                                color: '#be344b',
                                padding: '6px 10px',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}

      </Panel>

      {resource === 'students' && (
        <p className="resource-note">
          <AlertCircle size={16} />
          Deleting a student permanently deletes all linked
          applications, interviews, offers, tasks, and history.
        </p>
      )}

      {resource === 'applications' && (
        <p className="resource-note">
          <AlertCircle size={16} />
          Before deleting an application, remove linked
          interviews, offers and tasks.
        </p>
      )}

    </>
  );
}

function tableHeaders(resource) {
  switch (resource) {
    case 'students':
      return ['Student', 'Major', 'Graduation', 'Student ID'];

    case 'applications':
      return [
        'Company / position',
        'Student',
        'Location',
        'Date applied',
        'Status'
      ];

    case 'interviews':
      return [
        'Application',
        'Interview date',
        'Type',
        'Status',
        'Notes'
      ];

    case 'offers':
      return [
        'Application',
        'Salary',
        'Offer date',
        'Decision deadline',
        'Status'
      ];

    case 'tasks':
      return [
        'Task',
        'Due date',
        'Priority',
        'Status'
      ];

    default:
      return [];
  }
}
