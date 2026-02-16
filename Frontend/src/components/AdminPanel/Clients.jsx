import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    X,
    Edit,
    Trash2,
    Loader,
    User,
    Mail,
    Phone,
    MapPin,
    Hash,
    Users
} from 'lucide-react';
import { clientAPI } from '../../config/api';
import './css/Clients.css';

const Clients = ({ isStaff }) => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const initialFormData = {
        name: '',
        email: '',
        phone: '',
        address: '',
        siteAddress: '',
        billingAddress: '',
        billingPincode: '',
        contact1: '',
        contact2: '',
        status: 'Active'
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await clientAPI.getAll();
            if (response.success) {
                setClients(response.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingClient) {
                const response = await clientAPI.update(editingClient._id, formData);
                if (response.success) {
                    await fetchClients();
                    closeModal();
                }
            } else {
                const response = await clientAPI.create(formData);
                if (response.success) {
                    await fetchClients();
                    closeModal();
                }
            }
        } catch (err) {
            alert(err.message || 'Failed to save client');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setFormData({
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
            siteAddress: client.siteAddress || '',
            billingAddress: client.billingAddress || '',
            billingPincode: client.billingPincode || '',
            contact1: client.contact1 || '',
            contact2: client.contact2 || '',
            status: client.status || 'Active'
        });
        setShowNewClientModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this client?')) return;
        try {
            const response = await clientAPI.delete(id);
            if (response.success) {
                await fetchClients();
            }
        } catch (err) {
            alert('Failed to delete client');
        }
    };

    const closeModal = () => {
        setShowNewClientModal(false);
        setEditingClient(null);
        setFormData(initialFormData);
    };

    const SEVEN_DAYS_AGO = new Date();
    SEVEN_DAYS_AGO.setDate(SEVEN_DAYS_AGO.getDate() - 7);

    const filteredClients = clients.filter(client => {
        const matchesSearch = (
            client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone?.includes(searchTerm)
        );

        const matchesTab = (
            activeTab === 'All' ||
            (activeTab === 'New' && new Date(client.createdAt) >= SEVEN_DAYS_AGO) ||
            (activeTab === 'Staff Added' && client.createdBy?.role === 'Staff')
        );

        return matchesSearch && matchesTab;
    });

    return (
        <div className={`clients-container ${isStaff ? 'staff-view' : ''}`}>
            <div className="clients-wrapper">
                <div className="c-clients-header">
                    <div className="c-header-left">
                        <h2>Clients</h2>
                        <div className="c-tabs-list">
                            {['All', 'New', 'Staff Added'].map(tab => (
                                <button
                                    key={tab}
                                    className={`c-tab-item ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === 'New' ? 'New (Recent)' : tab}
                                    <span className="c-tab-badge">
                                        {tab === 'All' ? clients.length :
                                            tab === 'New' ? clients.filter(c => new Date(c.createdAt) >= SEVEN_DAYS_AGO).length :
                                                clients.filter(c => c.createdBy?.role === 'Staff').length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="clients-controls-row">
                    <div className="c-search-container">
                        <Search className="c-search-icon" size={20} />
                        <input
                            type="text"
                            className="c-search-input"
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-new-client" onClick={() => setShowNewClientModal(true)}>
                        <Plus size={18} />
                        <span>Add New Client</span>
                    </button>
                </div>

                {loading ? (
                    <div className="c-loading-state">
                        <Loader className="c-spinner" size={40} />
                        <p>Loading clients...</p>
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="c-empty-state-card">
                        <Users size={48} />
                        <h4>No clients found</h4>
                        <p>Try matching your search or filters to different criteria.</p>
                    </div>
                ) : (
                    <div className="c-list-card">
                        <div className="c-table-container">
                            <table className="c-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Contact Info</th>
                                        <th>Site Address</th>
                                        <th>Status</th>
                                        <th>Added By</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClients.map((client) => (
                                        <tr key={client._id}>
                                            <td className="client-name-cell">
                                                <div className="client-profile">
                                                    <div className="client-avatar">{client.name.charAt(0)}</div>
                                                    <span>{client.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="client-contact-info">
                                                    <div className="contact-item">
                                                        <Mail size={12} />
                                                        <span>{client.email}</span>
                                                    </div>
                                                    <div className="contact-item">
                                                        <Phone size={12} />
                                                        <span>{client.phone}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="client-site-addr">
                                                    <MapPin size={12} />
                                                    <span>{client.siteAddress || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`c-status-badge ${client.status?.toLowerCase()}`}>
                                                    {client.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="added-by-info">
                                                    <span className="added-by-name">{client.createdBy?.fullName || 'Admin'}</span>
                                                    <span className={`added-by-role ${client.createdBy?.role?.toLowerCase()}`}>
                                                        {client.createdBy?.role || 'Admin'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="c-action-buttons">
                                                    <button className="btn-icon-edit" onClick={() => handleEdit(client)} title="Edit">
                                                        <Edit size={16} />
                                                    </button>
                                                    {!isStaff && (
                                                        <button className="btn-icon-delete" onClick={() => handleDelete(client._id)} title="Delete">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {showNewClientModal && (
                <div className="modal-overlay">
                    <div className="modal-content-wide">
                        <div className="modal-header">
                            <h3>{editingClient ? 'Edit Client' : 'New Client'}</h3>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="c-form-section">
                                <h4>Basic Information</h4>
                                <div className="c-form-grid">
                                    <div className="form-field">
                                        <label>Name <span>*</span></label>
                                        <input type="text" name="name" className="c-client-input" value={formData.name} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-field">
                                        <label>Email <span>*</span></label>
                                        <input type="email" name="email" className="c-client-input" value={formData.email} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-field">
                                        <label>Phone <span>*</span></label>
                                        <input type="tel" name="phone" className="c-client-input" value={formData.phone} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-field">
                                        <label>Alternative Contact</label>
                                        <input type="tel" name="contact1" className="c-client-input" value={formData.contact1} onChange={handleInputChange} placeholder="Secondary number" />
                                    </div>
                                    <div className="form-field">
                                        <label>WhatsApp Number</label>
                                        <input type="tel" name="contact2" className="c-client-input" value={formData.contact2} onChange={handleInputChange} placeholder="Primary WhatsApp" />
                                    </div>
                                    <div className="form-field">
                                        <label>Status</label>
                                        <select name="status" className="c-client-input" value={formData.status} onChange={handleInputChange}>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="c-form-section">
                                <h4>Site Information</h4>
                                <div className="c-form-grid">
                                    <div className="form-field full-width">
                                        <label>Site Address</label>
                                        <input type="text" name="siteAddress" className="c-client-input" value={formData.siteAddress} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn-submit" disabled={submitting}>
                                    {submitting ? <Loader className="spinner" size={16} /> : (editingClient ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
