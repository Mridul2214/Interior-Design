import React from 'react';
import { ClipboardCheck } from 'lucide-react';

const Assignments = ({ assignedRequests }) => {
    return (
        <div className="fade-in">
            <div className="section-card">
                <div className="section-header">
                    <h3><ClipboardCheck size={18} /> Active Assignments</h3>
                </div>
                <div className="assigned-list">
                    {assignedRequests.length > 0 ? assignedRequests.map(request => (
                        <div key={request._id} className="assigned-item-premium" style={{ padding: '1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div>
                                    <span style={{ fontWeight: 700 }}>{request.requestNumber}</span>
                                    <span style={{ marginLeft: '12px', color: '#64748b', fontSize: '0.9rem' }}>{request.project?.name}</span>
                                </div>
                                <span className={`status-pill ${request.status?.toLowerCase().replace(' ', '-')}`}>{request.status}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                    {request.assignedTo?.fullName?.charAt(0)}
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>
                                    <span style={{ color: '#64748b' }}>Assigned to:</span> <strong>{request.assignedTo?.fullName}</strong>
                                </div>
                                <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#64748b' }}>
                                    {request.items?.length || 0} items in pipeline
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="empty-state">No active assignments found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Assignments;
