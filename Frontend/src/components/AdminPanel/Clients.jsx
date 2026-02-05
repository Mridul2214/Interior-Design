import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    X,
    Edit,
    Trash2,
    Loader
} from 'lucide-react';
import { clientAPI } from '../../config/api';
import './css/Clients.css';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Initial form state
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
        clientGST: '',
        clientManager: '',
        clientManagerContact: '',
        clientManagerEmail: '',
        interiorDesigner: '',
        interiorDesignerContact: '',
        interiorDesignerEmail: '',
        customerServiceContact: '',
        customerServiceEmail: '',
        pan: '',
        status: 'Active'
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await clientAPI.getAll({ search: searchTerm });
            if (response.success) {
                setClients(response.data);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching clients:', err);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            if (editingClient) {
                // Update existing client
                const response = await clientAPI.update(editingClient._id, formData);
                if (response.success) {
                    await fetchClients();
                    closeModal();
                }
            } else {
                // Create new client
                const response = await clientAPI.create(formData);
                if (response.success) {
                    await fetchClients();
                    closeModal();
                }
            }
        } catch (err) {
            setError(err.message);
            console.error('Error saving client:', err);
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
            clientGST: client.clientGST || '',
            clientManager: client.clientManager || '',
            clientManagerContact: client.clientManagerContact || '',
            clientManagerEmail: client.clientManagerEmail || '',
            interiorDesigner: client.interiorDesigner || '',
            interiorDesignerContact: client.interiorDesignerContact || '',
            interiorDesignerEmail: client.interiorDesignerEmail || '',
            customerServiceContact: client.customerServiceContact || '',
            customerServiceEmail: client.customerServiceEmail || '',
            pan: client.pan || '',
            status: client.status || 'Active'
        });
        setShowNewClientModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this client?')) {
            return;
        }

        try {
            const response = await clientAPI.delete(id);
            if (response.success) {
                await fetchClients();
            }
        } catch (err) {
            setError(err.message);
            console.error('Error deleting client:', err);
        }
    };

    const closeModal = () => {
        setShowNewClientModal(false);
        setEditingClient(null);
        setFormData(initialFormData);
        setError(null);
    };

    const filteredClients = clients.filter(client =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm) ||
        client.clientGST?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="clients-container">
            <div className="clients-wrapper">

                {/* Header Section */}
                <div className="clients-header">
                    <button className="btn-new-client" onClick={() => setShowNewClientModal(true)}>
                        <Plus size={18} />
                        <span>Add New Client</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="clients-search-container">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search clients by name, email, phone, or GST..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-banner">
                        <i className="fas fa-exclamation-triangle"></i>
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="loading-state">
                        <Loader className="spinner" size={40} />
                        <p>Loading clients...</p>
                    </div>
                ) : filteredClients.length === 0 ? (
                    /* Empty State */
                    <div className="empty-state-card">
                        <h4>No clients yet</h4>
                        <p>Add your first client to get started</p>
                    </div>
                ) : (
                    /* Clients Table */
                    <div className="clients-table-container">
                        <table className="clients-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>GST</th>
                                    <th>Manager</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map((client) => (
                                    <tr key={client._id}>
                                        <td>{client.name}</td>
                                        <td>{client.email}</td>
                                        <td>{client.phone}</td>
                                        <td>{client.clientGST || '-'}</td>
                                        <td>{client.clientManager || '-'}</td>
                                        <td>
                                            <span className={`status-badge ${client.status?.toLowerCase()}`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon-edit"
                                                    onClick={() => handleEdit(client)}
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="btn-icon-delete"
                                                    onClick={() => handleDelete(client._id)}
                                                    title="Delete"
                                                >
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

            {/* New/Edit Client Modal */}
            {showNewClientModal && (
                <div className="modal-overlay">
                    <div className="modal-content-wide">
                        <div className="modal-header">
                            <h3>{editingClient ? 'Edit Client' : 'New Client'}</h3>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-form-body">
                                {/* Basic Information */}
                                <div className="form-section">
                                    <h4>Basic Information</h4>
                                    <div className="form-grid">
                                        <div className="form-field">
                                            <label>Name <span>*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="client-input"
                                                placeholder="Client name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label>Email <span>*</span></label>
                                            <input
                                                type="email"
                                                name="email"
                                                className="client-input"
                                                placeholder="email@example.com"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label>Phone <span>*</span></label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                className="client-input"
                                                placeholder="+91 98765 43210"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label>Status</label>
                                            <select
                                                name="status"
                                                className="client-input"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="form-section">
                                    <h4>Address Information</h4>
                                    <div className="form-grid">
                                        <div className="form-field full-width">
                                            <label>Address</label>
                                            <input
                                                type="text"
                                                name="address"
                                                className="client-input"
                                                placeholder="Street address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-field full-width">
                                            <label>Site Address</label>
                                            <input
                                                type="text"
                                                name="siteAddress"
                                                className="client-input"
                                                placeholder="Site address"
                                                value={formData.siteAddress}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label>Billing Address</label>
                                            <input
                                                type="text"
                                                name="billingAddress"
                                                className="client-input"
                                                placeholder="Billing address"
                                                value={formData.billingAddress}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label>Billing Pincode</label>
                                            <input
                                                type="text"
                                                name="billingPincode"
                                                className="client-input"
                                                placeholder="Pincode"
                                                value={formData.billingPincode}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="form-section">
                                    <h4>Additional Contacts</h4>
                                    <div className="form-grid">
                                        <div className="form-field">
                                            <label>Contact 1</label>
                                            <input
                                                type="text"
                                                name="contact1"
                                                className="client-input"
                                                placeholder="Contact number"
                                                value={formData.contact1}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label>Contact 2</label>
                                            <input
                                                type="text"
                                                name="contact2"
                                                className="client-input"
                                                placeholder="Contact number"
                                                value={formData.contact2}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Business Information */}
                                <div className="form-section">
                                    <h4>Business Information</h4>
                                    <div className="form-grid">
                                        <div className="form-field">
                                            <label>GST Number</label>
                                            <input
                                                type="text"
                                                name="clientGST"
                                                className="client-input"
                                                placeholder="GST number"
                                                value={formData.clientGST}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label>PAN Number</label>
                                            <input
                                                type="text"
                                                name="pan"
                                                className="client-input"
                                                placeholder="PAN number"
                                                value={formData.pan}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Client Manager */}
                                <div className="form-section">
                                    <h4>Client Manager</h4>
                                    <div className="form-grid">
                                        <div className="form-field">
                                            <label>Manager Name</label>
                                            <input
                                                type="text"
                                                name="clientManager"
                                                className="client-input"
                                                placeholder="Manager name"
                                                value={formData.clientManager}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label>Manager Contact</label>
                                            <input
                                                type="text"
                                                name="clientManagerContact"
                                                className="client-input"
                                                placeholder="Manager contact"
                                                value={formData.clientManagerContact}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label>Manager Email</label>
                                            <input
                                                type="email"
                                                name="clientManagerEmail"
                                                className="client-input"
                                                placeholder="Manager email"
                                                value={formData.clientManagerEmail}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Interior Designer */}
                                <div className="form-section">
                                    <h4>Interior Designer</h4>
                                    <div className="form-grid">
                                        <div className="form-field">
                                            <label>Designer Name</label>
                                            <input
                                                type="text"
                                                name="interiorDesigner"
                                                className="client-input"
                                                placeholder="Designer name"
                                                value={formData.interiorDesigner}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label>Designer Contact</label>
                                            <input
                                                type="text"
                                                name="interiorDesignerContact"
                                                className="client-input"
                                                placeholder="Designer contact"
                                                value={formData.interiorDesignerContact}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label>Designer Email</label>
                                            <input
                                                type="email"
                                                name="interiorDesignerEmail"
                                                className="client-input"
                                                placeholder="Designer email"
                                                value={formData.interiorDesignerEmail}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Service */}
                                <div className="form-section">
                                    <h4>Customer Service</h4>
                                    <div className="form-grid">
                                        <div className="form-field">
                                            <label>Service Contact</label>
                                            <input
                                                type="text"
                                                name="customerServiceContact"
                                                className="client-input"
                                                placeholder="Service contact"
                                                value={formData.customerServiceContact}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label>Service Email</label>
                                            <input
                                                type="email"
                                                name="customerServiceEmail"
                                                className="client-input"
                                                placeholder="Service email"
                                                value={formData.customerServiceEmail}
                                                onChange={handleInputChange}
                                            />
                                        </div>
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
                                            {editingClient ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        editingClient ? 'Update Client' : 'Create Client'
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

export default Clients;
