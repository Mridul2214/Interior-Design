import React from 'react';
import { Package, Eye, Calendar } from 'lucide-react';

const StaffTasks = ({ 
    pendingTasks, 
    inProgressTasks, 
    setSelectedTask, 
    setShowTaskDetailsModal, 
    setShowTimeExtension 
}) => {
    return (
        <div className="fade-in">
            <div className="section-card">
                <div className="section-header">
                    <h3><Package size={18} /> My Assigned Tasks</h3>
                </div>
                <div className="tasks-list">
                    {(pendingTasks.length > 0 || inProgressTasks.length > 0) ? (
                        [...pendingTasks, ...inProgressTasks].map(task => (
                            <div key={task._id} className="task-item" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '0.5rem' }}>
                                <div className="task-info">
                                    <span className="task-number" style={{ fontSize: '1rem', fontWeight: 700 }}>{task.requestNumber}</span>
                                    <span className="task-project" style={{ fontSize: '0.8rem', color: '#64748b' }}>{task.project?.name}</span>
                                    <span className="task-items" style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.8rem' }}>
                                        {task.items?.length || 0} items requested
                                    </span>
                                </div>
                                <div className="task-status">
                                    <span className={`status-pill ${task.status?.toLowerCase().replace(' ', '-')}`} style={{ 
                                        background: task.status === 'Assigned' ? '#fffbeb' : '#f0f9ff',
                                        color: task.status === 'Assigned' ? '#d97706' : '#0ea5e9'
                                    }}>
                                        {task.status}
                                    </span>
                                </div>
                                <div className="task-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        className="btn-details"
                                        style={{ padding: '8px 16px', background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                                        onClick={() => {
                                            setSelectedTask(task);
                                            setShowTaskDetailsModal(true);
                                        }}
                                    >
                                        <Eye size={14} /> Details
                                    </button>
                                    <button 
                                        className="btn-extend"
                                        style={{ padding: '8px 16px', background: '#e0e7ff', color: '#6366f1', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        onClick={() => {
                                            setSelectedTask(task);
                                            setShowTimeExtension(true);
                                        }}
                                    >
                                        <Calendar size={14} /> Time
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
                            <Package size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No material requests assigned to you yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffTasks;
