import React from 'react';
import { Target, User, Clock, AlertTriangle, Plus, Filter, LayoutGrid } from 'lucide-react';
import '../css/ProductionManagement.css';

const MOCK_KANBAN = {
    'To Do': [
        { id: 'T-01', title: 'Site Inspection & Measurement', project: 'Apartment Interiors - Kondapur', assignee: 'Suresh P.', priority: 'high', due: '2026-04-15' },
        { id: 'T-02', title: 'Procure Plumbing Materials', project: 'Villa Renovation - Jubilee Hills', assignee: 'Rahul K.', priority: 'medium', due: '2026-04-20' },
        { id: 'T-03', title: 'Client Sign-off on Flooring', project: 'Penthouse - Manikonda', assignee: 'Vikram S.', priority: 'low', due: '2026-04-22' }
    ],
    'In Progress': [
        { id: 'T-04', title: 'Electrical Wiring - Phase 1', project: 'Office Interior - HITEC City', assignee: 'Priya M.', priority: 'high', due: '2026-04-12' },
        { id: 'T-05', title: 'False Ceiling Framing', project: 'Showroom Design - Banjara Hills', assignee: 'Anita R.', priority: 'urgent', due: '2026-04-10' }
    ],
    'Review': [
        { id: 'T-06', title: 'Wall Demolition', project: 'Villa Renovation - Jubilee Hills', assignee: 'Rahul K.', priority: 'medium', due: '2026-04-08' }
    ],
    'Completed': [
        { id: 'T-07', title: 'Initial Site Clearance', project: 'Apartment Interiors - Kondapur', assignee: 'Suresh P.', priority: 'low', due: '2026-04-05' },
        { id: 'T-08', title: 'Design Finalization', project: 'Showroom Design - Banjara Hills', assignee: 'Anita R.', priority: 'medium', due: '2026-04-01' }
    ]
};

const TasksBoard = () => {
    const getPriorityColor = (priority) => {
        const colors = { urgent: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#94a3b8' };
        const bgs = { urgent: '#fee2e2', high: '#fef3c7', medium: '#eff6ff', low: '#f1f5f9' };
        return { color: colors[priority], bg: bgs[priority] };
    };

    return (
        <div className="pm-dashboard">
            <div className="pm-welcome-header" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="pm-welcome-text">
                    <h1 style={{ fontSize: '1.5rem' }}>Tasks Board</h1>
                    <p className="pm-welcome-date">Kanban view of all production tasks</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', zIndex: 1 }}>
                    <button className="pm-quick-action-btn" style={{ padding: '0.5rem 1rem', flexDirection: 'row', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                        <Filter size={16} /> Filters
                    </button>
                    <button className="pm-quick-action-btn" style={{ padding: '0.5rem 1rem', flexDirection: 'row', gap: '0.5rem', background: '#3b82f6', color: 'white', borderColor: '#2563eb' }}>
                        <Plus size={16} /> New Task
                    </button>
                </div>
            </div>

            <div className="pm-kanban-container">
                {Object.entries(MOCK_KANBAN).map(([columnName, tasks]) => (
                    <div className="pm-kanban-column" key={columnName}>
                        <div className="pm-kanban-column-header">
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <LayoutGrid size={16} color="#64748b" />
                                {columnName}
                                <span style={{ background: '#e2e8f0', color: '#475569', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '99px' }}>
                                    {tasks.length}
                                </span>
                            </h3>
                        </div>
                        
                        <div className="pm-kanban-cards">
                            {tasks.map(task => {
                                const prio = getPriorityColor(task.priority);
                                return (
                                    <div className="pm-kanban-card" key={task.id}>
                                        <div className="pm-kanban-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{task.id}</span>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', background: prio.bg, color: prio.color }}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#0f172a', lineHeight: 1.3 }}>{task.title}</h4>
                                        <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Target size={12} /> {task.project}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748b' }}>
                                                <div className="pm-team-avatar" style={{ width: '20px', height: '20px', fontSize: '0.6rem', background: '#f1f5f9', color: '#475569' }}>
                                                    {task.assignee.split(' ').map(n=>n[0]).join('')}
                                                </div>
                                                {task.assignee}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: task.priority === 'urgent' ? '#ef4444' : '#64748b' }}>
                                                <Clock size={12} /> {new Date(task.due).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TasksBoard;
