import React from 'react';
import { FileText, Eye, Check, X, Send } from 'lucide-react';
import '../css/ManagerDashboard.css';

const Quotations = ({ quotations, formatCurrency }) => {
    return (
        <div className="design-quotations">
            <div className="section-card">
                <div className="section-header">
                    <h3><FileText size={18} /> Approved Project Quotations</h3>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '-0.5rem 0 1rem 0' }}>
                    These are quotations approved by Super Admin. You can view the full details to prepare tasks for your staff.
                </p>
                <div className="quotations-list review-mode" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1rem' }}>
                    {quotations.length > 0 ? quotations.map(quote => (
                        <div key={quote._id} className="quotation-item" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="quote-info">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem' }}>
                                    <span className="quote-number" style={{ fontWeight: 700, color: '#4f46e5' }}>{quote.quotationNumber}</span>
                                    <span className="status-badge-inline approved" style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: '#dcfce7', color: '#10b981', fontWeight: 700 }}>
                                        {quote.status}
                                    </span>
                                </div>
                                <span className="quote-project" style={{ display: 'block', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{quote.projectName}</span>
                                <span className="quote-client" style={{ fontSize: '0.75rem', color: '#64748b' }}>Client: {quote.client?.name || 'Loading...'}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="quote-amount" style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.75rem', color: '#0f172a' }}>{formatCurrency(quote.totalAmount)}</div>
                                <div className="quote-actions">
                                    <button className="btn-icon" onClick={() => window.open(`/quotations/view/${quote._id}`, '_blank')} title="View Full Details">
                                        <Eye size={20} /> View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', width: '100%', gridColumn: 'span 2' }}>
                            No approved quotations found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Quotations;
