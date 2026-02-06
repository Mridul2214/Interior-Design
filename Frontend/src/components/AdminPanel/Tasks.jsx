import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    CheckCircle,
    X,
    Edit,
    Trash2,
    Loader,
    Calendar,
    User
} from 'lucide-react';
import { taskAPI, userAPI } from '../../config/api';
import './css/Tasks.css';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const initialFormData = {
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        assignedTo: '',
        dueDate: '',
        project: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        fetchTasks();
        fetchUsers();

        const processAIData = (data) => {
            if (!data) return;
            setFormData(prev => ({
                ...prev,
                ...data
            }));
            setShowTaskModal(true);
        };

        const handleAIPopulate = (e) => processAIData(e.detail);

        // Check for pending data from session (for after navigation)
        const pending = sessionStorage.getItem('AI_PENDING_DATA');
        if (pending) {
            const { type, data } = JSON.parse(pending);
            if (type === 'TASK') {
                processAIData(data);
                sessionStorage.removeItem('AI_PENDING_DATA'); // Clean up
            }
        }

        window.addEventListener('AI_POPULATE_TASK', handleAIPopulate);
        return () => window.removeEventListener('AI_POPULATE_TASK', handleAIPopulate);
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await taskAPI.getAll();
            if (response.success) {
                setTasks(response.data);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await userAPI.getAll();
            if (response.success) {
                setUsers(response.data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            if (editingTask) {
                const response = await taskAPI.update(editingTask._id, formData);
                if (response.success) {
                    await fetchTasks();
                    closeModal();
                }
            } else {
                const response = await taskAPI.create(formData);
                if (response.success) {
                    await fetchTasks();
                    closeModal();
                }
            }
        } catch (err) {
            setError(err.message);
            console.error('Error saving task:', err);
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
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            project: task.project || ''
        });
        setShowTaskModal(true);
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const response = await taskAPI.update(taskId, { status: newStatus });
            if (response.success) {
                // Optimistically update local state or refetch
                setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await taskAPI.delete(id);
            if (response.success) {
                await fetchTasks();
            }
        } catch (err) {
            setError(err.message);
            console.error('Error deleting task:', err);
        }
    };

    const closeModal = () => {
        setShowTaskModal(false);
        setEditingTask(null);
        setFormData(initialFormData);
        setError(null);
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
        const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return '#ef4444';
            case 'Medium': return '#f59e0b';
            case 'Low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#10b981';
            case 'In Progress': return '#3b82f6';
            case 'To Do': return '#f59e0b';
            case 'Blocked': return '#ef4444';
            default: return '#6b7280';
        }
    };

    // Stats calculation
    const todoTasks = tasks.filter(t => t.status === 'To Do').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
    const blockedTasks = tasks.filter(t => t.status === 'Blocked').length;

    const statsCards = [
        { label: 'Total Tasks', value: tasks.length, color: 'purple', icon: <Loader size={20} />, status: 'All' },
        { label: 'To Do', value: todoTasks, color: 'orange', icon: <Plus size={20} />, status: 'To Do' },
        { label: 'In Progress', value: inProgressTasks, color: 'blue', icon: <Calendar size={20} />, status: 'In Progress' },
        { label: 'Completed', value: completedTasksCount, color: 'green', icon: <CheckCircle size={20} />, status: 'Completed' },
    ];

    return (
        <div className="tasks-container">
            <div className="tasks-wrapper">
                {/* Header */}
                <div className="tasks-header">
                    <div className="tasks-title">
                        <h2>Task Management</h2>
                    </div>
                    <button className="btn-new-task" onClick={() => setShowTaskModal(true)}>
                        <Plus size={18} />
                        <span>Add New Task</span>
                    </button>
                </div>

                {/* Task Stats Row */}
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

                {/* Search and Filter */}
                <div className="tasks-controls">
                    <div className="tasks-search-container">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="tasks-filter-group">
                        <select
                            className="task-filter-select"
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                        >
                            <option value="All">All Priority</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>

                        <div className="status-filters">
                            {['All', 'To Do', 'In Progress', 'Completed', 'Blocked'].map(status => (
                                <button
                                    key={status}
                                    className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                                    onClick={() => setFilterStatus(status)}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-banner">
                        <i className="fas fa-exclamation-triangle"></i>
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="loading-state">
                        <Loader className="spinner" size={40} />
                        <p>Loading tasks...</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="empty-state-card">
                        <h4>No tasks found</h4>
                        <p>Create your first task to get started</p>
                    </div>
                ) : (
                    /* Tasks List View */
                    <div className="tasks-list-card">
                        <div className="tasks-table-container">
                            <table className="tasks-table">
                                <thead>
                                    <tr>
                                        <th>Task Details</th>
                                        <th>Project</th>
                                        <th>Assigned To</th>
                                        <th>Due Date</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Actions</th>
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
                                                <span className="task-list-project">{task.project || '---'}</span>
                                            </td>
                                            <td>
                                                <div className="task-assignee">
                                                    <div className="assignee-avatar">
                                                        {task.assignedTo?.fullName?.charAt(0) || '?'}
                                                    </div>
                                                    <span>{task.assignedTo?.fullName || 'Unassigned'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="task-date">
                                                    <Calendar size={14} />
                                                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="priority-badge-small" style={{ borderLeft: `3px solid ${getPriorityColor(task.priority)}` }}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    className={`status-select-inline task-${task.status?.toLowerCase().replace(' ', '-')}`}
                                                    value={task.status}
                                                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                >
                                                    <option value="To Do">To Do</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Blocked">Blocked</option>
                                                </select>
                                            </td>
                                            <td>
                                                <div className="task-actions">
                                                    <button onClick={() => handleEdit(task)} className="btn-task-action edit" title="Edit">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(task._id)} className="btn-task-action delete" title="Delete">
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

            {/* Add/Edit Task Modal */}
            {showTaskModal && (
                <div className="modal-overlay">
                    <div className="modal-content-wide">
                        <div className="modal-header">
                            <h3>{editingTask ? 'Edit Task' : 'New Task'}</h3>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-form-body">
                                <div className="form-grid">
                                    <div className="form-field full-width">
                                        <label>Title <span>*</span></label>
                                        <input
                                            type="text"
                                            name="title"
                                            className="client-input"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-field full-width">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            className="client-input"
                                            rows="4"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Status <span>*</span></label>
                                        <select
                                            name="status"
                                            className="client-input"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="To Do">To Do</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Blocked">Blocked</option>
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label>Priority <span>*</span></label>
                                        <select
                                            name="priority"
                                            className="client-input"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label>Assign To</label>
                                        <select
                                            name="assignedTo"
                                            className="client-input"
                                            value={formData.assignedTo}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Unassigned</option>
                                            {users
                                                .filter(user => user.role === 'Designer')
                                                .map(user => (
                                                    <option key={user._id} value={user._id}>
                                                        {user.fullName}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label>Due Date</label>
                                        <input
                                            type="date"
                                            name="dueDate"
                                            className="client-input"
                                            value={formData.dueDate}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-field full-width">
                                        <label>Project</label>
                                        <input
                                            type="text"
                                            name="project"
                                            className="client-input"
                                            placeholder="Project name"
                                            value={formData.project}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={closeModal}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader className="spinner" size={16} />
                                            {editingTask ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        editingTask ? 'Update Task' : 'Create Task'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
