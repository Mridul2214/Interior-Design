import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    AreaChart, Area, Legend
} from 'recharts';
import {
    Activity, TrendingUp, Users, CheckCircle2,
    AlertTriangle, Clock, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import '../css/PMAnalytics.css';

const STATUS_COLORS = {
    'Pending': '#94a3b8', 'In Progress': '#3b82f6', 'Completed': '#10b981', 'Approved': '#8b5cf6',
    'Planning': '#3b82f6', 'Active': '#10b981', 'On Hold': '#ef4444',
    'Low': '#10b981', 'Medium': '#f59e0b', 'High': '#ef4444', 'Urgent': '#be185d', 'Critical': '#be185d'
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'white', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: 13 }}>
            <p style={{ fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ margin: 0, color: p.color, fontWeight: 600 }}>
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
};

const PMCharts = ({ chartData }) => {
    if (!chartData) return null;

    const {
        tasksByStatus = {},
        tasksByPriority = {},
        projectsByStatus = {},
        tasksByStage = {},
        weeklyTrend = [],
        projectProgress = []
    } = chartData;

    const statusData = Object.entries(tasksByStatus)
        .filter(([_, v]) => v > 0)
        .map(([name, value]) => ({ name, value }));

    const priorityData = Object.entries(tasksByPriority)
        .filter(([_, v]) => v > 0)
        .map(([name, value]) => ({ name, value }));

    const projectStatusData = Object.entries(projectsByStatus)
        .filter(([_, v]) => v > 0)
        .map(([name, value]) => ({ name, value }));

    const stageData = Object.entries(tasksByStage)
        .map(([name, value]) => ({ name, value, fullName: { PM: 'Project Manager', PE: 'Project Engineer', SE: 'Site Engineer', SS: 'Supervisor' }[name] || name }));

    return (
        <>
            {/* Row 1: Two pie charts */}
            <div className="pm-charts-grid">
                <div className="pm-chart-card">
                    <h3 className="pm-chart-title"><PieChartIcon size={16} style={{ color: '#3b82f6' }} />Task Status Distribution</h3>
                    <p className="pm-chart-subtitle">Current state of all tasks</p>
                    <div className="pm-chart-container">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={100} innerRadius={55} labelLine={false} label={renderCustomLabel}>
                                        {statusData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="pm-empty-analytics"><Activity size={32} /><p>No tasks yet</p></div>
                        )}
                    </div>
                </div>

                <div className="pm-chart-card">
                    <h3 className="pm-chart-title"><AlertTriangle size={16} style={{ color: '#f59e0b' }} />Priority Breakdown</h3>
                    <p className="pm-chart-subtitle">Tasks grouped by priority level</p>
                    <div className="pm-chart-container">
                        {priorityData.length > 0 ? (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={priorityData} dataKey="value" cx="50%" cy="50%" outerRadius={100} innerRadius={55} labelLine={false} label={renderCustomLabel}>
                                        {priorityData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="pm-empty-analytics"><Activity size={32} /><p>No data</p></div>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 2: Bar chart + Area chart */}
            <div className="pm-charts-grid">
                <div className="pm-chart-card">
                    <h3 className="pm-chart-title"><BarChart3 size={16} style={{ color: '#8b5cf6' }} />Tasks by Stage</h3>
                    <p className="pm-chart-subtitle">Distribution across the hierarchy</p>
                    <div className="pm-chart-container">
                        <ResponsiveContainer>
                            <BarChart data={stageData} barCategoryGap="25%">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="Tasks" radius={[6, 6, 0, 0]}>
                                    {stageData.map((_, i) => <Cell key={i} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][i]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="pm-chart-card">
                    <h3 className="pm-chart-title"><TrendingUp size={16} style={{ color: '#10b981' }} />Weekly Trend</h3>
                    <p className="pm-chart-subtitle">Tasks created vs completed (last 8 weeks)</p>
                    <div className="pm-chart-container">
                        <ResponsiveContainer>
                            <AreaChart data={weeklyTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="created" name="Created" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
                                <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
                                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 3: Project progress bars */}
            {projectProgress.length > 0 && (
                <div className="pm-chart-card" style={{ marginBottom: '2rem' }}>
                    <h3 className="pm-chart-title"><CheckCircle2 size={16} style={{ color: '#10b981' }} />Project Progress Overview</h3>
                    <p className="pm-chart-subtitle">Completion status across all projects</p>
                    <div className="pm-chart-container" style={{ height: Math.max(200, projectProgress.length * 55) }}>
                        <ResponsiveContainer>
                            <BarChart data={projectProgress} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} width={140} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="progress" name="Progress %" radius={[0, 6, 6, 0]} maxBarSize={24}>
                                    {projectProgress.map((p, i) => (
                                        <Cell key={i} fill={p.progress >= 75 ? '#10b981' : p.progress >= 40 ? '#3b82f6' : '#f59e0b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </>
    );
};

export default PMCharts;
