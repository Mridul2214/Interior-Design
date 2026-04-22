import React, { useState, useEffect } from 'react';
import {
    FileText, Users, CheckCircle, Clock, Plus, Eye, Check, X,
    TrendingUp, Palette, Image, Package, Tag, Bell, List,
    ArrowRight, Send, AlertCircle, Loader, ChevronRight, Briefcase,
    Menu, LogOut, LayoutDashboard, ShoppingCart, CheckSquare,
    AlertTriangle, RefreshCw, Play, UserPlus, Scissors
} from 'lucide-react';


import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
    projectAPI, quotationAPI, taskAPI, notificationAPI, staffAPI, procurementAPI, designDashboardAPI,
    BASE_IMAGE_URL
} from '../../../config/api';
import '../css/ManagerDashboard.css';

import DesignOverview from './DesignOverview';
import Projects from './Projects';
import Quotations from './Quotations';
import Clients from './Clients';
import Inventory from './Inventory';
import Tasks from './Tasks';

const DesignManagerDashboard = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${BASE_IMAGE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const [stats, setStats] = useState(null);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [quotations, setQuotations] = useState([]);
    const [teamStats, setTeamStats] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [materialRequests, setMaterialRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [submittingTask, setSubmittingTask] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [taskFormData, setTaskFormData] = useState({ title: '', description: '', assignedTo: [], priority: 'Medium', dueDate: '', project: '' });

    // Submission Review States
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [showTaskUpdatesModal, setShowTaskUpdatesModal] = useState(false);
    const [showStaffRecordModal, setShowStaffRecordModal] = useState(false);
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [splitTaskData, setSplitTaskData] = useState({ title: '', assignedTo: [] });
    const [selectedStaffForRecord, setSelectedStaffForRecord] = useState(null);
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [reviewStatus, setReviewStatus] = useState('Approved');
    const [managerFeedback, setManagerFeedback] = useState('');
    const [submissionFilter, setSubmissionFilter] = useState('All');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectStats, projectList, taskList, quoteRes, teamRes, notifRes, staffRes, matRes] = await Promise.all([
                projectAPI.getStats(),
                projectAPI.getAll({ limit: 100 }),
                taskAPI.getAll({ limit: 100 }),
                quotationAPI.getAll({ status: 'Approved' }),
                staffAPI.getAnalyticsOverview(),
                notificationAPI.getAll({ limit: 30 }),
                staffAPI.getAll(),
                procurementAPI.getMaterialRequests({ limit: 100 })
            ]);

            if (projectStats.success) setStats(projectStats.data);
            if (projectList.success) setProjects(projectList.data);
            if (taskList.success) setTasks(taskList.data);
            if (quoteRes.success) setQuotations(quoteRes.data);
            if (teamRes.success) setTeamStats(teamRes.data.filter(s => s.role?.toLowerCase().includes('design')));
            if (notifRes.success) setNotifications(notifRes.data);
            if (staffRes.success) setStaffList(staffRes.data.filter(s => s.role?.toLowerCase().includes('design') && s.status === 'Active'));
            if (matRes.success) setMaterialRequests(matRes.data);
        } catch (err) {
            console.error('Design Manager Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignTask = async (e) => {
        e.preventDefault();
        setSubmittingTask(true);
        try {
            const endpoint = editingTaskId ? taskAPI.update(editingTaskId, taskFormData) : taskAPI.create(taskFormData);
            const res = await endpoint;
            if (res.success) {
                setShowAssignModal(false);
                setTaskFormData({ title: '', description: '', assignedTo: [], priority: 'Medium', dueDate: '', project: '' });
                fetchData();
            }
        } catch (err) {
            alert('Assignment failed: ' + err.message);
        } finally {
            setSubmittingTask(false);
        }
    };

    const handleReviewSubmission = async () => {
        if (!selectedTask || !selectedTask.submissions?.length) return;
        const latestSubmission = selectedTask.submissions[selectedTask.submissions.length - 1];
        try {
            const res = await taskAPI.review(selectedTask._id, {
                submissionId: latestSubmission._id,
                status: reviewStatus,
                managerFeedback
            });
            if (res.success) {
                setShowSubmissionModal(false);
                setSelectedTask(null);
                setManagerFeedback('');
                fetchData();
            }
        } catch (err) {
            alert('Review failed: ' + err.message);
        }
    };

    const handlePushToProcurement = async (taskId) => {
        if (!window.confirm('Are you sure you want to push this design to procurement?')) return;
        try {
            const res = await taskAPI.pushToProcurement(taskId);
            if (res.success) {
                alert('Pushed to procurement successfully!');
                fetchData();
            }
        } catch (err) {
            alert('Push failed: ' + err.message);
        }
    };

    const handleSplitTask = async () => {
        if (!splitTaskData.title || splitTaskData.assignedTo.length === 0) return alert('Please fill in sub-task title and assignment');
        try {
            const res = await taskAPI.create({
                ...selectedTask,
                _id: undefined,
                title: splitTaskData.title,
                assignedTo: splitTaskData.assignedTo,
                status: 'To Do',
                progress: 0,
                submissions: [],
                dailyUpdates: []
            });
            if (res.success) {
                alert('Task split successfully!');
                setShowSplitModal(false);
                fetchData();
            }
        } catch (err) {
            alert('Failed to split task');
        }
    };

    const handleReassignTask = async (taskId, staffIds, reason) => {
        if (!window.confirm('Are you sure you want to reassign this task?')) return;
        try {
            const res = await taskAPI.reassign(taskId, staffIds, reason);
            if (res.success) {
                alert('Task reassigned successfully');
                fetchData();
            }
        } catch (err) {
            alert('Reassignment failed: ' + err.message);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const getPriorityColor = (p) => ({ Critical: '#dc2626', High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' }[p] || '#94a3b8');

    if (loading) return <div className="loading-state">Loading Design Dashboard...</div>;

    const renderContent = () => {
        if (activeTab === 'quotations') return <Quotations quotations={quotations} formatCurrency={formatCurrency} />;
        if (activeTab === 'project_status') {
            return (
                <Projects 
                    projects={projects} 
                    materialRequests={materialRequests} 
                    onReviewRequest={(pid) => navigate(`/material-review?project=${pid}`)}
                    onUpdateStatus={(pid, stat) => projectAPI.update(pid, { status: stat }).then(fetchData)}
                    onHandoffInitiate={(proj) => handlePushToProcurement(proj._id)}
                />
            );
        }
        if (activeTab === 'tasks') {
            return (
                <Tasks 
                    tasks={tasks} 
                    teamStats={teamStats} 
                    staffList={staffList}
                    onOpenAssignModal={() => setShowAssignModal(true)} 
                    onOpenEditTask={(task) => { setSelectedTask(task); setShowAssignModal(true); }}
                    getPriorityColor={getPriorityColor} 
                    onReassign={handleReassignTask}
                    onViewUpdates={(task) => { setSelectedTask(task); setShowTaskUpdatesModal(true); }}
                    onSplit={(task) => { setSelectedTask(task); setSplitTaskData({ title: `${task.title} - Part 2`, assignedTo: [] }); setShowSplitModal(true); }}
                />
            );
        }

        if (activeTab === 'staff_overview') {
            return (
                <div className="section-card">
                    <div className="section-header"><h3>Staff Workload & Availability</h3></div>
                    <div className="team-performance-list">
                        {staffList.map(member => {
                            const activeCount = tasks.filter(t => t.assignedTo?.some(s => s._id === member._id) && t.status !== 'Completed').length;
                            return (
                                <div 
                                    key={member._id} 
                                    className="member-row clickable-row" 
                                    onClick={() => {
                                        setSelectedStaffForRecord(member);
                                        setShowStaffRecordModal(true);
                                    }}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s', borderBottom: '1px solid #f1f5f9', padding: '1rem 0.5rem' }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div className="member-info">
                                        <div className="member-name" style={{ fontWeight: 600 }}>{member.name}</div>
                                        <div className="member-role" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{member.role}</div>
                                    </div>
                                    <div className="member-load" style={{ flex: 1, padding: '0 2rem' }}>
                                        <div className="load-bar" style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px' }}>
                                            <div className="load-fill" style={{
                                                height: '100%', borderRadius: '3px',
                                                width: `${Math.min((activeCount / 5) * 100, 100)}%`,
                                                backgroundColor: activeCount > 3 ? '#ef4444' : '#10b981'
                                            }}></div>
                                        </div>
                                        <span className="load-text" style={{ fontSize: '0.7rem', color: '#64748b' }}>{activeCount} active tasks</span>
                                    </div>
                                    <div className="member-availability">
                                        <span className={`status-badge-inline ${member.status?.toLowerCase()}`}>{member.status}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        if (activeTab === 'ready_for_procurement') {
            const approvedDesigns = tasks.filter(t => t.status === 'Approved');
            return (
                <div className="section-card">
                    <div className="section-header" style={{ marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Send size={20} color="#10b981" /> Approved Designs Pipeline
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Finalized designs ready for the procurement phase</p>
                        </div>
                    </div>

                    <div className="ready-designs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {approvedDesigns.length > 0 ? approvedDesigns.map(task => {
                            const latestSubmission = task.submissions?.[task.submissions.length - 1];
                            return (
                                <div key={task._id} className="submission-card" style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: '16px', background: '#fff', padding: '1.5rem', transition: 'all 0.3s ease' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{task.title}</h4>
                                        <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>READY</span>
                                    </div>

                                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85rem' }}>
                                            <Briefcase size={14} color="#6366f1" />
                                            <span style={{ fontWeight: 600, color: '#475569' }}>Project:</span>
                                            <span style={{ color: '#1e293b' }}>{task.project?.projectName || 'Internal Project'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                            <Users size={14} color="#6366f1" />
                                            <span style={{ fontWeight: 600, color: '#475569' }}>Design Team:</span>
                                            <span style={{ color: '#1e293b', fontWeight: 500 }}>
                                                {task.assignedTo?.map(s => s.name).join(', ') || latestSubmission?.submittedBy?.name || 'Assigned Staff'}
                                            </span>
                                        </div>
                                    </div>

                                    {latestSubmission?.files?.length > 0 && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Final Assets</p>
                                            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                                                {latestSubmission.files.map((file, idx) => (
                                                    <div key={idx} style={{ width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 }}>
                                                        {file.url?.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                                                            <img src={getImageUrl(file.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
                                                                <FileText size={20} color="#94a3b8" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ marginTop: 'auto' }}>
                                        <button
                                            className="action-btn primary"
                                            style={{
                                                width: '100%',
                                                justifyContent: 'center',
                                                height: '45px',
                                                borderRadius: '12px',
                                                backgroundColor: '#10b981',
                                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                color: 'white',
                                                fontWeight: 600
                                            }}
                                            onClick={() => handlePushToProcurement(task._id)}
                                        >
                                            <Send size={18} />
                                            <span>Complete Department Handover</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ gridColumn: '1 / -1', padding: '5rem 2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                                <CheckSquare size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                                <h4 style={{ color: '#64748b', marginBottom: '0.5rem' }}>All Caught Up!</h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>There are no approved designs waiting for procurement at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (activeTab === 'submissions') {
            const submissions = tasks.filter(t => t.submissions?.length > 0 && (submissionFilter === 'All' || t.status === submissionFilter));
            return (
                <div className="section-card">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3>Staff Design Submissions</h3>
                        <div className="board-filters" style={{ display: 'flex', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            {['All', 'Review Pending', 'Revision Required', 'Approved', 'Rejected'].map(filter => (
                                <button
                                    key={filter}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        background: submissionFilter === filter ? '#4f46e5' : 'transparent',
                                        color: submissionFilter === filter ? 'white' : '#64748b'
                                    }}
                                    onClick={() => setSubmissionFilter(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="submissions-grid">
                        {submissions.map(task => {
                            const latest = task.submissions[task.submissions.length - 1];
                            return (
                                <div key={task._id} className="submission-card">
                                    <div className="submission-header">
                                        <h4>{task.title}</h4>
                                        <div style={{ textAlign: 'right' }}>
                                            <span className="submission-time" style={{ display: 'block' }}>{new Date(latest.submittedAt).toLocaleDateString()}</span>
                                            {task.submissions.length > 1 && (
                                                <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700 }}>
                                                    Redo Count: {task.submissions.length - 1}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="submission-staff">Submitted by: {latest.submittedBy?.name || 'Staff'}</p>
                                    <div className="submission-files" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                        {latest.files?.map((f, i) => (
                                            <a key={i} href={getImageUrl(f.url)} target="_blank" rel="noopener noreferrer" className="file-link" style={{ display: 'inline-block', position: 'relative', overflow: 'hidden', borderRadius: '8px', border: '1px solid #e2e8f0', width: '60px', height: '60px' }}>
                                                {f.url?.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || !f.url?.endsWith('.pdf') ? (
                                                    <img src={getImageUrl(f.url)} alt={f.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }} title={f.filename}>
                                                        <FileText size={20} color="#64748b" />
                                                    </div>
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                    <div className="submission-actions">
                                        <button className="btn-view" onClick={() => { setSelectedTask(task); setShowSubmissionModal(true); }}>Review</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )
        }

        return (
            <>
                <DesignOverview stats={stats} tasks={tasks} quotations={quotations} teamStats={teamStats} />
                <div className="section-card" style={{ gridColumn: 'span 2', marginTop: '2rem' }}>
                    <div className="section-header"><h3><Bell size={18} /> Activity Feed</h3></div>
                    <div className="notifications-feed">
                        {notifications.map(notif => (
                            <div key={notif._id} className={`notif-item ${notif.isRead ? 'read' : 'unread'}`}>
                                <div className="notif-content">
                                    <p className="notif-title">{notif.title}</p>
                                    <p className="notif-desc">{notif.description}</p>
                                    <span className="notif-time">{new Date(notif.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="dashboard-content-area-unified fade-in" style={{ padding: '2rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="action-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', color: '#64748b' }}
                >
                    <RefreshCw size={16} className={loading ? 'spin' : ''} />
                    <span>{loading ? 'Updating...' : 'Refresh Data'}</span>
                </button>
            </div>
            {renderContent()}

            {/* ── Task Assignment Modal ── */}
            {showAssignModal && (
                <div className="modal-overlay">
                    <div className="modal-content-styled">
                        <div className="modal-header">
                            <h3>{editingTaskId ? 'Edit Design Task' : 'Assign / Split Design Task'}</h3>
                            <button className="close-btn" onClick={() => setShowAssignModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAssignTask} className="modal-form">
                            <div className="form-group">
                                <label>Task Title</label>
                                <input type="text" placeholder="e.g., Living Room 3D Render" value={taskFormData.title} onChange={e => setTaskFormData({ ...taskFormData, title: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea placeholder="Provide details..." value={taskFormData.description} onChange={e => setTaskFormData({ ...taskFormData, description: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Assign To Staff (Select multiple to split task)</label>
                                <select
                                    multiple
                                    className="multi-select"
                                    value={taskFormData.assignedTo}
                                    onChange={e => {
                                        const values = Array.from(e.target.selectedOptions, option => option.value);
                                        setTaskFormData({ ...taskFormData, assignedTo: values });
                                    }}
                                    required
                                    style={{ height: '100px' }}
                                >
                                    {staffList.map(s => <option key={s._id} value={s._id}>{s.name} — {s.role}</option>)}
                                </select>
                                <small>Hold Ctrl (Cmd on Mac) to select multiple staff</small>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select value={taskFormData.priority} onChange={e => setTaskFormData({ ...taskFormData, priority: e.target.value })}>
                                        <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input type="date" value={taskFormData.dueDate} onChange={e => setTaskFormData({ ...taskFormData, dueDate: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Relates to Approved Quotation</label>
                                <select value={taskFormData.project} onChange={e => setTaskFormData({ ...taskFormData, project: e.target.value })} required>
                                    <option value="">Select Quotation / Project</option>
                                    {quotations.map(q => <option key={q._id} value={q._id}>{q.quotationNumber} — {q.projectName}</option>)}
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="action-btn" onClick={() => setShowAssignModal(false)}>Cancel</button>
                                <button type="submit" className="action-btn primary" disabled={submittingTask}>
                                    {submittingTask ? 'Assigning...' : 'Assign Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Submission Review Modal ── */}
            {showSubmissionModal && selectedTask && (
                <div className="modal-overlay">
                    <div className="modal-content-styled">
                        <div className="modal-header">
                            <h3>Review Design Submission: {selectedTask.title}</h3>
                            <button className="close-btn" onClick={() => setShowSubmissionModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="submission-details">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h5>Current Submission (Latest):</h5>
                                    {selectedTask.submissions.length > 1 && (
                                        <span style={{ padding: '4px 10px', background: '#fee2e2', color: '#ef4444', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                                            Revision #{selectedTask.submissions.length - 1}
                                        </span>
                                    )}
                                </div>
                                <div className="files-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                                    {selectedTask.submissions[selectedTask.submissions.length - 1].files.map((f, i) => (
                                        <a key={i} href={getImageUrl(f.url)} target="_blank" rel="noopener noreferrer" className="file-item" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '12px', border: '1px solid #e2e8f0', textDecoration: 'none', background: '#f8fafc', transition: 'all 0.2s' }}>
                                            <div style={{ height: '90px', width: '100%', background: '#eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {f.url?.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || !f.url?.endsWith('.pdf') ? (
                                                    <img src={getImageUrl(f.url)} alt={f.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <FileText size={32} color="#94a3b8" />
                                                )}
                                            </div>
                                            <div style={{ padding: '8px', fontSize: '0.7rem', color: '#475569', textWrap: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {f.filename}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                                <div className="staff-notes" style={{ marginBottom: '1.5rem', padding: '12px', background: '#f1f5f9', borderRadius: '8px' }}>
                                    <h6 style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: '#64748b' }}>Staff Notes:</h6>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{selectedTask.submissions[selectedTask.submissions.length - 1].staffNotes || 'No notes provided'}</p>
                                </div>

                                {selectedTask.submissions.length > 1 && (
                                    <div className="history-section" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                                        <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                            <RefreshCw size={16} /> Previous Submissions & Redo History
                                        </h5>
                                        <div className="history-list" style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                                            {selectedTask.submissions.slice(0, -1).reverse().map((sub, idx) => (
                                                <div key={idx} style={{ marginBottom: '1rem', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <strong style={{ fontSize: '0.8rem' }}>Version {selectedTask.submissions.length - 1 - idx}</strong>
                                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                                                        {sub.files.map((f, i) => (
                                                            <a key={i} href={getImageUrl(f.url)} target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #eee', flexShrink: 0 }}>
                                                                <img src={getImageUrl(f.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            </a>
                                                        ))}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#ef4444', background: '#fff1f2', padding: '6px', borderRadius: '4px', marginTop: '4px' }}>
                                                        <strong>Redo Feedback:</strong> {sub.managerFeedback || 'Revision requested'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="review-form">
                                <div className="form-group">
                                    <label>Decision</label>
                                    <select value={reviewStatus} onChange={e => setReviewStatus(e.target.value)}>
                                        <option value="Approved">Approve Design</option>
                                        <option value="Revision Required">Request Revision (Redo)</option>
                                        <option value="Rejected">Reject</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Feedback / Comments</label>
                                    <textarea
                                        placeholder="Add comments for the staff..."
                                        value={managerFeedback}
                                        onChange={e => setManagerFeedback(e.target.value)}
                                        required={reviewStatus === 'Revision Required'}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="action-btn" onClick={() => setShowSubmissionModal(false)}>Cancel</button>
                            <button className="action-btn primary" onClick={handleReviewSubmission}>Submit Review</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Task Updates Review Modal */}
            {showTaskUpdatesModal && selectedTask && (
                <div className="modal-overlay">
                    <div className="modal-content-styled" style={{ maxWidth: '650px' }}>
                        <div className="modal-header">
                            <div>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><RefreshCw size={20} color="#6366f1" /> Daily Progress Review</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>Reviewing updates for: <strong>{selectedTask.title}</strong></p>
                            </div>
                            <button className="close-btn" onClick={() => setShowTaskUpdatesModal(false)}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                            <div className="update-timeline">
                                {selectedTask.dailyUpdates?.length > 0 ? (
                                    [...selectedTask.dailyUpdates].reverse().map((upd, idx) => (
                                        <div key={idx} style={{ 
                                            background: upd.emergencies ? '#fff1f2' : '#f8fafc',
                                            padding: '1.25rem',
                                            borderRadius: '16px',
                                            border: `1px solid ${upd.emergencies ? '#fecaca' : '#e2e8f0'}`,
                                            marginBottom: '1rem',
                                            position: 'relative',
                                            borderLeft: `5px solid ${upd.emergencies ? '#ef4444' : '#6366f1'}`
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem' }}>
                                                    {upd.staff?.name || 'Assigned Staff'}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                                                    {new Date(upd.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.5, marginBottom: '10px' }}>
                                                {upd.update}
                                            </div>
                                            {upd.emergencies && (
                                                <div style={{ 
                                                    background: '#ef4444', color: 'white', padding: '10px 14px', borderRadius: '10px', 
                                                    fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px',
                                                    marginTop: '8px'
                                                }}>
                                                    <AlertTriangle size={16} /> EMERGENCY / BLOCKER: {upd.emergencies}
                                                </div>
                                            )}
                                            {upd.extensionRequest && upd.extensionRequest.requestedDate && (
                                                <div style={{ 
                                                    background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 14px', borderRadius: '10px', 
                                                    marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                                }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 800 }}>EXTENSION REQUESTED</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#92400e' }}>
                                                            Until: <strong>{new Date(upd.extensionRequest.requestedDate).toLocaleDateString()}</strong>
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: '#92400e', marginTop: '4px' }}>Reason: {upd.extensionRequest.reason}</div>
                                                    </div>
                                                    <div style={{ fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem' }}>
                                                        {upd.extensionRequest.status}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                        <Clock size={40} color="#cbd5e1" style={{ marginBottom: '10px' }} />
                                        <p style={{ color: '#94a3b8' }}>No daily updates submitted for this task yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '1.25rem', background: '#f8fafc', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
                            <button className="btn-primary" style={{ width: '100%', background: '#6366f1' }} onClick={() => setShowTaskUpdatesModal(false)}>Acknowledge & Close</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Staff Performance Record Modal */}
            {showStaffRecordModal && selectedStaffForRecord && (() => {
                const staffTasks = tasks.filter(t => t.assignedTo?.some(s => s._id === selectedStaffForRecord._id));
                const active = staffTasks.filter(t => t.status !== 'Completed' && t.status !== 'Approved');
                const completed = staffTasks.filter(t => t.status === 'Completed' || t.status === 'Approved');
                const redoTotal = staffTasks.reduce((acc, t) => acc + (t.submissions?.length > 1 ? t.submissions.length - 1 : 0), 0);
                
                const calculateDuration = (task) => {
                    if (!task.createdAt || !task.updatedAt) return 'Calculating...';
                    const start = new Date(task.createdAt);
                    const end = new Date(task.updatedAt);
                    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                    return `${diffDays} days`;
                };

                return (
                    <div className="modal-overlay">
                        <div className="modal-content-styled" style={{ maxWidth: '900px', width: '95%' }}>
                            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', color: 'white', padding: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                                        {selectedStaffForRecord.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedStaffForRecord.name}</h2>
                                        <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>{selectedStaffForRecord.role} • Performance Record</p>
                                    </div>
                                </div>
                                <button className="close-btn" onClick={() => setShowStaffRecordModal(false)} style={{ color: 'white' }}><X size={24} /></button>
                            </div>

                            <div style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4f46e5' }}>{active.length}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Active Tasks</div>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{completed.length}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Completed</div>
                                    </div>
                                    <div style={{ background: '#fff1f2', padding: '1.25rem', borderRadius: '16px', textAlign: 'center', border: '1px solid #fecaca' }}>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444' }}>{redoTotal}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>Total Redos</div>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>
                                            {completed.length > 0 ? (completed.reduce((acc, t) => acc + (new Date(t.updatedAt) - new Date(t.createdAt)), 0) / (completed.length * 86400000)).toFixed(1) : 0}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Avg Days/Task</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '2.5rem' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: '#1e293b' }}>
                                        <Play size={18} color="#4f46e5" /> Active Projects & Current Work
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {active.length > 0 ? active.map(t => (
                                            <div key={t._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', overflow: 'hidden' }}>
                                                <div 
                                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', cursor: t.submissions?.length > 1 ? 'pointer' : 'default' }}
                                                    onClick={() => t.submissions?.length > 1 && setExpandedTaskId(expandedTaskId === t._id ? null : t._id)}
                                                >
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            {t.submissions?.length > 1 && <ChevronRight size={14} style={{ transform: expandedTaskId === t._id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />}
                                                            {t.title}
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Project: {t.project?.projectName || 'Internal'}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                        {t.submissions?.length > 1 && (
                                                            <div style={{ textAlign: 'center', background: '#fff1f2', padding: '4px 10px', borderRadius: '8px' }}>
                                                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444' }}>{t.submissions.length - 1}</div>
                                                                <div style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 700 }}>REDOS</div>
                                                            </div>
                                                        )}
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4f46e5' }}>{t.progress || 0}%</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Due: {new Date(t.dueDate).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {expandedTaskId === t._id && t.submissions?.length > 1 && (
                                                    <div style={{ padding: '1rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                                                        <h5 style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <RefreshCw size={12} /> Active Redo Feedback
                                                        </h5>
                                                        {t.submissions.slice(0, -1).reverse().map((sub, idx) => (
                                                            <div key={idx} style={{ marginBottom: '8px', padding: '10px', background: '#fff', border: '1px solid #fee2e2', borderRadius: '8px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                    <strong style={{ fontSize: '0.7rem', color: '#ef4444' }}>Revision #{t.submissions.length - 1 - idx}</strong>
                                                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <div style={{ fontSize: '0.8rem', color: '#1e293b' }}>{sub.managerFeedback}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )) : (
                                            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>No active assignments.</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: '#1e293b' }}>
                                        <CheckCircle size={18} color="#10b981" /> Completed Work History
                                    </h4>
                                    <div style={{ background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                            <thead style={{ background: '#f1f5f9' }}>
                                                <tr>
                                                    <th style={{ padding: '12px', textAlign: 'left' }}>Task Name</th>
                                                    <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                                                    <th style={{ padding: '12px', textAlign: 'center' }}>Redos</th>
                                                    <th style={{ padding: '12px', textAlign: 'center' }}>Duration</th>
                                                    <th style={{ padding: '12px', textAlign: 'right' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {completed.length > 0 ? completed.map(t => (
                                                    <React.Fragment key={t._id}>
                                                        <tr 
                                                            style={{ borderBottom: '1px solid #e2e8f0', cursor: t.submissions?.length > 1 ? 'pointer' : 'default' }}
                                                            onClick={() => t.submissions?.length > 1 && setExpandedTaskId(expandedTaskId === t._id ? null : t._id)}
                                                        >
                                                            <td style={{ padding: '12px', fontWeight: 600 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    {t.submissions?.length > 1 && <ChevronRight size={14} style={{ transform: expandedTaskId === t._id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />}
                                                                    {t.title}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '12px', color: '#64748b' }}>{t.project?.projectName || 'N/A'}</td>
                                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                                <span style={{ color: t.submissions?.length > 1 ? '#ef4444' : '#64748b', fontWeight: t.submissions?.length > 1 ? 800 : 400 }}>
                                                                    {t.submissions?.length > 1 ? t.submissions.length - 1 : 0}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>{calculateDuration(t)}</td>
                                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                                <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>{t.status}</span>
                                                            </td>
                                                        </tr>
                                                        {expandedTaskId === t._id && t.submissions?.length > 1 && (
                                                            <tr>
                                                                <td colSpan="5" style={{ padding: '0', background: '#f8fafc' }}>
                                                                    <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0' }}>
                                                                        <h5 style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            <RefreshCw size={14} /> Redo History & Manager Feedback
                                                                        </h5>
                                                                        {t.submissions.slice(0, -1).map((sub, idx) => (
                                                                            <div key={idx} style={{ marginBottom: '10px', padding: '10px', background: '#fff', border: '1px solid #fee2e2', borderRadius: '8px' }}>
                                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                                    <strong style={{ fontSize: '0.75rem', color: '#ef4444' }}>Revision Request #{idx + 1}</strong>
                                                                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                                                                                </div>
                                                                                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                                                                                    {sub.managerFeedback || 'No detailed feedback provided.'}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                )) : (
                                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No completed history found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0' }}>
                                <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowStaffRecordModal(false)}>Close Record View</button>
                            </div>
                        </div>
                    </div>
                );
            })()}
            {showSplitModal && selectedTask && (
                <div className="modal-overlay">
                    <div className="modal-content-styled" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <div>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Scissors size={20} color="#6366f1" /> Split Task Assignment</h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Create a sub-assignment from: {selectedTask.title}</p>
                            </div>
                            <button className="close-btn" onClick={() => setShowSplitModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ padding: '1.5rem' }}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Sub-Task Title</label>
                                <input 
                                    type="text" 
                                    className="premium-input" 
                                    value={splitTaskData.title}
                                    onChange={(e) => setSplitTaskData({ ...splitTaskData, title: e.target.value })}
                                    placeholder="Enter Title for the new task..."
                                />
                            </div>
                            
                            <div className="form-group">
                                <label style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px', display: 'block' }}>Assign To Staff</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', maxHeight: '200px', overflowY: 'auto', padding: '5px' }}>
                                    {staffList.map(staff => (
                                        <div 
                                            key={staff._id} 
                                            onClick={() => {
                                                const isAssigned = splitTaskData.assignedTo.some(id => id === staff._id);
                                                setSplitTaskData({
                                                    ...splitTaskData,
                                                    assignedTo: isAssigned 
                                                        ? splitTaskData.assignedTo.filter(id => id !== staff._id)
                                                        : [...splitTaskData.assignedTo, staff._id]
                                                });
                                            }}
                                            style={{ 
                                                padding: '10px', 
                                                borderRadius: '10px', 
                                                border: `2px solid ${splitTaskData.assignedTo.includes(staff._id) ? '#6366f1' : '#f1f5f9'}`,
                                                background: splitTaskData.assignedTo.includes(staff._id) ? '#eef2ff' : '#fff',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: splitTaskData.assignedTo.includes(staff._id) ? '#4338ca' : '#1e293b' }}>{staff.name}</div>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{staff.role}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowSplitModal(false)}>Cancel</button>
                            <button className="btn-primary" style={{ flex: 2, background: '#4f46e5' }} onClick={handleSplitTask}>Confirm Split</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesignManagerDashboard;
