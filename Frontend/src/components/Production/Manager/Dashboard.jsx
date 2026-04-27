import React, { useState, useEffect } from 'react';
import {
    Target, CheckSquare, Clock, AlertCircle, Users, TrendingUp,
    TrendingDown, Calendar, ArrowRight, Plus, FileText, BarChart3,
    Activity, MessageSquare, CheckCircle, Edit3, FolderPlus,
    ClipboardList, Wallet, Timer, AlertTriangle, Briefcase
} from 'lucide-react';
import '../css/ProductionManagement.css';
import { productionManagerAPI } from '../../../config/api';

// MOCK variables removed

// ─── HELPERS ────────────────────────────────────────────────────────────────────
const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
};

const getStatusClass = (status) => {
    const map = { 'Active': 'active', 'On Hold': 'on-hold', 'Planning': 'planning', 'Completed': 'completed' };
    return map[status] || 'default';
};

const getCapacityColor = (capacity) => {
    if (capacity >= 90) return '#ef4444';
    if (capacity >= 70) return '#f59e0b';
    return '#10b981';
};

const getDeadlineColor = (priority) => {
    const map = { urgent: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#94a3b8' };
    return map[priority] || '#94a3b8';
};

const getActivityColor = (type) => {
    if (type?.includes('CREATE')) return '#3b82f6';
    if (type?.includes('UPDATE')) return '#f59e0b';
    if (type?.includes('APPROVE') || type?.includes('COMPLETED')) return '#10b981';
    if (type?.includes('COMMENT')) return '#8b5cf6';
    return '#64748b';
};

// ─── COMPONENT ──────────────────────────────────────────────────────────────────
const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        totalProjects: 0,
        activeProjects: 0,
        pendingApprovals: 0,
        completedTasks: 0,
        projects: [],
        recentActivity: []
    });
    const [teamWorkload, setTeamWorkload] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [budgetData, setBudgetData] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const dashboardRes = await productionManagerAPI.getDashboardOverview();
                const teamRes = await productionManagerAPI.getTeamOverview();
                const deadlinesRes = await productionManagerAPI.getDashboardDeadlines();
                const budgetRes = await productionManagerAPI.getDashboardBudget();

                if (dashboardRes?.success) setData(dashboardRes.data);
                if (teamRes?.success) setTeamWorkload(teamRes.data);
                if (deadlinesRes?.success) setDeadlines(deadlinesRes.data);
                if (budgetRes?.success) setBudgetData(budgetRes.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const budgetPercent = budgetData ? Math.round((budgetData.spent / budgetData.total) * 100) : 0;

    if (loading) {
        return (
            <div className="pm-loading-screen">
                <div className="pm-loading-spinner"></div>
                <p>Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="production-management pm-dashboard">
            {/* ── Welcome Header ─────────────────────────────────── */}
            <div className="pm-welcome-header">
                <div className="pm-welcome-text">
                    <h1>Production Management</h1>
                    <p className="pm-welcome-date">
                        <Calendar size={15} />
                        {dateStr}
                    </p>
                </div>
                <div className="pm-welcome-summary">
                    <div className="pm-summary-pill">
                        <span className="pm-pill-dot active"></span>
                        {data.activeProjects} active projects
                    </div>
                    <div className="pm-summary-pill">
                        <span className="pm-pill-dot warning"></span>
                        {data.pendingApprovals} pending approvals
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ─────────────────────────────────────── */}
            <div className="pm-stats-grid">
                {[
                    { label: 'Total Projects', value: data.totalProjects, icon: Target, trend: 0, color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'Active Projects', value: data.activeProjects, icon: CheckSquare, trend: 0, color: '#16a34a', bg: '#dcfce7' },
                    { label: 'Pending Approvals', value: data.pendingApprovals, icon: AlertCircle, trend: 0, color: '#d97706', bg: '#fef3c7' },
                    { label: 'Completed Tasks', value: data.completedTasks, icon: CheckCircle, trend: 0, color: '#8b5cf6', bg: '#f3e8ff' },
                    { label: 'Team Members', value: teamWorkload.length, icon: Users, trend: 0, color: '#0891b2', bg: '#cffafe' },
                    { label: 'Budget Utilization', value: `${budgetPercent}%`, icon: Wallet, trend: 0, color: '#e11d48', bg: '#ffe4e6' },
                ].map((stat, idx) => (
                    <div className="pm-stat-card-v2" key={idx}>
                        <div className="pm-stat-card-header">
                            <div className="pm-stat-icon-v2" style={{ background: stat.bg, color: stat.color }}>
                                <stat.icon size={20} />
                            </div>
                            <div className={`pm-stat-trend ${stat.trend >= 0 ? 'up' : 'down'}`} style={{ visibility: 'hidden' }}>
                                {stat.trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {Math.abs(stat.trend)}%
                            </div>
                        </div>
                        <div className="pm-stat-value-v2">{stat.value}</div>
                        <div className="pm-stat-label-v2">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Main Grid: Project Progress + Activity ──────────── */}
            <div className="pm-main-grid">
                {/* Project Progress */}
                <div className="pm-card pm-project-progress-card">
                    <div className="pm-card-header">
                        <h3><BarChart3 size={18} /> Project Progress</h3>
                        <button className="pm-view-all-btn">View All <ArrowRight size={14} /></button>
                    </div>
                    <div className="pm-project-progress-list">
                        {data.projects.map(project => (
                            <div className="pm-project-row" key={project._id}>
                                <div className="pm-project-row-info">
                                    <div className="pm-project-row-top">
                                        <span className="pm-project-name">{project.projectName}</span>
                                        <span className={`pm-status-badge ${getStatusClass(project.status)}`}>{project.status}</span>
                                    </div>
                                    <div className="pm-project-row-meta">
                                        {project.endDate && <span><Calendar size={13} /> {new Date(project.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                                    </div>
                                </div>
                                <div className="pm-project-row-progress">
                                    <div className="pm-progress-bar-v2">
                                        <div
                                            className="pm-progress-fill-v2"
                                            style={{ width: `${project.progress || 0}%` }}
                                            data-progress={`${project.progress || 0}%`}
                                        ></div>
                                    </div>
                                    <span className="pm-progress-text">{project.progress || 0}%</span>
                                </div>
                            </div>
                        ))}
                        {data.projects.length === 0 && <p className="pm-empty-text" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No projects found.</p>}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="pm-card pm-activity-card">
                    <div className="pm-card-header">
                        <h3><Activity size={18} /> Recent Activity</h3>
                    </div>
                    <div className="pm-activity-timeline">
                        {data.recentActivity.map((item, idx) => (
                            <div className="pm-timeline-item" key={item._id}>
                                <div className="pm-timeline-dot-wrapper">
                                    <div className="pm-timeline-dot" style={{ background: getActivityColor(item.action) }}></div>
                                    {idx < data.recentActivity.length - 1 && <div className="pm-timeline-line"></div>}
                                </div>
                                <div className="pm-timeline-content">
                                    <div className="pm-timeline-header">
                                        <div className="pm-timeline-avatar" style={{ background: getActivityColor(item.action) + '20', color: getActivityColor(item.action) }}>
                                            {item.userId?.fullName?.substring(0, 2).toUpperCase() || 'SY'}
                                        </div>
                                        <div className="pm-timeline-text">
                                            <span className="pm-timeline-user">{item.userId?.fullName || 'System'}</span>
                                            <span className="pm-timeline-action"> {item.action?.toLowerCase().replace(/_/g, ' ')}</span>
                                        </div>
                                    </div>
                                    <p className="pm-timeline-detail">{item.message}</p>
                                    <span className="pm-timeline-time"><Clock size={12} /> {new Date(item.timestamp || item.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                        {data.recentActivity.length === 0 && <p className="pm-empty-text" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No recent activity.</p>}
                    </div>
                </div>
            </div>

            {/* ── Bottom Grid: Team + Deadlines + Budget ──────────── */}
            <div className="pm-bottom-grid">
                {/* Team Workload */}
                <div className="pm-card pm-team-card">
                    <div className="pm-card-header">
                        <h3><Users size={18} /> Team Workload</h3>
                    </div>
                    <div className="pm-team-workload-list">
                        {teamWorkload.map(member => {
                            const capacity = Math.min((member.projects / 5) * 100, 100);
                            return (
                                <div className="pm-team-member-row" key={member.id}>
                                    <div className="pm-team-member-info">
                                        <div className="pm-team-avatar" style={{ background: getCapacityColor(capacity) + '18', color: getCapacityColor(capacity) }}>
                                            {member.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="pm-team-details">
                                            <span className="pm-team-name">{member.name}</span>
                                            <span className="pm-team-role">{member.role}</span>
                                        </div>
                                    </div>
                                    <div className="pm-team-capacity">
                                        <div className="pm-capacity-header">
                                            <span>{member.projects} projects</span>
                                            <span style={{ color: getCapacityColor(capacity) }}>{capacity}%</span>
                                        </div>
                                        <div className="pm-capacity-bar">
                                            <div
                                                className="pm-capacity-fill"
                                                style={{ width: `${capacity}%`, background: getCapacityColor(capacity) }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {teamWorkload.length === 0 && <p className="pm-empty-text" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No team members assigned.</p>}
                    </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="pm-card pm-deadline-card">
                    <div className="pm-card-header">
                        <h3><Timer size={18} /> Upcoming Deadlines</h3>
                    </div>
                    <div className="pm-deadline-list">
                        {deadlines.map(dl => (
                            <div className="pm-deadline-item" key={dl.id}>
                                <div className="pm-deadline-indicator" style={{ background: getDeadlineColor(dl.priority) }}></div>
                                <div className="pm-deadline-info">
                                    <span className="pm-deadline-task">{dl.task}</span>
                                    <span className="pm-deadline-project">{dl.project}</span>
                                </div>
                                <div className="pm-deadline-countdown" style={{ color: getDeadlineColor(dl.priority) }}>
                                    {dl.daysLeft <= 3 ? (
                                        <span className="pm-deadline-urgent">
                                            <AlertTriangle size={14} /> {dl.daysLeft < 0 ? 'Overdue' : dl.daysLeft + 'd'}
                                        </span>
                                    ) : (
                                        <span>{dl.daysLeft} days</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {deadlines.length === 0 && <p className="pm-empty-text" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No upcoming deadlines.</p>}
                    </div>
                </div>

                {/* Budget Overview */}
                <div className="pm-card pm-budget-card">
                    <div className="pm-card-header">
                        <h3><Wallet size={18} /> Budget Overview</h3>
                    </div>
                    {budgetData ? (
                        <div className="pm-budget-content">
                            <div className="pm-budget-ring-container">
                                <div className="pm-budget-ring" style={{ '--budget-percent': budgetPercent }}>
                                    <svg viewBox="0 0 120 120" className="pm-ring-svg">
                                        <circle cx="60" cy="60" r="52" className="pm-ring-bg" />
                                        <circle
                                            cx="60" cy="60" r="52"
                                            className="pm-ring-fill"
                                            style={{ strokeDasharray: `${budgetPercent * 3.267} 326.7` }}
                                        />
                                    </svg>
                                    <div className="pm-ring-center">
                                        <span className="pm-ring-value">{budgetPercent}%</span>
                                        <span className="pm-ring-label">Utilized</span>
                                    </div>
                                </div>
                                <div className="pm-budget-totals">
                                    <div className="pm-budget-total-row">
                                        <span>Total Budget</span>
                                        <strong>{formatCurrency(budgetData.total)}</strong>
                                    </div>
                                    <div className="pm-budget-total-row">
                                        <span>Spent</span>
                                        <strong style={{ color: '#e11d48' }}>{formatCurrency(budgetData.spent)}</strong>
                                    </div>
                                    <div className="pm-budget-total-row">
                                        <span>Remaining</span>
                                        <strong style={{ color: '#10b981' }}>{formatCurrency(budgetData.total - budgetData.spent)}</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="pm-budget-breakdown">
                                {budgetData.categories.map((cat, idx) => (
                                    <div className="pm-budget-category" key={idx}>
                                        <div className="pm-budget-cat-header">
                                            <div className="pm-budget-cat-dot" style={{ background: cat.color }}></div>
                                            <span>{cat.name}</span>
                                            <span className="pm-budget-cat-amount">{formatCurrency(cat.amount)}</span>
                                        </div>
                                        <div className="pm-budget-cat-bar">
                                            <div
                                                className="pm-budget-cat-fill"
                                                style={{
                                                    width: `${(cat.amount / budgetData.spent) * 100}%`,
                                                    background: cat.color
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="pm-empty-text" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading budget...</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
