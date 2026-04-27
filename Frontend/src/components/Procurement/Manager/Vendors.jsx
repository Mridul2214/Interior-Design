import React from 'react';
import { Users, Plus } from 'lucide-react';

const Vendors = ({ vendors, setShowAddVendorModal, handleViewVendorDetails }) => {
    return (
        <div className="fade-in">
            <div className="section-card">
                <div className="section-header">
                    <h3><Users size={18} /> Verified Vendor Network</h3>
                    <button className="btn-add-vendor" onClick={() => setShowAddVendorModal(true)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={14} /> Add Vendor</button>
                </div>
                <div className="vendors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {vendors.map(vendor => (
                        <div key={vendor._id} className="vendor-card-premium" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div className="vendor-icon-box" style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f0f9ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Users size={24} />
                                </div>
                                <span className={`status-badge ${vendor.status?.toLowerCase()}`} style={{ height: 'fit-content' }}>{vendor.status}</span>
                            </div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{vendor.name}</h4>
                            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>{vendor.vendorCode} • {vendor.category || 'General Supplier'}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                <div style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: 700 }}>
                                    {'★'.repeat(Math.floor(vendor.rating || 0))}
                                    <span style={{ color: '#cbd5e1' }}>{'★'.repeat(5 - Math.floor(vendor.rating || 0))}</span>
                                </div>
                                <button onClick={() => handleViewVendorDetails(vendor)} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>View Details</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Vendors;
