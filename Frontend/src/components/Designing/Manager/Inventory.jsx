import React from 'react';
import { 
    Box, 
    Package, 
    Eye, 
    Briefcase, 
    Layers,
    ArrowRight,
    Search
} from 'lucide-react';
import '../css/DesignStudio.css';

const Inventory = ({ materialRequests, projects, onReviewRequest }) => {
    return (
        <div className="design-studio-container fade-in">
            {/* Studio Header */}
            <header className="editorial-header">
                <div>
                    <div className="editorial-date">Studio Library // Technical Specs</div>
                    <h1>THE <span>SPEC</span> LOG</h1>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ background: '#eee', padding: '10px 20px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Search size={16} />
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Find Specification...</span>
                    </div>
                </div>
            </header>

            <div className="studio-grid" style={{ gridTemplateColumns: '1fr', gap: '4rem' }}>
                <div className="spec-log-main">
                    {projects.map((project, pIdx) => {
                        const projectRequests = materialRequests?.filter(r => 
                            (r.project?._id || r.project)?.toString() === project._id?.toString()
                        );
                        if (!projectRequests || projectRequests.length === 0) return null;

                        return (
                            <div key={project._id} style={{ marginBottom: '5rem' }}>
                                <div style={{ borderBottom: '2px solid #1a1a1a', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#c4a484', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>PROJECT 0{pIdx + 1}</div>
                                        <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>{project.name}</h2>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#888' }}>{projectRequests.length} SPECIFICATIONS</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
                                    {projectRequests.map((req, rIdx) => (
                                        <div key={req._id} style={{ border: '1px solid #eee', padding: '2rem', background: '#fff', position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#aaa', letterSpacing: '1px' }}>ID: {req.requestNumber}</div>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '5px' }}>Material List</div>
                                                </div>
                                                <div style={{ 
                                                    fontSize: '0.65rem', 
                                                    fontWeight: 900, 
                                                    background: req.status === 'Design Review' ? '#1a1a1a' : '#eee', 
                                                    color: req.status === 'Design Review' ? '#fff' : '#666',
                                                    padding: '4px 10px',
                                                    borderRadius: '2px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {req.status}
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '2rem', fontSize: '0.85rem', color: '#666', lineHeight: 1.6 }}>
                                                {req.items?.length || 0} unique material items specified for final procurement phase.
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f9f9f9', paddingTop: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                                                        {req.requestedBy?.fullName?.charAt(0) || 'D'}
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888' }}>Spec by {req.requestedBy?.fullName || 'Senior Designer'}</span>
                                                </div>
                                                <button 
                                                    onClick={() => onReviewRequest(req)}
                                                    style={{ background: 'transparent', border: '1px solid #1a1a1a', padding: '8px 20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                >
                                                    REVIEW SPECS <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {(!materialRequests || materialRequests.length === 0) && (
                        <div style={{ padding: '10rem 0', textAlign: 'center' }}>
                            <Box size={48} color="#eee" style={{ marginBottom: '2rem' }} />
                            <h2 style={{ fontWeight: 300, color: '#ccc' }}>No material specifications are currently pending review.</h2>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Inventory;
