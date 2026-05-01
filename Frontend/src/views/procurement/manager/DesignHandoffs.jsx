import React from 'react';
import { Plus, UserPlus, X, Target, FileText, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';
import '../css/DesignHandoffs.css';

const DesignHandoffs = ({ 
    designHandoffs, 
    setSelectedRequest, 
    setShowAssignModal, 
    selectedReviewItem, 
    setSelectedReviewItem, 
    formatCurrency 
}) => {
    return (
        <div className="fade-in">
            <div className="section-card">
                <div className="section-header priority-header">
                    <h3><Plus size={18} color="#6366f1" /> Pushed Designs from Design Manager</h3>
                    <span className="badge badge-priority">Priority Action</span>
                </div>
                <div className="requests-list">
                    {designHandoffs.length > 0 ? designHandoffs.map(item => (
                        <div key={item._id} className={`request-item-premium ${item.type === 'Task' ? 'request-item-task' : 'request-item-mr'}`}>
                            <div className="request-info">
                                <div className="request-title-wrapper">
                                    <span className="request-title">{item.type === 'MaterialRequest' ? item.requestNumber : item.title}</span>
                                    <span className={`request-type-badge ${item.type === 'Task' ? 'task' : 'mr'}`}>
                                        {item.type === 'Task' ? 'DESIGN PUSHED (NO MR)' : 'MATERIAL REQUEST'}
                                    </span>
                                </div>
                                <div className="request-project-info">
                                    Project: <strong>{item.project?.name}</strong> • {item.type === 'MaterialRequest' ? `${item.items?.length || 0} items` : 'Needs Material Verification'}
                                </div>
                                {item.type === 'MaterialRequest' && item.approvedBudget > 0 && (
                                    <div style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '6px', fontWeight: 600 }}>
                                        Approved Budget Limit: {formatCurrency(item.approvedBudget)}
                                    </div>
                                )}
                                {item.type === 'MaterialRequest' && item.assignedTo && (
                                    <div style={{ fontSize: '0.85rem', color: '#4f46e5', marginTop: '4px', fontWeight: 600 }}>
                                        Auto-Assigned To: {item.assignedTo.fullName || 'Staff'}
                                    </div>
                                )}
                                <div className="request-design-note" style={{ marginTop: '6px' }}>
                                    <strong>Design Note:</strong> {item.type === 'MaterialRequest' ? (item.notes || 'Final design approved and pushed for procurement.') : (item.description || 'Pushed from design stage. Please check drawings and create material list.')}
                                </div>
                            </div>
                            <div className="request-actions-col">
                                <button 
                                    className="btn-assign-primary"
                                    onClick={() => {
                                        setSelectedRequest(item);
                                        setShowAssignModal(true);
                                    }}
                                >
                                    <UserPlus size={18} /> {item.type === 'Task' ? 'Assign Design Review' : 'Assign Immediately'}
                                </button>
                                <button 
                                    className="btn-review-outline"
                                    onClick={() => setSelectedReviewItem(item)}
                                >
                                    Review Project Details
                                </button>
                                {item.type === 'Task' && <span style={{ fontSize: '0.7rem', color: '#f59e0b', textAlign: 'center', fontWeight: 600 }}>Needs Material List</span>}
                            </div>
                        </div>
                    )) : (
                        <div className="empty-state">No design handoffs waiting for assignment</div>
                    )}
                </div>
            </div>

            {/* Review Handoff Modal */}
            {selectedReviewItem && (
                <div className="modal-backdrop-blur" onClick={() => setSelectedReviewItem(null)}>
                    <div className="modal-card-premium" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-round" onClick={() => setSelectedReviewItem(null)}><X size={20} /></button>
                        
                        <div style={{ marginBottom: '2rem' }}>
                            <div className="modal-project-badge">
                                <span className="modal-project-label">Project Review</span>
                                <span className="badge-lite" style={{ background: '#eef2ff', color: '#6366f1' }}>{selectedReviewItem.project?.projectNumber}</span>
                            </div>
                            <h2 className="modal-project-title">{selectedReviewItem.project?.name}</h2>
                            <p className="modal-project-client">Client: {selectedReviewItem.project?.client?.name}</p>
                        </div>

                        <div className="modal-grid-2col">
                            <div className="modal-info-box">
                                <h4 className="modal-info-title"><Target size={16} /> Status Info</h4>
                                <div className="modal-info-list">
                                    <div><span className="modal-info-label">Project Stage:</span> <strong className="modal-info-val-highlight">{selectedReviewItem.project?.stage}</strong></div>
                                    <div><span className="modal-info-label">Status:</span> <strong>{selectedReviewItem.project?.status}</strong></div>
                                    <div><span className="modal-info-label">Budget:</span> <strong>{formatCurrency(selectedReviewItem.project?.budget)}</strong></div>
                                </div>
                            </div>
                            <div className="modal-info-box">
                                <h4 className="modal-info-title"><FileText size={16} /> Handoff Details</h4>
                                <div className="modal-info-list">
                                    <div><span className="modal-info-label">Type:</span> <strong>{selectedReviewItem.type === 'Task' ? 'Design Push' : 'Material Request'}</strong></div>
                                    <div><span className="modal-info-label">Items:</span> <strong>{selectedReviewItem.items?.length || 0} items listed</strong></div>
                                    <div><span className="modal-info-label">Date:</span> <strong>{new Date(selectedReviewItem.createdAt).toLocaleDateString()}</strong></div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-notes-box">
                            <h4 className="modal-notes-title"><MessageSquare size={16} /> Designer's Notes</h4>
                            <p className="modal-notes-text">
                                {selectedReviewItem.type === 'Task' 
                                    ? (selectedReviewItem.description || "No specific notes provided for this design push.")
                                    : (selectedReviewItem.notes || "No specific notes provided for this material request.")
                                }
                            </p>
                        </div>

                        <div className="modal-actions-row">
                            <button 
                                className="btn-modal-assign"
                                onClick={() => {
                                    setSelectedRequest(selectedReviewItem);
                                    setSelectedReviewItem(null);
                                    setShowAssignModal(true);
                                }}
                            >
                                Assign Staff Now
                            </button>
                            <button 
                                className="btn-modal-close"
                                onClick={() => setSelectedReviewItem(null)}
                            >
                                Close Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesignHandoffs;
