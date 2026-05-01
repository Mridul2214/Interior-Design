import React from 'react';
import { Target, Clock, CheckCircle, AlertCircle, Play } from 'lucide-react';
import '../css/StaffDashboard.css';

const Overview = ({ user, projects, myTasks, notifications, onUpdateTaskStatus }) => {
    return (
        <div className="view-overview fade-in">
            <div className="welcome-banner">
                <h3>Welcome, {user?.fullName}! ✨</h3>
                <p>You have {myTasks.filter(t => t.status !== 'Completed').length} tasks to focus on today.</p>
            </div>

            <div className="stats-row">
                <div className="stat-pill">
                    <Target size={20} className="text-primary" />
                    <div className="pill-info">
                        <strong>{projects.length}</strong>
                        <span>Assigned Projects</span>
                    </div>
                </div>
                <div className="stat-pill">
                    <Clock size={20} className="text-warning" />
                    <div className="pill-info">
                        <strong>{myTasks.filter(t => t.status === 'In Progress').length}</strong>
                        <span>In Progress Tasks</span>
                    </div>
                </div>
                <div className="stat-pill">
                    <CheckCircle size={20} className="text-success" />
                    <div className="pill-info">
                        <strong>{myTasks.filter(t => t.status === 'Completed').length}</strong>
                        <span>Completed Tasks</span>
                    </div>
                </div>
            </div>

            <div className="overview-split">
                <div className="overview-left">
                    <h4>Active Project Progress</h4>
                    <div className="progress-list">
                        {projects.slice(0, 4).map(p => (
                            <div key={p._id} className="prog-item">
                                <div className="prog-header">
                                    <span>{p.name}</span>
                                    <span>{p.progress || 0}%</span>
                                </div>
                                <div className="prog-bar-bg">
                                    <div className="prog-bar-fill" style={{ width: `${p.progress || 0}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h4 style={{ marginTop: '2rem' }}>Manager Alerts</h4>
                    <div className="feedback-small-list">
                        {notifications.filter(n => n.type === 'Alert' || n.title.includes('Revision')).slice(0, 3).map(n => (
                            <div key={n._id} className="feed-small-item">
                                <AlertCircle size={14} className="text-error" />
                                <div className="feed-text">
                                    <strong>{n.title}</strong>
                                    <p>{n.description}</p>
                                </div>
                            </div>
                        ))}
                        {notifications.filter(n => n.type === 'Alert' || n.title.includes('Revision')).length === 0 && (
                            <div className="empty-mini">No urgent feedback from manager.</div>
                        )}
                    </div>
                </div>

                <div className="overview-right">
                    <h4>Upcoming Queue</h4>
                    <div className="queue-list">
                        {myTasks.filter(t => t.status !== 'Completed').slice(0, 6).map(t => (
                            <div key={t._id} className="queue-item">
                                <div className={`queue-dot ${t.status?.toLowerCase().replace(/\s+/g, '-')}`}></div>
                                <div className="queue-info">
                                    <strong>{t.title}</strong>
                                    <span>{t.project?.name || 'General Task'}</span>
                                </div>
                                <button className="btn-go" onClick={() => onUpdateTaskStatus(t._id, t.status)}>
                                    <Play size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
