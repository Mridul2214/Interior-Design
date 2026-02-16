import React, { useState, useEffect } from 'react';
import { Search, Loader, Mail, Phone, MapPin, User, Plus, X } from 'lucide-react';
import { clientAPI } from '../../config/api';
import './css/StaffClients.css';

const StaffClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
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
            console.error('Failed to load clients:', err);
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
            const response = await clientAPI.create(formData);
            if (response.success) {
                alert('Client added successfully');
                setShowModal(false);
                setFormData(initialFormData);
                fetchClients();
            }
        } catch (err) {
            alert(err.message || 'Failed to add client');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredClients = clients.filter(client =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.siteAddress?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="sc-clients-container">
                <div className="sc-loading">
                    <Loader size={40} className="spinner" />
                    <p>Loading clients list...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sc-clients-container">
            <div className="sc-clients-wrapper">
                <div className="sc-header">
                    <h2>Client Directory</h2>
                    <button className="sc-btn-add" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        <span>Add Client</span>
                    </button>
                </div>

                <div className="sc-controls">
                    <div className="sc-search-wrapper">
                        <Search className="sc-search-icon" size={18} />
                        <input
                            type="text"
                            className="sc-search-input"
                            placeholder="Search by name, email, or site address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="sc-list-card">
                    <div className="sc-table-container">
                        <table className="sc-table">
                            <thead>
                                <tr>
                                    <th>Client Profile</th>
                                    <th>Contact Information</th>
                                    <th>Site Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map(client => (
                                    <tr key={client._id}>
                                        <td data-label="Client Profile">
                                            <div className="sc-client-profile">
                                                <div className="sc-avatar">{client.name?.charAt(0)}</div>
                                                <span className="sc-client-name">{client.name}</span>
                                            </div>
                                        </td>
                                        <td data-label="Contact">
                                            <div className="sc-contact-info">
                                                <div className="sc-contact-item">
                                                    <Mail size={12} />
                                                    <span>{client.email}</span>
                                                </div>
                                                <div className="sc-contact-item">
                                                    <Phone size={12} />
                                                    <span>{client.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Site Address">
                                            <div className="sc-contact-item">
                                                <MapPin size={12} />
                                                <span>{client.siteAddress || 'N/A'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredClients.length === 0 && (
                        <div className="sc-empty">
                            <User size={40} />
                            <p>No clients found in directory</p>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="sc-modal-overlay">
                    <div className="sc-modal-card">
                        <div className="sc-modal-header">
                            <h3>Add New Client</h3>
                            <button onClick={() => setShowModal(false)} className="sc-modal-close">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="sc-form">
                            <div className="sc-form-section">
                                <div className="sc-form-grid">
                                    <div className="sc-input-group">
                                        <label>Full Name *</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Client name" />
                                    </div>
                                    <div className="sc-input-group">
                                        <label>Email *</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="email@example.com" />
                                    </div>
                                    <div className="sc-input-group">
                                        <label>Phone *</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="Phone number" />
                                    </div>
                                    <div className="sc-input-group">
                                        <label>Alternative Phone</label>
                                        <input type="tel" name="contact1" value={formData.contact1} onChange={handleInputChange} placeholder="Secondary number" />
                                    </div>
                                    <div className="sc-input-group">
                                        <label>WhatsApp Number</label>
                                        <input type="tel" name="contact2" value={formData.contact2} onChange={handleInputChange} placeholder="Primary WhatsApp" />
                                    </div>
                                    <div className="sc-input-group">
                                        <label>Site Address</label>
                                        <input type="text" name="siteAddress" value={formData.siteAddress} onChange={handleInputChange} placeholder="Project site location" />
                                    </div>
                                </div>
                            </div>
                            <div className="sc-modal-footer">
                                <button type="button" onClick={() => setShowModal(false)} className="sc-btn-cancel">Cancel</button>
                                <button type="submit" disabled={submitting} className="sc-btn-submit">
                                    {submitting ? <Loader className="spinner" size={16} /> : 'Save Client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffClients;
