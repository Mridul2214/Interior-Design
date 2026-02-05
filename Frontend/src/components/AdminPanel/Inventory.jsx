import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Trash2,
    Edit2,
    X,
    Loader,
    Package,
    Upload
} from 'lucide-react';
import { inventoryAPI, uploadAPI } from '../../config/api';
import './css/Inventory.css';

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Items');
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const initialFormData = {
        itemName: '',
        description: '',
        section: 'Plywood',
        finish: '',
        material: '',
        unit: 'sheets',
        size: '',
        stock: 0,
        reorderLevel: 10,
        price: 0,
        offerPrice: 0,
        image: null
    };

    const [formData, setFormData] = useState(initialFormData);

    const sections = ['Plywood', 'Laminate', 'Hardware', 'Veneer', 'Accessories', 'Other'];

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await inventoryAPI.getAll();
            if (response.success) {
                setItems(response.data);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = async (file) => {
        if (!file) return;

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('image', file);

            const result = await uploadAPI.image(formData);
            if (result.success) {
                setFormData(prev => ({ ...prev, image: result.data }));
            } else {
                alert(result.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Error uploading image');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            if (editingItem) {
                const response = await inventoryAPI.update(editingItem._id, formData);
                if (response.success) {
                    await fetchItems();
                    closeModal();
                }
            } else {
                const response = await inventoryAPI.create(formData);
                if (response.success) {
                    await fetchItems();
                    closeModal();
                }
            }
        } catch (err) {
            setError(err.message);
            console.error('Error saving item:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            itemName: item.itemName || '',
            description: item.description || '',
            section: item.section || 'Plywood',
            finish: item.finish || '',
            material: item.material || '',
            unit: item.unit || 'sheets',
            size: item.size || '',
            stock: item.stock || 0,
            reorderLevel: item.reorderLevel || 10,
            price: item.price || 0,
            offerPrice: item.offerPrice || 0,
            image: item.image || null
        });
        setShowItemModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            const response = await inventoryAPI.delete(id);
            if (response.success) {
                await fetchItems();
            }
        } catch (err) {
            setError(err.message);
            console.error('Error deleting item:', err);
        }
    };

    const closeModal = () => {
        setShowItemModal(false);
        setEditingItem(null);
        setFormData(initialFormData);
        setError(null);
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSection = activeFilter === 'All Items' || item.section === activeFilter;
        return matchesSearch && matchesSection;
    });

    useEffect(() => {
        const handleOpenModal = () => setShowItemModal(true);
        window.addEventListener('open-inventory-modal', handleOpenModal);
        return () => window.removeEventListener('open-inventory-modal', handleOpenModal);
    }, []);

    return (
        <div className="inventory-wrapper">
            <div className="inventory-container">
                {/* Search */}
                <div className="inventory-search-container">
                    <Search className="inventory-search-icon" size={20} />
                    <input
                        type="text"
                        className="inventory-search-input"
                        placeholder="Search inventory by name, code or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Section Filters */}
                <div className="inventory-filters">
                    <button
                        className={`filter-pill ${activeFilter === 'All Items' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('All Items')}
                    >
                        All Items
                    </button>
                    {sections.map(section => (
                        <button
                            key={section}
                            className={`filter-pill ${activeFilter === section ? 'active' : ''}`}
                            onClick={() => setActiveFilter(section)}
                        >
                            {section}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="error-banner">
                        <i className="fas fa-exclamation-triangle"></i>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">
                        <Loader className="spinner" size={40} />
                        <p>Loading inventory...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state-card">
                        <h4>No items found</h4>
                        <p>Add your first inventory item to get started</p>
                    </div>
                ) : (
                    /* Items List */
                    <div className="inventory-list">
                        {filteredItems.map((item) => (
                            <div key={item._id} className="inventory-item-card">
                                <div className="item-main-content">
                                    <div className="item-thumbnail">
                                        {item.image ? (
                                            <img
                                                src={`http://localhost:5000${item.image}`}
                                                alt={item.itemName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                                            />
                                        ) : (
                                            <Package size={32} />
                                        )}
                                    </div>
                                    <div className="item-details-grid">
                                        <div className="item-info-col">
                                            <h3>{item.itemName}</h3>
                                            <p className="item-desc">{item.description}</p>
                                            <div className="item-meta-grid">
                                                <div className="meta-item">
                                                    <span className="meta-label">Section:</span>
                                                    <span className="meta-value">{item.section}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="meta-label">Size:</span>
                                                    <span className="meta-value">{item.size || 'N/A'}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="meta-label">Units:</span>
                                                    <span className="meta-value">{item.unit}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="meta-label">Material:</span>
                                                    <span className="meta-value">{item.material || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="item-price-col">
                                            <div className="unit-tag">STOCK: <span className={item.stock <= item.reorderLevel ? 'low-stock' : 'in-stock'}>{item.stock}</span></div>
                                            <div className="price-details">
                                                <div className="price-row">
                                                    <span className="price-label">Price:</span>
                                                    <span className="original-price">₹{item.price?.toLocaleString()}</span>
                                                </div>
                                                {item.offerPrice > 0 && (
                                                    <div className="price-row">
                                                        <span className="price-label">Offer:</span>
                                                        <span className="offer-price">₹{item.offerPrice?.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="item-actions-footer">
                                    <button onClick={() => handleEdit(item)} className="btn-edit-item">
                                        <Edit2 size={16} />
                                        <span>Edit Details</span>
                                    </button>
                                    <button onClick={() => handleDelete(item._id)} className="btn-delete-item" title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Item Modal */}
            {showItemModal && (
                <div className="modal-overlay">
                    <div className="modal-content large">
                        <div className="modal-header">
                            <h3>{editingItem ? 'Edit Item' : 'New Item'}</h3>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-form-body">
                                <div className="form-grid">
                                    <div className="form-field">
                                        <label>Item Name <span>*</span></label>
                                        <input
                                            type="text"
                                            name="itemName"
                                            className="client-input"
                                            value={formData.itemName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Section <span>*</span></label>
                                        <select
                                            name="section"
                                            className="client-input"
                                            value={formData.section}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            {sections.map(section => (
                                                <option key={section} value={section}>{section}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-field full-width">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            className="client-input"
                                            rows="3"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Finish/Brand</label>
                                        <input
                                            type="text"
                                            name="finish"
                                            className="client-input"
                                            value={formData.finish}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Material/Origin</label>
                                        <input
                                            type="text"
                                            name="material"
                                            className="client-input"
                                            value={formData.material}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Size</label>
                                        <input
                                            type="text"
                                            name="size"
                                            className="client-input"
                                            placeholder="e.g., 8ft x 4ft x 19mm"
                                            value={formData.size}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Unit</label>
                                        <select
                                            name="unit"
                                            className="client-input"
                                            value={formData.unit}
                                            onChange={handleInputChange}
                                        >
                                            <option value="sheets">Sheets</option>
                                            <option value="sqft">Sq Ft</option>
                                            <option value="pieces">Pieces</option>
                                            <option value="meters">Meters</option>
                                            <option value="kg">Kg</option>
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label>Stock <span>*</span></label>
                                        <input
                                            type="number"
                                            name="stock"
                                            className="client-input"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Reorder Level</label>
                                        <input
                                            type="number"
                                            name="reorderLevel"
                                            className="client-input"
                                            value={formData.reorderLevel}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Price <span>*</span></label>
                                        <input
                                            type="number"
                                            name="price"
                                            className="client-input"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-field full-width">
                                        <label>Offer Price</label>
                                        <input
                                            type="number"
                                            name="offerPrice"
                                            className="client-input"
                                            value={formData.offerPrice}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-field full-width">
                                        <label>Item Image</label>
                                        <div className="product-image-upload" onClick={() => document.getElementById('inventory-file').click()}>
                                            {formData.image ? (
                                                <img
                                                    src={`http://localhost:5000${formData.image}`}
                                                    alt="Preview"
                                                    style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '12px' }}
                                                />
                                            ) : (
                                                <div className="upload-placeholder">
                                                    <Upload size={32} />
                                                    <span>Click to upload item image</span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            id="inventory-file"
                                            hidden
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e.target.files[0])}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={closeModal}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader className="spinner" size={16} />
                                            {editingItem ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        editingItem ? 'Update Item' : 'Create Item'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
