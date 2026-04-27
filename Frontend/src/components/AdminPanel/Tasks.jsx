import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Search,
    Plus,
    CheckCircle,
    X,
    Edit,
    Trash2,
    Loader,
    Calendar,
    Briefcase,
    Clock,
    AlertCircle,
    User,
    Sparkles,
    Eye,
    MapPin,
    Camera,
    AlertTriangle,
    ExternalLink,
    Package,
    Image as ImageIcon
} from 'lucide-react';
import { taskAPI, staffAPI, clientAPI, quotationAPI, siteVisitAPI, BASE_IMAGE_URL } from '../../config/api';
import { useToast } from '../../context/ToastContext';
import CustomSelect from '../common/CustomSelect';
import AISuggestButton from '../common/AISuggestButton';
import './css/Tasks.css';
import './css/TaskDetails.css';

const Tasks = ({ isStaff, user }) => {
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const [tasks, setTasks] = useState([]);
    const [staff, setStaff] = useState([]);
    const [clients, setClients] = useState([]);
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [taskVisits, setTaskVisits] = useState([]);
    const [visitsLoading, setVisitsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showDesignModal, setShowDesignModal] = useState(false);

    const initialFormData = {
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        assignedTo: '',
        client: '',
        quotation: '',
        dueDate: '',
        estimatedDuration: '',
        project: '',
        progress: 0
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        const status = searchParams.get('status');
        if (status) setFilterStatus(status);
        else setFilterStatus('All');
    }, [searchParams]);

    useEffect(() => {
        fetchAllData();

        const processAIData = (data) => {
            if (!data) return;
            setFormData(prev => ({
                ...prev,
                ...data
            }));
            setShowTaskModal(true);
        };

        const handleAIPopulate = (e) => processAIData(e.detail);
        const pending = sessionStorage.getItem('AI_PENDING_DATA');
        if (pending) {
            const { type, data } = JSON.parse(pending);
            if (type === 'TASK') {
                processAIData(data);
                sessionStorage.removeItem('AI_PENDING_DATA');
            }
        }

        window.addEventListener('AI_POPULATE_TASK', handleAIPopulate);
        return () => window.removeEventListener('AI_POPULATE_TASK', handleAIPopulate);
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [tasksRes, staffRes, clientsRes, quotationsRes] = await Promise.all([
                taskAPI.getAll(),
                staffAPI.getAll(),
                clientAPI.getAll({ limit: 1000 }),
                quotationAPI.getAll({ limit: 1000 })
            ]);

            if (tasksRes.success) setTasks(tasksRes.data);
            if (staffRes.success) setStaff(staffRes.data);
            if (clientsRes.success) setClients(clientsRes.data);
            if (quotationsRes.success) setQuotations(quotationsRes.data);
        } catch (err) {
            setError(err.message);
            showToast('Failed to load task data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await taskAPI.getAll();
            if (response.success) setTasks(response.data);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        const newValue = type === 'range' ? parseInt(value, 10) : value;

        if (name === 'client') {
            setFormData(prev => ({
                ...prev,
                client: newValue,
                quotation: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: newValue
            }));
        }
    };

    const filteredQuotations = formData.client
        ? quotations.filter(q => 
            (q.client?._id === formData.client || q.client === formData.client)
          )
        : [];

    const handleViewDetails = async (task) => {
        setSelectedTask(task);
        setShowDetailsModal(true);
        setVisitsLoading(true);
        document.body.style.overflow = 'hidden';
        try {
            const res = await siteVisitAPI.getByTask(task._id);
            if (res.success) {
                setTaskVisits(res.data);
            }
        } catch (err) {
            console.error('Error fetching task site visits:', err);
        } finally {
            setVisitsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingTask) {
                const response = await taskAPI.update(editingTask._id, formData);
                if (response.success) {
                    await fetchTasks();
                    showToast('Task updated successfully');
                    closeModal();
                }
            } else {
                const response = await taskAPI.create(formData);
                if (response.success) {
                    await fetchTasks();
                    showToast('New task assigned successfully');
                    closeModal();
                }
            }
        } catch (err) {
            showToast(err.message || 'Failed to save task', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'To Do',
            priority: task.priority || 'Medium',
            assignedTo: task.assignedTo?._id || '',
            client: task.client?._id || '',
            quotation: task.quotation?._id || '',
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            estimatedDuration: task.estimatedDuration || '',
            project: task.project || '',
            progress: task.progress || 0
        });
        setShowTaskModal(true);
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const response = await taskAPI.update(taskId, { status: newStatus });
            if (response.success) {
                setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus, progress: newStatus === 'Completed' ? 100 : t.progress } : t));
                showToast(`Task status updated to ${newStatus}`);
            }
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleProgressChange = async (taskId, newProgress) => {
        try {
            const updateData = { progress: newProgress };
            if (newProgress === 100) updateData.status = 'Completed';
            else if (newProgress > 0 && newProgress < 100) updateData.status = 'In Progress';

            const response = await taskAPI.update(taskId, updateData);
            if (response.success) {
                setTasks(prev => prev.map(t => t._id === taskId ? { ...t, ...updateData } : t));
            }
        } catch (err) {
            showToast('Failed to update progress', 'error');
        }
    };

    const handlePushToProcurement = async (taskId) => {
        if (!window.confirm('Approve this design and push to procurement?')) return;
        try {
            const response = await taskAPI.pushToProcurement(taskId);
            if (response.success) {
                setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: 'Pushed to Procurement' } : t));
                showToast('Design pushed to procurement successfully');
            }
        } catch (err) {
            showToast('Failed to push to procurement', 'error');
        }
    };

    const handleSalesReview = async (taskId, approved) => {
        const notes = prompt(approved ? 'Add optional sales notes:' : 'Enter reason for revision:');
        if (!approved && !notes) return; // Need reason for rejection

        try {
            const response = await taskAPI.salesApprove(taskId, { approved, salesNotes: notes || '' });
            if (response.success) {
                setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: approved ? 'Sales Approved' : 'Revision Required' } : t));
                showToast(approved ? 'Design approved by Sales' : 'Revision requested');
            }
        } catch (err) {
            showToast('Sales review failed', 'error');
        }
    };

    const handleAdminReview = async (taskId, approved) => {
        const notes = prompt(approved ? 'Add final approval notes (optional):' : 'Enter rejection reason (required):');
        if (!approved && !notes) return;

        try {
            const response = await taskAPI.adminReview(taskId, { approved, rejectionReason: notes || '' });
            if (response.success) {
                setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: approved ? 'Pushed to Procurement' : 'Admin Rejected' } : t));
                showToast(approved ? 'Pushed to Procurement successfully' : 'Design rejected and sent back');
            }
        } catch (err) {
            showToast('Admin review failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            const response = await taskAPI.delete(id);
            if (response.success) {
                await fetchTasks();
                showToast('Task deleted successfully');
            }
        } catch (err) {
            showToast('Failed to delete task', 'error');
        }
    };

    const closeModal = () => {
        setShowTaskModal(false);
        setShowDetailsModal(false);
        setEditingTask(null);
        setFormData(initialFormData);
        setError(null);
        document.body.style.overflow = 'unset';
    };

    const filteredTasks = tasks.filter(task => {
        // 1. Staff Filter: Only show tasks assigned to me
        if (isStaff && task.assignedTo?.email !== user?.email) return false;

        const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
        const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return '#dc2626';
            case 'High': return '#ef4444';
            case 'Medium': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const statsCards = [
        { label: 'Total Tasks', value: tasks.length, color: 'purple', icon: <Loader size={20} />, status: 'All' },
        { label: 'To Do', value: tasks.filter(t => t.status === 'To Do').length, color: 'orange', icon: <Plus size={20} />, status: 'To Do' },
        { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: 'blue', icon: <Calendar size={20} />, status: 'In Progress' },
        { label: 'Design Approvals', value: tasks.filter(t => t.status === 'Pending Admin Review').length, color: 'indigo', icon: <ImageIcon size={20} />, status: 'Pending Admin Review' },
        { label: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, color: 'green', icon: <CheckCircle size={20} />, status: 'Completed' },
    ];

    return (
        <div className={`tasks-container ${isStaff ? 'staff-view' : ''}`}>
            <div className="tasks-wrapper">
                <div className="t-tasks-header">
                    <div className="t-tasks-title">
                        <h2>
                            {isStaff ? 'My Assigned Tasks' : 
                             filterStatus === 'Pending Admin Review' ? 'Design Approval Center' : 'Task Management'}
                        </h2>
                        <p className="tasks-subtitle">
                            {isStaff ? 'Update your progress and complete assigned works' : 
                             filterStatus === 'Pending Admin Review' ? 'Review and authorize completed designs for procurement' : 'Assign work to staff members and track progress'}
                        </p>
                    </div>
                    {!isStaff && (
                        <button className="btn-new-task" onClick={() => setShowTaskModal(true)}>
                            <Plus size={18} />
                            <span>Assign New Task</span>
                        </button>
                    )}
                </div>

                <div className="tasks-stats-grid">
                    {statsCards.map((stat, i) => (
                        <div
                            key={i}
                            className={`tasks-stat-card stat-${stat.color} ${filterStatus === stat.status ? 'selected' : ''}`}
                            onClick={() => setFilterStatus(stat.status)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="stat-content">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                            <div className="stat-icon-box">
                                {stat.icon}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="tasks-controls">
                    <div className="t-search-container">
                        <Search className="t-search-icon" size={20} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="tasks-filter-group">
                        <CustomSelect
                            options={[
                                { value: 'All', label: 'All Priority' },
                                { value: 'Critical', label: 'Critical' },
                                { value: 'High', label: 'High' },
                                { value: 'Medium', label: 'Medium' },
                                { value: 'Low', label: 'Low' }
                            ]}
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            searchable={false}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <Loader className="spinner" size={40} />
                        <p>Loading tasks...</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="empty-state-card">
                        <h4>No tasks found</h4>
                        <p>Assign your first task to get started</p>
                    </div>
                ) : (
                    <div className="tasks-list-card">
                        <div className="tasks-table-container">
                            <table className="tasks-table">
                                <thead>
                                    <tr>
                                        <th>Task Details</th>
                                        <th>Assigned To</th>
                                        <th>Client & Project</th>
                                        <th>Due Date</th>
                                        <th>Duration</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Progress</th>
                                        {!isStaff && <th>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTasks.map((task) => (
                                        <tr key={task._id}>
                                            <td className="task-details-cell">
                                                <div className="task-info-main">
                                                    <span className="task-list-title">{task.title}</span>
                                                    <span className="task-list-desc">{task.description}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="task-assignee">
                                                    <div className="assignee-avatar">
                                                        {task.assignedTo?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="assignee-info">
                                                        <span className="assignee-name">{task.assignedTo?.name || 'Unassigned'}</span>
                                                        <span className="assignee-role">{task.assignedTo?.role || ''}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="task-project-cell">
                                                    {task.client && (
                                                        <div className="project-item">
                                                            <User size={12} />
                                                            <span>{task.client.name}</span>
                                                        </div>
                                                    )}
                                                    {task.quotation && (
                                                        <div className="project-item quotation">
                                                            <Briefcase size={12} />
                                                            <span>{task.quotation.projectName}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="task-date">
                                                    <Calendar size={14} />
                                                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="task-duration">
                                                    <Clock size={14} />
                                                    <span>{task.estimatedDuration || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="priority-badge-small" style={{ borderLeft: `3px solid ${getPriorityColor(task.priority)}` }}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <CustomSelect
                                                    variant="inline"
                                                    options={[
                                                        { value: 'To Do', label: 'To Do' },
                                                        { value: 'In Progress', label: 'In Progress' },
                                                        { value: 'Review Pending', label: 'Review Pending' },
                                                        { value: 'Revision Required', label: 'Revision Required' },
                                                        { value: 'Approved', label: 'Approved (Manager)' },
                                                        { value: 'Pending Sales Review', label: 'Pending Sales' },
                                                        { value: 'Pushed to Procurement', label: 'Procurement Ready' },
                                                        { value: 'Completed', label: 'Completed' },
                                                        { value: 'Blocked', label: 'Blocked' }
                                                    ]}
                                                    value={task.status}
                                                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                    searchable={false}
                                                />
                                            </td>
                                            <td>
                                                <div className="task-progress-cell">
                                                    <div className="progress-info">
                                                        <div className="progress-bar-bg">
                                                            <div
                                                                className="progress-bar-fill"
                                                                style={{
                                                                    width: `${task.progress || 0}%`,
                                                                    backgroundColor: task.progress === 100 ? '#10b981' : '#6366f1'
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="progress-value">{task.progress || 0}%</span>
                                                    </div>
                                                    {isStaff && (
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            step="5"
                                                            className="progress-slider"
                                                            value={task.progress || 0}
                                                            onChange={(e) => handleProgressChange(task._id, parseInt(e.target.value))}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="task-actions-cell">
                                                <div className="task-actions">
                                                    {task.status === 'Pending Sales Review' && (
                                                         <>
                                                             <button className="btn-icon approve" onClick={() => handleSalesReview(task._id, true)} title="Sales: Approve Design" style={{ color: '#10b981' }}>
                                                                 <CheckCircle size={16} />
                                                             </button>
                                                             <button className="btn-icon reject" onClick={() => handleSalesReview(task._id, false)} title="Sales: Reject Design" style={{ color: '#ef4444' }}>
                                                                 <X size={16} />
                                                             </button>
                                                         </>
                                                     )}
                                                     {task.status === 'Pending Admin Review' && (
                                                         <>
                                                             <button className="btn-icon approve" onClick={() => { setSelectedTask(task); setShowDesignModal(true); }} title="Review & Approve Design" style={{ color: '#6366f1' }}>
                                                                 <Eye size={16} />
                                                             </button>
                                                             <button className="btn-icon approve" onClick={() => handleAdminReview(task._id, true)} title="Admin: Fast Approve" style={{ color: '#10b981' }}>
                                                                 <CheckCircle size={16} />
                                                             </button>
                                                             <button className="btn-icon reject" onClick={() => handleAdminReview(task._id, false)} title="Admin: Reject Design" style={{ color: '#ef4444' }}>
                                                                 <AlertTriangle size={16} />
                                                             </button>
                                                         </>
                                                     )}
                                                    <button className="btn-icon" onClick={() => handleViewDetails(task)} title="View Details">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button className="btn-icon" onClick={() => handleEdit(task)} title="Link to Project/Edit">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="btn-icon delete" onClick={() => handleDelete(task._id)} title="Delete Task">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {showTaskModal && (
                <div className="modal-overlay">
                    <div className="modal-content-wide">
                        <div className="modal-header">
                            <h3>{editingTask ? 'Edit Task' : 'Assign New Task'}</h3>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-form-body" data-lenis-prevent>
                                <div className="form-grid">
                                    <div className="form-field full-width">
                                        <label>Task Title <span>*</span></label>
                                        <input
                                            type="text"
                                            name="title"
                                            className="client-input"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Install kitchen cabinets"
                                            required
                                        />
                                    </div>

                                    <div className="form-field full-width">
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <label>Description</label>
                                            <AISuggestButton
                                                type="Task"
                                                field="description"
                                                value={formData.description}
                                                context={{ title: formData.title }}
                                                onSuggest={(v) => setFormData(prev => ({ ...prev, description: v }))}
                                            />
                                        </div>
                                        <textarea
                                            name="description"
                                            className="client-input"
                                            rows="3"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Detailed task description..."
                                        />
                                    </div>

                                    <div className="form-field">
                                        <CustomSelect
                                            label="Assign to Staff Member"
                                            name="assignedTo"
                                            required
                                            options={staff.filter(s => s.status === 'Active').map(s => ({
                                                value: s._id,
                                                label: `${s.name} - ${s.role}`
                                            }))}
                                            value={formData.assignedTo}
                                            onChange={handleInputChange}
                                            placeholder="Select Staff"
                                        />
                                    </div>

                                    <div className="form-field">
                                        <CustomSelect
                                            label="Client"
                                            name="client"
                                            options={clients.map(c => ({ value: c._id, label: c.name }))}
                                            value={formData.client}
                                            onChange={handleInputChange}
                                            placeholder="Select Client"
                                        />
                                    </div>

                                     <div className="form-field">
                                        <CustomSelect
                                            label="Link to Project / Quotation (Required for BOQ)"
                                            name="quotation"
                                            options={filteredQuotations.map(q => ({
                                                value: q._id,
                                                label: `${q.quotationNumber} - ${q.projectName} (${q.status})`
                                            }))}
                                            value={formData.quotation}
                                            onChange={handleInputChange}
                                            placeholder={formData.client ? (filteredQuotations.length > 0 ? "Select Project to Link" : "No Projects Found for Client") : "Select Client First"}
                                            disabled={!formData.client}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Due Date <span>*</span></label>
                                        <input
                                            type="date"
                                            name="dueDate"
                                            className="client-input"
                                            value={formData.dueDate}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Estimated Duration</label>
                                        <input
                                            type="text"
                                            name="estimatedDuration"
                                            className="client-input"
                                            value={formData.estimatedDuration}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 5 days, 2 weeks"
                                        />
                                    </div>

                                    <div className="form-field">
                                        <CustomSelect
                                            label="Priority"
                                            name="priority"
                                            required
                                            options={[
                                                { value: 'Low', label: 'Low' },
                                                { value: 'Medium', label: 'Medium' },
                                                { value: 'High', label: 'High' },
                                                { value: 'Critical', label: 'Critical' }
                                            ]}
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            searchable={false}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <CustomSelect
                                            label="Status"
                                            name="status"
                                            required
                                            options={[
                                                { value: 'To Do', label: 'To Do' },
                                                { value: 'In Progress', label: 'In Progress' },
                                                { value: 'Completed', label: 'Completed' },
                                                { value: 'Blocked', label: 'Blocked' }
                                            ]}
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            searchable={false}
                                        />
                                    </div>

                                    <div className="form-field full-width">
                                        <label>Progress ({formData.progress}%)</label>
                                        <input
                                            type="range"
                                            name="progress"
                                            min="0"
                                            max="100"
                                            step="5"
                                            value={formData.progress}
                                            onChange={handleInputChange}
                                            className="slider-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModal} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit" disabled={submitting}>
                                    {submitting ? <Loader className="spinner" size={16} /> : (editingTask ? 'Update Task' : 'Assign Task')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Details & Evidence Modal */}
            {showDetailsModal && selectedTask && (
                <div className="modal-overlay">
                    <div className="modal-content task-details-modal">
                        <div className="modal-header">
                            <div className="header-title">
                                <h2>Task Evidence & Progress</h2>
                                <p>{selectedTask.title}</p>
                            </div>
                            <button className="btn-close" onClick={() => setShowDetailsModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="task-summary-strip">
                                <div className="summary-item">
                                    <span className="label">Assigned To</span>
                                    <span className="value">{selectedTask.assignedTo?.name || 'Unassigned'}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="label">Status</span>
                                    <span className="value-badge">{selectedTask.status}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="label">Current Progress</span>
                                    <span className="value">{selectedTask.progress}%</span>
                                </div>
                            </div>

                            <section className="evidence-section">
                                <h3 className="section-subtitle">Site Visit Logs & Photos</h3>
                                {visitsLoading ? (
                                    <div className="loader-container">
                                        <Loader className="spinner" />
                                        <span>Fetching field evidence...</span>
                                    </div>
                                ) : taskVisits.length > 0 ? (
                                    <div className="visits-timeline">
                                        {taskVisits.map((visit) => (
                                            <div key={visit._id} className="visit-log-item card">
                                                <div className="visit-log-header">
                                                    <div className="uploader-info">
                                                        <div className="avatar">{visit.staff?.name?.charAt(0) || 'S'}</div>
                                                        <div className="name-box">
                                                            <span className="staff-name">{visit.staff?.name || 'Staff member'}</span>
                                                            <span className="visit-time">{new Date(visit.createdAt).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="visit-date-badge">
                                                        <Calendar size={12} />
                                                        <span>{new Date(visit.visitDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>

                                                <div className="visit-log-notes">
                                                    <p>{visit.notes || 'No notes provided for this visit.'}</p>
                                                    {visit.location && (
                                                        <div className="visit-loc">
                                                            <MapPin size={12} />
                                                            <span>{visit.location}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {visit.images && visit.images.length > 0 && (
                                                    <div className="visit-log-gallery">
                                                        {visit.images.map((img, i) => (
                                                            <div key={i} className="gallery-img">
                                                                <img src={`${BASE_IMAGE_URL}${img}`} alt={`Visit site evidence ${i + 1}`} className="evidence-image" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-evidence-state">
                                        <Camera size={40} />
                                        <p>No site visit logs uploaded for this task yet.</p>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {/* Design Preview Modal for Admin Final Review */}
            {showDesignModal && selectedTask && (
                <div className="modal-overlay" style={{ zIndex: 1100 }}>
                    <div className="modal-content-wide design-preview-admin" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: '#6366f1', color: 'white', padding: '10px', borderRadius: '14px' }}><ImageIcon size={24} /></div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Design Final Review</h2>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{selectedTask.title}</p>
                                </div>
                            </div>
                            <button className="btn-close" onClick={() => setShowDesignModal(false)}><X size={20} /></button>
                        </div>
                        
                        <div className="modal-body" style={{ padding: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                                <div className="preview-assets">
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ImageIcon size={18} color="#6366f1" /> Submitted Files
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                                        {selectedTask.submissions?.[selectedTask.submissions.length - 1]?.files?.map((file, i) => {
                                            const isImg = file.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                                            return (
                                                <div key={i} style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                                    {isImg ? (
                                                        <div style={{ height: '120px', background: '#eee' }}>
                                                            <img src={file.url.startsWith('http') ? file.url : `${BASE_IMAGE_URL}${file.url}`} alt="Design" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </div>
                                                    ) : (
                                                        <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0' }}><FileText size={36} color="#64748b" /></div>
                                                    )}
                                                    <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.7rem', color: '#1e293b', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name || `Asset ${i+1}`}</span>
                                                        <a href={file.url.startsWith('http') ? file.url : `${BASE_IMAGE_URL}${file.url}`} target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}><ExternalLink size={14} /></a>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="preview-details">
                                    <div style={{ background: '#f1f5f9', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 12px 0' }}>Designer's Vision</h3>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
                                            {selectedTask.submissions?.[selectedTask.submissions.length - 1]?.designerNotes || 'No specific notes provided.'}
                                        </p>
                                    </div>

                                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 12px 0' }}>Material List (BOQ)</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {selectedTask.submissions?.[selectedTask.submissions.length - 1]?.designItems?.map((item, i) => (
                                                <div key={i} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                                                    <span style={{ color: '#6366f1' }}>{item.quantity} {item.unit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ padding: '1.5rem 2rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn-cancel" onClick={() => setShowDesignModal(false)}>Close</button>
                            <button className="btn-submit" onClick={() => { handleAdminReview(selectedTask._id, false); setShowDesignModal(false); }} style={{ background: '#ef4444' }}>Request Redo</button>
                            <button className="btn-submit" onClick={() => { handleAdminReview(selectedTask._id, true); setShowDesignModal(false); }} style={{ background: '#10b981' }}>Approve & Finalize</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
