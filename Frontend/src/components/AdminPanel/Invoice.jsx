import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    X,
    FileText,
    Download,
    Mail,
    Edit,
    Trash2,
    MoreVertical,
    CreditCard,
    Clock,
    CheckCircle,
    AlertCircle,
    Printer,
    Loader
} from 'lucide-react';
import { invoiceAPI, clientAPI } from '../../config/api';
import './css/Invoice.css';

const Invoice = () => {
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filtered Invoices
    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Form State
    const [formData, setFormData] = useState({
        client: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ description: 'Design Consultation', quantity: 1, rate: 5000, tax: 18 }]
    });

    useEffect(() => {
        fetchInvoices();
        fetchClients();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await invoiceAPI.getAll();
            if (response.success) setInvoices(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await clientAPI.getAll();
            if (response.success) setClients(response.data);
        } catch (err) {
            console.error('Error fetching clients:', err);
        }
    };

    const handleCreateInvoice = async () => {
        if (!formData.client || formData.items.length === 0) {
            alert('Please select a client and add at least one item.');
            return;
        }

        try {
            setSubmitting(true);
            const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
            const totalTax = formData.items.reduce((sum, item) => sum + (item.quantity * item.rate * item.tax / 100), 0);

            // Add amount field to each item as required by backend
            const preparedItems = formData.items.map(item => ({
                ...item,
                amount: item.quantity * item.rate
            }));

            const response = await invoiceAPI.create({
                ...formData,
                items: preparedItems,
                subtotal,
                totalTax,
                grandTotal: subtotal + totalTax,
                status: 'Unpaid'
            });

            if (response.success) {
                setShowCreateModal(false);
                fetchInvoices();
                setFormData({ client: '', invoiceDate: '', dueDate: '', items: [] });
            }
        } catch (err) {
            alert('Error creating invoice: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this invoice?')) return;
        try {
            await invoiceAPI.delete(id);
            setInvoices(invoices.filter(inv => inv._id !== id));
        } catch (err) {
            alert('Error deleting: ' + err.message);
        }
    };

    const handleUpdatePayment = async (id, status, amountToPay) => {
        try {
            await invoiceAPI.recordPayment(id, {
                amount: amountToPay,
                paymentMethod: 'Bank Transfer',
                paymentDate: new Date()
            });
            fetchInvoices();
        } catch (err) {
            alert('Error updating payment: ' + err.message);
        }
    };

    // Stats Calculation
    const unpaidTotal = invoices.filter(i => i.status === 'Unpaid').reduce((sum, i) => sum + (i.grandTotal || 0), 0);
    const overdueTotal = invoices.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + (i.grandTotal || 0), 0);
    const paidTotal = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (i.grandTotal || 0), 0);

    const statsData = [
        { label: 'Outstanding', value: `₹${unpaidTotal.toLocaleString()}`, icon: <CreditCard size={24} />, color: 'blue' },
        { label: 'Overdue', value: `₹${overdueTotal.toLocaleString()}`, icon: <AlertCircle size={24} />, color: 'red' },
        { label: 'Paid (Total)', value: `₹${paidTotal.toLocaleString()}`, icon: <CheckCircle size={24} />, color: 'green' },
        { label: 'Total Invoices', value: invoices.length, icon: <FileText size={24} />, color: 'purple' },
    ];

    return (
        <div className="invoice-container">
            <div className="invoice-wrapper">
                <div className="invoice-header">
                    <button className="btn-create-invoice" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} />
                        <span>Create Invoice</span>
                    </button>
                </div>

                <div className="invoice-stats-grid">
                    {statsData.map((stat, i) => (
                        <div key={i} className="invoice-stat-card">
                            <div className="stat-content">
                                <h4>{stat.label}</h4>
                                <h2>{stat.value}</h2>
                            </div>
                            <div className={`stat-icon-wrapper ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="invoice-filter-bar">
                    <div className="search-field">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search by invoice # or client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>

                {error && <div className="error-banner">{error}</div>}

                <div className="invoice-table-card">
                    {loading ? (
                        <div className="loading-state">
                            <Loader className="spinner" size={40} />
                            <p>Loading invoices...</p>
                        </div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
                            <FileText size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                            <h3>No invoices found</h3>
                        </div>
                    ) : (
                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Client Name</th>
                                    <th>Date</th>
                                    <th>Due Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv._id}>
                                        <td className="inv-id">{inv.invoiceNumber}</td>
                                        <td className="client-name-cell">{inv.client?.name || 'Unknown'}</td>
                                        <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                                        <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                                        <td className="amount-cell">₹{inv.grandTotal?.toLocaleString()}</td>
                                        <td>
                                            <span className={`status-badge ${inv.status?.toLowerCase()}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="invoice-actions">
                                                <button className="btn-inv-action primary" title="Download"><Download size={16} /></button>
                                                {inv.status !== 'Paid' && (
                                                    <button
                                                        className="btn-inv-action success"
                                                        title="Mark Paid"
                                                        onClick={() => handleUpdatePayment(inv._id, 'Paid', inv.grandTotal - (inv.amountPaid || 0))}
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-inv-action danger"
                                                    title="Delete"
                                                    onClick={() => handleDelete(inv._id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content-invoice">
                        <div className="modal-header">
                            <h3>Create New Invoice</h3>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="inv-form-grid">
                                <div className="inv-field">
                                    <label>Client *</label>
                                    <select
                                        className="inv-input"
                                        value={formData.client}
                                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                    >
                                        <option value="">Select Client</option>
                                        {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="inv-form-grid">
                                    <div className="inv-field">
                                        <label>Invoice Date</label>
                                        <input
                                            type="date"
                                            className="inv-input"
                                            value={formData.invoiceDate}
                                            onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="inv-field">
                                        <label>Due Date</label>
                                        <input
                                            type="date"
                                            className="inv-input"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700 }}>Items</span>
                                <button
                                    className="btn-add-item"
                                    onClick={() => setFormData({ ...formData, items: [...formData.items, { description: '', quantity: 1, rate: 0, tax: 18 }] })}
                                >
                                    <Plus size={16} /> Add Item
                                </button>
                            </div>

                            <table className="inv-items-table" style={{ width: '100%', marginTop: '1rem' }}>
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th>Qty</th>
                                        <th>Rate</th>
                                        <th>Tax (%)</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <input
                                                    className="inv-input"
                                                    value={item.description}
                                                    onChange={(e) => {
                                                        const newItems = [...formData.items];
                                                        newItems[idx].description = e.target.value;
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="inv-input"
                                                    style={{ width: '60px' }}
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const newItems = [...formData.items];
                                                        newItems[idx].quantity = parseInt(e.target.value) || 0;
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="inv-input"
                                                    style={{ width: '100px' }}
                                                    value={item.rate}
                                                    onChange={(e) => {
                                                        const newItems = [...formData.items];
                                                        newItems[idx].rate = parseInt(e.target.value) || 0;
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="inv-input"
                                                    style={{ width: '60px' }}
                                                    value={item.tax}
                                                    onChange={(e) => {
                                                        const newItems = [...formData.items];
                                                        newItems[idx].tax = parseInt(e.target.value) || 0;
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <button onClick={() => {
                                                    const newItems = formData.items.filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, items: newItems });
                                                }} style={{ color: '#ef4444', border: 'none', background: 'none' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button className="btn-save-inv" onClick={handleCreateInvoice} disabled={submitting}>
                                {submitting ? 'Generating...' : 'Generate Invoice'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoice;
