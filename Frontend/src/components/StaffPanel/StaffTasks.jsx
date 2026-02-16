import React, { useState, useEffect } from 'react';
import {
    Search,
    Loader,
    Calendar,
    Clock,
    User,
    Briefcase,
    LayoutGrid,
    List as ListIcon
} from 'lucide-react';
import { taskAPI } from '../../config/api';
import './css/StaffTasks.css';

const StaffTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [updatingTaskId, setUpdatingTaskId] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await taskAPI.getAll(); // The API should handle staff scoping via token
            if (response.success) {
                setTasks(response.data);
            }
        } catch (err) {
            console.error('Failed to load tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProgressUpdate = async (taskId, progress) => {
        // Update local state immediately for smooth UI
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, progress } : t));

        setUpdatingTaskId(taskId);
        try {
            await taskAPI.updateProgress(taskId, { progress });
        } catch (err) {
            console.error('Failed to sync progress:', err);
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        Total: tasks.length,
        'To Do': tasks.filter(t => t.status === 'To Do').length,
        'In Progress': tasks.filter(t => t.status === 'In Progress').length,
        Completed: tasks.filter(t => t.status === 'Completed').length
    };

    if (loading) {
        return (
            <div className="st-tasks-container">
                <div className="st-loading-state">
                    <Loader size={40} className="spinner" />
                    <p>Fetching your tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="st-tasks-container">
            <div className="st-tasks-wrapper">
                <div className="st-tasks-header">
                    <h2>My Assigned Tasks</h2>
                    <p className="st-tasks-subtitle">Track and update your daily progress</p>
                </div>

                <div className="st-stats-grid">
                    {Object.entries(stats).map(([label, value]) => (
                        <div
                            key={label}
                            className={`st-stat-card ${filterStatus === label ? 'selected' : ''}`}
                            onClick={() => setFilterStatus(label === 'Total' ? 'All' : label)}
                        >
                            <div className="st-stat-info">
                                <span className="st-stat-label">{label}</span>
                                <span className="st-stat-value">{value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="st-tasks-controls">
                    <div className="st-search-container">
                        <Search className="st-search-icon" size={18} />
                        <input
                            type="text"
                            className="st-search-input"
                            placeholder="Search your tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="st-tasks-list-card">
                    <div className="st-table-container">
                        <table className="st-tasks-table">
                            <thead>
                                <tr>
                                    <th>Task Details</th>
                                    <th>Project / Client</th>
                                    <th>Progress</th>
                                    <th>Priority</th>
                                    <th>Deadline</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map(task => (
                                    <tr key={task._id}>
                                        <td data-label="Task Details">
                                            <span className="st-task-title">{task.title}</span>
                                            <span className="st-task-desc">{task.description}</span>
                                        </td>
                                        <td data-label="Project">
                                            <div className="st-project-info">
                                                <Briefcase size={12} />
                                                <span>{task.quotation?.projectName || 'General'}</span>
                                            </div>
                                        </td>
                                        <td data-label="Progress">
                                            <div className="st-progress-cell">
                                                <div className="st-progress-bar-bg">
                                                    <div
                                                        className="st-progress-bar-fill"
                                                        style={{ width: `${task.progress}%` }}
                                                    />
                                                </div>
                                                <div className="st-slider-container">
                                                    <input
                                                        type="range"
                                                        className="st-slider"
                                                        min="0"
                                                        max="100"
                                                        step="5"
                                                        value={task.progress || 0}
                                                        onChange={(e) => handleProgressUpdate(task._id, parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <div className="st-progress-meta">
                                                    <span className="st-progress-text">{task.progress}%</span>
                                                    {updatingTaskId === task._id && <Loader size={12} className="spinner" />}
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Priority">
                                            <span className={`st-priority-badge st-priority-${task.priority?.toLowerCase()}`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td data-label="Deadline">
                                            <div className="st-date-info">
                                                <Calendar size={12} />
                                                <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredTasks.length === 0 && (
                        <div className="st-empty-state">
                            <p>No tasks found matching your criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffTasks;
