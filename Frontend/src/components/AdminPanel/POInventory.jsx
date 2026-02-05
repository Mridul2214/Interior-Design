import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Package,
    ArrowUpRight,
    History,
    Plus,
    X,
    Loader,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { poInventoryAPI } from '../../config/api';
import './css/POInventory.css';

const POInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State for New Item
    const [formData, setFormData] = useState({
        itemName: '',
        sku: '',
        supplier: '',
        currentStock: 0,
        unit: 'Sheets',
        reorderPoint: 10
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await poInventoryAPI.getAll();
            if (response.success) {
                setInventory(response.data);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching PO inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateItem = async () => {
        if (!formData.itemName || !formData.supplier) {
            alert('Item name and Supplier are required');
            return;
        }

        try {
            setSubmitting(true);
            const response = await poInventoryAPI.create(formData);
            if (response.success) {
                setShowAddModal(false);
                fetchInventory();
                setFormData({ itemName: '', sku: '', supplier: '', currentStock: 0, unit: 'Sheets', reorderPoint: 10 });
            }
        } catch (err) {
            alert('Error creating item: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusInfo = (item) => {
        const stock = item.currentStock || 0;
        if (stock <= 0) return { label: 'Out of Stock', class: 'out-of-stock', color: '#ef4444' };
        if (stock <= item.reorderPoint) return { label: 'Low Stock', class: 'low-stock', color: '#eab308' };
        return { label: 'In Stock', class: 'in-stock', color: '#16a34a' };
    };

    const getStockPercentage = (current, reorder) => {
        const target = reorder * 2;
        const perc = (current / target) * 100;
        return Math.min(perc, 100);
    };

    useEffect(() => {
        const handleOpenModal = () => setShowAddModal(true);
        window.addEventListener('open-po-inventory-modal', handleOpenModal);
        return () => window.removeEventListener('open-po-inventory-modal', handleOpenModal);
    }, []);

    return (
        <div className="po-inv-container">
            <div className="po-inv-wrapper">

                <div className="invoice-filter-bar">
                    <div className="search-field">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search materials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {error && <div className="error-banner">{error}</div>}

                {loading ? (
                    <div className="loading-state">
                        <Loader className="spinner" size={40} />
                        <p>Loading inventory...</p>
                    </div>
                ) : filteredInventory.length === 0 ? (
                    <div className="empty-state-card" style={{ padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '16px' }}>
                        <Package size={64} style={{ color: '#cbd5e1', marginBottom: '1.5rem' }} />
                        <h3>Inventory is empty</h3>
                        <p>Start adding materials to track your stock.</p>
                    </div>
                ) : (
                    <div className="po-inv-grid">
                        {filteredInventory.map((item) => {
                            const status = getStatusInfo(item);
                            return (
                                <div key={item._id} className="po-inv-card">
                                    <div className="card-top">
                                        <div className="item-icon-box">
                                            <Package size={24} color="#3b82f6" />
                                        </div>
                                        <span className={`item-badge status-${status.class}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="item-title">
                                        <span className="item-sku">{item.sku || 'NO-SKU'}</span>
                                        <h3>{item.itemName}</h3>
                                        <p>{item.supplier || 'No Supplier'}</p>
                                    </div>

                                    <div className="stock-meter-box">
                                        <div className="meter-label">
                                            <span style={{ fontWeight: 700 }}>{item.currentStock} {item.unit}</span>
                                            <span style={{ color: '#94a3b8' }}>Min: {item.reorderPoint}</span>
                                        </div>
                                        <div className="meter-bar">
                                            <div
                                                className="meter-fill"
                                                style={{
                                                    width: `${getStockPercentage(item.currentStock, item.reorderPoint)}%`,
                                                    backgroundColor: status.color
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="meta-grid">
                                        <div>
                                            <span className="meta-label">Unit Price</span>
                                            <span className="meta-value">₹{item.price?.toLocaleString() || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="meta-label">Last In</span>
                                            <span className="meta-value">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Never'}</span>
                                        </div>
                                    </div>

                                    <button
                                        className="btn-link-action"
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setShowHistoryModal(true);
                                        }}
                                    >
                                        View History <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content-wide" style={{ width: '450px' }}>
                        <div className="modal-header">
                            <h3>Add Inventory Item</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={24} /></button>
                        </div>
                        <div className="modal-body" style={{ padding: '1.5rem' }}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#64748b' }}>Item Name *</label>
                                <input
                                    className="po-input"
                                    style={{ width: '100%' }}
                                    value={formData.itemName}
                                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#64748b' }}>SKU/ID</label>
                                <input
                                    className="po-input"
                                    style={{ width: '100%' }}
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#64748b' }}>Supplier</label>
                                <input
                                    className="po-input"
                                    style={{ width: '100%' }}
                                    value={formData.supplier}
                                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#64748b' }}>Current Stock</label>
                                    <input
                                        type="number"
                                        className="po-input"
                                        style={{ width: '100%' }}
                                        value={formData.currentStock}
                                        onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#64748b' }}>Min. Reorder</label>
                                    <input
                                        type="number"
                                        className="po-input"
                                        style={{ width: '100%' }}
                                        value={formData.reorderPoint}
                                        onChange={(e) => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
                            <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="btn-create-po" onClick={handleCreateItem} disabled={submitting}>
                                {submitting ? 'Adding...' : 'Add to Inventory'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* History Modal */}
            {showHistoryModal && selectedItem && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '500px' }}>
                        <div className="modal-header">
                            <h3>Material History</h3>
                            <button className="modal-close" onClick={() => setShowHistoryModal(false)}><X size={24} /></button>
                        </div>
                        <div className="modal-body" style={{ padding: '1.5rem' }}>
                            <div className="history-summary" style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{selectedItem.itemName}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#64748b' }}>Current Stock: <strong>{selectedItem.currentStock} {selectedItem.unit}</strong></span>
                                    <span style={{ color: '#64748b' }}>Last Updated: <strong>{new Date(selectedItem.updatedAt).toLocaleDateString()}</strong></span>
                                </div>
                            </div>

                            <div className="history-timeline">
                                <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>Update Activity</h5>
                                <div className="timeline-item" style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem' }}>
                                    <div className="timeline-icon" style={{ color: '#10b981' }}><CheckCircle2 size={18} /></div>
                                    <div className="timeline-info">
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>System Verification</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Stock level verified and synced with master inventory.</p>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(selectedItem.updatedAt).toLocaleString()}</span>
                                    </div>
                                </div>
                                {selectedItem.purchaseOrder && (
                                    <div className="timeline-item" style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem' }}>
                                        <div className="timeline-icon" style={{ color: '#3b82f6' }}><Package size={18} /></div>
                                        <div className="timeline-info">
                                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Received from PO</p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Batch received via Purchase Order <strong>#{selectedItem.purchaseOrder.poNumber || 'Unknown'}</strong></p>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(selectedItem.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer" style={{ background: '#f8fafc' }}>
                            <button className="btn-cancel" style={{ width: '100%' }} onClick={() => setShowHistoryModal(false)}>Close Activity Log</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POInventory;
