import React from 'react';
import { Box, Package, Eye, ChevronRight, Briefcase, Tag } from 'lucide-react';
import '../css/ManagerDashboard.css';

const Inventory = ({ materialRequests, projects, onReviewRequest }) => {
    return (
        <div className="design-inventory">
            <div className="section-card">
                <div className="section-header">
                    <h3><Box size={18} /> Materials & Design Inventory</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {materialRequests?.filter(r => r.status === 'Pending').length} pending approval
                        </span>
                    </div>
                </div>
                <div className="grouped-requests" style={{ marginTop: '1.5rem' }}>
                    {projects.map(project => {
                        const projectRequests = materialRequests?.filter(r => 
                            (r.project?._id || r.project)?.toString() === project._id?.toString()
                        );
                        if (!projectRequests || projectRequests.length === 0) return null;

                        return (
                            <div key={project._id} className="project-request-group" style={{ marginBottom: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Briefcase size={16} color="#64748b" />
                                        <strong style={{ fontSize: '0.9rem' }}>{project.name}</strong>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{projectRequests.length} total requests</span>
                                </div>
                                <div style={{ padding: '0.5rem' }}>
                                    {projectRequests.map(req => (
                                        <div key={req._id} className="request-sub-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{req.requestNumber}</span>
                                                    <span className={`status-badge-mini ${req.status?.toLowerCase()}`}>{req.status}</span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                                                    {req.items?.length || 0} items requested · {req.requestedBy?.fullName || 'Staff'}
                                                </div>
                                            </div>
                                            <div className="request-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn-icon" onClick={() => onReviewRequest(req)} title="Review & Approve">
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    {materialRequests?.length === 0 && <div className="empty-state">No material requests found.</div>}
                </div>
            </div>
        </div>
    );
};

export default Inventory;
