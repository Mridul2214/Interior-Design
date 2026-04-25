import React, { useState } from 'react';
import { List, Plus, Tag, CheckSquare, Users, User, ArrowRight, RefreshCw, AlertTriangle, UserPlus, X, Send, Scissors, FileText, Calendar, Activity } from 'lucide-react';
import '../css/ManagerDashboard.css';

const Tasks = ({ tasks, teamStats, staffList, onOpenAssignModal, onOpenEditTask, getPriorityColor, onReassign, onViewUpdates, onSplit }) => {
    const [showReassignDropdown, setShowReassignDropdown] = useState(null);
    const [reassignReason, setReassignReason] = useState('');

    const handleReassignSubmit = (taskId, staffMember) => {
        onReassign(taskId, [staffMember._id], 'Reassigned by manager');
        setShowReassignDropdown(null);
    };

    return (
        <div className="design-tasks fade-in">
            <div className="pipeline-section-header" style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', width: '45px', height: '45px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.3)' }}>
                                <List size={24} />
                            </div>
                            Creative Pipeline Management
                        </h2>
                        <p style={{ color: '#64748b', marginTop: '0.6rem', marginLeft: '57px', fontSize: '1rem' }}>
                            Track daily designer reports, manage task splitting, and optimize studio bandwidth.
                        </p>
                    </div>
                    <button className="btn-assign-staff" onClick={onOpenAssignModal} style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.3)' }}>
                        <Plus size={20} /> Assign New Design
                    </button>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '7fr 3fr', gap: '1.5fr' }}>
                <div className="tasks-container" style={{ display: 'grid', gap: '1.25rem' }}>
                    {tasks.filter(t => t.status !== 'Completed' && t.status !== 'Approved' && t.status !== 'Pushed to Procurement').map(task => {
                        const hasEmergency = task.dailyUpdates?.some(u => u.emergencies);
                        const overdue = task.dueDate && new Date(task.dueDate) < new Date();
                        const updatesCount = task.dailyUpdates?.length || 0;

                        return (
                            <div key={task._id} className="card-premium" style={{
                                background: '#fff', border: `1px solid ${hasEmergency ? '#fee2e2' : '#f1f5f9'}`, borderRadius: '24px',
                                padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center',
                                position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, width: '6px', height: '100%', background: hasEmergency ? '#ef4444' : overdue ? '#f59e0b' : getPriorityColor(task.priority) }}></div>

                                <div style={{ flex: 1, minWidth: '220px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{task.title}</h4>
                                        {hasEmergency && <span className="badge-lite" style={{ background: '#fee2e2', color: '#ef4444', borderColor: '#fecaca' }}>Emergency</span>}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={12} color="#64748b" />
                                            </div>
                                            {task.assignedTo?.map(s => s.name).join(', ') || 'Unassigned'}
                                        </div>
                                        <span style={{ color: '#e2e8f0' }}>|</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: overdue ? '#ef4444' : '#64748b', fontWeight: overdue ? 700 : 500 }}>
                                            <Calendar size={14} />
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Deadline'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center', minWidth: '100px', background: '#f8fafc', padding: '10px 15px', borderRadius: '16px' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#4f46e5' }}>{task.progress || 0}%</div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{task.status}</div>
                                </div>

                                <div className="task-actions-group" style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        className="btn-action-round"
                                        onClick={() => onViewUpdates(task)}
                                        style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        title={`Reports (${updatesCount})`}
                                    >
                                        <RefreshCw size={18} color="#6366f1" />
                                    </button>

                                    <button
                                        className="btn-action-round"
                                        onClick={() => onSplit(task)}
                                        style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        title="Split Task"
                                    >
                                        <Scissors size={18} color="#8b5cf6" />
                                    </button>

                                    <button
                                        className="btn-assign-staff"
                                        onClick={() => onOpenEditTask(task)}
                                        style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                                    >
                                        Manage
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="workload-summary">
                    <div className="card-premium" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9', position: 'sticky', top: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Users size={20} color="#6366f1" /> Studio Bandwidth
                            </h3>
                            <Activity size={18} color="#10b981" />
                        </div>
                        <div className="team-load-list">
                            {teamStats.map(member => (
                                <div key={member._id} className="load-row" style={{ padding: '1.25rem 0', borderBottom: '1px solid #f8fafc' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>{member.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{member.role}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                fontWeight: 800,
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                                background: member.pendingTasks > 4 ? '#fee2e2' : '#f0fdf4',
                                                color: member.pendingTasks > 4 ? '#ef4444' : '#10b981'
                                            }}>
                                                {member.pendingTasks} Projects
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${Math.min((member.pendingTasks / 6) * 100, 100)}%`, background: member.pendingTasks > 4 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '10px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tasks;
