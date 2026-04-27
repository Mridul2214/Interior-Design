import React, { useState, useEffect } from 'react';
import {
    CheckSquare,
    Clock,
    AlertCircle,
    Plus,
    FileText,
    Users,
    ChevronRight,
    TrendingUp,
    Calendar,
    X,
    ExternalLink,
    Download,
    Eye,
    Package,
    Image
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { taskAPI, siteVisitAPI, BASE_IMAGE_URL } from '../../config/api';
import './css/StaffDashboard.css';

const StaffDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        pendingTasks: 0,
        completedToday: 0,
        activeProjects: 0
    });
    const [urgentTasks, setUrgentTasks] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [recentVisits, setRecentVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Tasks (Staff-filtered by backend)
                const [tasksRes, visitsRes] = await Promise.all([
                    taskAPI.getAll(),
                    siteVisitAPI.getAll({ limit: 4 })
                ]);

                if (tasksRes.success) {
                    const tasks = tasksRes.data;
                    const pending = tasks.filter(t => t.status !== 'Completed').length;

                    // Tasks completed today
                    const today = new Date().toDateString();
                    const doneToday = tasks.filter(t =>
                        t.status === 'Completed' &&
                        new Date(t.updatedAt).toDateString() === today
                    ).length;

                    // Active projects (unique clients/projects in pending tasks)
                    const activeProjs = [...new Set(tasks.filter(t => t.status !== 'Completed').map(t => t.quotation?._id))].filter(id => id).length;

                    setStats({
                        pendingTasks: pending,
                        completedToday: doneToday,
                        activeProjects: activeProjs || 0
                    });

                    // Set urgent tasks (High/Critical priority and not completed)
                    const urgent = tasks.filter(t =>
                        t.status !== 'Completed' &&
                        (t.priority === 'High' || t.priority === 'Critical')
                    ).slice(0, 3);
                    setUrgentTasks(urgent);

                    // Set pending reviews specifically for Sales
                    if (user?.role === 'Sales') {
                        const reviews = tasks.filter(t => t.status === 'Pending Sales Review');
                        setPendingReviews(reviews);
                    }
                }

                if (visitsRes.success) {
                    setRecentVisits(visitsRes.data);
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const quickActions = [
        { name: 'New Quotation', icon: FileText, path: '/staff/quotations/new', color: '#6366f1' },
        { name: 'Add Client', icon: Users, path: '/staff/clients', color: '#10b981' },
        { name: 'Log Visit', icon: AlertCircle, path: '/staff/site-visits', color: '#f59e0b' },
    ];

    return (
        <div className="staff-dashboard">

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon pending">
                        <Clock size={24} />
                    </div>
                    <div className="stat-data">
                        <span className="value">{stats.pendingTasks}</span>
                        <span className="label">Pending Tasks</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon completed">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-data">
                        <span className="value">{stats.completedToday}</span>
                        <span className="label">Done Today</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon projects">
                        <CheckSquare size={24} />
                    </div>
                    <div className="stat-data">
                        <span className="value">{stats.activeProjects}</span>
                        <span className="label">Active Projects</span>
                    </div>
                </div>
            </div>

            {/* Sales Specific Section: Design Approvals */}
            {user?.role === 'Sales' && (
                <section className="dashboard-section" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '2px solid #e2e8f0' }}>
                    <div className="section-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: '#6366f1', color: 'white', padding: '8px', borderRadius: '12px' }}>
                                <FileText size={20} />
                            </div>
                            <h2 className="section-title">Designs Awaiting Your Approval ({pendingReviews.length})</h2>
                        </div>
                        <button onClick={() => navigate('/staff/tasks')} className="view-all">See All Tasks</button>
                    </div>
                    <div className="tasks-list" style={{ marginTop: '1rem' }}>
                        {pendingReviews.length > 0 ? pendingReviews.map((task) => (
                            <div key={task._id} className="task-item" style={{ cursor: 'default', borderLeft: '6px solid #6366f1' }}>
                                <div className="task-info">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <h3 style={{ fontSize: '1.1rem' }}>{task.title}</h3>
                                        <span className="badge-new" style={{ background: '#6366f1', color: 'white', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>MANAGER APPROVED</span>
                                    </div>
                                    <p style={{ color: '#475569', fontWeight: 600 }}>Project: {task.project?.projectName || task.quotation?.projectName || 'Interior Design Project'}</p>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Assigned to: {task.assignedTo?.map(s => s.name).join(', ') || 'N/A'}</p>
                                </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            className="btn-view-mini"
                                            onClick={() => { setSelectedTask(task); setShowViewModal(true); }}
                                            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '8px 20px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            View Design
                                        </button>
                                        <button 
                                            className="btn-approve-mini"
                                            onClick={async () => {
                                                const notes = prompt('Add optional notes for the Design Manager:');
                                                try {
                                                    const res = await taskAPI.salesApprove(task._id, { approved: true, salesNotes: notes || '' });
                                                    if (res.success) {
                                                        alert('✅ Design approved and forwarded!');
                                                        window.location.reload();
                                                    }
                                                } catch (err) { alert('Approval failed'); }
                                            }}
                                            style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            className="btn-reject-mini"
                                            onClick={async () => {
                                                const reason = prompt('Why does this design need revision? (Required):');
                                                if (!reason) return;
                                                try {
                                                    const res = await taskAPI.salesApprove(task._id, { approved: false, salesNotes: reason });
                                                    if (res.success) {
                                                        alert('🔄 Revision request sent to Manager');
                                                        window.location.reload();
                                                    }
                                                } catch (err) { alert('Request failed'); }
                                            }}
                                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}
                                        >
                                            Redo
                                        </button>
                                    </div>
                            </div>
                        )) : (
                            <div className="empty-tasks-mini" style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '16px' }}>
                                <CheckSquare size={32} style={{ color: '#cbd5e1', marginBottom: '10px' }} />
                                <p style={{ color: '#64748b', fontWeight: 500 }}>All caught up! No designs pending your review.</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Quick Actions */}
            <section className="dashboard-section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="quick-actions-grid">
                    {quickActions.map((action) => (
                        <button
                            key={action.name}
                            className="action-card"
                            onClick={() => navigate(action.path)}
                        >
                            <div className="icon-wrapper" style={{ backgroundColor: action.color + '15', color: action.color }}>
                                <action.icon size={24} />
                            </div>
                            <span>{action.name}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Urgent Tasks */}
            <section className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">My Tasks</h2>
                    <button onClick={() => navigate('/staff/tasks')} className="view-all">View All</button>
                </div>
                <div className="tasks-list">
                    {urgentTasks.length > 0 ? urgentTasks.map((task) => (
                        <div key={task._id} className="task-item" onClick={() => navigate('/staff/tasks')}>
                            <div className={`status-line ${task.priority.toLowerCase()}`}></div>
                            <div className="task-info">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h3>{task.title}</h3>
                                    {new Date(task.updatedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                                        <span className="badge-new" style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>NEW</span>
                                    )}
                                </div>
                                <p>{task.client?.name || 'N/A'} • <span className="deadline">{new Date(task.dueDate).toLocaleDateString()}</span></p>
                            </div>
                            <button className="task-check">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )) : (
                        <div className="empty-tasks-mini">
                            <p>No high-priority tasks pending.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Last Site Visit Uploads */}
            <section className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Last Site Visit Uploads</h2>
                    <button onClick={() => navigate('/staff/site-visits')} className="view-all">Log New</button>
                </div>
                <div className="site-visits-grid">
                    {recentVisits.length > 0 ? (
                        recentVisits.map((visit) => (
                            <div key={visit._id} className="visit-preview-card">
                                <div className="visit-images">
                                    {visit.images && visit.images.length > 0 ? (
                                        <>
                                            <img src={`${BASE_IMAGE_URL}${visit.images[0]}`} alt="Site" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                                            <div style={{ display: 'none', color: 'red', fontSize: '10px' }}>Failed: {`${BASE_IMAGE_URL}${visit.images[0]}`}</div>
                                        </>
                                    ) : (
                                        <div className="no-image-placeholder">No Image</div>
                                    )}
                                    <span className="image-count">+{visit.images?.length || 0} Photos</span>
                                </div>
                                <div className="visit-details">
                                    <h4>{visit.client?.name || 'Site Visit'}</h4>
                                    <p className="visit-notes">{visit.notes?.substring(0, 60)}...</p>
                                    <div className="visit-meta">
                                        <Calendar size={12} />
                                        <span>{new Date(visit.visitDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state-mini">
                            <p>No recent site visits logged.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Recent Activity Feed */}
            <section className="dashboard-section">
                <h2 className="section-title">Recent Activity</h2>
                <div className="activity-feed">
                    {recentVisits.slice(0, 3).map((visit) => (
                        <div key={visit._id} className="activity-item">
                            <div className="activity-dot"></div>
                            <div className="activity-content">
                                <p><strong>Site Visit</strong> logged for {visit.client?.name || 'Client'}</p>
                                <span className="time">{new Date(visit.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                    {urgentTasks.slice(0, 2).map((task) => (
                        <div key={task._id} className="activity-item">
                            <div className="activity-dot task"></div>
                            <div className="activity-content">
                                <p><strong>Task Updated:</strong> {task.title}</p>
                                <span className="time">{new Date(task.updatedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── DESIGN PREVIEW MODAL FOR SALES ── */}
            {showViewModal && selectedTask && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="modal-content" style={{ background: 'white', borderRadius: '28px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <button onClick={() => setShowViewModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}><X size={20} /></button>
                        
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ background: '#6366f1', color: 'white', padding: '10px', borderRadius: '14px' }}><Eye size={24} /></div>
                                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>{selectedTask.title}</h2>
                            </div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>Review the design files and item list before presenting to client.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                            <div className="modal-left-col">
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Image size={18} color="#6366f1" /> Design Assets</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {selectedTask.submissions?.[selectedTask.submissions.length - 1]?.files?.map((file, i) => {
                                        const isImg = file.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                                        return (
                                            <div key={i} className="file-card" style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                                {isImg ? (
                                                    <div style={{ height: '140px', background: '#eee' }}>
                                                        <img src={file.url.startsWith('http') ? file.url : `${BASE_IMAGE_URL}${file.url}`} alt="Design" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                ) : (
                                                    <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0' }}><FileText size={40} color="#64748b" /></div>
                                                )}
                                                <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name || `File ${i+1}`}</span>
                                                    <a href={file.url.startsWith('http') ? file.url : `${BASE_IMAGE_URL}${file.url}`} target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}><ExternalLink size={16} /></a>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {!selectedTask.submissions?.[selectedTask.submissions.length - 1]?.files?.length && (
                                        <div style={{ gridColumn: '1/-1', padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>No files attached to this submission.</div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-right-col">
                                <div style={{ background: '#f1f5f9', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} color="#6366f1" /> Designer Notes</h3>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>{selectedTask.submissions?.[selectedTask.submissions.length - 1]?.designerNotes || 'No notes provided by the designer.'}</p>
                                </div>

                                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={16} color="#6366f1" /> Item Specifications</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {selectedTask.submissions?.[selectedTask.submissions.length - 1]?.designItems?.map((item, i) => (
                                            <div key={i} style={{ padding: '10px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>
                                                    <span>{item.name}</span>
                                                    <span style={{ color: '#6366f1' }}>{item.quantity} {item.unit}</span>
                                                </div>
                                                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Size: {item.size || 'N/A'}</p>
                                            </div>
                                        ))}
                                        {!selectedTask.submissions?.[selectedTask.submissions.length - 1]?.designItems?.length && (
                                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No item list provided.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setShowViewModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>Close Preview</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;
