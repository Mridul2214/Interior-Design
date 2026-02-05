import React, { useState, useEffect } from 'react';
import {
    Download,
    DollarSign,
    TrendingUp,
    PieChart,
    Target,
    Users,
    Calendar,
    FileText,
    ExternalLink,
    Clock,
    Loader
} from 'lucide-react';
import { reportAPI, quotationAPI } from '../../config/api';
import './css/Reports.css';

const Reports = () => {
    const [stats, setStats] = useState(null);
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const [reportRes, quoteRes] = await Promise.all([
                reportAPI.getDashboard(),
                quotationAPI.getAll()
            ]);

            if (reportRes.success) setStats(reportRes.data);
            if (quoteRes.success) setQuotations(quoteRes.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const conversionRate = stats?.quotations?.total > 0
        ? ((stats.quotations.approved / stats.quotations.total) * 100).toFixed(1)
        : '0.0';

    const metrics = [
        {
            label: 'Total Revenue',
            value: `₹${stats?.revenue?.approved?.toLocaleString() || '0'}`,
            icon: <DollarSign size={20} />,
            variant: 'solid-green',
            id: 'rev-total'
        },
        {
            label: 'Pending Revenue',
            value: `₹${stats?.revenue?.potential?.toLocaleString() || '0'}`,
            icon: <TrendingUp size={20} />,
            variant: 'solid-blue',
            id: 'rev-pending'
        },
        {
            label: 'Total Clients',
            value: stats?.clients?.total || '0',
            icon: <Users size={20} />,
            iconClass: 'cyan',
            id: 'clients-active'
        },
        {
            label: 'Conversion Rate',
            value: `${conversionRate}%`,
            icon: <Target size={20} />,
            iconClass: 'orange',
            id: 'conv-rate'
        },
        {
            label: 'Active Tasks',
            value: stats?.tasks?.inProgress || '0',
            icon: <Clock size={20} />,
            iconClass: 'pink',
            id: 'tasks-active'
        },
        {
            label: 'Total Quotations',
            value: stats?.quotations?.total || '0',
            icon: <FileText size={20} />,
            variant: 'solid-purple',
            id: 'quotes-total'
        },
        {
            label: 'Approved Quotes',
            value: stats?.quotations?.approved || '0',
            icon: <Calendar size={20} />,
            iconClass: 'purple',
            id: 'quotes-approved'
        },
        {
            label: 'Inventory Alerts',
            value: (stats?.inventory?.lowStock || 0) + (stats?.inventory?.outOfStock || 0),
            icon: <TrendingUp size={20} />,
            iconClass: 'pink',
            id: 'inv-alerts'
        }
    ];

    return (
        <div className="reports-container">
            <div className="reports-wrapper">
                <div className="reports-header">
                    <div className="reports-title">
                        <h2>Analytics Reports</h2>
                        <p>Detailed overview of your business performance and conversion metrics.</p>
                    </div>
                    <button className="btn-export">
                        <Download size={18} />
                        <span>Export PDF</span>
                    </button>
                </div>

                {error && <div className="error-banner">{error}</div>}

                {loading ? (
                    <div className="loading-state">
                        <Loader className="spinner" size={40} />
                        <p>Loading analytics reports...</p>
                    </div>
                ) : (
                    <>
                        <div className="reports-stats-matrix">
                            {metrics.map((stat) => (
                                <div key={stat.id} className={`stat-metric-card ${stat.variant || ''}`}>
                                    <div className="stat-top-row">
                                        <div className={`stat-icon-box ${stat.iconClass || ''}`}>
                                            {stat.icon}
                                        </div>
                                        <ExternalLink size={14} style={{ opacity: 0.4 }} />
                                    </div>
                                    <div className="stat-label">{stat.label}</div>
                                    <div className="stat-value">{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="summary-container-card">
                            <div className="summary-header">
                                <h3>Quote Activity Summary</h3>
                            </div>

                            {quotations.length === 0 ? (
                                <div className="empty-reports-state">
                                    <FileText size={48} strokeWidth={1} />
                                    <p>No activity to display</p>
                                </div>
                            ) : (
                                <div className="reports-table-container">
                                    <table className="reports-table">
                                        <thead>
                                            <tr>
                                                <th>Quotation #</th>
                                                <th>Client</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quotations.slice(0, 10).map((q) => (
                                                <tr key={q._id}>
                                                    <td>{q.quotationNumber}</td>
                                                    <td>{q.client?.name || 'N/A'}</td>
                                                    <td>₹{q.totalAmount?.toLocaleString()}</td>
                                                    <td>
                                                        <span className={`status-badge-small ${q.status?.toLowerCase()}`}>
                                                            {q.status}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Reports;
