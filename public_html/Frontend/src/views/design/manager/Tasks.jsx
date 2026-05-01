import React, { useState } from 'react';
import { List, Plus, Tag, CheckSquare, Users, User, ArrowRight, RefreshCw, AlertTriangle, UserPlus, X, Send, Scissors, FileText, Calendar, Activity } from 'lucide-react';
import '../css/ManagerDashboard.css';

const Tasks = ({ tasks, teamStats, staffList, onOpenAssignModal, onOpenEditTask, getPriorityColor, onReassign, onViewUpdates, onSplit }) => {
    const [showReassignDropdown, setShowReassignDropdown] = useState(null);
    const [reassignReason, setReassignReason] = useState('');

    const handleReassignSubmit = (taskId, staffMember) => {
        if (window.confirm(`Reassign this task to ${staffMember.name}?`)) {
            onReassign(taskId, [staffMember._id], 'Reassigned by manager for studio optimization');
            setShowReassignDropdown(null);
        }
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
                <div className="tasks-container" style={{ display: 'grid', gap: '1.25rem', paddingBottom: '300px' }}>
                    {tasks.filter(t => t.status !== 'Completed' && t.status !== 'Approved' && t.status !== 'Pushed to Procurement').map(task => {
                        const hasEmergency = task.dailyUpdates?.some(u => u.emergencies);
                        const overdue = task.dueDate && new Date(task.dueDate) < new Date();
                        const updatesCount = task.dailyUpdates?.length || 0;

                        return (
                            <div key={task._id} className="card-premium" style={{
                                background: '#fff', 
                                border: `1px solid ${hasEmergency ? '#fee2e2' : '#f1f5f9'}`, 
                                borderRadius: '24px',
                                padding: '1.25rem 1.75rem', 
                                display: 'grid', 
                                gridTemplateColumns: '1fr auto auto', 
                                gap: '2rem', 
                                alignItems: 'center',
                                zIndex: showReassignDropdown === task._id ? 3000 : 1,
                                overflow: 'visible', // Changed to visible for popover
                                boxShadow: '0 4px 20px -5px rgba(0,0,0,0.03)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                marginBottom: '1rem',
                                cursor: 'default'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(0,0,0,0.08)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px -5px rgba(0,0,0,0.03)';
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
                                        style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        title={`Reports (${updatesCount})`}
                                    >
                                        <RefreshCw size={18} color="#6366f1" />
                                    </button>

                                    <button
                                        className="btn-action-round"
                                        onClick={() => onSplit(task)}
                                        style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        title="Split Task"
                                    >
                                        <Scissors size={18} color="#8b5cf6" />
                                    </button>

                                    <div style={{ position: 'relative' }}>
                                        <button
                                            className="btn-assign-staff"
                                            onClick={() => setShowReassignDropdown(showReassignDropdown === task._id ? null : task._id)}
                                            style={{ 
                                                background: showReassignDropdown === task._id ? '#4f46e5' : '#eff6ff', 
                                                color: showReassignDropdown === task._id ? 'white' : '#2563eb', 
                                                border: '1px solid #dbeafe', 
                                                padding: '10px 18px', 
                                                borderRadius: '12px', 
                                                fontWeight: 700, 
                                                fontSize: '0.85rem', 
                                                cursor: 'pointer', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <UserPlus size={16} /> Reassign
                                        </button>

                                        {showReassignDropdown === task._id && (
                                            <div className="reassign-popover" style={{ 
                                                position: 'absolute', 
                                                top: 'calc(100% + 12px)', 
                                                right: 0, 
                                                background: 'rgba(255, 255, 255, 0.95)', 
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(99, 102, 241, 0.15)', 
                                                borderRadius: '20px', 
                                                boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.15)', 
                                                zIndex: 4000, 
                                                width: '300px', 
                                                padding: '1rem',
                                                animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '1px' }}>Reassign Task</span>
                                                    <button 
                                                        onClick={() => setShowReassignDropdown(null)}
                                                        style={{ background: '#f8fafc', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                                <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                                                    {teamStats.filter(s => !task.assignedTo?.some(a => (a._id || a).toString() === s._id.toString())).map(staff => (
                                                        <div 
                                                            key={staff._id} 
                                                            className="staff-select-item"
                                                            onClick={() => handleReassignSubmit(task._id, staff)}
                                                            style={{ 
                                                                padding: '12px', 
                                                                borderRadius: '14px', 
                                                                cursor: 'pointer', 
                                                                fontSize: '0.9rem', 
                                                                color: '#1e293b', 
                                                                transition: 'all 0.2s', 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                gap: '12px',
                                                                marginBottom: '4px',
                                                                border: '1px solid transparent'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#f5f3ff';
                                                                e.currentTarget.style.borderColor = '#ddd6fe';
                                                                e.currentTarget.style.transform = 'translateX(4px)';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.borderColor = 'transparent';
                                                                e.currentTarget.style.transform = 'translateX(0)';
                                                            }}
                                                        >
                                                            <div style={{ 
                                                                width: '36px', 
                                                                height: '36px', 
                                                                borderRadius: '12px', 
                                                                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', 
                                                                color: '#6366f1', 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                justifyContent: 'center', 
                                                                fontSize: '0.9rem', 
                                                                fontWeight: 800, 
                                                                border: '1px solid #ddd6fe' 
                                                            }}>
                                                                {(staff.name || staff.fullName || 'S').charAt(0)}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontWeight: 800, color: '#1e293b' }}>{staff.name || staff.fullName || 'Staff Member'}</div>
                                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{staff.role}</div>
                                                            </div>
                                                            <ArrowRight size={14} color="#6366f1" style={{ opacity: 0.5 }} />
                                                        </div>
                                                    ))}
                                                    {teamStats.filter(s => !task.assignedTo?.some(a => (a._id || a).toString() === s._id.toString())).length === 0 && (
                                                        <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                                                            <div style={{ background: '#f8fafc', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                                                <Users size={20} color="#cbd5e1" />
                                                            </div>
                                                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>No other designers available</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>{member.name || member.fullName || 'Staff Member'}</div>
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
