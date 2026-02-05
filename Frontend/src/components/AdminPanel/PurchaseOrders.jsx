import React, { useState, useEffect } from 'react';
import {
    Plus,
    X,
    Search,
    Filter,
    FileText,
    Clock,
    ShoppingCart,
    Package,
    TrendingUp,
    Eye,
    Edit3,
    CheckCircle2,
    Trash2,
    Loader
} from 'lucide-react';
import { purchaseOrderAPI, inventoryAPI } from '../../config/api';
import './css/PurchaseOrders.css';

const PurchaseOrders = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State for New PO
    const [formData, setFormData] = useState({
        supplier: '',
        deliveryAddress: '',
        deliveryDate: '',
        paymentTerms: '',
        notes: '',
        items: []
    });

    useEffect(() => {
        fetchPurchaseOrders();
    }, []);

    const fetchPurchaseOrders = async () => {
        try {
            setLoading(true);
            const response = await purchaseOrderAPI.getAll();
            if (response.success) {
                setPurchaseOrders(response.data);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching POs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this purchase order?')) return;
        try {
            const response = await purchaseOrderAPI.delete(id);
            if (response.success) {
                setPurchaseOrders(purchaseOrders.filter(po => po._id !== id));
            }
        } catch (err) {
            alert('Error deleting PO: ' + err.message);
        }
    };

    const handleMarkReceived = async (id) => {
        if (!window.confirm('Mark this purchase order as received? This will update inventory.')) return;
        try {
            setSubmitting(true);
            const response = await purchaseOrderAPI.markReceived(id);
            if (response.success) {
                setPurchaseOrders(purchaseOrders.map(po =>
                    po._id === id ? { ...po, status: 'Received' } : po
                ));
            }
        } catch (err) {
            alert('Error updating PO: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreatePO = async () => {
        if (!formData.supplier || formData.items.length === 0 || !formData.deliveryDate || !formData.deliveryAddress) {
            alert('Please fill in all required fields: Supplier, Delivery Date, Address, and at least one item.');
            return;
        }

        try {
            setSubmitting(true);
            const poData = {
                ...formData,
                expectedDeliveryDate: formData.deliveryDate,
                poNumber: `PO-${Date.now().toString().slice(-6)}`,
                orderDate: new Date(),
                items: formData.items.map(item => {
                    const qty = Number(item.quantity) || 0;
                    const r = Number(item.rate) || 0;
                    return {
                        ...item,
                        quantity: qty,
                        rate: r,
                        amount: qty * r,
                        unit: item.unit || 'pcs'
                    };
                }),
                status: 'Ordered'
            };

            poData.totalAmount = poData.items.reduce((sum, item) => sum + item.amount, 0);

            const response = await purchaseOrderAPI.create(poData);
            if (response.success) {
                setShowCreateModal(false);
                fetchPurchaseOrders();
                setFormData({ supplier: '', deliveryAddress: '', deliveryDate: '', paymentTerms: '', notes: '', items: [] });
            }
        } catch (err) {
            alert('Error creating PO: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredPOs = purchaseOrders.filter(po => {
        const matchesSearch = po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || po.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats Calculation
    const statsData = [
        { label: 'Total POs', value: purchaseOrders.length, icon: <FileText size={24} />, color: 'stat-purple' },
        { label: 'Pending', value: purchaseOrders.filter(p => p.status === 'Pending').length, icon: <Clock size={24} />, color: 'stat-yellow' },
        { label: 'Ordered', value: purchaseOrders.filter(p => p.status === 'Ordered').length, icon: <ShoppingCart size={24} />, color: 'stat-magenta' },
        { label: 'Received', value: purchaseOrders.filter(p => p.status === 'Received').length, icon: <Package size={24} />, color: 'stat-green' },
        { label: 'Total Value', value: `₹${purchaseOrders.reduce((sum, p) => sum + (p.totalAmount || 0), 0).toLocaleString()}`, icon: <TrendingUp size={24} />, color: 'stat-blue' }
    ];

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'ordered': return 'status-ordered';
            case 'received': return 'status-received';
            case 'approved': return 'status-approved';
            case 'pending': return 'status-pending';
            default: return '';
        }
    };

    return (
        <div className="po-container">
            <div className="po-wrapper">
                <div className="po-header-section">
                    <button className="btn-primary-blue" onClick={() => setShowCreateModal(true)}>
                        <Plus size={20} />
                        <span>Create Purchase Order</span>
                    </button>
                </div>

                <div className="po-stats-grid">
                    {statsData.map((stat, index) => (
                        <div key={index} className="po-stat-card">
                            <div className="stat-info">
                                <h4>{stat.label}</h4>
                                <h2>{stat.value}</h2>
                            </div>
                            <div className={`stat-icon ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="po-filter-bar">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by PO number or supplier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option>All Status</option>
                        <option>Pending</option>
                        <option>Ordered</option>
                        <option>Received</option>
                        <option>Approved</option>
                    </select>
                </div>

                {error && <div className="error-banner">{error}</div>}

                <div className="po-table-card">
                    {loading ? (
                        <div className="loading-state">
                            <Loader className="spinner" size={40} />
                            <p>Loading purchase orders...</p>
                        </div>
                    ) : (
                        <table className="po-table">
                            <thead>
                                <tr>
                                    <th>PO Number</th>
                                    <th>Supplier</th>
                                    <th>Order Date</th>
                                    <th>Delivery Date</th>
                                    <th>Items</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPOs.map((po) => (
                                    <tr key={po._id}>
                                        <td>
                                            <div className="po-number-cell">
                                                <FileText size={18} className="po-icon" />
                                                {po.poNumber}
                                            </div>
                                        </td>
                                        <td>{po.supplier}</td>
                                        <td className="date-cell">{new Date(po.orderDate).toLocaleDateString()}</td>
                                        <td className="date-cell">{po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString() : 'TBD'}</td>
                                        <td className="items-cell">{po.items?.length || 0} items</td>
                                        <td className="amount-cell">₹{po.totalAmount?.toLocaleString()}</td>
                                        <td>
                                            <div className={`status-badge ${getStatusClass(po.status)}`}>
                                                {po.status}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-action" title="View"><Eye size={18} /></button>
                                                {po.status === 'Ordered' && (
                                                    <button
                                                        className="btn-action done"
                                                        title="Mark as Received"
                                                        onClick={() => handleMarkReceived(po._id)}
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-action delete"
                                                    title="Delete"
                                                    onClick={() => handleDelete(po._id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content-wide">
                        <div className="modal-header">
                            <h3>Create Purchase Order</h3>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}><X size={24} /></button>
                        </div>
                        <div className="modal-form-body">
                            <div className="modal-form-grid">
                                <div className="form-field">
                                    <label>Supplier <span>*</span></label>
                                    <input
                                        type="text"
                                        className="po-input"
                                        placeholder="Supplier name"
                                        value={formData.supplier}
                                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Delivery Date</label>
                                    <input
                                        type="date"
                                        className="po-input"
                                        value={formData.deliveryDate}
                                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-field" style={{ marginBottom: '1rem' }}>
                                <label>Delivery Address</label>
                                <textarea
                                    className="po-input"
                                    value={formData.deliveryAddress}
                                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                />
                            </div>
                            <div className="items-section-header">
                                <h4>Items</h4>
                                <button
                                    className="btn-add-item-purple"
                                    onClick={() => setFormData({ ...formData, items: [...formData.items, { itemName: '', quantity: 1, rate: 0, unit: 'pcs' }] })}
                                >
                                    <Plus size={18} /> Add Item
                                </button>
                            </div>
                            <div className="po-items-list" style={{ marginBottom: '1.5rem' }}>
                                {formData.items.map((item, idx) => (
                                    <div key={idx} className="po-item-row" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <input
                                            placeholder="Item name"
                                            className="po-input"
                                            style={{ flex: 3 }}
                                            value={item.itemName}
                                            onChange={(e) => {
                                                const newItems = [...formData.items];
                                                newItems[idx].itemName = e.target.value;
                                                setFormData({ ...formData, items: newItems });
                                            }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Qty"
                                            className="po-input"
                                            style={{ flex: 1 }}
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const newItems = [...formData.items];
                                                newItems[idx].quantity = e.target.value;
                                                setFormData({ ...formData, items: newItems });
                                            }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Rate"
                                            className="po-input"
                                            style={{ flex: 1 }}
                                            value={item.rate}
                                            onChange={(e) => {
                                                const newItems = [...formData.items];
                                                newItems[idx].rate = e.target.value;
                                                setFormData({ ...formData, items: newItems });
                                            }}
                                        />
                                        <input
                                            placeholder="Unit"
                                            className="po-input"
                                            style={{ flex: 1 }}
                                            value={item.unit}
                                            onChange={(e) => {
                                                const newItems = [...formData.items];
                                                newItems[idx].unit = e.target.value;
                                                setFormData({ ...formData, items: newItems });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button
                                className="btn-create-po"
                                onClick={handleCreatePO}
                                disabled={submitting}
                            >
                                {submitting ? 'Creating...' : 'Create Purchase Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrders;
