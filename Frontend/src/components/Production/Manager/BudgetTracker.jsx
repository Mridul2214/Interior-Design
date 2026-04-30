import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import {
    DollarSign, TrendingUp, TrendingDown, Wallet,
    AlertCircle, ArrowUpRight
} from 'lucide-react';
import '../css/PMAnalytics.css';

const formatCurrency = (n) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
};

const BudgetTracker = ({ budgetData }) => {
    if (!budgetData) return null;

    const {
        totalBudget = 0,
        totalSpent = 0,
        totalEstimated = 0,
        utilization = 0,
        variance = 0,
        projectBudgets = [],
        budgetByStatus = {}
    } = budgetData;

    const utilizationColor = utilization > 90 ? '#ef4444' : utilization > 70 ? '#f59e0b' : '#10b981';

    const budgetStatusData = Object.entries(budgetByStatus)
        .filter(([_, v]) => v.budget > 0)
        .map(([name, v]) => ({ name, budget: v.budget, spent: v.spent }));

    return (
        <>
            {/* Summary Cards */}
            <div className="pm-budget-grid">
                <div className="pm-budget-summary-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />
                    <div className="pm-kpi-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
                        <Wallet size={20} />
                    </div>
                    <div className="pm-kpi-value">{formatCurrency(totalBudget)}</div>
                    <div className="pm-kpi-label">Total Budget</div>
                    <div className="pm-kpi-detail">Across all projects</div>
                </div>

                <div className="pm-budget-summary-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${utilizationColor}, ${utilizationColor}88)` }} />
                    <div className="pm-kpi-icon" style={{ background: utilization > 90 ? '#fee2e2' : utilization > 70 ? '#fef3c7' : '#d1fae5', color: utilizationColor }}>
                        <DollarSign size={20} />
                    </div>
                    <div className="pm-kpi-value">{formatCurrency(totalSpent)}</div>
                    <div className="pm-kpi-label">Total Spent ({utilization}%)</div>
                    <div style={{ marginTop: 8, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(utilization, 100)}%`, borderRadius: 3, background: utilizationColor, transition: 'width 0.5s ease-out' }} />
                    </div>
                </div>

                <div className="pm-budget-summary-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${variance >= 0 ? '#10b981' : '#ef4444'}, ${variance >= 0 ? '#34d399' : '#f87171'})` }} />
                    <div className="pm-kpi-icon" style={{ background: variance >= 0 ? '#d1fae5' : '#fee2e2', color: variance >= 0 ? '#10b981' : '#ef4444' }}>
                        {variance >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div className="pm-kpi-value" style={{ color: variance >= 0 ? '#10b981' : '#ef4444' }}>
                        {variance >= 0 ? '+' : ''}{formatCurrency(Math.abs(variance))}
                    </div>
                    <div className="pm-kpi-label">{variance >= 0 ? 'Under Budget' : 'Over Budget'}</div>
                    <div className="pm-kpi-detail">{variance >= 0 ? 'Remaining balance' : 'Exceeded allocation'}</div>
                </div>
            </div>

            {/* Budget by Status Chart */}
            {budgetStatusData.length > 0 && (
                <div className="pm-charts-grid" style={{ marginBottom: '2rem' }}>
                    <div className="pm-chart-card full-width">
                        <h3 className="pm-chart-title"><DollarSign size={16} style={{ color: '#10b981' }} />Budget vs Spent by Project Status</h3>
                        <p className="pm-chart-subtitle">Financial allocation and expenditure</p>
                        <div className="pm-chart-container">
                            <ResponsiveContainer>
                                <BarChart data={budgetStatusData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                                    <Tooltip content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null;
                                        return (
                                            <div style={{ background: 'white', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: 13 }}>
                                                <p style={{ fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>{label}</p>
                                                {payload.map((p, i) => (
                                                    <p key={i} style={{ margin: 0, color: p.color, fontWeight: 600 }}>
                                                        {p.name}: {formatCurrency(p.value)}
                                                    </p>
                                                ))}
                                            </div>
                                        );
                                    }} />
                                    <Bar dataKey="budget" name="Budget" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                    <Bar dataKey="spent" name="Spent" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Per-Project Breakdown */}
            {projectBudgets.length > 0 && (
                <div className="pm-chart-card" style={{ marginBottom: '2rem' }}>
                    <h3 className="pm-chart-title"><ArrowUpRight size={16} style={{ color: '#3b82f6' }} />Per-Project Budget</h3>
                    <p className="pm-chart-subtitle">Individual project financial health</p>
                    <div className="pm-budget-project-list">
                        {projectBudgets.map((p, i) => {
                            const barColor = p.utilization > 90 ? '#ef4444' : p.utilization > 70 ? '#f59e0b' : '#10b981';
                            return (
                                <div key={i} className="pm-budget-project-row">
                                    <div className="pm-budget-project-info">
                                        <div className="pm-budget-project-name">{p.name}</div>
                                        <div className="pm-budget-amounts">
                                            <span>Budget: {formatCurrency(p.budget)}</span>
                                            <span>Spent: {formatCurrency(p.spent)}</span>
                                            <span className={`pm-risk-badge ${p.riskLevel.toLowerCase()}`}>{p.riskLevel}</span>
                                        </div>
                                    </div>
                                    <div className="pm-budget-bar-container">
                                        <div className="pm-budget-bar">
                                            <div className="pm-budget-bar-fill" style={{ width: `${Math.min(p.utilization, 100)}%`, background: barColor }} />
                                        </div>
                                        <div className="pm-budget-bar-label" style={{ color: barColor }}>{p.utilization}%</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {projectBudgets.length === 0 && (
                <div className="pm-chart-card" style={{ marginBottom: '2rem' }}>
                    <div className="pm-empty-analytics">
                        <Wallet size={40} />
                        <p>No budget data available</p>
                        <span>Add budget info to your projects to see analytics here</span>
                    </div>
                </div>
            )}
        </>
    );
};

export default BudgetTracker;
