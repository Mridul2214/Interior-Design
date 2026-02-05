import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, CheckCircle, XCircle, Loader, FileText, Eye, Printer, X } from 'lucide-react';
import { quotationAPI } from '../../config/api';
import './css/Quotations.css';

const Quotations = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const response = await quotationAPI.getAll();
            if (response.success) {
                setQuotations(response.data);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching quotations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quotation?')) return;

        try {
            setSubmitting(true);
            const response = await quotationAPI.delete(id);
            if (response.success) {
                setQuotations(quotations.filter(q => q._id !== id));
            }
        } catch (err) {
            alert('Error deleting quotation: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            setSubmitting(true);
            const response = await quotationAPI.approve(id);
            if (response.success) {
                setQuotations(quotations.map(q => q._id === id ? { ...q, status: 'Approved' } : q));
            }
        } catch (err) {
            alert('Error approving quotation: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredQuotations = quotations.filter(q =>
        q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'status-approved';
            case 'pending': return 'status-pending';
            case 'rejected': return 'status-rejected';
            default: return 'status-default';
        }
    };

    return (
        <div className="quotations-wrapper">
            <div className="quotations-content">
                <div className="search-container">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search quotations by number, project or client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {error && <div className="error-banner">{error}</div>}

                {loading ? (
                    <div className="loading-state">
                        <Loader className="spinner" size={40} />
                        <p>Loading quotations...</p>
                    </div>
                ) : filteredQuotations.length === 0 ? (
                    <div className="quotations-card">
                        <div className="empty-state">
                            <FileText size={48} className="empty-icon" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3 className="empty-title">No quotations found</h3>
                            <p className="empty-subtitle">
                                {searchTerm ? 'No results match your search' : 'Your created quotations will appear here'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="quotations-table-container">
                        <table className="quotations-table">
                            <thead>
                                <tr>
                                    <th>Qtn No.</th>
                                    <th>Project Name</th>
                                    <th>Client</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQuotations.map((q) => (
                                    <tr key={q._id}>
                                        <td className="qtn-number">{q.quotationNumber}</td>
                                        <td>{q.projectName}</td>
                                        <td>{q.client?.name || 'N/A'}</td>
                                        <td>₹{q.totalAmount?.toLocaleString()}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(q.status)}`}>
                                                {q.status}
                                            </span>
                                        </td>
                                        <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                                        <td className="action-cells">
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => setSelectedBill(q)}
                                                    className="btn-icon view"
                                                    title="View Bill"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {q.status === 'Pending' && (
                                                    <button
                                                        onClick={() => handleApprove(q._id)}
                                                        className="btn-icon approve"
                                                        title="Approve"
                                                        disabled={submitting}
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                <Link to={`/quotations/edit/${q._id}`} className="btn-icon edit" title="Edit">
                                                    <Edit2 size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(q._id)}
                                                    className="btn-icon delete"
                                                    title="Delete"
                                                    disabled={submitting}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Premium Receipt Modal */}
            {selectedBill && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(12px)' }} onClick={() => setSelectedBill(null)}>
                    <div className="no-scroller" style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '2.5rem',
                        borderRadius: '24px',
                        maxWidth: '480px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        position: 'relative',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        animation: 'slideUpModal 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedBill(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem',
                                boxShadow: '0 8px 15px -3px rgba(37, 99, 235, 0.3)'
                            }}>
                                <CheckCircle size={32} color="white" />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Quotation Bill</h2>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem' }}>{selectedBill.quotationNumber} • {new Date(selectedBill.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Client</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{selectedBill.client?.name || 'N/A'}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Project</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2563eb' }}>{selectedBill.projectName}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>Itemized Summary</h3>
                            <div className="no-scroller" style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
                                {selectedBill.items?.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{item.itemName}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.quantity} {item.unit} x ₹{item.rate?.toLocaleString()}</div>
                                        </div>
                                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>₹{item.amount?.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ padding: '1.25rem', background: '#f1f5f9', borderRadius: '16px', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                                <span>Subtotal</span>
                                <span>₹{(selectedBill.totalAmount - (selectedBill.taxAmount || 0)).toLocaleString()}</span>
                            </div>
                            {selectedBill.taxAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                                    <span>GST ({selectedBill.taxRate}%)</span>
                                    <span>+ ₹{selectedBill.taxAmount?.toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #cbd5e1' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Grand Total</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563eb' }}>₹{selectedBill.totalAmount?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => window.print()} style={{ flex: 1, padding: '0.8rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                                <Printer size={18} /> Print Bill
                            </button>
                            <button onClick={() => setSelectedBill(null)} style={{ flex: 1, padding: '0.8rem', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quotations;

