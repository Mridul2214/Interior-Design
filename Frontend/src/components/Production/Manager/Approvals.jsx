import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, FileText, MessageSquare, ExternalLink, Plus, Filter, X } from 'lucide-react';
import '../css/ProductionManagement.css';
import { approvalAPI } from '../../../config/api';

const TYPE_LABELS = {
    'Material': 'Material Request',
    'Milestone': 'Milestone Review',
    'Vendor': 'Vendor Approval',
    'Design': 'Design Variance'
};

const Approvals = () => {
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [newRequest, setNewRequest] = useState({
        requestTitle: '',
        projectName: '',
        submittedBy: '',
        requestType: 'Material',
        value: ''
    });

    const fetchApprovals = async () => {
        try {
            setLoading(true);
            const res = await approvalAPI.getApprovals();
            if (res.success) {
                setApprovals(res.data);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    const filteredApprovals = approvals.filter(item => {
        if (filterStatus === 'all') return true;
        return item.status === filterStatus;
    });

    const pendingCount = approvals.filter(item => item.status === 'pending').length;

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...newRequest,
                value: newRequest.value ? Number(newRequest.value) : 0
            };
            const res = await approvalAPI.createApproval(dataToSubmit);
            if (res.success) {
                setIsModalOpen(false);
                setNewRequest({ requestTitle: '', projectName: '', submittedBy: '', requestType: 'Material', value: '' });
                fetchApprovals();
            } else {
                alert("Error: " + res.message);
            }
        } catch (err) {
            alert("Error creating request: " + err.message);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await approvalAPI.updateApproval(id, { status: newStatus });
            if (res.success) {
                fetchApprovals();
            } else {
                alert("Error updating status: " + res.message);
            }
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const formatCurrency = (value) => {
        if (!value) return null;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    };

    return (
        <div className="pm-dashboard">
            <div className="pm-welcome-header" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="pm-welcome-text">
                    <h1 style={{ fontSize: '1.5rem' }}>Approvals</h1>
                    <p className="pm-welcome-date">Review and authorize production requests</p>
                </div>
                <div style={{ zIndex: 1, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <Filter size={16} color="#64748b" />
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#334155', fontWeight: 500 }}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div className="pm-summary-pill" style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', fontWeight: 600 }}>
                        <span className="pm-pill-dot danger"></span>
                        {pendingCount} Pending
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="pm-quick-action-btn" style={{ padding: '0.5rem 1rem', flexDirection: 'row', gap: '0.5rem', background: '#3b82f6', color: 'white', borderColor: '#2563eb' }}>
                        <Plus size={16} /> New Request
                    </button>
                </div>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>{error}</div>}

            <div className="pm-card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading approvals...</div>
                ) : (
                    <table className="pm-table">
                        <thead>
                            <tr>
                                <th>Request Details</th>
                                <th>Project</th>
                                <th>Submitted By</th>
                                <th>Stage / Value</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApprovals.map(item => (
                                <tr key={item._id} className="pm-table-row">
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {item.requestType === 'Vendor' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>}
                                            {item.requestTitle}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} /> Submitted on {new Date(item.submittedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>{item.projectName}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div className="pm-team-avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                                                {item.submittedBy ? item.submittedBy.split(' ').map(n=>n[0]).join('').substring(0,2) : '?'}
                                            </div>
                                            <span style={{ fontSize: '0.85rem', color: '#334155' }}>{item.submittedBy}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="pm-status-badge planning" style={{ display: 'inline-block', marginBottom: '4px' }}>{TYPE_LABELS[item.requestType] || item.requestType}</span>
                                        {item.value > 0 && <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{formatCurrency(item.value)}</div>}
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
                                            background: item.status === 'approved' ? '#dcfce7' : item.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                            color: item.status === 'approved' ? '#16a34a' : item.status === 'rejected' ? '#ef4444' : '#d97706'
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button className="pm-icon-btn" title="View Details" style={{ color: '#3b82f6', background: '#eff6ff' }}>
                                                <ExternalLink size={16} />
                                            </button>
                                            {item.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleUpdateStatus(item._id, 'rejected')} className="pm-icon-btn" title="Reject" style={{ color: '#ef4444', background: '#fee2e2' }}>
                                                        <XCircle size={16} />
                                                    </button>
                                                    <button onClick={() => handleUpdateStatus(item._id, 'approved')} className="pm-icon-btn" title="Approve" style={{ color: '#10b981', background: '#dcfce7' }}>
                                                        <CheckCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredApprovals.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No approvals found for this filter.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Request Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Create Approval Request</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Request Title *</label>
                                <input required type="text" value={newRequest.requestTitle} onChange={e => setNewRequest({...newRequest, requestTitle: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Project Name *</label>
                                <input required type="text" value={newRequest.projectName} onChange={e => setNewRequest({...newRequest, projectName: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Submitted By *</label>
                                <input required type="text" value={newRequest.submittedBy} onChange={e => setNewRequest({...newRequest, submittedBy: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Request Type</label>
                                <select value={newRequest.requestType} onChange={e => setNewRequest({...newRequest, requestType: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}>
                                    <option value="Material">Material</option>
                                    <option value="Milestone">Milestone</option>
                                    <option value="Vendor">Vendor</option>
                                    <option value="Design">Design</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Value / Amount (Optional)</label>
                                <input type="number" min="0" value={newRequest.value} onChange={e => setNewRequest({...newRequest, value: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            
                            <button type="submit" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                                Submit Request
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Approvals;
