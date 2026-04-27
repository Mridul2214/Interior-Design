import React from 'react';
import { Search, History, Filter } from 'lucide-react';

const StaffHistory = ({ 
    searchQuery, 
    setSearchQuery, 
    handleSearch, 
    vendorStats, 
    formatCurrency, 
    handleComparePrices, 
    itemsToBuy 
}) => {
    return (
        <div className="fade-in">
            <div className="search-section" style={{ marginBottom: '1.5rem' }}>
                <div className="search-input-group" style={{ display: 'flex', gap: '0.5rem', background: 'white', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Search size={18} />
                    <input
                        style={{ flex: 1, border: 'none', outline: 'none' }}
                        type="text"
                        placeholder="Search products in vendor history..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="btn-search" style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }} onClick={handleSearch}>Search</button>
                </div>
            </div>
            <div className="section-card">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3><History size={18} /> Purchase History</h3>
                    <button 
                        className="btn-compare"
                        style={{ padding: '8px 16px', background: '#e0e7ff', color: '#6366f1', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={handleComparePrices}
                        disabled={itemsToBuy.length === 0}
                    >
                        <Filter size={14} /> Compare Market Prices
                    </button>
                </div>
                <div className="vendor-history-list">
                    {vendorStats.length > 0 ? (
                        vendorStats.map(v => (
                            <div key={v.vendor?._id || Math.random()} className="vendor-history-item" style={{ border: '1px solid #f1f5f9', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
                                <div className="vendor-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="vendor-name" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{v.vendor?.name}</span>
                                    <span className="vendor-code" style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>{v.vendor?.vendorCode}</span>
                                </div>
                                <div className="vendor-details" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', margin: '1rem 0' }}>
                                    <div className="detail-row" style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="label" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Orders</span>
                                        <span className="value" style={{ fontWeight: 700 }}>{v.totalPurchases}</span>
                                    </div>
                                    <div className="detail-row" style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="label" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Spent</span>
                                        <span className="value" style={{ fontWeight: 700 }}>{formatCurrency(v.totalAmount)}</span>
                                    </div>
                                    <div className="detail-row" style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="label" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Saved</span>
                                        <span className="value discount" style={{ fontWeight: 700, color: '#10b981' }}>{formatCurrency(v.totalDiscount)}</span>
                                    </div>
                                </div>
                                <div className="vendor-items">
                                    <span className="items-title" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Commonly Purchased Items</span>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        {Object.entries(v.items).slice(0, 3).map(([itemName, data]) => (
                                            <div key={itemName} className="item-row" style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', marginTop: '6px' }}>
                                                <span className="item-name">{itemName}</span>
                                                <span className="item-qty">x{data.quantity}</span>
                                                <span className="item-amount" style={{ fontWeight: 600 }}>{formatCurrency(data.totalAmount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">No purchase history found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffHistory;
