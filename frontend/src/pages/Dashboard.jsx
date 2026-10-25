import React from 'react';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, CalendarClock, CalendarDays, Check, CheckCircle2, Clock3, ListTodo, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import { STATUS_CHOICES, dateLabel, initials, isDone, isUpcoming, sortByDate } from '../format.js';
import { Badge, Empty, Panel, PrimaryButton } from '../components/UI.jsx';
function BadgeIcon({ icon: Icon, tone='blue' }) { return <div className={`feature-icon tone-${tone}`}><Icon size={21}/></div>; }

export default function Dashboard({ data, students, appMap, studentName, selectedStudent, loading, onNavigate, onAdd, onTaskToggle, busyId }) {
  const apps = data.applications, interviews = data.interviews, offers = data.offers, tasks = data.tasks;
  const inProgress = apps.filter(a=>['Applied','Screening','Interview'].includes(a.status)).length;
  const upcoming = sortByDate(interviews.filter(i=>isUpcoming(i.interviewDate) && !['Cancelled','Completed'].includes(i.interviewStatus)), 'interviewDate', false);
  const pending = tasks.filter(t=>!isDone(t));
  const offerCount = offers.length;
  const statusBars = STATUS_CHOICES.map(status=>({ status, count:apps.filter(a=>a.status===status).length }));
  const maxBar = Math.max(...statusBars.map(s=>s.count),1);

  return <>
    <div className="welcome-row"><div><div className="eyebrow"><span className="small-glow"/> YOUR PLACEMENT OVERVIEW</div><h1>Good to see you! <span className="wave">👋</span></h1><p>Track applications, plan interviews, and take the next step in your career.</p></div><PrimaryButton onClick={()=>onAdd('applications')}>New application</PrimaryButton></div>
    <section className="welcome-banner"><div className="banner-content"><div className="banner-tag"><Sparkles size={15}/> YOUR CAREER JOURNEY</div><h2>Every application is a step<br/>toward your next opportunity.</h2><p>Keep the momentum going. Your progress starts here.</p><button onClick={()=>onNavigate('applications')}>Explore applications <ArrowRight size={16}/></button></div><div className="banner-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><div className="banner-briefcase"><BriefcaseBusiness size={72} strokeWidth={1.5}/></div><div className="float-spark one">✦</div><div className="float-spark two">✦</div></div></section>

    <div className="stat-grid">
      <StatCard label="Total applications" value={apps.length} icon={BriefcaseBusiness} tone="blue" caption="All recorded applications" onClick={()=>onNavigate('applications')}/>
      <StatCard label="In progress" value={inProgress} icon={TrendingUp} tone="purple" caption="Applied, screening & interview" onClick={()=>onNavigate('applications')}/>
      <StatCard label="Upcoming interviews" value={upcoming.length} icon={CalendarDays} tone="amber" caption="Scheduled in the future" onClick={()=>onNavigate('interviews')}/>
      <StatCard label="Offers received" value={offerCount} icon={Trophy} tone="green" caption="Offers in the tracker" onClick={()=>onNavigate('offers')}/>
    </div>

    <div className="dashboard-columns">
      <Panel title="Recent applications" subtitle="Your latest opportunities" action={<button className="text-link" onClick={()=>onNavigate('applications')}>View all <ArrowRight size={15}/></button>}>
        {loading ? <div className="loading-state">Loading applications...</div> : apps.length ? <div className="table-wrap"><table className="data-table compact"><thead><tr><th>Company / position</th><th>Applied</th><th>Status</th></tr></thead><tbody>{sortByDate(apps,'appliedDate').slice(0,5).map(item=><tr key={item.applicationId}><td><div className="company-cell"><div className="company-logo">{initials(item.company)}</div><div><strong>{item.company}</strong><small>{item.jobTitle}</small></div></div></td><td className="muted-cell">{dateLabel(item.appliedDate)}</td><td><Badge>{item.status}</Badge></td></tr>)}</tbody></table></div> : <Empty title="No applications yet" message="Add your first job application to start tracking progress." action={<button className="btn btn-secondary" onClick={()=>onAdd('applications')}>Add application</button>}/>}
      </Panel>
      <Panel title="Application stages" subtitle="Where your applications stand" className="stages-panel">
        {!apps.length ? <Empty title="No stage data yet" message="Application progress will appear when you add records."/> : <div className="stage-bars">{statusBars.map(item=><div className="stage-line" key={item.status}><div className="stage-label"><span>{item.status}</span><strong>{item.count}</strong></div><div className="bar-track"><div className={`bar-fill fill-${item.status.toLowerCase()}`} style={{width:`${item.count/maxBar * 100}%`}}/></div></div>)}</div>}
      </Panel>
    </div>
    <div className="dashboard-columns bottom-columns">
      <Panel title="Upcoming interviews" subtitle="Be ready for what’s next" action={<button className="text-link" onClick={()=>onNavigate('interviews')}>See all <ArrowRight size={15}/></button>}>
        {upcoming.length ? <div className="compact-list">{upcoming.slice(0,4).map(item=><div className="compact-list-row" key={item.interviewId}><div className="event-icon"><CalendarClock size={19}/></div><div className="grow"><strong>{appMap.get(item.applicationId)?.company || 'Interview'}</strong><small>{appMap.get(item.applicationId)?.jobTitle || item.interviewType}</small></div><div className="event-date">{dateLabel(item.interviewDate)}</div></div>)}</div> : <Empty title="No upcoming interviews" message="Scheduled interviews will appear here."/>}
      </Panel>
      <Panel title="Tasks to complete" subtitle={`${pending.length} outstanding ${pending.length === 1 ? 'task' : 'tasks'}`} action={<button className="text-link" onClick={()=>onNavigate('tasks')}>View tasks <ArrowRight size={15}/></button>}>
        {pending.length ? <div className="compact-list">{sortByDate(pending,'dueDate',false).slice(0,4).map(item=><div className="compact-list-row" key={item.taskId}><button className="round-check" title="Mark completed" disabled={busyId === item.taskId} onClick={()=>onTaskToggle(item)}><Check size={14}/></button><div className="grow"><strong>{item.taskTitle}</strong><small>{studentName(item.studentId)} · {dateLabel(item.dueDate)}</small></div><Badge>{item.priority}</Badge></div>)}</div> : <Empty title="All caught up" message="New to-dos and deadlines will appear here."/>}
      </Panel>
    </div>
  </>;
}

function StatCard({label,value,icon,tone,caption,onClick}) {return <button className="stat-card" onClick={onClick}><div className="stat-top"><BadgeIcon icon={icon} tone={tone}/><ArrowUpRight size={17} className="stat-arrow"/></div><strong className="stat-number">{value}</strong><span className="stat-label">{label}</span><small>{caption}</small></button>}

