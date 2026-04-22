import React, { useState, useEffect } from 'react';
import { 
    DollarSign, Receipt, CreditCard, CheckCircle, Clock,
    Plus, Target, FileText, Wallet, ReceiptText
} from 'lucide-react';
import { accountsAPI, invoiceAPI } from '../../config/api';
import './css/StaffDashboard.css';

const AccountsStaffDashboard = ({ user }) => {
    const [invoices, setInvoices] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [invRes, payRes] = await Promise.all([
                invoiceAPI.getAll({ limit: 10 }),
                accountsAPI.getPayments({ limit: 10 })
            ]);

            if (invRes.success) setInvoices(invRes.data);
            if (payRes.success) setPayments(payRes.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        return `₹${amount.toLocaleString()}`;
    };

    const pendingInvoices = invoices.filter(i => i.status !== 'Paid');
    const totalPending = pendingInvoices.reduce((sum, i) => sum + (i.grandTotal - i.amountPaid), 0);

    return (
        <div className="role-dashboard accounts-staff">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="user-avatar accounts">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <h1>Accounts Dashboard</h1>
                        <p>Welcome, {user?.fullName}</p>
                    </div>
                </div>
                <div className="user-badge">
                    <span className="badge accounts">Accounts Team</span>
                </div>
            </div>

            <div className="quick-stats">
                <div className="quick-stat">
                    <span className="stat-number">{pendingInvoices.length}</span>
                    <span className="stat-text">Pending Invoices</span>
                </div>
                <div className="quick-stat">
                    <span className="stat-number">{formatCurrency(totalPending)}</span>
                    <span className="stat-text">Pending Amount</span>
                </div>
                <div className="quick-stat">
                    <span className="stat-number">{payments.length}</span>
                    <span className="stat-text">Payments Recorded</span>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="section-card primary">
                    <div className="section-header">
                        <h3><Receipt size={18} /> Invoices</h3>
                    </div>
                    <div className="invoices-list">
                        {invoices.slice(0, 6).map(invoice => (
                            <div key={invoice._id} className={`invoice-item ${invoice.status?.toLowerCase().replace(' ', '-')}`}>
                                <div className="invoice-info">
                                    <span className="invoice-number">{invoice.invoiceNumber}</span>
                                    <span className="invoice-client">{invoice.client?.name}</span>
                                </div>
                                <div className="invoice-amounts">
                                    <span className="total">{formatCurrency(invoice.grandTotal)}</span>
                                    {invoice.amountPaid > 0 && (
                                        <span className="paid">Paid: {formatCurrency(invoice.amountPaid)}</span>
                                    )}
                                </div>
                                <div className={`status-badge ${invoice.status?.toLowerCase().replace(' ', '-')}`}>
                                    {invoice.status === 'Paid' && <CheckCircle size={14} />}
                                    {invoice.status === 'Unpaid' && <Clock size={14} />}
                                    {invoice.status === 'Partially Paid' && <Clock size={14} />}
                                    {invoice.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="section-card">
                    <div className="section-header">
                        <h3><CreditCard size={18} /> Recent Payments</h3>
                    </div>
                    <div className="payments-list">
                        {payments.slice(0, 5).map(payment => (
                            <div key={payment._id} className="payment-item">
                                <div className="payment-info">
                                    <span className="payment-number">{payment.paymentNumber}</span>
                                    <span className="payment-method">{payment.paymentMethod}</span>
                                </div>
                                <div className="payment-amount">
                                    {formatCurrency(payment.amount)}
                                </div>
                                <div className="payment-date">
                                    {new Date(payment.paymentDate).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-cards">
                    <div className="action-card">
                        <Receipt size={24} />
                        <span>View Invoices</span>
                    </div>
                    <div className="action-card">
                        <CreditCard size={24} />
                        <span>Record Payment</span>
                    </div>
                    <div className="action-card">
                        <Wallet size={24} />
                        <span>Add Expense</span>
                    </div>
                    <div className="action-card">
                        <ReceiptText size={24} />
                        <span>Generate Receipt</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountsStaffDashboard;
