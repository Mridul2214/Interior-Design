import React from 'react';
import { Package, UserPlus } from 'lucide-react';

const MaterialRequests = ({ pendingRequests, setSelectedRequest, setShowAssignModal }) => {
    return (
        <div className="fade-in">
            <div className="section-card">
                <div className="section-header">
                    <h3><Package size={18} /> Requests from Design Team</h3>
                    <span className="badge">New</span>
                </div>
                <div className="requests-list">
                    {pendingRequests.length > 0 ? pendingRequests.map(request => (
                        <div key={request._id} className="request-item-premium" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', marginBottom: '1rem', border: '1px solid #f1f5f9' }}>
                            <div className="request-info">
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>{request.requestNumber}</span>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                                    Project: <strong>{request.project?.name}</strong> • {request.items?.length || 0} items
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <span className={`priority-badge ${request.priority?.toLowerCase()}`}>{request.priority} Priority</span>
                                    <span className="badge-outline">{request.project?.stage} Stage</span>
                                </div>
                            </div>
                            <div className="request-actions">
                                <button 
                                    className="btn-assign-staff"
                                    onClick={() => {
                                        setSelectedRequest(request);
                                        setShowAssignModal(true);
                                    }}
                                    style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                >
                                    <UserPlus size={18} /> Assign Staff
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="empty-state">No requests currently pending assignment</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaterialRequests;
