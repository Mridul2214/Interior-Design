import React, { useState, useEffect } from 'react';
import {
    Target, CheckSquare, Clock, AlertCircle, Users, TrendingUp,
    TrendingDown, Calendar, ArrowRight, Plus, FileText, BarChart3,
    Activity, MessageSquare, CheckCircle, Edit3, FolderPlus,
    ClipboardList, Wallet, Timer, AlertTriangle, Briefcase
} from 'lucide-react';
import '../css/ProductionManagement.css';

// ─── MOCK DATA ──────────────────────────────────────────────────────────────────
const MOCK_STATS = [
    { label: 'Total Projects', value: 12, icon: Target, trend: +8, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Active Projects', value: 7, icon: CheckSquare, trend: +12, color: '#16a34a', bg: '#dcfce7' },
    { label: 'Pending Approvals', value: 4, icon: AlertCircle, trend: -5, color: '#d97706', bg: '#fef3c7' },
    { label: 'Completed Tasks', value: 38, icon: CheckCircle, trend: +22, color: '#8b5cf6', bg: '#f3e8ff' },
    { label: 'Team Members', value: 14, icon: Users, trend: +2, color: '#0891b2', bg: '#cffafe' },
    { label: 'Budget Utilization', value: '68%', icon: Wallet, trend: +4, color: '#e11d48', bg: '#ffe4e6' },
];

const MOCK_PROJECTS = [
    { id: 1, name: 'Villa Renovation - Jubilee Hills', status: 'Active', progress: 72, engineer: 'Rahul K.', dueDate: '2026-05-15', budget: '₹18.5L' },
    { id: 2, name: 'Office Interior - HITEC City', status: 'Active', progress: 45, engineer: 'Priya M.', dueDate: '2026-06-01', budget: '₹32L' },
    { id: 3, name: 'Residential Complex - Gachibowli', status: 'On Hold', progress: 28, engineer: 'Vikram S.', dueDate: '2026-06-20', budget: '₹45L' },
    { id: 4, name: 'Showroom Design - Banjara Hills', status: 'Active', progress: 91, engineer: 'Anita R.', dueDate: '2026-05-05', budget: '₹12L' },
    { id: 5, name: 'Apartment Interiors - Kondapur', status: 'Planning', progress: 10, engineer: 'Suresh P.', dueDate: '2026-07-10', budget: '₹28L' },
];

const MOCK_TEAM = [
    { id: 1, name: 'Rahul Kumar', role: 'Project Engineer', tasks: 8, capacity: 75, avatar: 'RK' },
    { id: 2, name: 'Priya Menon', role: 'Site Engineer', tasks: 6, capacity: 60, avatar: 'PM' },
    { id: 3, name: 'Vikram Singh', role: 'Project Engineer', tasks: 10, capacity: 95, avatar: 'VS' },
    { id: 4, name: 'Anita Reddy', role: 'Site Supervisor', tasks: 4, capacity: 40, avatar: 'AR' },
    { id: 5, name: 'Suresh Patel', role: 'Site Engineer', tasks: 7, capacity: 70, avatar: 'SP' },
];

const MOCK_ACTIVITY = [
    { id: 1, user: 'Rahul K.', avatar: 'RK', action: 'completed task', detail: 'Electrical wiring - Phase 2', time: '10 min ago', type: 'completed' },
    { id: 2, user: 'Priya M.', avatar: 'PM', action: 'uploaded report', detail: 'Daily Site Progress - HITEC City', time: '25 min ago', type: 'created' },
    { id: 3, user: 'Vikram S.', avatar: 'VS', action: 'commented on', detail: 'Material delay for Gachibowli project', time: '1 hour ago', type: 'commented' },
    { id: 4, user: 'Anita R.', avatar: 'AR', action: 'updated status', detail: 'Showroom Design moved to Final Inspection', time: '2 hours ago', type: 'updated' },
    { id: 5, user: 'Suresh P.', avatar: 'SP', action: 'created task', detail: 'Foundation work - Kondapur Block A', time: '3 hours ago', type: 'created' },
    { id: 6, user: 'System', avatar: 'SY', action: 'auto-flagged', detail: 'Budget threshold reached for Villa Renovation', time: '4 hours ago', type: 'warning' },
];

const MOCK_DEADLINES = [
    { id: 1, task: 'Final Inspection - Showroom Design', project: 'Banjara Hills', daysLeft: 2, priority: 'urgent' },
    { id: 2, task: 'Plumbing Completion - Villa Reno', project: 'Jubilee Hills', daysLeft: 5, priority: 'high' },
    { id: 3, task: 'Material Delivery - Flooring', project: 'HITEC City', daysLeft: 8, priority: 'medium' },
    { id: 4, task: 'Electrical Sign-off', project: 'Gachibowli', daysLeft: 12, priority: 'low' },
    { id: 5, task: 'Paint Work Start', project: 'Kondapur', daysLeft: 18, priority: 'low' },
];

const MOCK_BUDGET = {
    total: 13550000,
    spent: 9214000,
    categories: [
        { name: 'Materials', amount: 4200000, color: '#3b82f6' },
        { name: 'Labour', amount: 2800000, color: '#8b5cf6' },
        { name: 'Equipment', amount: 1200000, color: '#f59e0b' },
        { name: 'Overheads', amount: 1014000, color: '#10b981' },
    ]
};

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
    const map = { completed: '#10b981', created: '#3b82f6', commented: '#8b5cf6', updated: '#f59e0b', warning: '#ef4444' };
    return map[type] || '#64748b';
};

// ─── COMPONENT ──────────────────────────────────────────────────────────────────
const Dashboard = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const budgetPercent = Math.round((MOCK_BUDGET.spent / MOCK_BUDGET.total) * 100);

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
                        7 active projects
                    </div>
                    <div className="pm-summary-pill">
                        <span className="pm-pill-dot warning"></span>
                        4 pending approvals
                    </div>
                    <div className="pm-summary-pill">
                        <span className="pm-pill-dot danger"></span>
                        2 urgent deadlines
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ─────────────────────────────────────── */}
            <div className="pm-stats-grid">
                {MOCK_STATS.map((stat, idx) => (
                    <div className="pm-stat-card-v2" key={idx}>
                        <div className="pm-stat-card-header">
                            <div className="pm-stat-icon-v2" style={{ background: stat.bg, color: stat.color }}>
                                <stat.icon size={20} />
                            </div>
                            <div className={`pm-stat-trend ${stat.trend >= 0 ? 'up' : 'down'}`}>
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
                        {MOCK_PROJECTS.map(project => (
                            <div className="pm-project-row" key={project.id}>
                                <div className="pm-project-row-info">
                                    <div className="pm-project-row-top">
                                        <span className="pm-project-name">{project.name}</span>
                                        <span className={`pm-status-badge ${getStatusClass(project.status)}`}>{project.status}</span>
                                    </div>
                                    <div className="pm-project-row-meta">
                                        <span><Users size={13} /> {project.engineer}</span>
                                        <span><Calendar size={13} /> {new Date(project.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                        <span><Wallet size={13} /> {project.budget}</span>
                                    </div>
                                </div>
                                <div className="pm-project-row-progress">
                                    <div className="pm-progress-bar-v2">
                                        <div
                                            className="pm-progress-fill-v2"
                                            style={{ width: `${project.progress}%` }}
                                            data-progress={`${project.progress}%`}
                                        ></div>
                                    </div>
                                    <span className="pm-progress-text">{project.progress}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="pm-card pm-activity-card">
                    <div className="pm-card-header">
                        <h3><Activity size={18} /> Recent Activity</h3>
                    </div>
                    <div className="pm-activity-timeline">
                        {MOCK_ACTIVITY.map((item, idx) => (
                            <div className="pm-timeline-item" key={item.id}>
                                <div className="pm-timeline-dot-wrapper">
                                    <div className="pm-timeline-dot" style={{ background: getActivityColor(item.type) }}></div>
                                    {idx < MOCK_ACTIVITY.length - 1 && <div className="pm-timeline-line"></div>}
                                </div>
                                <div className="pm-timeline-content">
                                    <div className="pm-timeline-header">
                                        <div className="pm-timeline-avatar" style={{ background: getActivityColor(item.type) + '20', color: getActivityColor(item.type) }}>
                                            {item.avatar}
                                        </div>
                                        <div className="pm-timeline-text">
                                            <span className="pm-timeline-user">{item.user}</span>
                                            <span className="pm-timeline-action"> {item.action}</span>
                                        </div>
                                    </div>
                                    <p className="pm-timeline-detail">{item.detail}</p>
                                    <span className="pm-timeline-time"><Clock size={12} /> {item.time}</span>
                                </div>
                            </div>
                        ))}
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
                        {MOCK_TEAM.map(member => (
                            <div className="pm-team-member-row" key={member.id}>
                                <div className="pm-team-member-info">
                                    <div className="pm-team-avatar" style={{ background: getCapacityColor(member.capacity) + '18', color: getCapacityColor(member.capacity) }}>
                                        {member.avatar}
                                    </div>
                                    <div className="pm-team-details">
                                        <span className="pm-team-name">{member.name}</span>
                                        <span className="pm-team-role">{member.role}</span>
                                    </div>
                                </div>
                                <div className="pm-team-capacity">
                                    <div className="pm-capacity-header">
                                        <span>{member.tasks} tasks</span>
                                        <span style={{ color: getCapacityColor(member.capacity) }}>{member.capacity}%</span>
                                    </div>
                                    <div className="pm-capacity-bar">
                                        <div
                                            className="pm-capacity-fill"
                                            style={{ width: `${member.capacity}%`, background: getCapacityColor(member.capacity) }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="pm-card pm-deadline-card">
                    <div className="pm-card-header">
                        <h3><Timer size={18} /> Upcoming Deadlines</h3>
                    </div>
                    <div className="pm-deadline-list">
                        {MOCK_DEADLINES.map(dl => (
                            <div className="pm-deadline-item" key={dl.id}>
                                <div className="pm-deadline-indicator" style={{ background: getDeadlineColor(dl.priority) }}></div>
                                <div className="pm-deadline-info">
                                    <span className="pm-deadline-task">{dl.task}</span>
                                    <span className="pm-deadline-project">{dl.project}</span>
                                </div>
                                <div className="pm-deadline-countdown" style={{ color: getDeadlineColor(dl.priority) }}>
                                    {dl.daysLeft <= 3 ? (
                                        <span className="pm-deadline-urgent">
                                            <AlertTriangle size={14} /> {dl.daysLeft}d
                                        </span>
                                    ) : (
                                        <span>{dl.daysLeft} days</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Budget Overview */}
                <div className="pm-card pm-budget-card">
                    <div className="pm-card-header">
                        <h3><Wallet size={18} /> Budget Overview</h3>
                    </div>
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
                                    <strong>{formatCurrency(MOCK_BUDGET.total)}</strong>
                                </div>
                                <div className="pm-budget-total-row">
                                    <span>Spent</span>
                                    <strong style={{ color: '#e11d48' }}>{formatCurrency(MOCK_BUDGET.spent)}</strong>
                                </div>
                                <div className="pm-budget-total-row">
                                    <span>Remaining</span>
                                    <strong style={{ color: '#10b981' }}>{formatCurrency(MOCK_BUDGET.total - MOCK_BUDGET.spent)}</strong>
                                </div>
                            </div>
                        </div>
                        <div className="pm-budget-breakdown">
                            {MOCK_BUDGET.categories.map((cat, idx) => (
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
                                                width: `${(cat.amount / MOCK_BUDGET.spent) * 100}%`,
                                                background: cat.color
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Quick Actions ──────────────────────────────────── */}
            <div className="pm-card pm-quick-actions-card">
                <div className="pm-card-header">
                    <h3><Briefcase size={18} /> Quick Actions</h3>
                </div>
                <div className="pm-quick-actions-grid">
                    <button className="pm-quick-action-btn">
                        <div className="pm-qa-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><Plus size={20} /></div>
                        <span>Create Task</span>
                    </button>
                    <button className="pm-quick-action-btn">
                        <div className="pm-qa-icon" style={{ background: '#f3e8ff', color: '#8b5cf6' }}><FolderPlus size={20} /></div>
                        <span>Add Project</span>
                    </button>
                    <button className="pm-quick-action-btn">
                        <div className="pm-qa-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><FileText size={20} /></div>
                        <span>Generate Report</span>
                    </button>
                    <button className="pm-quick-action-btn">
                        <div className="pm-qa-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Calendar size={20} /></div>
                        <span>View Calendar</span>
                    </button>
                    <button className="pm-quick-action-btn">
                        <div className="pm-qa-icon" style={{ background: '#ffe4e6', color: '#e11d48' }}><ClipboardList size={20} /></div>
                        <span>Approvals</span>
                    </button>
                    <button className="pm-quick-action-btn">
                        <div className="pm-qa-icon" style={{ background: '#cffafe', color: '#0891b2' }}><Users size={20} /></div>
                        <span>Manage Team</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
