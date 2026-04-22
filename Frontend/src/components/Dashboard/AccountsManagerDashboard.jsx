import React, { useState, useEffect } from 'react';
import { 
    DollarSign, Receipt, CreditCard, TrendingUp, ArrowRight,
    Plus, Eye, CheckCircle, Clock, AlertTriangle, FileText,
    BarChart3, Wallet, Target
} from 'lucide-react';
import { projectAPI, accountsAPI, invoiceAPI } from '../../config/api';
import './css/ManagerDashboard.css';

const AccountsManagerDashboard = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [projects, setProjects] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [accStats, projRes, invRes] = await Promise.all([
                accountsAPI.getStats(),
                projectAPI.getAll({ stage: 'Completed', limit: 5 }),
                invoiceAPI.getAll({ limit: 10 })
            ]);

            if (accStats.success) setStats(accStats.data);
            if (projRes.success) setProjects(projRes.data);
            if (invRes.success) setInvoices(invRes.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount.toLocaleString()}`;
    };

    return (
        <div className="role-dashboard accounts-manager">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="role-icon accounts">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <h1>Accounts Manager Dashboard</h1>
                        <p>Welcome back, {user?.fullName?.split(' ')[0]}</p>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon income">
                        <TrendingUp size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{formatCurrency(stats?.totalPayments || 0)}</span>
                        <span className="stat-label">Total Received</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon expense">
                        <Wallet size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{formatCurrency(stats?.totalExpenses || 0)}</span>
                        <span className="stat-label">Total Expenses</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon pending">
                        <Receipt size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.pendingInvoices || 0}</span>
                        <span className="stat-label">Pending Invoices</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success">
                        <CheckCircle size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.paidInvoices || 0}</span>
                        <span className="stat-label">Paid Invoices</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="section-card">
                    <div className="section-header">
                        <h3><Receipt size={18} /> Recent Invoices</h3>
                        <a href="/invoice" className="view-all">View All <ArrowRight size={14} /></a>
                    </div>
                    <div className="invoices-list">
                        {invoices.slice(0, 5).map(invoice => (
                            <div key={invoice._id} className="invoice-item">
                                <div className="invoice-info">
                                    <span className="invoice-number">{invoice.invoiceNumber}</span>
                                    <span className="invoice-client">{invoice.client?.name}</span>
                                </div>
                                <div className="invoice-amount">
                                    {formatCurrency(invoice.grandTotal)}
                                </div>
                                <div className={`invoice-status ${invoice.status?.toLowerCase().replace(' ', '-')}`}>
                                    {invoice.status === 'Paid' && <CheckCircle size={14} />}
                                    {invoice.status === 'Unpaid' && <Clock size={14} />}
                                    {invoice.status === 'Partially Paid' && <AlertTriangle size={14} />}
                                    {invoice.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="section-card">
                    <div className="section-header">
                        <h3><BarChart3 size={18} /> Expense Breakdown</h3>
                    </div>
                    <div className="expenses-breakdown">
                        {stats?.expensesByType?.length > 0 ? stats.expensesByType.map((exp, i) => (
                            <div key={i} className="expense-row">
                                <span className="expense-type">{exp._id}</span>
                                <div className="expense-bar-container">
                                    <div 
                                        className="expense-bar" 
                                        style={{ width: `${(exp.total / (stats?.totalExpenses || 1)) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="expense-amount">{formatCurrency(exp.total)}</span>
                            </div>
                        )) : (
                            <div className="empty-state">No expense data</div>
                        )}
                    </div>
                </div>

                <div className="section-card">
                    <div className="section-header">
                        <h3><Target size={18} /> Completed Projects</h3>
                    </div>
                    <div className="projects-list compact">
                        {projects.length > 0 ? projects.map(project => (
                            <div key={project._id} className="project-item">
                                <div className="project-info">
                                    <span className="project-name">{project.name}</span>
                                    <span className="project-client">{project.client?.name}</span>
                                </div>
                                <div className="project-budget">
                                    {formatCurrency(project.budget)}
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">No completed projects</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="workflow-actions">
                <h3>Accounts Workflow Actions</h3>
                <div className="action-buttons">
                    <button className="action-btn">
                        <Receipt size={18} /> Create Invoice
                    </button>
                    <button className="action-btn">
                        <CreditCard size={18} /> Record Payment
                    </button>
                    <button className="action-btn">
                        <Wallet size={18} /> Add Expense
                    </button>
                    <button className="action-btn primary">
                        <BarChart3 size={18} /> Financial Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountsManagerDashboard;
