import React, { useState, useEffect } from 'react';
import { 
    Wrench, CheckSquare, Clock, Play, Camera, Upload,
    AlertTriangle, Target, User, CheckCircle, XCircle, ClipboardCheck
} from 'lucide-react';
import { taskAPI, productionAPI, notificationAPI, inventoryAPI } from '../../../config/api';
import { useNavigate } from 'react-router-dom';
import '../css/StaffDashboard.css';

const ProductionStaffDashboard = ({ user }) => {
    const [myTasks, setMyTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [taskRes, projRes] = await Promise.all([
                productionAPI.getTasks({ limit: 10 }),
                projectAPI.getByStage('Production')
            ]);

            if (taskRes.success) setMyTasks(taskRes.data);
            if (projRes.success) setProjects(projRes.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateTaskStatus = async (taskId, status) => {
        try {
            await productionAPI.updateTask(taskId, { status });
            fetchData();
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    const reportIssue = async (taskId) => {
        const description = prompt('Describe the issue:');
        if (description) {
            try {
                await productionAPI.reportIssue(taskId, { description });
                fetchData();
            } catch (err) {
                console.error('Error reporting issue:', err);
            }
        }
    };

    const getTaskTypeIcon = (type) => {
        const icons = {
            'civil': '🔨',
            'electrical': '💡',
            'plumbing': '🚿',
            'painting': '🎨'
        };
        return icons[type?.toLowerCase()] || '📋';
    };

    return (
        <div className="role-dashboard production-staff">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="user-avatar production">
                        <Wrench size={20} />
                    </div>
                    <div>
                        <h1>Production Dashboard</h1>
                        <p>Welcome, {user?.fullName}</p>
                    </div>
                </div>
                <div className="user-badge">
                    <span className="badge production">Production Team</span>
                </div>
            </div>

            <div className="quick-stats">
                <div className="quick-stat">
                    <span className="stat-number">{myTasks.filter(t => t.status !== 'Completed').length}</span>
                    <span className="stat-text">Pending Tasks</span>
                </div>
                <div className="quick-stat">
                    <span className="stat-number">{myTasks.filter(t => t.status === 'In Progress').length}</span>
                    <span className="stat-text">In Progress</span>
                </div>
                <div className="quick-stat">
                    <span className="stat-number">{myTasks.filter(t => t.status === 'Completed').length}</span>
                    <span className="stat-text">Completed</span>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="section-card primary">
                    <div className="section-header">
                        <h3><Target size={18} /> My Tasks</h3>
                        <div className="filter-tabs">
                            <button className="tab active">All</button>
                            <button className="tab">In Progress</button>
                            <button className="tab">To Do</button>
                        </div>
                    </div>
                    <div className="tasks-list detailed">
                        {myTasks.slice(0, 8).map(task => (
                            <div key={task._id} className={`task-item ${task.status?.toLowerCase().replace(' ', '-')}`}>
                                <div className="task-type-badge">
                                    {getTaskTypeIcon(task.taskType)}
                                </div>
                                <div className="task-info">
                                    <span className="task-title">{task.title}</span>
                                    <span className="task-meta">
                                        <span className="task-category">{task.taskType || 'General'}</span>
                                        <span className="task-project">{task.project?.name}</span>
                                    </span>
                                </div>
                                <div className="task-due-date">
                                    <Clock size={14} />
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                                </div>
                                <div className="task-status-actions">
                                    {task.status === 'To Do' && (
                                        <button className="btn-start" onClick={() => updateTaskStatus(task._id, 'In Progress')}>
                                            <Play size={14} /> Start
                                        </button>
                                    )}
                                    {task.status === 'In Progress' && (
                                        <>
                                            <button className="btn-complete" onClick={() => updateTaskStatus(task._id, 'Completed')}>
                                                <CheckCircle size={14} /> Complete
                                            </button>
                                            <button className="btn-issue" onClick={() => reportIssue(task._id)}>
                                                <AlertTriangle size={14} />
                                            </button>
                                        </>
                                    )}
                                    {task.status === 'Completed' && (
                                        <span className="status-completed"><CheckCircle size={14} /> Done</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="section-card">
                    <div className="section-header">
                        <h3><Camera size={18} /> Site Updates</h3>
                    </div>
                    <div className="site-updates">
                        <div className="upload-zone">
                            <Upload size={32} />
                            <p>Upload site photos</p>
                            <span>Before / During / After</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-cards">
                    <div className="action-card">
                        <CheckSquare size={24} />
                        <span>Update Task</span>
                    </div>
                    <div className="action-card">
                        <Camera size={24} />
                        <span>Upload Photos</span>
                    </div>
                    <div className="action-card">
                        <AlertTriangle size={24} />
                        <span>Report Issue</span>
                    </div>
                    <div className="action-card">
                        <ClipboardCheck size={24} />
                        <span>Checklist</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductionStaffDashboard;
