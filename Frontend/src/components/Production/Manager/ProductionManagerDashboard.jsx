import React, { useState, useEffect } from 'react';
import { 
    Wrench, CheckSquare, Clock, AlertTriangle, Truck,
    ArrowRight, Plus, Eye, ClipboardCheck, Target,
    Building2, Users, BarChart3, Play, Pause, CheckCircle
} from 'lucide-react';
import { projectAPI, taskAPI, staffAPI, notificationAPI, inventoryAPI, productionAPI } from '../../../config/api';
import { useNavigate } from 'react-router-dom';
import '../css/ManagerDashboard.css';

const ProductionManagerDashboard = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projRes, prodRes, taskRes, pipelineRes] = await Promise.all([
                projectAPI.getByStage('Production'),
                productionAPI.getStats(),
                productionAPI.getTasks({ limit: 10 }),
                productionAPI.getPipeline()
            ]);

            if (projRes.success) setProjects(projRes.data);
            if (prodRes.success) setStats(prodRes.data);
            if (taskRes.success) setTasks(taskRes.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        return `₹${amount.toLocaleString()}`;
    };

    const getTaskTypeColor = (type) => {
        const colors = {
            'civil': '#8b5cf6',
            'electrical': '#f59e0b',
            'plumbing': '#3b82f6',
            'painting': '#10b981'
        };
        return colors[type?.toLowerCase()] || '#64748b';
    };

    return (
        <div className="role-dashboard production-manager">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="role-icon production">
                        <Wrench size={24} />
                    </div>
                    <div>
                        <h1>Project Manager Dashboard</h1>
                        <p>Welcome back, {user?.fullName?.split(' ')[0]}</p>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon production">
                        <Target size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{projects.length}</span>
                        <span className="stat-label">Active Projects</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon info">
                        <CheckSquare size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.tasks?.inProgress || 0}</span>
                        <span className="stat-label">Tasks In Progress</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning">
                        <AlertTriangle size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.tasks?.blocked || 0}</span>
                        <span className="stat-label">Blocked Tasks</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success">
                        <CheckCircle size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.tasks?.completed || 0}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>
            </div>

            <div className="pipeline-section">
                <h3><Building2 size={18} /> Project Pipeline</h3>
                <div className="pipeline-columns">
                    {['Design', 'Procurement', 'Production'].map(stage => (
                        <div key={stage} className="pipeline-column">
                            <div className="column-header">
                                <span className="column-name">{stage}</span>
                                <span className="column-count">{projects.filter(p => p.stage === stage).length}</span>
                            </div>
                            <div className="column-projects">
                                {projects.filter(p => p.stage === stage).map(project => (
                                    <div key={project._id} className="pipeline-card">
                                        <span className="card-name">{project.name}</span>
                                        <div className="card-progress">
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${project.progress || 0}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="section-card">
                    <div className="section-header">
                        <h3><CheckSquare size={18} /> Production Tasks</h3>
                        <button className="btn-add"><Plus size={14} /> Assign Task</button>
                    </div>
                    <div className="tasks-list">
                        {tasks.slice(0, 8).map(task => (
                            <div key={task._id} className={`task-item ${task.status?.toLowerCase().replace(' ', '-')}`}>
                                <div className={`status-dot ${task.status?.toLowerCase().replace(' ', '-')}`}></div>
                                <div className="task-info">
                                    <span className="task-title">{task.title}</span>
                                    <span className="task-meta">
                                        <span className="task-type" style={{ color: getTaskTypeColor(task.taskType) }}>
                                            {task.taskType || 'General'}
                                        </span>
                                        <span className="task-project">{task.project?.name}</span>
                                    </span>
                                </div>
                                <div className="task-assignee">
                                    <Users size={14} /> {task.assignedTo?.name || 'Unassigned'}
                                </div>
                                <div className="task-actions">
                                    <button className="btn-icon" title="View"><Eye size={14} /></button>
                                    <button className="btn-icon" title="Edit"><Plus size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="section-card">
                    <div className="section-header">
                        <h3><AlertTriangle size={18} /> Issues Reported</h3>
                    </div>
                    <div className="issues-list">
                        {tasks.filter(t => t.status === 'Blocked').length > 0 ? (
                            tasks.filter(t => t.status === 'Blocked').map(task => (
                                <div key={task._id} className="issue-item">
                                    <AlertTriangle size={16} className="issue-icon" />
                                    <div className="issue-info">
                                        <span className="issue-title">{task.title}</span>
                                        <span className="issue-project">{task.project?.name}</span>
                                    </div>
                                    <button className="btn-resolve">Resolve</button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state success">No issues reported</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="workflow-actions">
                <h3>Production Workflow Actions</h3>
                <div className="action-buttons">
                    <button className="action-btn">
                        <Plus size={18} /> Create Task
                    </button>
                    <button className="action-btn">
                        <Users size={18} /> Assign Workers
                    </button>
                    <button className="action-btn">
                        <ClipboardCheck size={18} /> Checklist
                    </button>
                    <button className="action-btn primary">
                        <CheckCircle size={18} /> Mark Complete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductionManagerDashboard;
