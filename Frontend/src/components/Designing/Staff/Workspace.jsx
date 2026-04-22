import React from 'react';
import { Tag, Plus, Image, List, CheckCircle, Package, ArrowRight, MousePointer, Box } from 'lucide-react';
import '../css/StaffDashboard.css';

const Workspace = ({ inventory, taggedMaterials, onAddMaterialTag, materialRequests, selectedProject, onMarkProcurement }) => {
    return (
        <div className="view-workspace fade-in">
            <div className="workspace-main-layout">
                <div className="workspace-left">
                    <div className="content-card">
                        <div className="card-header" style={{ marginBottom: '1rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Tag size={20} color="#4f46e5" /> Tag Materials for Review</h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Select items from the catalog. Your manager will approve them before Procurement begins.</p>
                        </div>
                        <div className="materials-catalog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {inventory.slice(0, 12).map(item => (
                                <div key={item._id} className="inv-item-card" style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white', position: 'relative', cursor: 'pointer' }} onClick={() => onAddMaterialTag(item)}>
                                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                                        {item.imageUrl ? <img src={item.imageUrl} alt={item.itemName} style={{ maxWidth: '100%' }} /> : <Image size={32} color="#e2e8f0" />}
                                    </div>
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{item.itemName}</h4>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>₹{item.price} / {item.unit}</span>
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', width: '24px', height: '24px', background: '#f1f5f9', color: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Plus size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="content-card" style={{ marginTop: '2rem' }}>
                        <div className="card-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><List size={20} color="#8b5cf6" /> Tagged History</h3>
                        </div>
                        <div className="history-list-scroll" style={{ marginTop: '1rem' }}>
                            {materialRequests
                                .filter(r => (r.project?._id || r.project)?.toString() === (selectedProject?._id || selectedProject?.id)?.toString())
                                .map(req => (
                                <div key={req._id} className={`history-item-row ${req.status?.toLowerCase()}`} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <strong>{req.requestNumber}</strong>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{req.items?.length || 0} items — {new Date(req.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={`status-badge-mini ${req.status?.toLowerCase()}`} style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid currentColor' }}>{req.status}</span>
                                        {req.managerRemarks && <p style={{ fontSize: '0.7rem', color: '#dc2626', margin: '4px 0 0 0', fontStyle: 'italic' }}>"{req.managerRemarks}"</p>}
                                    </div>
                                </div>
                            ))}
                            {materialRequests.filter(r => (r.project?._id || r.project)?.toString() === (selectedProject?._id || selectedProject?.id)?.toString()).length === 0 && (
                                <div className="empty-state">No submission history for this project yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="workspace-right">
                    <aside className="tagged-bucket-panel" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', position: 'sticky', top: '1.5rem', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', pb: '1rem' }}>
                            <Box size={18} color="#4f46e5" /> Selected Materials
                        </h4>
                        <div className="tagged-list" style={{ minHeight: '300px' }}>
                            {taggedMaterials.map(m => (
                                <div key={m._id} className="tagged-item-mini" style={{ padding: '0.75rem', background: 'white', borderRadius: '12px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{m.itemName || m.name}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Qty: {m.quantity} {m.unit}</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#10b981' }}>₹{m.price * m.quantity}</div>
                                    </div>
                                </div>
                            ))}
                            {taggedMaterials.length === 0 && (
                                <div style={{ textAlign: 'center', paddingTop: '4rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    <MousePointer size={24} style={{ marginBottom: '10px', opacity: 0.3 }} />
                                    <p>Select materials from the left to start tagging.</p>
                                </div>
                            )}
                        </div>

                        <div className="bucket-footer" style={{ marginTop: '2rem', borderTop: '2px dashed #e2e8f0', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <span style={{ color: '#64748b', fontWeight: 600 }}>Total Count</span>
                                <strong style={{ color: '#0f172a' }}>{taggedMaterials.length} Items</strong>
                            </div>
                            <button 
                                className="btn-procure-submit" 
                                style={{ width: '100%', padding: '12px', background: taggedMaterials.length > 0 ? '#4f46e5' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: taggedMaterials.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                disabled={taggedMaterials.length === 0}
                                onClick={onMarkProcurement}
                            >
                                Submit Request <ArrowRight size={18} />
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Workspace;
