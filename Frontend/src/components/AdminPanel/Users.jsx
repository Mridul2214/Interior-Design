import React, { useState, useEffect } from 'react';
import {
    Plus,
    X,
    Search,
    Edit,
    Trash2,
    Shield,
    Mail,
    Phone,
    UserCircle,
    Loader
} from 'lucide-react';
import { userAPI } from '../../config/api';
import './css/Users.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        role: 'Designer',
        password: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getAll();
            if (response.success) setUsers(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'Designer',
            password: '' // Leave password empty during edit unless user wants to change it
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        // Validation: Password only required for new users
        if (!formData.fullName || !formData.email || (!editingUser && !formData.password)) {
            alert('Name, Email and Password are required');
            return;
        }

        try {
            setSubmitting(true);
            const response = editingUser
                ? await userAPI.update(editingUser._id, formData)
                : await userAPI.create(formData);

            if (response.success) {
                setShowModal(false);
                fetchUsers();
                setEditingUser(null);
                setFormData({ fullName: '', email: '', phone: '', role: 'Designer', password: '' });
            }
        } catch (err) {
            alert(`Error ${editingUser ? 'updating' : 'creating'} user: ` + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await userAPI.delete(id);
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleClass = (role) => {
        return role?.toLowerCase().replace(' ', '-') || 'default';
    };

    return (
        <div className="users-container">
            <div className="users-wrapper">
                <div className="users-header">
                    <button className="btn-add-user" onClick={() => {
                        setEditingUser(null);
                        setFormData({ fullName: '', email: '', phone: '', role: 'Designer', password: '' });
                        setShowModal(true);
                    }}>
                        <Plus size={18} />
                        <span>Add New User</span>
                    </button>
                </div>

                <div className="invoice-filter-bar">
                    <div className="search-field">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search team members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {error && <div className="error-banner">{error}</div>}

                <div className="users-table-card">
                    {loading ? (
                        <div className="loading-state">
                            <Loader className="spinner" size={40} />
                            <p>Loading team members...</p>
                        </div>
                    ) : (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Contact Info</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="user-profile-cell">
                                                <div className="user-avatar">{user.fullName?.charAt(0)}</div>
                                                <div className="user-details">
                                                    <span style={{ fontWeight: 600 }}>{user.fullName}</span>
                                                    <span className="user-email">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontSize: '0.85rem' }}><Phone size={12} style={{ marginRight: '6px' }} />{user.phone || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-badge ${getRoleClass(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: '#f0fdf4',
                                                color: '#16a34a'
                                            }}>
                                                Active
                                            </span>
                                        </td>
                                        <td>
                                            <div className="invoice-actions">
                                                <button
                                                    className="btn-inv-action"
                                                    title="Edit"
                                                    onClick={() => handleEditClick(user)}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="btn-inv-action"
                                                    title="Delete"
                                                    onClick={() => handleDelete(user._id)}
                                                >
                                                    <Trash2 size={16} />
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

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content-user">
                        <div className="modal-header">
                            <h3>{editingUser ? 'Edit Team Member' : 'Add Team Member'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    className="user-input"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    className="user-input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    className="user-input"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    className="user-input"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Designer">Designer</option>
                                    <option value="Manager">Manager</option>
                                    <option value="User">User</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Password {editingUser ? '(Leave blank to keep current)' : '*'}</label>
                                <input
                                    type="password"
                                    className="user-input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSubmit} disabled={submitting}>
                                {submitting ? (editingUser ? 'Updating...' : 'Creating...') : (editingUser ? 'Update Account' : 'Create Account')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
