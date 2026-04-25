import React, { useState, useEffect } from 'react';
import { 
    Tag, Package, Eye, Check, X, 
    ArrowRight, Clock, User, Briefcase,
    FileText, AlertCircle, CheckCircle, List
} from 'lucide-react';
import { projectAPI, procurementAPI, notificationAPI, staffAPI, BASE_IMAGE_URL } from '../../../config/api';
import '../css/Dashboard.css';

const MaterialReviewHub = ({ user }) => {
    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${BASE_IMAGE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };
    const [materialRequests, setMaterialRequests] = useState([]);
    const [projects, setProjects] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRemarks, setReviewRemarks] = useState('');

    const isManager = user?.role?.toLowerCase().includes('manager') || user?.role?.toLowerCase().includes('admin');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [matRes, projRes, staffRes] = await Promise.all([
                procurementAPI.getMaterialRequests({ limit: 100 }),
                projectAPI.getAll({ limit: 100 }),
                staffAPI.getAll()
            ]);

            if (matRes.success) setMaterialRequests(matRes.data);
            if (projRes.success) setProjects(projRes.data);
            if (staffRes.success) setStaffList(staffRes.data);
        } catch (err) {
            console.error('Failed to fetch review hub data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewRequest = async (status) => {
        if (!selectedRequest) return;
        try {
            const res = await procurementAPI.updateMaterialRequest(selectedRequest._id, {
                status,
                managerRemarks: reviewRemarks
            });

            if (res.success) {
                // Notify the Designer
                await notificationAPI.create({
                    title: `Material Request ${status}`,
                    description: `Your request ${selectedRequest.requestNumber} for "${selectedRequest.project?.name}" has been ${status}. ${reviewRemarks}`,
                    type: status === 'Approved' ? 'Success' : 'Error',
                    recipient: selectedRequest.requestedBy?._id || selectedRequest.requestedBy,
                    relatedModel: 'MaterialRequest',
                    relatedId: selectedRequest._id
                });

                setShowReviewModal(false);
                setSelectedRequest(null);
                setReviewRemarks('');
                fetchData();
            }
        } catch (err) {
            alert('Failed to review request: ' + err.message);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        return `₹${amount.toLocaleString()}`;
    };

    if (loading) return <div className="loading-state">Loading Review Hub...</div>;

    // Filter requests for staff to see only their own, or manager to see all
    const filteredRequests = isManager 
        ? materialRequests 
        : materialRequests.filter(r => (r.requestedBy?._id || r.requestedBy) === user?._id);

    return (
        <div className="review-hub-page">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div className="header-left">
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Package size={28} color="#4f46e5" /> 
                        Material Review Hub
                    </h1>
                    <p style={{ color: '#64748b' }}>
                        {isManager 
                            ? 'Approve or reject material requests from the design team' 
                            : 'Track the status of your material submissions'}
                    </p>
                </div>
                <div className="hub-stats" style={{ display: 'flex', gap: '1.5rem' }}>
                    <div className="hub-stat-item">
                        <strong>{filteredRequests.filter(r => r.status === 'Pending').length}</strong>
                        <span>Pending</span>
                    </div>
                    <div className="hub-stat-item">
                        <strong style={{ color: '#10b981' }}>{filteredRequests.filter(r => r.status === 'Approved').length}</strong>
                        <span>Approved</span>
                    </div>
                </div>
            </div>

            <div className="grouped-content">
                {(() => {
                    // Group requests by project
                    const groups = filteredRequests.reduce((acc, req) => {
                        const projectId = (req.project?._id || req.project || 'unassigned').toString();
                        if (!acc[projectId]) {
                            acc[projectId] = {
                                project: req.project && typeof req.project === 'object' ? req.project : projects.find(p => p._id === projectId),
                                requests: []
                            };
                        }
                        acc[projectId].requests.push(req);
                        return acc;
                    }, {});

                    return Object.entries(groups).map(([projectId, group]) => {
                        const project = group.project;
                        const projectName = project?.name || 'Unknown Project';
                        const projectRequests = group.requests;

                        return (
                            <div key={projectId} className="project-review-group" style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '2rem', overflow: 'hidden' }}>
                                <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: '#eef2ff', padding: '8px', borderRadius: '8px' }}>
                                            <Briefcase size={18} color="#4f46e5" />
                                        </div>
                                        <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>{projectName}</strong>
                                    </div>
                                    <span className="badge-outline">{projectRequests.length} Requests</span>
                                </div>
                                
                                <div className="requests-table-container">
                                    <table className="requests-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#fcfcfc', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                                                <th style={{ padding: '1rem 1.5rem' }}>Request ID</th>
                                                <th style={{ padding: '1rem 1.5rem' }}>Designer</th>
                                                <th style={{ padding: '1rem 1.5rem' }}>Items</th>
                                                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                                                <th style={{ padding: '1rem 1.5rem' }}>Created</th>
                                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {projectRequests.map(req => (
                                                <tr key={req._id} style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s' }}>
                                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#4f46e5' }}>{req.requestNumber}</td>
                                                    <td style={{ padding: '1rem 1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ background: '#f1f5f9', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', overflow: 'hidden' }}>
                                                                {req.requestedBy?.avatar ? <img src={getImageUrl(req.requestedBy.avatar)} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : (req.requestedBy?.fullName?.[0] || 'S')}
                                                            </div>
                                                            <span style={{ fontSize: '0.85rem' }}>{req.requestedBy?.fullName || 'Staff'}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem' }}>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{req.items?.length || 0} materials</span>
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem' }}>
                                                        <span className={`status-pill ${req.status.toLowerCase()}`}>{req.status}</span>
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                                                        {new Date(req.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                        <button 
                                                            className="btn-icon" 
                                                            onClick={() => { setSelectedRequest(req); setShowReviewModal(true); }}
                                                            style={{ background: '#f8fafc' }}
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    });
                })()}
            </div>

            {/* ── Modal for Details & Review ── */}
            {showReviewModal && selectedRequest && (
                <div className="modal-overlay">
                    <div className="modal-content-styled" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <div>
                                <h3>Material Request Review</h3>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ID: {selectedRequest.requestNumber}</p>
                            </div>
                            <button className="close-btn" onClick={() => setShowReviewModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                            <div className="review-items-list" style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <List size={16} /> Requested Materials
                                </h4>
                                <div className="items-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {selectedRequest.items?.map((item, idx) => (
                                        <div key={idx} style={{ background: item.isExtra ? '#f0fdf4' : '#fcfcfc', border: item.isExtra ? '1px solid #bbf7d0' : '1px solid #f1f5f9', padding: '1rem', borderRadius: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <strong style={{ fontSize: '0.9rem' }}>{item.itemName}</strong>
                                                    {item.isExtra && <span style={{ background: '#10b981', color: 'white', padding: '1px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800 }}>EXTRA ITEM</span>}
                                                </div>
                                                <span style={{ background: '#4f46e5', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>× {item.quantity} {item.unit || 'pieces'}</span>
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}><strong>Specs:</strong> {item.specifications || 'N/A'}</p>
                                            {item.isExtra && item.reasonForExtra && (
                                                <p style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '6px', background: '#fee2e2', padding: '6px', borderRadius: '6px' }}>
                                                    <strong>Reason for Extra:</strong> {item.reasonForExtra}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Remarks History or Entry */}
                            <div className="review-remarks-section" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                                {isManager ? (
                                    <>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Review Feedback / Remarks</label>
                                        <textarea 
                                            className="modal-textarea"
                                            value={reviewRemarks}
                                            onChange={e => setReviewRemarks(e.target.value)}
                                            placeholder="Write your approval notes or reasons for rejection..."
                                            style={{ width: '100%', minHeight: '100px', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                        />
                                    </>
                                ) : (
                                    selectedRequest.managerRemarks && (
                                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <strong style={{ fontSize: '0.85rem', color: '#64748b' }}>Manager Feedback:</strong>
                                            <p style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#1e293b' }}>"{selectedRequest.managerRemarks}"</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                        {isManager && selectedRequest.status === 'Pending' && (
                            <div className="modal-footer" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button 
                                    className="action-btn" 
                                    style={{ borderColor: '#ef4444', color: '#ef4444' }} 
                                    onClick={() => handleReviewRequest('Rejected')}
                                    disabled={!reviewRemarks}
                                >
                                    <X size={16} /> Disapprove & Send Back
                                </button>
                                <button 
                                    className="action-btn primary" 
                                    onClick={() => handleReviewRequest('Approved')}
                                >
                                    <Check size={16} /> Approve & Forward
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialReviewHub;
