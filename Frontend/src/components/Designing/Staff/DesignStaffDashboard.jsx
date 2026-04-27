import React, { useState, useEffect } from 'react';
import {
    FileText, CheckSquare, Clock, Play, Image,
    Tag, Upload, Target, User,
    AlertCircle, CheckCircle, Bell, Plus, FileUp, Send, List, Check,
    Search, Trash2, PieChart, Briefcase, ChevronRight, X, LogOut,
    AlertTriangle, Lock as LockIcon, Menu, RefreshCw, Package, Users, Eye
} from 'lucide-react';
import {
    projectAPI, taskAPI, quotationAPI, notificationAPI, inventoryAPI, procurementAPI,
    staffAPI, designDashboardAPI, uploadAPI, BASE_IMAGE_URL
} from '../../../config/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../css/StaffDashboard.css';
import Tasks from './Tasks';

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
    const [uploading, setUploading] = useState(false);
    const [uploadData, setUploadData] = useState({
        files: [],
        designItems: [], // Changed to array
        staffNotes: ''
    });

    const PREDEFINED_ITEMS = [
        "Plywood (18mm)", "Plywood (12mm)", "Plywood (6mm)", "Laminate (1mm)", 
        "Adhesive (Fevicol SH)", "Hinges (Soft Close)", "Handles (6 inch)", 
        "Handles (8 inch)", "Drawer Channels", "Edge Banding", "Paint (Enamel)", 
        "Paint (Emulsion)", "Gypsum Board", "LED Strip (Warm White)", 
        "Glass (6mm Clear)", "Mirror", "Screws (1 inch)", "Screws (1.5 inch)"
    ];

    const ITEM_UNITS = ["pcs", "kg", "mtr", "sq ft", "pkt", "box", "ltr", "roll"];

    // Material Request States
    const [materialRequests, setMaterialRequests] = useState([]);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [materialFormData, setMaterialFormData] = useState({
        project: '',
        quotation: '',
        items: [],
        priority: 'Medium',
        notes: ''
    });

    // Item Builder Helpers
    const handleAddDesignItem = () => {
        setUploadData(prev => ({
            ...prev,
            designItems: [...prev.designItems, { name: '', size: '', unit: 'pcs', quantity: 1 }]
        }));
    };

    const handleRemoveDesignItem = (index) => {
        setUploadData(prev => ({
            ...prev,
            designItems: prev.designItems.filter((_, i) => i !== index)
        }));
    };

    const handleDesignItemChange = (index, field, value) => {
        setUploadData(prev => {
            const newItems = [...prev.designItems];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, designItems: newItems };
        });
    };

    // Quotation View States
    const [showQuotationModal, setShowQuotationModal] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState(null);

    useEffect(() => {
        fetchData(true); // Initial load with spinner
        // Auto-refresh every 30 seconds to catch reassignments silently
        const interval = setInterval(() => fetchData(false), 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            const [taskRes, notifRes, matRes] = await Promise.all([
                taskAPI.getAll(),
                notificationAPI.getAll({ limit: 10 }),
                procurementAPI.getMaterialRequests()
            ]);

            if (taskRes.success) {
                // Trust backend pre-filtered data for staff
                setTasks(taskRes.data);
            }
            if (notifRes.success) setNotifications(notifRes.data);
            if (matRes.success) {
                // Filter material requests for this staff member
                setMaterialRequests(matRes.data.filter(r =>
                    (r.requestedBy?._id || r.requestedBy) === user?._id
                ));
            }
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

    const handleOpenMaterialModal = (task) => {
        // Ensure we have valid IDs for both project and quotation
        const quotationId = task.quotation?._id || task.quotation;
        const projectId = task.project?._id || task.project || quotationId; // Fallback to quotation ID

        const quotation = task.quotation || task.project;
        const items = quotation?.items?.map(item => ({
            itemName: item.itemName,
            description: item.description || '',
            quantity: item.quantity,
            unit: item.unit || 'pieces',
            specifications: item.specifications || '',
            isExtra: false
        })) || [];

        setMaterialFormData({
            project: projectId,
            quotation: quotationId,
            items: items,
            priority: task.priority || 'Medium',
            notes: ''
        });
        setSelectedTask(task);
        setShowMaterialModal(true);
    };

    const handleAddExtraItem = () => {
        setMaterialFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                { itemName: '', description: '', quantity: 1, unit: 'pieces', specifications: '', isExtra: true, reasonForExtra: '' }
            ]
        }));
    };

    const handleRemoveItem = (index) => {
        setMaterialFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmitMaterialRequest = async () => {
        if (materialFormData.items.length === 0) return alert('Please add at least one item');
        try {
            setUploading(true);
            const res = await procurementAPI.createMaterialRequest(materialFormData);
            if (res.success) {
                alert('Material request submitted successfully!');
                setShowMaterialModal(false);
                setMaterialFormData({ project: '', quotation: '', items: [], priority: 'Medium', notes: '' });
            }
        } catch (err) {
            alert('Request failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const getPriorityColor = (p) => ({ Critical: '#dc2626', High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' }[p] || '#94a3b8');

    const handleSubmitTask = async () => {
        if (!selectedTask) return;
        if (uploadData.files.length === 0) return alert('Please upload at least one design file');
        
        try {
            setUploading(true);
            const res = await taskAPI.submit(selectedTask._id, {
                files: uploadData.files,
                designItems: uploadData.designItems,
                staffNotes: uploadData.staffNotes
            });
            if (res.success) {
                alert('Task submitted successfully for review!');
                setShowUploadModal(false);
                setUploadData({ files: [], designItems: [], staffNotes: '' });
                fetchData();
            }
        } catch (err) {
            console.error('Submission Error:', err);
            alert('Submission failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateTaskStatus = async (taskId, currentStatus) => {
        const nextStatus = currentStatus === 'To Do' ? 'In Progress' : currentStatus;
        if (nextStatus === currentStatus) return;
        try {
            const res = await taskAPI.update(taskId, { status: nextStatus });
            if (res.success) {
                fetchData();
            }
        } catch (err) {
            console.error('Status Update Error:', err);
        }
    };

    const handleMarkNotifRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Notif Read Error:', err);
        }
    };

    const handleNotifClick = async (notif) => {
        if (!notif.isRead) {
            await handleMarkNotifRead(notif._id);
        }
        
        // Navigation logic
        if (notif.relatedModel === 'Task') {
            navigate('?tab=tasks');
        } else if (notif.relatedModel === 'MaterialRequest') {
            navigate('?tab=materials');
        }
    };

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
        <div className="dashboard-content-area-unified fade-in" style={{ padding: '1.5rem' }}>
            {activeTab === 'overview' && (
                <>
                    <div className="welcome-banner-premium" style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        padding: '2.5rem',
                        borderRadius: '24px',
                        color: 'white',
                        marginBottom: '2rem',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.2)'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Designer Workspace</h3>
                            <p style={{ fontSize: '1rem', opacity: 0.9, marginTop: '8px', maxWidth: '500px' }}>
                                Welcome back! Track your assignments, manage your design pipeline, and collaborate with the team.
                            </p>
                        </div>
                        <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}>
                            <PieChart size={200} />
                        </div>
                    </div>

                    {dueSoonTasks.length > 0 && (
                        <div className="alert-banner-premium" style={{
                            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                            border: '1px solid #fde68a',
                            padding: '1rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
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

                    <div className="stats-grid">
                        <div className="stat-card design">
                            <div className="stat-icon">
                                <Briefcase size={28} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{pendingTasks.length}</span>
                                <span className="stat-label">Active Tasks</span>
                            </div>
                        </div>
                        <div className="stat-card procurement" style={{ borderColor: revisionTasks.length > 0 ? '#ef4444' : '#f1f5f9' }}>
                            <div className="stat-icon" style={{ background: revisionTasks.length > 0 ? '#fef2f2' : '#fffbeb', color: revisionTasks.length > 0 ? '#ef4444' : '#f59e0b' }}>
                                <AlertCircle size={28} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{revisionTasks.length}</span>
                                <span className="stat-label">Revisions Needed</span>
                            </div>
                        </div>
                        <div className="stat-card completed">
                            <div className="stat-icon">
                                <CheckCircle size={28} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{tasks.filter(t => t.status === 'Approved').length}</span>
                                <span className="stat-label">Approved Designs</span>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginTop: '1rem' }}>
                        <div className="card-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Bell size={18} /> Recent Notifications</h3>
                        </div>
                        <div className="notifications-feed">
                            {notifications.map(n => (
                                <div 
                                    key={n._id} 
                                    className={`notif-item ${n.isRead ? 'read' : 'unread'}`} 
                                    onClick={() => handleNotifClick(n)}
                                >
                                    <div className="notif-content">
                                        <p className="notif-title">{n.title}</p>
                                        <p className="notif-desc">{n.description}</p>
                                        <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                                    </div>
                                    {!n.isRead && (
                                        <button 
                                            className="action-btn-mini" 
                                            onClick={(e) => { e.stopPropagation(); handleMarkNotifRead(n._id); }}
                                            style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer' }}
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {notifications.length === 0 && <div className="empty-state">No new notifications</div>}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'tasks' && (
                <Tasks 
                    myTasks={pendingTasks} 
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    getPriorityColor={getPriorityColor}
                    taskAPI={taskAPI}
                    onOpenUpload={(task) => { setSelectedTask(task); setShowUploadModal(true); }}
                    onOpenMaterial={null}
                    onOpenQuotation={null}
                    user={user}
                />
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
                                {revisionTasks.map(task => {
                                    const isReassigned = task.timeline?.some(t => t.action === 'reassigned');
                                    const isSplit = task.assignedTo?.length > 1;
                                    const splitWith = task.assignedTo?.filter(s => s.email !== user?.email).map(s => s.name).join(', ');

                                    return (
                                        <div key={task._id} className="queue-item" style={{ borderColor: '#ef4444' }}>
                                            <div className="queue-info">
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <strong className="text-error" style={{ fontSize: '1rem' }}>{task.title}</strong>
                                                        {isReassigned && <span style={{ background: '#fff7ed', color: '#c2410c', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, border: '1px solid #ffedd5' }}>REASSIGNED</span>}
                                                        {isSplit && <span style={{ background: '#f0f9ff', color: '#0369a1', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, border: '1px solid #e0f2fe' }}>SPLIT</span>}
                                                    </div>
                                                    {task.project && (
                                                        <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Briefcase size={12} /> {task.project.projectName}
                                                        </div>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                                                    Status: <span style={{ color: '#ef4444', fontWeight: 700 }}>Redo Given</span> ({task.progress || 0}%)
                                                </span>

                                                {isSplit && splitWith && (
                                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Users size={12} /> Split with: <span style={{ fontWeight: 600 }}>{splitWith}</span>
                                                    </div>
                                                )}

                                                <div className="progress-container" style={{ width: '100%', height: '6px', background: '#fee2e2', borderRadius: '3px', marginTop: '8px' }}>
                                                    <div className="progress-bar" style={{ width: `${task.progress || 0}%`, height: '100%', background: '#ef4444', borderRadius: '3px' }}></div>
                                                </div>
                                                <div className="feed-small-item" style={{ marginTop: '0.8rem', marginBottom: '0.8rem', background: '#fff', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px' }}>
                                                    <div className="feed-text">
                                                        <strong>Manager Feedback:</strong>
                                                        <p>{task.submissions?.[task.submissions.length - 1]?.managerFeedback || 'Redo carefully'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                                                <button className="btn-save-boq" style={{ backgroundColor: '#ef4444', border: 'none' }} onClick={() => { setSelectedTask(task); setShowUploadModal(true); }}>
                                                    <Upload size={16} /> Re-submit
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
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
                                <strong style={{ color: '#15803d' }}><CheckCircle size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Finalized Designs & Approvals</strong>
                                <span style={{ display: 'block', marginTop: '4px' }}>Track your designs through Manager, Sales, and Superadmin review.</span>
                            </div>
                        </div>
                        <table className="tag-table" style={{ margin: 0 }}>
                            <thead>
                                <tr><th>Task Title</th><th>Approved Date</th><th>Status</th><th>Designs</th><th>Notes</th></tr>
                            </thead>
                            <tbody>
                                {tasks.filter(t => ['Approved', 'Completed', 'Pushed to Procurement', 'Pending Sales Review', 'Sales Approved', 'Pending Admin Review', 'Admin Rejected'].includes(t.status)).length === 0 && (
                                    <tr><td colSpan="5" className="empty-mini">No designs in pipeline yet.</td></tr>
                                )}
                                {tasks.filter(t => ['Approved', 'Completed', 'Pushed to Procurement', 'Pending Sales Review', 'Sales Approved', 'Pending Admin Review', 'Admin Rejected'].includes(t.status)).map(task => (
                                    <tr key={task._id}>
                                        <td>
                                            <strong>{task.title}</strong>
                                            {task.quotation && (
                                                <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 600 }}>
                                                    {task.quotation.projectName}
                                                </div>
                                            )}
                                        </td>
                                        <td>{new Date(task.submissions[task.submissions.length - 1]?.submittedAt || task.updatedAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className="status-pill" style={{ 
                                                background: task.status === 'Pending Sales Review' ? '#dbeafe' : 
                                                           task.status === 'Sales Approved' ? '#f0fdf4' :
                                                           task.status === 'Pending Admin Review' ? '#fef3c7' :
                                                           task.status === 'Admin Rejected' ? '#fee2e2' :
                                                           task.status === 'Pushed to Procurement' ? '#dcfce7' : 
                                                           task.status === 'Approved' ? '#f0f9ff' : '#f1f5f9',
                                                color: task.status === 'Pending Sales Review' ? '#1e40af' : 
                                                       task.status === 'Sales Approved' ? '#15803d' :
                                                       task.status === 'Pending Admin Review' ? '#92400e' :
                                                       task.status === 'Admin Rejected' ? '#b91c1c' :
                                                       task.status === 'Pushed to Procurement' ? '#15803d' : 
                                                       task.status === 'Approved' ? '#0369a1' : '#475569'
                                            }}>
                                                {task.status === 'Pushed to Procurement' ? 'Procurement Ready' : 
                                                 task.status === 'Pending Sales Review' ? 'Sales Review' : 
                                                 task.status === 'Pending Admin Review' ? 'With Superadmin' :
                                                 task.status === 'Sales Approved' ? 'Sales Approved' :
                                                 task.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', maxWidth: '150px', padding: '5px 0' }}>
                                                {task.submissions?.[task.submissions.length - 1]?.files?.map((f, idx) => (
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
                                        <td>{task.submissions[task.submissions.length - 1]?.managerFeedback || 'Great work!'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* View for Review Pending Tasks */}
                    <div className="project-detail-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div className="pd-header" style={{ padding: '1.5rem', background: '#fffbeb', borderBottom: '1px solid #e2e8f0', margin: 0 }}>
                            <div className="pd-title">
                                <strong style={{ color: '#b45309' }}><Clock size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Pending Manager Review</strong>
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
                                        <td>
                                            <strong>{task.title}</strong>
                                            {task.quotation && (
                                                <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 600 }}>
                                                    {task.quotation.projectName}
                                                </div>
                                            )}
                                        </td>
                                        <td>{new Date(task.submissions[task.submissions.length - 1].submittedAt).toLocaleDateString()}</td>
                                        <td><span className="status-pill" style={{ background: '#fef9c3', color: '#a16207' }}>Review Pending</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', maxWidth: '150px', padding: '5px 0' }}>
                                                {task.submissions?.[task.submissions.length - 1]?.files?.map((f, idx) => (
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
                                        <td>{task.submissions[task.submissions.length - 1].staffNotes}</td>
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
                            <div className="design-items-builder" style={{ marginTop: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <label style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Package size={18} color="#6366f1" /> Required Materials & Items
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddDesignItem}
                                        style={{ background: '#f0f9ff', color: '#0ea5e9', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Plus size={14} /> Add Item
                                    </button>
                                </div>

                                {uploadData.designItems.length > 0 ? (
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        {uploadData.designItems.map((item, idx) => (
                                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 40px', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                {/* Item Name with Search/Autocomplete behavior */}
                                                <div style={{ position: 'relative' }}>
                                                    <input 
                                                        list={`predefined-items-${idx}`}
                                                        placeholder="Item Name..."
                                                        value={item.name}
                                                        onChange={e => handleDesignItemChange(idx, 'name', e.target.value)}
                                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                                    />
                                                    <datalist id={`predefined-items-${idx}`}>
                                                        {PREDEFINED_ITEMS.map((pi, i) => (
                                                            <option key={i} value={pi} />
                                                        ))}
                                                    </datalist>
                                                </div>
                                                
                                                <input 
                                                    placeholder="Size (e.g. 700cm)"
                                                    value={item.size}
                                                    onChange={e => handleDesignItemChange(idx, 'size', e.target.value)}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                                />

                                                <select 
                                                    value={item.unit}
                                                    onChange={e => handleDesignItemChange(idx, 'unit', e.target.value)}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: 'white' }}
                                                >
                                                    {ITEM_UNITS.map(u => (
                                                        <option key={u} value={u}>{u}</option>
                                                    ))}
                                                </select>

                                                <input 
                                                    type="number"
                                                    placeholder="Qty"
                                                    value={item.quantity}
                                                    onChange={e => handleDesignItemChange(idx, 'quantity', e.target.value)}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                                />

                                                <button 
                                                    onClick={() => handleRemoveDesignItem(idx)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        No items added yet. Click "Add Item" to specify materials.
                                    </div>
                                )}
                            </div>
                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px', display: 'block', color: '#1e293b' }}>Staff Notes</label>
                                <textarea
                                    placeholder="Add any additional notes about the design..."
                                    style={{ height: '80px', borderRadius: '12px', padding: '12px' }}
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
            {/* ── Material Request Modal ── */}
            {showMaterialModal && (
                <div className="modal-overlay">
                    <div className="modal-content-styled" style={{ maxWidth: '900px', width: '95%' }}>
                        <div className="modal-header">
                            <div>
                                <h3>Material Request: {selectedTask?.title}</h3>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Create a procurement request for materials</p>
                            </div>
                            <button className="close-btn" onClick={() => setShowMaterialModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            <div className="items-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: 0, color: '#1e293b' }}>Material Items</h4>
                                <button className="btn-save-boq" style={{ background: '#10b981', border: 'none', padding: '8px 16px' }} onClick={handleAddExtraItem}>
                                    <Plus size={16} /> Add Extra Item
                                </button>
                            </div>

                            <div className="material-items-table" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>
                                            <th style={{ padding: '12px' }}>Item Name</th>
                                            <th style={{ padding: '12px' }}>Specs/Details</th>
                                            <th style={{ padding: '12px', width: '100px' }}>Qty</th>
                                            <th style={{ padding: '12px', width: '100px' }}>Unit</th>
                                            <th style={{ padding: '12px', width: '60px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {materialFormData.items.map((item, idx) => (
                                            <tr key={idx} style={{ borderTop: '1px solid #f1f5f9', background: item.isExtra ? '#f0fdf4' : 'white' }}>
                                                <td style={{ padding: '8px' }}>
                                                    <input
                                                        type="text"
                                                        value={item.itemName}
                                                        onChange={e => {
                                                            const newItems = [...materialFormData.items];
                                                            newItems[idx].itemName = e.target.value;
                                                            setMaterialFormData({ ...materialFormData, items: newItems });
                                                        }}
                                                        placeholder="Item Name"
                                                        className="modal-input-mini"
                                                        readOnly={!item.isExtra}
                                                    />
                                                    {item.isExtra && <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 700 }}>EXTRA ITEM</span>}
                                                </td>
                                                <td style={{ padding: '8px' }}>
                                                    <input
                                                        type="text"
                                                        value={item.specifications}
                                                        onChange={e => {
                                                            const newItems = [...materialFormData.items];
                                                            newItems[idx].specifications = e.target.value;
                                                            setMaterialFormData({ ...materialFormData, items: newItems });
                                                        }}
                                                        placeholder="Specifications"
                                                        className="modal-input-mini"
                                                    />
                                                    {item.isExtra && (
                                                        <input
                                                            type="text"
                                                            value={item.reasonForExtra || ''}
                                                            onChange={e => {
                                                                const newItems = [...materialFormData.items];
                                                                newItems[idx].reasonForExtra = e.target.value;
                                                                setMaterialFormData({ ...materialFormData, items: newItems });
                                                            }}
                                                            placeholder="Reason for extra item..."
                                                            style={{ marginTop: '4px', fontSize: '0.7rem', color: '#b91c1c' }}
                                                            className="modal-input-mini"
                                                            required
                                                        />
                                                    )}
                                                </td>
                                                <td style={{ padding: '8px' }}>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={e => {
                                                            const newItems = [...materialFormData.items];
                                                            newItems[idx].quantity = e.target.value;
                                                            setMaterialFormData({ ...materialFormData, items: newItems });
                                                        }}
                                                        className="modal-input-mini"
                                                    />
                                                </td>
                                                <td style={{ padding: '8px' }}>
                                                    <input
                                                        type="text"
                                                        value={item.unit}
                                                        onChange={e => {
                                                            const newItems = [...materialFormData.items];
                                                            newItems[idx].unit = e.target.value;
                                                            setMaterialFormData({ ...materialFormData, items: newItems });
                                                        }}
                                                        className="modal-input-mini"
                                                    />
                                                </td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                                    <button onClick={() => handleRemoveItem(idx)} style={{ color: '#ef4444', background: 'none', border: 'none' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select value={materialFormData.priority} onChange={e => setMaterialFormData({ ...materialFormData, priority: e.target.value })}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Request Notes</label>
                                    <textarea
                                        placeholder="General notes for the procurement team..."
                                        value={materialFormData.notes}
                                        onChange={e => setMaterialFormData({ ...materialFormData, notes: e.target.value })}
                                        style={{ minHeight: '80px' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="action-btn" onClick={() => setShowMaterialModal(false)}>Cancel</button>
                            <button className="action-btn primary" onClick={handleSubmitMaterialRequest} disabled={uploading}>
                                {uploading ? 'Sending Request...' : 'Send to Procurement Hub'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ── Quotation Detail Modal ── */}
            {showQuotationModal && selectedQuotation && (
                <div className="modal-overlay">
                    <div className="modal-content-styled" style={{ maxWidth: '1000px', width: '95%' }}>
                        <div className="modal-header">
                            <div>
                                <h3>Quotation Details: {selectedQuotation.quotationNumber}</h3>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Reference for {selectedQuotation.projectName}</p>
                            </div>
                            <button className="close-btn" onClick={() => setShowQuotationModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '16px' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Project Name</span>
                                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{selectedQuotation.projectName}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Total Value</span>
                                    <div style={{ fontWeight: 700, color: '#1e293b' }}>₹{selectedQuotation.totalAmount?.toLocaleString()}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Status</span>
                                    <div style={{ fontWeight: 700, color: '#10b981' }}>{selectedQuotation.status}</div>
                                </div>
                            </div>

                            <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>Bill of Quantities (BOQ)</h4>
                            <div className="material-items-table" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>
                                            <th style={{ padding: '12px' }}>Item & Description</th>
                                            <th style={{ padding: '12px' }}>Specs</th>
                                            <th style={{ padding: '12px' }}>Quantity</th>
                                            <th style={{ padding: '12px' }}>Unit</th>
                                            <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedQuotation.items?.map((item, idx) => (
                                            <tr key={idx} style={{ borderTop: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontWeight: 600 }}>{item.itemName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.description}</div>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontSize: '0.8rem' }}>{item.material} / {item.finish}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.size}</div>
                                                </td>
                                                <td style={{ padding: '12px' }}>{item.quantity}</td>
                                                <td style={{ padding: '12px' }}>{item.unit}</td>
                                                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>₹{item.amount?.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                                            <td colSpan="4" style={{ padding: '12px', textAlign: 'right' }}>Total Amount</td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>₹{selectedQuotation.totalAmount?.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {selectedQuotation.notes && (
                                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7' }}>
                                    <strong style={{ fontSize: '0.85rem', color: '#92400e' }}>Quotation Notes:</strong>
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#b45309', margin: 0 }}>{selectedQuotation.notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="action-btn primary" onClick={() => setShowQuotationModal(false)}>Close View</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesignStaffDashboard;
