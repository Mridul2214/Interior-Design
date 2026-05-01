import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, FileText, MessageSquare, ExternalLink, Plus, Filter, X, Users, UserX, ChevronDown } from 'lucide-react';
import '../css/ProductionManagement.css';
import { approvalAPI, productionAPI } from '../../../config/api';
import LeaveApprovals from '../Shared/LeaveApprovals';
import CustomSelect from '../../common/CustomSelect';

const TYPE_LABELS = {
    'Material': 'Material Request',
    'Milestone': 'Milestone Review',
    'Vendor': 'Vendor Approval',
    'Design': 'Design Variance'
};

const Approvals = () => {
    const [approvals, setApprovals] = useState([]);
    const [staffRequests, setStaffRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('general'); // 'general' or 'staff'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    
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
            const [genRes, staffRes] = await Promise.all([
                approvalAPI.getApprovals(),
                productionAPI.getReplacementRequests()
            ]);
            
            if (genRes.success) setApprovals(genRes.data);
            if (staffRes.success) setStaffRequests(staffRes.data);
            
            if (!genRes.success && !staffRes.success) {
                setError("Failed to fetch data");
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

    const filteredApprovals = (activeTab === 'general' ? approvals : staffRequests).filter(item => {
        if (filterStatus === 'all') return true;
        // Normalize casing for comparison
        return item.status.toLowerCase() === filterStatus.toLowerCase();
    });

    const pendingCount = (activeTab === 'general' ? approvals : staffRequests).filter(item => item.status.toLowerCase() === 'pending').length;

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

    const handleActionStaffRequest = async (id, status) => {
        const remarks = prompt("Enter remarks (optional):");
        try {
            const res = await productionAPI.actionReplacementRequest(id, { status, adminRemarks: remarks });
            if (res.success) {
                fetchStaffRequests(); // Wait, I should just use fetchApprovals()
                fetchApprovals();
            } else {
                alert("Error: " + res.message);
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
            {/* Toolbar */}
            <div style={{ padding: '0 1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                        onClick={() => setFiltersOpen(o => !o)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                            background: filtersOpen ? '#0f172a' : 'white',
                            color: filtersOpen ? 'white' : '#334155',
                            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Filter size={15} />
                        Filters
                        {filterStatus !== 'all' && (
                            <span style={{ background: '#3b82f6', color: 'white', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', marginLeft: '2px' }}>1</span>
                        )}
                        <ChevronDown size={14} style={{ transition: 'transform 0.2s ease', transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </button>
                    {filterStatus !== 'all' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '99px', fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 600 }}>
                            {filterStatus}
                            <button onClick={() => setFilterStatus('all')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#3b82f6' }}><X size={12} /></button>
                        </div>
                    )}
                </div>
                {activeTab === 'general' && (
                    <button onClick={() => setIsModalOpen(true)} className="pm-quick-action-btn">
                        <Plus size={15} /> New Request
                    </button>
                )}
            </div>

            {/* Collapsible Filter Panel */}
            <div style={{ overflow: 'hidden', maxHeight: filtersOpen ? '120px' : '0', transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)', marginBottom: filtersOpen ? '1rem' : '0' }}>
                <div style={{ margin: '0 1.5rem', padding: '1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>Status:</span>
                        {['all', 'Pending', 'Approved', 'Rejected'].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)} style={{
                                padding: '4px 14px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                border: '1px solid', transition: 'all 0.15s ease',
                                background: filterStatus === s ? '#0f172a' : 'white',
                                color: filterStatus === s ? 'white' : '#475569',
                                borderColor: filterStatus === s ? '#0f172a' : '#e2e8f0'
                            }}>
                                {s === 'all' ? 'All Statuses' : s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', padding: '0 1.5rem' }}>
                <button 
                    onClick={() => setActiveTab('general')}
                    style={{
                        padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer',
                        background: activeTab === 'general' ? '#0f172a' : 'white',
                        color: activeTab === 'general' ? 'white' : '#64748b',
                        display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                >
                    <FileText size={18} /> General Approvals
                </button>
                <button 
                    onClick={() => setActiveTab('staff')}
                    style={{
                        padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer',
                        background: activeTab === 'staff' ? '#0f172a' : 'white',
                        color: activeTab === 'staff' ? 'white' : '#64748b',
                        display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                >
                    <Users size={18} /> Staff Replacements
                </button>
                <button 
                    onClick={() => setActiveTab('leaves')}
                    style={{
                        padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer',
                        background: activeTab === 'leaves' ? '#0f172a' : 'white',
                        color: activeTab === 'leaves' ? 'white' : '#64748b',
                        display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                >
                    <Clock size={18} /> Team Leaves
                </button>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>{error}</div>}

            <div className={activeTab !== 'leaves' ? "pm-card" : ""} style={{ padding: activeTab === 'leaves' ? 0 : undefined, overflow: 'hidden' }}>
                {loading && activeTab !== 'leaves' ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading...</div>
                ) : activeTab === 'general' ? (
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
                                            background: item.status.toLowerCase() === 'approved' ? '#dcfce7' : item.status.toLowerCase() === 'rejected' ? '#fee2e2' : '#fef3c7',
                                            color: item.status.toLowerCase() === 'approved' ? '#16a34a' : item.status.toLowerCase() === 'rejected' ? '#ef4444' : '#d97706'
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button className="pm-icon-btn" title="View Details" style={{ color: '#3b82f6', background: '#eff6ff' }}>
                                                <ExternalLink size={16} />
                                            </button>
                                            {item.status.toLowerCase() === 'pending' && (
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
                        </tbody>
                    </table>
                ) : activeTab === 'staff' ? (
                    <table className="pm-table">
                        <thead>
                            <tr>
                                <th>Replacement For</th>
                                <th>Project</th>
                                <th>Reason</th>
                                <th>Requested By</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApprovals.map(item => (
                                <tr key={item._id} className="pm-table-row">
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <UserX size={16} color="#ef4444" />
                                            {item.currentStaffId?.fullName}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Role: {item.staffType}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>{item.projectId?.projectName}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', color: '#475569', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.reason}>
                                            {item.reason}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', color: '#334155' }}>{item.requestedBy?.fullName}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(item.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
                                            background: item.status.toLowerCase() === 'approved' ? '#dcfce7' : item.status.toLowerCase() === 'rejected' ? '#fee2e2' : '#fef3c7',
                                            color: item.status.toLowerCase() === 'approved' ? '#16a34a' : item.status.toLowerCase() === 'rejected' ? '#ef4444' : '#d97706'
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            {item.status.toLowerCase() === 'pending' && (
                                                <>
                                                    <button onClick={() => handleActionStaffRequest(item._id, 'Rejected')} className="pm-icon-btn" title="Reject" style={{ color: '#ef4444', background: '#fee2e2' }}>
                                                        <XCircle size={16} />
                                                    </button>
                                                    <button onClick={() => handleActionStaffRequest(item._id, 'Approved')} className="pm-icon-btn" title="Approve" style={{ color: '#10b981', background: '#dcfce7' }}>
                                                        <CheckCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : activeTab === 'leaves' ? (
                    <div style={{ padding: '0 1.5rem' }}>
                        <LeaveApprovals />
                    </div>
                ) : null}
                
                {activeTab !== 'leaves' && filteredApprovals.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No requests found for this filter.</div>
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
