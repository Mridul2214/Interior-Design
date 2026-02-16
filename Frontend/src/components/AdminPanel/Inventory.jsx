import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Trash2,
    Edit2,
    X,
    Loader,
    Package,
    Upload,
    AlertCircle,
    CheckCircle,
    Camera,
    Sparkles
} from 'lucide-react';
import { inventoryAPI, uploadAPI } from '../../config/api';
import AISuggestButton from '../common/AISuggestButton';
import './css/Inventory.css';

// Helper to get full image URL from backend
const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Serve from backend uploads directory
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
};

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
        section: 'Living Room',
        unit: 'Numbers',
        size: '',
        stock: 0,
        reorderLevel: 5,
        price: 0,
        image: null
    };

    const [formData, setFormData] = useState(initialFormData);
    const [availableSections, setAvailableSections] = useState(['Living Room', 'Bedroom', 'Kitchen', 'Dining', 'Bathroom', 'Office', 'Outdoors']);
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [newSectionName, setNewSectionName] = useState('');

    useEffect(() => {
        fetchItems();

        const processAIData = (data) => {
            if (!data) return;
            setFormData(prev => ({
                ...prev,
                ...data
            }));
            setShowItemModal(true);
        };

        const handleAIPopulate = (e) => processAIData(e.detail);
        const handleOpenModal = () => setShowItemModal(true);

        const pending = sessionStorage.getItem('AI_PENDING_DATA');
        if (pending) {
            const { type, data } = JSON.parse(pending);
            if (type === 'INVENTORY') {
                processAIData(data);
                sessionStorage.removeItem('AI_PENDING_DATA');
            }
        }

        window.addEventListener('AI_POPULATE_INVENTORY', handleAIPopulate);
        window.addEventListener('open-inventory-modal', handleOpenModal);
        return () => {
            window.removeEventListener('AI_POPULATE_INVENTORY', handleAIPopulate);
            window.removeEventListener('open-inventory-modal', handleOpenModal);
        };
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
            alert('Failed to load inventory');
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
            const uploadFormData = new FormData();
            uploadFormData.append('image', file);
            const response = await uploadAPI.image(uploadFormData);
            if (response.success) {
                // Backend returns file path in 'data'
                const imageUrl = response.data || response.url;
                setFormData(prev => ({ ...prev, image: imageUrl }));
                alert('Image uploaded successfully');
            }
        } catch (err) {
            alert('Image upload failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingItem) {
                const response = await inventoryAPI.update(editingItem._id, formData);
                if (response.success) {
                    await fetchItems();
                    alert('Item updated successfully');
                    closeModal();
                }
            } else {
                const response = await inventoryAPI.create(formData);
                if (response.success) {
                    await fetchItems();
                    alert('New item added to inventory');
                    closeModal();
                }
            }
        } catch (err) {
            alert(err.message || 'Failed to save item');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            itemName: item.itemName || '',
            description: item.description || '',
            section: item.section || 'Living Room',
            unit: item.unit || 'Numbers',
            size: item.size || '',
            stock: item.stock || 0,
            reorderLevel: item.reorderLevel || 5,
            price: item.price || 0,
            image: item.image || null
        });
        setShowItemModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await inventoryAPI.delete(id);
            if (response.success) {
                await fetchItems();
                alert('Item removed from inventory');
            }
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    const closeModal = () => {
        setShowItemModal(false);
        setEditingItem(null);
        setFormData(initialFormData);
        setError(null);
    };

    const handleAddSection = () => {
        if (!newSectionName.trim()) return;
        if (!availableSections.includes(newSectionName)) {
            setAvailableSections([...availableSections, newSectionName]);
            setFormData(prev => ({ ...prev, section: newSectionName }));
            alert(`New section "${newSectionName}" added`);
        }
        setNewSectionName('');
        setIsAddingSection(false);
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'All Items' || item.section === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="inventory-container">
            <div className="inventory-wrapper">
                <div className="inventory-header">
                    <h2>Catalog Management</h2>
                    <button className="btn-new-item" onClick={() => setShowItemModal(true)}>
                        <Plus size={18} />
                        <span>Add New Item</span>
                    </button>
                </div>

                <div className="inventory-controls">
                    <div className="search-bar">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-scroll">
                        {['All Items', ...availableSections].map(section => (
                            <button
                                key={section}
                                className={`filter-btn ${activeFilter === section ? 'active' : ''}`}
                                onClick={() => setActiveFilter(section)}
                            >
                                {section}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <Loader className="spinner" size={40} />
                        <p>Accessing inventory...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state-card">
                        <Package size={48} className="empty-icon" />
                        <h4>Inventory Empty</h4>
                        <p>Start adding items to build your catalog</p>
                    </div>
                ) : (
                    <div className="inventory-table-card">
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>Item Details</th>
                                    <th>Category</th>
                                    <th>Stock Level</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(item => (
                                    <tr key={item._id}>
                                        <td>
                                            <div className="item-details-cell">
                                                <div className="item-thumbnail-wrapper">
                                                    {item.image ? (
                                                        <img src={getImageUrl(item.image)} alt={item.itemName} className="item-list-thumb" />
                                                    ) : (
                                                        <div className="item-list-thumb-placeholder">
                                                            <Package size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="item-text-info">
                                                    <span className="item-name">{item.itemName}</span>
                                                    <span className="item-desc">{item.description}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="section-badge">{item.section}</span>
                                        </td>
                                        <td>
                                            <span className={`stock-value ${item.stock <= item.reorderLevel ? 'low' : ''}`}>
                                                {item.stock} {item.unit}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="price-value">₹{item.price.toLocaleString()}</span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="action-btn edit" onClick={() => handleEdit(item)}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDelete(item._id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showItemModal && (
                <div className="modal-overlay">
                    <div className="modal-content-wide" data-lenis-prevent>
                        <div className="modal-header">
                            <h3>{editingItem ? 'Edit Item' : 'New Item Registration'}</h3>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-field full-width">
                                    <label>Item Name <span>*</span></label>
                                    <input
                                        name="itemName"
                                        className="client-input"
                                        value={formData.itemName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-field full-width">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <label>Description</label>
                                        <AISuggestButton
                                            type="Inventory"
                                            field="description"
                                            value={formData.description}
                                            context={{ itemName: formData.itemName }}
                                            onSuggest={(v) => setFormData(prev => ({ ...prev, description: v }))}
                                        />
                                    </div>
                                    <textarea
                                        name="description"
                                        className="client-input"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="2"
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Section / Category</label>
                                    <select
                                        name="section"
                                        className="client-input"
                                        value={formData.section}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Section</option>
                                        {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <button type="button" className="btn-add-inline" onClick={() => setIsAddingSection(true)}>
                                        + Add New Category
                                    </button>
                                </div>
                                <div className="form-field">
                                    <label>Unit of Measure</label>
                                    <select
                                        name="unit"
                                        className="client-input"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Numbers">Numbers (pcs)</option>
                                        <option value="Sq Ft">Square Feet</option>
                                        <option value="Running Ft">Running Feet</option>
                                        <option value="Liters">Liters</option>
                                        <option value="Kg">Kilograms</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Price (₹) <span>*</span></label>
                                    <input
                                        type="number"
                                        name="price"
                                        className="client-input"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Stock Level <span>*</span></label>
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
                                <div className="form-field full-width">
                                    <label>Product Image</label>
                                    <div className="image-upload-preview-container">
                                        {formData.image ? (
                                            <div className="form-image-preview">
                                                <img src={getImageUrl(formData.image)} alt="Preview" />
                                                <button
                                                    type="button"
                                                    className="remove-preview-btn"
                                                    onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="image-upload-dropzone">
                                                <Upload size={24} />
                                                <span>Click to upload product image</span>
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleImageUpload(e.target.files[0])}
                                                    accept="image/*"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn-submit" disabled={submitting}>
                                    {submitting ? <Loader className="spinner" size={16} /> : (editingItem ? 'Update Item' : 'Add to Catalog')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isAddingSection && (
                <div className="modal-overlay sub-modal">
                    <div className="modal-content small">
                        <div className="modal-header">
                            <h4>Create New Category</h4>
                            <button className="modal-close" onClick={() => setIsAddingSection(false)}><X size={16} /></button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="text"
                                className="client-input"
                                placeholder="Category name (e.g., Lighting)"
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsAddingSection(false)}>Cancel</button>
                            <button className="btn-submit" onClick={handleAddSection}>Add Category</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
