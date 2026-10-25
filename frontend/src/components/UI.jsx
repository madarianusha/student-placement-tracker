import React from 'react';
import { AlertCircle, Check, Inbox, LoaderCircle, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { statusClass } from '../format.js';

export function Panel({ title, subtitle, action, children, className='' }) {
  return <section className={`panel ${className}`}>
    {(title || action) && <div className="panel-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>}
    {children}
  </section>;
}

export function PageHeader({eyebrow, title, description, action}) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

export function PrimaryButton({ children, onClick, disabled=false }) {
  return <button className="btn btn-primary" onClick={onClick} disabled={disabled}><Plus size={17}/>{children}</button>;
}

export function Badge({ children }) {return <span className={`status-pill ${statusClass(children)}`}>{children || 'Unknown'}</span>}

export function Empty({ title='No records yet', message='New records will appear here once you add them.', action }) {
  return <div className="empty-state"><div className="empty-icon"><Inbox size={25}/></div><h3>{title}</h3><p>{message}</p>{action}</div>;
}

export function SearchBox({value,onChange,placeholder='Search records...'}) {
  return <label className="search-box"><Search size={18}/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>
}

export function RowActions({onEdit,onDelete}) {
  return <div className="row-actions">
    {onEdit && <button title="Edit record" className="icon-action" onClick={onEdit}><Pencil size={15}/></button>}
    {onDelete && <button title="Delete record" className="icon-action destructive" onClick={onDelete}><Trash2 size={15}/></button>}
  </div>;
}

export function Modal({title,subtitle,children,onClose,width='540px'}) {
  return <div className="modal-backdrop" onMouseDown={e=>{ if(e.target===e.currentTarget) onClose(); }}>
    <div className="modal" role="dialog" aria-modal="true" aria-label={title} style={{maxWidth:width}}>
      <div className="modal-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-action" aria-label="Close" onClick={onClose}><X size={20}/></button></div>
      {children}
    </div>
  </div>;
}

export function LoadingRows() {return <div className="loading-state"><LoaderCircle size={23} className="spin"/> Loading records from Express...</div>}
export function InlineError({message}) {return <div className="inline-error"><AlertCircle size={16}/>{message}</div>}
export function SuccessToast({message,onClose}) {return <div className="toast"><Check size={16}/><span>{message}</span><button onClick={onClose} aria-label="Dismiss"><X size={14}/></button></div>}
