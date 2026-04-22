import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, FileText, Package, ShoppingCart, CheckSquare,
    DollarSign, TrendingUp, Users, AlertCircle, Clock,
    ArrowRight, ArrowUpRight, ArrowDownRight, Play, Pause,
    Target, Award, Wrench, Truck, Building2, ClipboardCheck,
    Send, CheckCircle, XCircle, Circle, Landmark, BarChart2
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { projectAPI, quotationAPI, taskAPI, purchaseOrderAPI, notificationAPI, reportAPI } from '../../config/api';
import './css/Dashboard.css';

// Custom Tooltip for Pie Chart
const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="label" style={{ color: payload[0].payload.fill }}>{payload[0].name}</p>
                <p className="value">{payload[0].value.toLocaleString()}</p>
                {payload[0].payload.percent && (
                    <p className="label">{(payload[0].payload.percent * 100).toFixed(0)}% of total</p>
                )}
            </div>
        );
    }
    return null;
};

const WorkflowDashboard = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [reportStats, setReportStats] = useState(null);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const notifListRef = React.useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const list = notifListRef.current;
        if (list) {
            const handleWheel = (e) => {
                const { scrollTop, scrollHeight, clientHeight } = list;
                const isAtTop = scrollTop === 0;
                const isAtBottom = Math.abs(scrollTop + clientHeight - scrollHeight) < 1;

                // Stop propagation for all wheel events within the list
                e.stopPropagation();

                // If moving down and at bottom, or up and at top, prevent default to stop background scroll
                if ((e.deltaY > 0 && isAtBottom) || (e.deltaY < 0 && isAtTop)) {
                    if (e.cancelable) e.preventDefault();
                }
            };
            list.addEventListener('wheel', handleWheel, { passive: false });
            return () => list.removeEventListener('wheel', handleWheel);
        }
    }, [notifications]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectStats, projectList, taskList, notifRes, reportData] = await Promise.all([
                projectAPI.getStats(),
                projectAPI.getAll({ limit: 5 }),
                taskAPI.getAll({ limit: 5 }),
                notificationAPI.getAll({ limit: 5 }),
                reportAPI.getDashboard()
            ]);

            if (projectStats.success) setStats(projectStats.data);
            if (projectList.success) setProjects(projectList.data);
            if (taskList.success) setTasks(taskList.data);
            if (notifRes.success) setNotifications(notifRes.data);
            if (reportData.success) setReportStats(reportData.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount.toLocaleString()}`;
    };

    const getStageColor = (stage) => {
        const colors = {
            'Design': '#8b5cf6',
            'Procurement': '#f59e0b',
            'Production': '#3b82f6',
            'Completed': '#10b981'
        };
        return colors[stage] || '#64748b';
    };

    const getStageIcon = (stage) => {
        switch (stage) {
            case 'Design': return <FileText size={16} />;
            case 'Procurement': return <Truck size={16} />;
            case 'Production': return <Wrench size={16} />;
            case 'Completed': return <CheckCircle size={16} />;
            default: return <Circle size={16} />;
        }
    };

    // Data for Charts
    const stageChartData = stats && stats.total > 0 ? [
        { name: 'Design', value: stats.stages.design || 0, fill: '#8b5cf6' },
        { name: 'Procurement', value: stats.stages.procurement || 0, fill: '#f59e0b' },
        { name: 'Production', value: stats.stages.production || 0, fill: '#3b82f6' },
        { name: 'Completed', value: stats.stages.completed || 0, fill: '#10b981' }
    ].filter(item => item.value > 0) : [{ name: 'Empty', value: 1, fill: '#f1f5f9' }];

    const quotationChartData = reportStats && (reportStats.quotations.approved || reportStats.quotations.pending) ? [
        { name: 'Approved', value: reportStats.quotations.approved || 0, fill: '#10b981' },
        { name: 'Pending', value: reportStats.quotations.pending || 0, fill: '#f59e0b' }
    ].filter(item => item.value > 0) : [{ name: 'Empty', value: 1, fill: '#f1f5f9' }];

    const financialChartData = reportStats && (reportStats.revenue.approved || reportStats.revenue.potential) ? [
        { name: 'Generated', value: reportStats.revenue.approved || 0, fill: '#10b981' },
        { name: 'Pending', value: reportStats.revenue.potential || 0, fill: '#3b82f6' }
    ].filter(item => item.value > 0) : [{ name: 'Empty', value: 1, fill: '#f1f5f9' }];

    const clientChartData = reportStats && reportStats.clients.total > 0 ? [
        { name: 'Active', value: reportStats.clients.active || 0, fill: '#0ea5e9' },
        { name: 'New/Other', value: (reportStats.clients.total - reportStats.clients.active) || 0, fill: '#94a3b8' }
    ].filter(item => item.value > 0) : [{ name: 'Empty', value: 1, fill: '#f1f5f9' }];

    return (
        <div className="workflow-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>{getGreeting()}, {user?.fullName?.split(' ')[0] || 'User'}</h1>
                    <p className="role-badge">{user?.role}</p>
                </div>
                <div className="workflow-progress-bar">
                    <div className="progress-step active">
                        <div className="step-icon"><FileText size={14} /></div>
                        <span>Design</span>
                    </div>
                    <div className="progress-line"></div>
                    <div className="progress-step">
                        <div className="step-icon"><Truck size={14} /></div>
                        <span>Procurement</span>
                    </div>
                    <div className="progress-line"></div>
                    <div className="progress-step">
                        <div className="step-icon"><Wrench size={14} /></div>
                        <span>Production</span>
                    </div>
                    <div className="progress-line"></div>
                    <div className="progress-step">
                        <div className="step-icon"><CheckCircle size={14} /></div>
                        <span>Complete</span>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card design">
                    <div className="stat-icon">
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.stages?.design || 0}</span>
                        <span className="stat-label">Design Stage</span>
                    </div>
                </div>

                <div className="stat-card procurement">
                    <div className="stat-icon">
                        <Truck size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.stages?.procurement || 0}</span>
                        <span className="stat-label">Procurement</span>
                    </div>
                </div>

                <div className="stat-card production">
                    <div className="stat-icon">
                        <Wrench size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.stages?.production || 0}</span>
                        <span className="stat-label">Production</span>
                    </div>
                </div>

                <div className="stat-card completed">
                    <div className="stat-icon">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.stages?.completed || 0}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>
            </div>

            {/* Graphical Summary Section */}
            <div className="graphical-summary-grid">
                {/* Financial Health */}
                <div className="summary-chart-card">
                    <div className="chart-header-mini">
                        <Landmark size={18} color="#3b82f6" />
                        <h3>Financial Summary</h3>
                    </div>
                    <div className="chart-content-mini">
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie
                                    data={financialChartData}
                                    innerRadius={50}
                                    outerRadius={65}
                                    paddingAngle={financialChartData[0]?.name === 'Empty' ? 0 : 5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {financialChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                {financialChartData[0]?.name !== 'Empty' && <RechartsTooltip content={<PieTooltip />} />}
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-center-label">
                            <span className="tiny-label">Revenue</span>
                            <span className="bold-value">{formatCurrency((reportStats?.revenue?.approved || 0) + (reportStats?.revenue?.potential || 0))}</span>
                        </div>
                    </div>
                    <div className="chart-legend-mini">
                        {financialChartData[0]?.name !== 'Empty' ? financialChartData.map((item, idx) => (
                            <div key={idx} className="legend-item-mini">
                                <div className="dot" style={{ backgroundColor: item.fill }}></div>
                                <span className="label">{item.name}</span>
                                <span className="value">{formatCurrency(item.value)}</span>
                            </div>
                        )) : <p className="no-data-text">No financial data yet</p>}
                    </div>
                </div>

                {/* Quotation Success */}
                <div className="summary-chart-card">
                    <div className="chart-header-mini">
                        <FileText size={18} color="#10b981" />
                        <h3>Quotations Success</h3>
                    </div>
                    <div className="chart-content-mini">
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie
                                    data={quotationChartData}
                                    innerRadius={50}
                                    outerRadius={65}
                                    paddingAngle={quotationChartData[0]?.name === 'Empty' ? 0 : 5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {quotationChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                {quotationChartData[0]?.name !== 'Empty' && <RechartsTooltip content={<PieTooltip />} />}
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-center-label">
                            <span className="tiny-label">Total</span>
                            <span className="bold-value">{reportStats?.quotations?.total || 0}</span>
                        </div>
                    </div>
                    <div className="chart-legend-mini">
                        {quotationChartData[0]?.name !== 'Empty' ? quotationChartData.map((item, idx) => (
                            <div key={idx} className="legend-item-mini">
                                <div className="dot" style={{ backgroundColor: item.fill }}></div>
                                <span className="label">{item.name}</span>
                                <span className="value">{item.value}</span>
                            </div>
                        )) : <p className="no-data-text">No quotations created</p>}
                    </div>
                </div>

                {/* Client Overview */}
                <div className="summary-chart-card">
                    <div className="chart-header-mini">
                        <Users size={18} color="#0ea5e9" />
                        <h3>Client Overview</h3>
                    </div>
                    <div className="chart-content-mini">
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie
                                    data={clientChartData}
                                    innerRadius={50}
                                    outerRadius={65}
                                    paddingAngle={clientChartData[0]?.name === 'Empty' ? 0 : 5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {clientChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                {clientChartData[0]?.name !== 'Empty' && <RechartsTooltip content={<PieTooltip />} />}
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-center-label">
                            <span className="tiny-label">Clients</span>
                            <span className="bold-value">{reportStats?.clients?.total || 0}</span>
                        </div>
                    </div>
                    <div className="chart-legend-mini">
                        {clientChartData[0]?.name !== 'Empty' ? clientChartData.map((item, idx) => (
                            <div key={idx} className="legend-item-mini">
                                <div className="dot" style={{ backgroundColor: item.fill }}></div>
                                <span className="label">{item.name}</span>
                                <span className="value">{item.value}</span>
                            </div>
                        )) : <p className="no-data-text">No clients registered</p>}
                    </div>
                </div>

                {/* Project Breakdown */}
                <div className="summary-chart-card">
                    <div className="chart-header-mini">
                        <Target size={18} color="#8b5cf6" />
                        <h3>Project Pipeline</h3>
                    </div>
                    <div className="chart-content-mini">
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie
                                    data={stageChartData}
                                    innerRadius={50}
                                    outerRadius={65}
                                    paddingAngle={stageChartData[0]?.name === 'Empty' ? 0 : 5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {stageChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                {stageChartData[0]?.name !== 'Empty' && <RechartsTooltip content={<PieTooltip />} />}
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-center-label">
                            <span className="tiny-label">Total</span>
                            <span className="bold-value">{stats?.total || 0}</span>
                        </div>
                    </div>
                    <div className="chart-legend-mini">
                        <div className="legend-grid-mini">
                            {stageChartData[0]?.name !== 'Empty' ? stageChartData.map((item, idx) => (
                                <div key={idx} className="legend-item-mini">
                                    <div className="dot" style={{ backgroundColor: item.fill }}></div>
                                    <span className="label text-truncate">{item.name}</span>
                                    <span className="value">{item.value}</span>
                                </div>
                            )) : <p className="no-data-text">No active projects</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="card projects-card">
                    <div className="card-header">
                        <h3><Target size={18} /> Active Projects</h3>
                        <a href="/projects" className="view-all">View All <ArrowRight size={14} /></a>
                    </div>
                    <div className="projects-list" data-lenis-prevent>
                        {projects.length > 0 ? projects.map(project => (
                            <div key={project._id} className="project-item">
                                <div className="project-info">
                                    <span className="project-name">{project.name}</span>
                                    <span className="project-number">{project.projectNumber}</span>
                                </div>
                                <div className="project-stage" style={{ backgroundColor: `${getStageColor(project.stage)}15`, color: getStageColor(project.stage) }}>
                                    {getStageIcon(project.stage)}
                                    <span>{project.stage}</span>
                                </div>
                                <div className="project-progress">
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${project.progress || 0}%` }}></div>
                                    </div>
                                    <span className="progress-text">{project.progress || 0}%</span>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">No active projects</div>
                        )}
                    </div>
                </div>

                <div className="card tasks-card">
                    <div className="card-header">
                        <h3><CheckSquare size={18} /> Recent Tasks</h3>
                        <a href="/tasks" className="view-all">View All <ArrowRight size={14} /></a>
                    </div>
                    <div className="tasks-list" data-lenis-prevent>
                        {tasks.length > 0 ? tasks.map(task => (
                            <div key={task._id} className="task-item">
                                <div className={`task-status ${task.status?.toLowerCase().replace(' ', '-')}`}>
                                    {task.status === 'Completed' && <CheckCircle size={16} />}
                                    {task.status === 'In Progress' && <Play size={16} />}
                                    {task.status === 'To Do' && <Circle size={16} />}
                                    {task.status === 'Blocked' && <Pause size={16} />}
                                </div>
                                <div className="task-info">
                                    <span className="task-title">{task.title}</span>
                                    <span className="task-project">{task.project?.name || 'No project'}</span>
                                </div>
                                <span className="task-due">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                            </div>
                        )) : (
                            <div className="empty-state">No tasks available</div>
                        )}
                    </div>
                </div>

                <div className="card notifications-card" data-lenis-prevent>
                    <div className="card-header">
                        <h3><AlertCircle size={18} /> Notifications</h3>
                        <span className="notif-count">{notifications.filter(n => !n.isRead).length} new</span>
                    </div>
                    <div
                        className="notifications-list"
                        ref={notifListRef}
                        data-lenis-prevent
                        style={{ height: '380px', overflowY: 'auto' }}
                    >
                        {notifications.length > 0 ? notifications.map(notif => (
                            <div key={notif._id} className={`notification-item ${!notif.isRead ? 'unread' : ''}`}>
                                <div className={`notif-icon ${notif.type?.toLowerCase()}`}>
                                    {notif.type === 'Success' && <CheckCircle size={14} />}
                                    {notif.type === 'Error' && <XCircle size={14} />}
                                    {notif.type === 'Warning' && <AlertCircle size={14} />}
                                    {(notif.type === 'Info' || !notif.type) && <Circle size={14} />}
                                </div>
                                <div className="notif-content">
                                    <span className="notif-title">{notif.title}</span>
                                    <span className="notif-desc">{notif.description}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">No notifications</div>
                        )}
                    </div>
                </div>

                <div className="card budget-card">
                    <div className="card-header">
                        <h3><DollarSign size={18} /> Budget Overview</h3>
                        <BarChart2 size={18} color="#64748b" />
                    </div>
                    <div className="budget-stats">
                        <div className="budget-item">
                            <span className="budget-label">Total Budget</span>
                            <span className="budget-value">{formatCurrency(stats?.budget?.total)}</span>
                        </div>
                        <div className="budget-item">
                            <span className="budget-label">Total Spent</span>
                            <span className="budget-value spent">{formatCurrency(stats?.budget?.spent)}</span>
                        </div>
                        <div className="budget-item">
                            <span className="budget-label">Remaining</span>
                            <span className="budget-value remaining">{formatCurrency(stats?.budget?.remaining)}</span>
                        </div>
                    </div>
                    <div className="budget-visual">
                        <div className="budget-bar-container">
                            <div
                                className="budget-fill"
                                style={{ width: `${stats?.budget?.total ? (stats.budget.spent / stats.budget.total) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <div className="budget-percentage">
                            {stats?.budget?.total ? ((stats.budget.spent / stats.budget.total) * 100).toFixed(1) : 0}% Used
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkflowDashboard;
