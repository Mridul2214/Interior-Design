import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, FileText, Clock, CheckCircle, IndianRupee, Users, Package, ShoppingCart } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { reportAPI, purchaseOrderAPI } from '../../config/api';
import './css/Dashboard.css';

const AnalyticsCard = ({ title, value, icon: Icon, color, bgColor, loading, details = [] }) => {
    const hasData = details.some(d => typeof d.value === 'number' && d.value > 0);
    const chartData = loading || details.length === 0 || !hasData
        ? [{ name: 'Empty', value: 1, color: '#f1f5f9' }]
        : details.map(d => ({ name: d.label, value: typeof d.value === 'number' ? d.value : 0, color: d.color }));

    return (
        <div className="analytics-card centered">
            <h3 className="analytics-card-title">{title}</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={160} minWidth={0}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="chart-center-content">
                    <div className="analytics-icon-circle" style={{ backgroundColor: bgColor, color: color }}>
                        <Icon size={18} />
                    </div>
                    <div className="center-value">{loading ? '...' : value}</div>
                </div>
            </div>
            <div className="analytics-details-row">
                {loading ? (
                    <div className="analytics-loading">Loading...</div>
                ) : (
                    details.map((item, index) => (
                        <div key={index} className="detail-pill">
                            <span className="dot" style={{ backgroundColor: item.color }}></span>
                            <span className="pill-label">{item.label}</span>
                            <span className="pill-value">{item.value}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const RevenueCard = ({ label, value, variant, icon: Icon, loading }) => (
    <div className={`revenue-card ${variant}`}>
        <div className="revenue-icon-wrapper">
            <Icon size={24} color="white" />
        </div>
        <h3 className="revenue-label">{label}</h3>
        <p className="revenue-value">
            {loading ? '...' : value}
        </p>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [poStats, setPoStats] = useState({ total: 0, pending: 0, ordered: 0, received: 0 });
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
        setRevenueData([
            { name: 'Jan', value: 40000 },
            { name: 'Feb', value: 30000 },
            { name: 'Mar', value: 60000 },
            { name: 'Apr', value: 45000 },
            { name: 'May', value: 80000 },
            { name: 'Jun', value: 70000 },
        ]);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [dashboardRes, poStatsRes] = await Promise.all([
                reportAPI.getDashboard(),
                purchaseOrderAPI.getStats()
            ]);

            if (dashboardRes.success) setStats(dashboardRes.data);
            if (poStatsRes.success) {
                setPoStats(poStatsRes.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount}`;
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-content">
                {error && (
                    <div className="error-banner">
                        <i className="fas fa-exclamation-triangle"></i>
                        {error}
                    </div>
                )}

                <div className="stats-grid">
                    <AnalyticsCard
                        title="Quotations"
                        value={stats?.quotations?.total || 0}
                        icon={FileText}
                        color="#6366f1"
                        bgColor="#e0e7ff"
                        loading={loading}
                        details={[
                            { label: 'Pending', value: stats?.quotations?.pending || 0, color: '#f59e0b' },
                            { label: 'Approved', value: stats?.quotations?.approved || 0, color: '#10b981' },
                            { label: 'Total Value', value: formatCurrency(stats?.revenue?.potential || 0), color: '#6366f1' }
                        ]}
                    />
                    <AnalyticsCard
                        title="Inventory"
                        value={stats?.inventory?.totalCount || 0}
                        icon={Package}
                        color="#8b5cf6"
                        bgColor="#ede9fe"
                        loading={loading}
                        details={[
                            { label: 'In Stock', value: stats?.inventory?.inStock || 0, color: '#10b981' },
                            { label: 'Low Stock', value: stats?.inventory?.lowStock || 0, color: '#f59e0b' },
                            { label: 'Out of Stock', value: stats?.inventory?.outOfStock || 0, color: '#ef4444' }
                        ]}
                    />
                    <AnalyticsCard
                        title="Purchase Orders"
                        value={poStats.total}
                        icon={ShoppingCart}
                        color="#ec4899"
                        bgColor="#fce7f3"
                        loading={loading}
                        details={[
                            { label: 'Pending', value: poStats.pending, color: '#f59e0b' },
                            { label: 'Received', value: poStats.received, color: '#10b981' }
                        ]}
                    />
                    <AnalyticsCard
                        title="Clients"
                        value={stats?.clients?.total || 0}
                        icon={Users}
                        color="#0ea5e9"
                        bgColor="#e0f2fe"
                        loading={loading}
                        details={[
                            { label: 'Active', value: stats?.clients?.active || 0, color: '#10b981' },
                            { label: 'New', value: stats?.clients?.new || 0, color: '#0ea5e9' }
                        ]}
                    />
                </div>

                <div className="dashboard-main-grid">
                    <div className="recent-quotes-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 className="card-title" style={{ border: 'none', padding: 0, margin: 0 }}>Revenue Analytics</h3>
                        </div>
                        <div style={{ height: '350px', width: '100%', minWidth: 0 }}>
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="revenue-section">
                        <RevenueCard
                            label="Total Revenue"
                            value={formatCurrency(stats?.revenue?.approved || 0)}
                            variant="green"
                            icon={TrendingUp}
                            loading={loading}
                        />
                        <RevenueCard
                            label="Potential Revenue"
                            value={formatCurrency(stats?.revenue?.potential || 0)}
                            variant="blue"
                            icon={DollarSign}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
