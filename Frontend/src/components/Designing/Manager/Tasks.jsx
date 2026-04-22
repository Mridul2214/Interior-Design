import React, { useState } from 'react';
import { List, Plus, Tag, CheckSquare, Users, User, ArrowRight, RefreshCw, AlertTriangle, UserPlus, X, Send, Scissors } from 'lucide-react';
import '../css/ManagerDashboard.css';

const Tasks = ({ tasks, teamStats, staffList, onOpenAssignModal, onOpenEditTask, getPriorityColor, onReassign, onViewUpdates, onSplit }) => {
    const [showReassignDropdown, setShowReassignDropdown] = useState(null);
    const [reassignReason, setReassignReason] = useState('');

    const handleReassignSubmit = (taskId, staffMember) => {
        onReassign(taskId, [staffMember._id], 'Reassigned by manager');
        setShowReassignDropdown(null);
    };

    return (
        <div className="design-tasks">
            <div className="dashboard-sections" style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '2rem' }}>
                <div className="section-card">
                    <div className="section-header" style={{ marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 800 }}>
                                <List size={22} color="#6366f1" /> Staff Task Activity
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>Monitor daily logs and managed staff workload.</p>
                        </div>
                        <button className="btn-add-premium" onClick={onOpenAssignModal} style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                            <Plus size={18} /> New Assignment
                        </button>
                    </div>

                    <div className="tasks-grid-modern" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {tasks.filter(t => t.status !== 'Completed' && t.status !== 'Approved' && t.status !== 'Pushed to Procurement').map(task => {
                            const hasEmergency = task.dailyUpdates?.some(u => u.emergencies);
                            const overdue = task.dueDate && new Date(task.dueDate) < new Date();
                            const updatesCount = task.dailyUpdates?.length || 0;

                            return (
                                <div key={task._id} className={`task-premium-card ${hasEmergency ? 'emergency' : ''}`} style={{ 
                                    background: '#fff', border: `1px solid ${hasEmergency ? '#fecaca' : '#e2e8f0'}`, borderRadius: '16px', 
                                    padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center',
                                    borderLeft: `6px solid ${hasEmergency ? '#ef4444' : overdue ? '#f59e0b' : getPriorityColor(task.priority)}`,
                                    boxShadow: hasEmergency ? '0 0 15px rgba(239, 68, 68, 0.1)' : '0 2px 4px rgba(0,0,0,0.02)'
                                }}>
                                    <div style={{ flex: 1, minWidth: '220px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{task.title}</h4>
                                            {hasEmergency && <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 900 }}>EMERGENCY</span>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: '#64748b' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} /> {task.assignedTo?.map(s => s.name).join(', ') || 'Unassigned'}</span>
                                            <span>·</span>
                                            <span style={{ fontWeight: 700, color: overdue ? '#dc2626' : '#64748b' }}>{overdue ? 'OVERDUE' : task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Deadline'}</span>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'center', minWidth: '100px' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4f46e5' }}>{task.progress || 0}%</div>
                                        <div className={`status-pill ${task.status?.toLowerCase().replace(/\s+/g, '-')}`} style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '12px', background: '#f1f5f9', marginTop: '4px' }}>
                                            {task.status}
                                        </div>
                                    </div>

                                    <div className="task-actions-group" style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            className="action-btn-lite" 
                                            onClick={() => onViewUpdates(task)}
                                            style={{ background: updatesCount > 0 ? '#eff6ff' : '#f8fafc', color: updatesCount > 0 ? '#3b82f6' : '#94a3b8', border: `1px solid ${updatesCount > 0 ? '#3b82f6' : '#e2e8f0'}`, padding: '8px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                        >
                                            <RefreshCw size={14} /> Reports {updatesCount > 0 ? `(${updatesCount})` : ''}
                                        </button>

                                        <button 
                                            className="action-btn-lite" 
                                            onClick={() => onSplit(task)}
                                            style={{ background: '#f8fafc', color: '#6366f1', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                        >
                                            <Scissors size={14} /> Split
                                        </button>

                                        <div style={{ position: 'relative' }}>
                                            <button 
                                                className="action-btn-lite" 
                                                onClick={() => setShowReassignDropdown(showReassignDropdown === task._id ? null : task._id)}
                                                style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                            >
                                                <UserPlus size={14} /> Reassign
                                            </button>

                                            {showReassignDropdown === task._id && (
                                                <div className="reassign-flyout" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, width: '220px', padding: '12px' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '10px' }}>Select Designer</div>
                                                    <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                                        {staffList?.map(staff => (
                                                            <button 
                                                                key={staff._id} 
                                                                onClick={() => handleReassignSubmit(task._id, staff)}
                                                                style={{ width: '100%', textAlign: 'left', padding: '10px', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', flexDirection: 'column' }}
                                                                onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                                                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                            >
                                                                <span style={{ fontWeight: 700, color: '#1e293b' }}>{staff.name}</span>
                                                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{staff.role}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            className="action-btn-styled" 
                                            onClick={() => onOpenEditTask(task)}
                                            style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="workload-summary">
                    <div className="section-card" style={{ height: '100%' }}>
                        <div className="section-header">
                            <h3><Users size={18} /> Team Load</h3>
                        </div>
                        <div className="team-load-list" style={{ marginTop: '1rem' }}>
                            {teamStats.map(member => (
                                <div key={member._id} className="load-row" style={{ padding: '1.25rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>{member.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{member.role}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: member.pendingTasks > 4 ? '#ef4444' : '#10b981' }}>{member.pendingTasks} Active</div>
                                        </div>
                                    </div>
                                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${Math.min((member.pendingTasks / 6) * 100, 100)}%`, background: member.pendingTasks > 4 ? '#ef4444' : '#10b981' }}></div>
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
