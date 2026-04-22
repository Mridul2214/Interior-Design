import React, { useState, useEffect } from 'react';
import { 
    FileText, CheckSquare, Clock, Play, Image,
    Tag, Upload, Target, User,
    AlertCircle, CheckCircle, Bell, Plus, FileUp, Send, List,
    Search, Trash2, PieChart, Briefcase, ChevronRight, X, LogOut,
    AlertTriangle, Lock as LockIcon, Menu, RefreshCw
} from 'lucide-react';
import { 
    projectAPI, taskAPI, quotationAPI, notificationAPI, inventoryAPI, procurementAPI, 
    staffAPI, designDashboardAPI, uploadAPI, BASE_IMAGE_URL 
} from '../../../config/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../css/StaffDashboard.css';

const DesignStaffDashboard = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    const [loading, setLoading] = useState(true);
    
    // Data States
    const [tasks, setTasks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    
    // UI States
    const [selectedTask, setSelectedTask] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadData, setUploadData] = useState({ files: [], staffNotes: '' });
    const [uploading, setUploading] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [taskRes, notifRes] = await Promise.all([
                taskAPI.getAll(),
                notificationAPI.getAll({ limit: 10 }),
            ]);

            if (taskRes.success) {
                // Filter tasks assigned to this user (handling array of assignees)
                const myTasks = taskRes.data.filter(t => 
                    t.assignedTo?.some(s => s._id === user?._id || s.email === user?.email)
                );
                setTasks(myTasks);
            }
            if (notifRes.success) setNotifications(notifRes.data);
        } catch (err) { 
            console.error('Staff Dashboard Fetch Error:', err); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        setUploading(true);
        try {
            const uploadedFiles = [];
            for (const file of files) {
                const formData = new FormData();
                formData.append('image', file);
                const res = await uploadAPI.image(formData);
                if (res.success) {
                    uploadedFiles.push({ filename: file.name, url: res.url, fileType: file.type });
                }
            }
            setUploadData(prev => ({ ...prev, files: [...prev.files, ...uploadedFiles] }));
        } catch (err) {
            alert('File upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitTask = async () => {
        if (!selectedTask || uploadData.files.length === 0) {
            return alert('Please upload at least one file');
        }
        try {
            setUploading(true);
            const res = await taskAPI.submit(selectedTask._id, uploadData);
            if (res.success) {
                alert('Task submitted successfully for review!');
                setShowUploadModal(false);
                setSelectedTask(null);
                setUploadData({ files: [], staffNotes: '' });
                fetchData();
            }
        } catch (err) {
            alert('Submission failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const getPriorityColor = (p) => ({ Critical: '#dc2626', High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' }[p] || '#94a3b8');

    if (loading) return <div className="loading-state">Initializing Designer Workspace...</div>;

    const pendingTasks = tasks.filter(t => ['To Do', 'In Progress', 'Revision Required'].includes(t.status));
    const revisionTasks = tasks.filter(t => t.status === 'Revision Required');
    const submittedTasks = tasks.filter(t => ['Review Pending', 'Approved', 'Pushed to Procurement'].includes(t.status));
    const dueSoonTasks = tasks.filter(t => {
        if (t.status === 'Completed' || t.status === 'Approved') return false;
        if (!t.dueDate) return false;
        const diff = new Date(t.dueDate) - new Date();
        const days = diff / (1000 * 60 * 60 * 24);
        return days <= 3 && days >= 0;
    });

    return (
        <div className="dashboard-content-area-unified fade-in" style={{ padding: '2rem' }}>
            {activeTab === 'overview' && (
                <>
                    <div className="welcome-banner">
                        <h3>Designer Workspace</h3>
                        <p>Track your assignments and manage your design pipeline.</p>
                    </div>

                    {dueSoonTasks.length > 0 && (
                        <div className="alert-banner-premium" style={{ 
                            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', 
                            border: '1px solid #fde68a', 
                            padding: '1.25rem', 
                            borderRadius: '16px', 
                            marginBottom: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.1)'
                        }}>
                            <div style={{ background: '#f59e0b', padding: '10px', borderRadius: '12px' }}>
                                <Clock size={24} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <strong style={{ color: '#92400e', fontSize: '1.1rem', display: 'block' }}>Daily Update Required!</strong>
                                <span style={{ color: '#b45309', fontSize: '0.9rem' }}>
                                    You have {dueSoonTasks.length} task(s) due within 3 days. Please provide your daily progress updates today.
                                </span>
                            </div>
                            <button className="btn-primary" style={{ background: '#f59e0b', border: 'none' }} onClick={() => navigate('?tab=tasks')}>
                                View Tasks
                            </button>
                        </div>
                    )}

                    <div className="stats-row">
                        <div className="stat-pill">
                            <Briefcase size={32} color="#4f46e5" />
                            <div>
                                <strong>{pendingTasks.length}</strong>
                                <span>Active Tasks</span>
                            </div>
                        </div>
                        <div className="stat-pill" style={{ borderColor: revisionTasks.length > 0 ? '#ef4444' : '#e2e8f0' }}>
                            <AlertCircle size={32} color={revisionTasks.length > 0 ? "#ef4444" : "#94a3b8"} />
                            <div>
                                <strong>{revisionTasks.length}</strong>
                                <span>Revisions Needed</span>
                            </div>
                        </div>
                        <div className="stat-pill">
                            <CheckCircle size={32} color="#10b981" />
                            <div>
                                <strong>{tasks.filter(t => t.status === 'Approved').length}</strong>
                                <span>Approved Designs</span>
                            </div>
                        </div>
                    </div>

                    <div className="project-detail-card">
                        <div className="pd-header">
                            <div className="pd-title">
                                <strong><Bell size={18} /> Recent Notifications</strong>
                            </div>
                        </div>
                        <div className="request-history-list">
                            {notifications.map(n => (
                                <div key={n._id} className="history-item">
                                    <div className="history-header">
                                        <div style={{ fontWeight: 700 }}>{n.title}</div>
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.5rem' }}>{n.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'tasks' && (
                <div>
                    <div className="task-board-header">
                        <h2>Assigned Design Tasks</h2>
                    </div>
                    <div className="board-lists" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
                        <div className="board-column">
                            <div className="col-header">
                                <span>In Progress Tasks</span>
                                <span className="count">{pendingTasks.length}</span>
                            </div>
                            <div className="queue-list">
                                {pendingTasks.map(task => (
                                    <div key={task._id} className="queue-item">
                                        <div className="queue-dot" style={{ backgroundColor: getPriorityColor(task.priority) }}></div>
                                        <div className="queue-info">
                                            <strong>{task.title}</strong>
                                            <span>Due: {new Date(task.dueDate).toLocaleDateString()} | <span className="text-warning">{task.status === 'Revision Required' ? 'Redo Given' : task.status}</span> ({task.progress || 0}%)</span>
                                            <div className="progress-container" style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '8px' }}>
                                                <div className="progress-bar" style={{ width: `${task.progress || 0}%`, height: '100%', background: task.status === 'Revision Required' ? '#ef4444' : '#4f46e5', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
                                            </div>
                                        </div>
                                        <button className="btn-save-boq" style={{ backgroundColor: '#4f46e5' }} onClick={() => { setSelectedTask(task); setShowUploadModal(true); }}>
                                            <Upload size={16} /> Submit Design
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'revisions' && (
                <div>
                    <div className="task-board-header">
                        <h2>Revision Requests</h2>
                    </div>
                    <div className="board-lists" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
                        <div className="board-column">
                            <div className="col-header">
                                <span>Needs Revision</span>
                                <span className="count">{revisionTasks.length}</span>
                            </div>
                            <div className="queue-list">
                                {revisionTasks.map(task => (
                                    <div key={task._id} className="queue-item" style={{ borderColor: '#ef4444' }}>
                                        <div className="queue-info">
                                            <strong className="text-error">{task.title}</strong>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                                                Status: <span style={{ color: '#ef4444', fontWeight: 700 }}>Redo Given</span> ({task.progress || 0}%)
                                            </span>
                                            <div className="progress-container" style={{ width: '100%', height: '6px', background: '#fee2e2', borderRadius: '3px', marginTop: '8px' }}>
                                                <div className="progress-bar" style={{ width: `${task.progress || 0}%`, height: '100%', background: '#ef4444', borderRadius: '3px' }}></div>
                                            </div>
                                            <div className="feed-small-item" style={{ marginTop: '0.8rem', marginBottom: '0.8rem', background: '#fff', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px' }}>
                                                <div className="feed-text">
                                                    <strong>Manager Feedback:</strong>
                                                    <p>{task.submissions?.[task.submissions.length-1]?.managerFeedback || 'Redo carefully'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="btn-save-boq" style={{ backgroundColor: '#ef4444', border: 'none' }} onClick={() => { setSelectedTask(task); setShowUploadModal(true); }}>
                                            <Upload size={16} /> Re-submit
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'submissions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* View for Approved/Finalized Tasks */}
                    <div className="project-detail-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div className="pd-header" style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', margin: 0 }}>
                            <div className="pd-title">
                                <strong style={{ color: '#15803d' }}><CheckCircle size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> Approved & Finalized Tasks</strong>
                                <span style={{ display: 'block', marginTop: '4px' }}>These tasks have been reviewed and accepted by your manager.</span>
                            </div>
                        </div>
                        <table className="tag-table" style={{ margin: 0 }}>
                            <thead>
                                <tr><th>Task Title</th><th>Approved Date</th><th>Status</th><th>Designs</th><th>Notes</th></tr>
                            </thead>
                            <tbody>
                                {tasks.filter(t => ['Approved', 'Completed', 'Pushed to Procurement'].includes(t.status)).length === 0 && (
                                    <tr><td colSpan="5" className="empty-mini">No approved tasks yet.</td></tr>
                                )}
                                {tasks.filter(t => ['Approved', 'Completed', 'Pushed to Procurement'].includes(t.status)).map(task => (
                                    <tr key={task._id}>
                                        <td><strong>{task.title}</strong></td>
                                        <td>{new Date(task.submissions[task.submissions.length-1]?.submittedAt || task.updatedAt).toLocaleDateString()}</td>
                                        <td><span className="status-pill" style={{ background: '#dcfce7', color: '#15803d' }}>{task.status}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', maxWidth: '150px', padding: '5px 0' }}>
                                                {task.submissions?.[task.submissions.length-1]?.files?.map((f, idx) => (
                                                    <a key={idx} href={f.url?.startsWith('http') ? f.url : `${BASE_IMAGE_URL}${f.url}`} target="_blank" rel="noreferrer">
                                                        <img 
                                                            src={f.url?.startsWith('http') ? f.url : `${BASE_IMAGE_URL}${f.url}`} 
                                                            alt="Design" 
                                                            style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=File'; }}
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        </td>
                                        <td>{task.submissions[task.submissions.length-1]?.managerFeedback || 'Great work!'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* View for Review Pending Tasks */}
                    <div className="project-detail-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div className="pd-header" style={{ padding: '1.5rem', background: '#fffbeb', borderBottom: '1px solid #e2e8f0', margin: 0 }}>
                            <div className="pd-title">
                                <strong style={{ color: '#b45309' }}><Clock size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> Pending Manager Review</strong>
                                <span style={{ display: 'block', marginTop: '4px' }}>Awaiting manager feedback on your submissions.</span>
                            </div>
                        </div>
                        <table className="tag-table" style={{ margin: 0 }}>
                            <thead>
                                <tr><th>Task Title</th><th>Submitted Date</th><th>Status</th><th>Designs</th><th>Your Notes</th></tr>
                            </thead>
                            <tbody>
                                {tasks.filter(t => t.status === 'Review Pending').length === 0 && (
                                    <tr><td colSpan="5" className="empty-mini">No tasks pending review.</td></tr>
                                )}
                                {tasks.filter(t => t.status === 'Review Pending').map(task => (
                                    <tr key={task._id}>
                                        <td><strong>{task.title}</strong></td>
                                        <td>{new Date(task.submissions[task.submissions.length-1].submittedAt).toLocaleDateString()}</td>
                                        <td><span className="status-pill" style={{ background: '#fef9c3', color: '#a16207' }}>Review Pending</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', maxWidth: '150px', padding: '5px 0' }}>
                                                {task.submissions?.[task.submissions.length-1]?.files?.map((f, idx) => (
                                                    <a key={idx} href={f.url?.startsWith('http') ? f.url : `${BASE_IMAGE_URL}${f.url}`} target="_blank" rel="noreferrer">
                                                        <img 
                                                            src={f.url?.startsWith('http') ? f.url : `${BASE_IMAGE_URL}${f.url}`} 
                                                            alt="Design" 
                                                            style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=File'; }}
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        </td>
                                        <td>{task.submissions[task.submissions.length-1].staffNotes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Submission Modal ── */}
            {showUploadModal && (
                <div className="modal-overlay">
                    <div className="modal-content-styled">
                        <div className="modal-header">
                            <h3>Submit Design: {selectedTask?.title}</h3>
                            <button className="close-btn" onClick={() => setShowUploadModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="upload-area">
                                <label className="file-input-label">
                                    <Upload size={24} />
                                    <span>Click to upload design files (2D/3D)</span>
                                    <input type="file" multiple onChange={handleFileUpload} hidden />
                                </label>
                                {uploading && <p className="loading-text">Uploading files...</p>}
                                <div className="uploaded-preview" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', marginTop: '10px' }}>
                                    {uploadData.files.map((f, i) => (
                                        <div key={i} className="file-preview-item" style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                            <img 
                                                src={f.url?.startsWith('http') ? f.url : `${BASE_IMAGE_URL}${f.url}`} 
                                                alt={f.filename} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=File'; }}
                                            />
                                            <button 
                                                onClick={() => setUploadData(prev => ({ ...prev, files: prev.files.filter((_, idx) => idx !== i) }))}
                                                style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
                                            >
                                                <X size={12} />
                                            </button>
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2px 5px', fontSize: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {f.filename}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Staff Notes</label>
                                <textarea 
                                    placeholder="Add any notes about the design..." 
                                    value={uploadData.staffNotes} 
                                    onChange={e => setUploadData({ ...uploadData, staffNotes: e.target.value })} 
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="action-btn" onClick={() => setShowUploadModal(false)}>Cancel</button>
                            <button className="action-btn primary" onClick={handleSubmitTask} disabled={uploading}>
                                {uploading ? 'Submitting...' : 'Submit to Manager'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesignStaffDashboard;
