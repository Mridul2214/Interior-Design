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
    Calendar
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
    const [recentVisits, setRecentVisits] = useState([]);
    const [loading, setLoading] = useState(true);

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
            <header className="dashboard-header">
                <div className="welcome-text">
                    <h1>Hello, {user?.fullName || 'Staff'}!</h1>
                    <p>Track your works and project status here.</p>
                </div>
                <div className="date-display">
                    <Calendar size={18} />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>
            </header>

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
                                <h3>{task.title}</h3>
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
        </div>
    );
};

export default StaffDashboard;
