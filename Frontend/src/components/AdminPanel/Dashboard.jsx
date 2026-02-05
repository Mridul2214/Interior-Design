import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, FileText, Clock, CheckCircle, IndianRupee } from 'lucide-react';
import { reportAPI } from '../../config/api';
import './css/Dashboard.css';

const StatCard = ({ title, value, icon: Icon, color, bgColor, loading }) => (
    <div className="stat-card">
        <div className="stat-header">
            <div className="stat-icon-wrapper" style={{ backgroundColor: bgColor, color: color }}>
                <Icon size={24} />
            </div>
            <h3 className="stat-title">{title}</h3>
        </div>
        <p className="stat-value">
            {loading ? <i className="fas fa-spinner fa-spin"></i> : value}
        </p>
    </div>
);

const RevenueCard = ({ label, value, variant, icon: Icon, loading }) => (
    <div className={`revenue-card ${variant}`}>
        <div className="revenue-icon-wrapper">
            <Icon size={24} color="white" />
        </div>
        <h3 className="revenue-label">{label}</h3>
        <p className="revenue-value">
            {loading ? <i className="fas fa-spinner fa-spin"></i> : value}
        </p>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await reportAPI.getDashboard();

            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
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

                {/* Stats Grid */}
                <div className="stats-grid">
                    <StatCard
                        title="Total Quotes"
                        value={stats?.quotations?.total || 0}
                        icon={FileText}
                        color="#6366f1"
                        bgColor="#e0e7ff"
                        loading={loading}
                    />
                    <StatCard
                        title="Pending"
                        value={stats?.quotations?.pending || 0}
                        icon={Clock}
                        color="#f59e0b"
                        bgColor="#fef3c7"
                        loading={loading}
                    />
                    <StatCard
                        title="Approved"
                        value={stats?.quotations?.approved || 0}
                        icon={CheckCircle}
                        color="#10b981"
                        bgColor="#d1fae5"
                        loading={loading}
                    />
                    <StatCard
                        title="Revenue"
                        value={formatCurrency(stats?.revenue?.approved || 0)}
                        icon={IndianRupee}
                        color="#0ea5e9"
                        bgColor="#e0f2fe"
                        loading={loading}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-main-grid">
                    {/* Recent Quotations */}
                    <div className="recent-quotes-card">
                        <h3 className="card-title">Quick Stats</h3>

                        <div className="quick-stats-grid">
                            <div className="quick-stat">
                                <p className="quick-stat-label">Total Clients</p>
                                <p className="quick-stat-value">{stats?.clients?.total || 0}</p>
                            </div>
                            <div className="quick-stat">
                                <p className="quick-stat-label">Active Clients</p>
                                <p className="quick-stat-value">{stats?.clients?.active || 0}</p>
                            </div>
                            <div className="quick-stat">
                                <p className="quick-stat-label">Total Tasks</p>
                                <p className="quick-stat-value">{stats?.tasks?.total || 0}</p>
                            </div>
                            <div className="quick-stat">
                                <p className="quick-stat-label">In Progress</p>
                                <p className="quick-stat-value">{stats?.tasks?.inProgress || 0}</p>
                            </div>
                            <div className="quick-stat">
                                <p className="quick-stat-label">Low Stock Items</p>
                                <p className="quick-stat-value">{stats?.inventory?.lowStock || 0}</p>
                            </div>
                            <div className="quick-stat">
                                <p className="quick-stat-label">Out of Stock</p>
                                <p className="quick-stat-value">{stats?.inventory?.outOfStock || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Banners */}
                    <div className="revenue-section">
                        <RevenueCard
                            label="Total Revenue (Approved)"
                            value={formatCurrency(stats?.revenue?.approved || 0)}
                            variant="green"
                            icon={TrendingUp}
                            loading={loading}
                        />
                        <RevenueCard
                            label="Potential Revenue (Pending)"
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
