import React from 'react';
import { FileText, Eye, Check, X, Send } from 'lucide-react';
import '../css/ManagerDashboard.css';

const Quotations = ({ quotations, formatCurrency }) => {
    return (
        <div className="design-quotations fade-in">
            <div className="pipeline-section-header" style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', width: '45px', height: '45px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.3)' }}>
                        <FileText size={24} />
                    </div>
                    Approved Design Blueprints
                </h2>
                <p style={{ color: '#64748b', marginTop: '0.6rem', marginLeft: '57px', fontSize: '1rem' }}>
                    Access full project briefs and financial breakdowns for projects approved for design development.
                </p>
            </div>

            <div className="quotations-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {quotations.length > 0 ? quotations.map(quote => (
                    <div key={quote._id} className="card-premium" style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', padding: '1.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle at top right, rgba(79, 70, 229, 0.03), transparent)', pointerEvents: 'none' }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                            <div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '1px' }}>{quote.quotationNumber}</span>
                                <h4 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{quote.projectName}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#64748b' }}>
                                        {quote.client?.name?.charAt(0) || 'C'}
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{quote.client?.name || 'Private Client'}</span>
                                </div>
                            </div>
                            <div className="badge-lite" style={{ background: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' }}>{quote.status}</div>
                        </div>

                        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Project Value</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{formatCurrency(quote.totalAmount)}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                className="btn-assign-staff" 
                                onClick={() => window.open(`/quotations/view/${quote._id}`, '_blank')}
                                style={{ flex: 1, background: '#4f46e5', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)' }}
                            >
                                <Eye size={18} /> View Blueprint
                            </button>
                            <button 
                                className="btn-action-round"
                                style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <Send size={18} color="#64748b" />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                        <div style={{ width: '64px', height: '64px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            <FileText size={32} color="#cbd5e1" />
                        </div>
                        <h3 style={{ color: '#64748b', fontWeight: 700 }}>No approved quotations found</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>When the Super Admin approves project quotations, they will appear here for you to begin design work.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quotations;
