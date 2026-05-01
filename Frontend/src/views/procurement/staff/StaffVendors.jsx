import React from 'react';
import { Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaffVendors = ({ 
    vendors, 
    vendorSearch, 
    setVendorSearch, 
    setSelectedVendor, 
    fetchPurchaseHistory, 
    vendorPurchaseCounts 
}) => {
    const navigate = useNavigate();
    const searchLower = vendorSearch.toLowerCase();
    
    const filteredVendors = vendors.filter(v =>
        v.status === 'Active' &&
        (vendorSearch === '' ||
            v.name?.toLowerCase().includes(searchLower) ||
            v.category?.toLowerCase().includes(searchLower) ||
            v.phone?.includes(searchLower) ||
            v.address?.toLowerCase().includes(searchLower) ||
            v.location?.toLowerCase().includes(searchLower) ||
            v.products?.some(p => p.itemName?.toLowerCase().includes(searchLower)))
    );

    return (
        <div className="fade-in">
            <div className="section-card">
                <div className="section-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3><Users size={18} /> Verified Vendors</h3>
                    <div style={{ background: '#f1f5f9', borderRadius: '50px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '10px', width: '260px' }}>
                        <Search size={15} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            value={vendorSearch}
                            onChange={e => setVendorSearch(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%' }}
                        />
                    </div>
                </div>
                {filteredVendors.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                        {vendorSearch ? `No vendors matching "${vendorSearch}"` : 'No active vendors found.'}
                    </div>
                ) : (
                    <div className="vendors-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {filteredVendors.map(vendor => (
                            <div
                                key={vendor._id}
                                className="vendor-item"
                                style={{ background: 'white', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onClick={() => {
                                    setSelectedVendor(vendor);
                                    fetchPurchaseHistory(vendor._id);
                                    navigate('?tab=history');
                                }}
                            >
                                <div className="vendor-info">
                                    <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '4px' }}>{vendor.name}</strong>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{vendor.category || vendor.address || 'General Supplier'}</span>
                                </div>
                                {vendor.products?.length > 0 && (
                                    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {vendor.products.slice(0, 3).map((p, i) => (
                                            <span key={i} style={{ background: '#f0fdf4', color: '#10b981', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '50px' }}>
                                                {p.itemName} — ₹{p.unitPrice}/{p.unit}
                                            </span>
                                        ))}
                                        {vendor.products.length > 3 && <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>+{vendor.products.length - 3} more</span>}
                                    </div>
                                )}
                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6366f1' }}>{vendor.phone}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{vendorPurchaseCounts[vendor._id]?.totalPurchases || 0} Deals</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffVendors;
