import React from 'react';
import { CheckCircle, XCircle, Clock, FileText, MessageSquare, ExternalLink } from 'lucide-react';
import '../css/ProductionManagement.css';

const MOCK_APPROVALS = [
    { id: 'APP-001', title: 'Material Requisition: Electrical Wiring', project: 'Office Interior - HITEC City', submittedBy: 'Priya M.', date: '2026-04-25', stage: 'Material Request', amount: '₹1,45,000', priority: 'High' },
    { id: 'APP-002', title: 'Site Milestone: Wall Demolition Complete', project: 'Villa Renovation - Jubilee Hills', submittedBy: 'Rahul K.', date: '2026-04-26', stage: 'Milestone Review', amount: null, priority: 'Medium' },
    { id: 'APP-003', title: 'Vendor Quotation: Italian Marble', project: 'Penthouse - Manikonda', submittedBy: 'Vikram S.', date: '2026-04-26', stage: 'Vendor Approval', amount: '₹4,50,000', priority: 'Urgent' },
    { id: 'APP-004', title: 'Design Change: Kitchen Layout', project: 'Apartment Interiors - Kondapur', submittedBy: 'Anita R.', date: '2026-04-27', stage: 'Design Variance', amount: null, priority: 'Medium' }
];

const Approvals = () => {
    return (
        <div className="pm-dashboard">
            <div className="pm-welcome-header" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                <div className="pm-welcome-text">
                    <h1 style={{ fontSize: '1.5rem' }}>Pending Approvals</h1>
                    <p className="pm-welcome-date">Review and authorize production requests</p>
                </div>
                <div style={{ zIndex: 1 }}>
                    <div className="pm-summary-pill" style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>
                        <span className="pm-pill-dot danger"></span>
                        {MOCK_APPROVALS.length} Pending
                    </div>
                </div>
            </div>

            <div className="pm-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="pm-table">
                    <thead>
                        <tr>
                            <th>Request Details</th>
                            <th>Project</th>
                            <th>Submitted By</th>
                            <th>Stage / Value</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_APPROVALS.map(item => (
                            <tr key={item.id} className="pm-table-row">
                                <td>
                                    <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {item.priority === 'Urgent' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>}
                                        {item.title}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} /> Submitted on {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>{item.project}</div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div className="pm-team-avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                                            {item.submittedBy.split(' ').map(n=>n[0]).join('')}
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: '#334155' }}>{item.submittedBy}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="pm-status-badge planning" style={{ display: 'inline-block', marginBottom: '4px' }}>{item.stage}</span>
                                    {item.amount && <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{item.amount}</div>}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button className="pm-icon-btn" title="View Details" style={{ color: '#3b82f6', background: '#eff6ff' }}>
                                            <ExternalLink size={16} />
                                        </button>
                                        <button className="pm-icon-btn" title="Reject" style={{ color: '#ef4444', background: '#fee2e2' }}>
                                            <XCircle size={16} />
                                        </button>
                                        <button className="pm-icon-btn" title="Approve" style={{ color: '#10b981', background: '#dcfce7' }}>
                                            <CheckCircle size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Approvals;
