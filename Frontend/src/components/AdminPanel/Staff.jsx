import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    X,
    Edit,
    Trash2,
    Loader,
    Phone,
    Mail,
    Calendar,
    BarChart2,
    TrendingUp,
    CheckCircle,
    Clock,
    AlertCircle,
    Briefcase
} from 'lucide-react';
import { staffAPI } from '../../config/api';
import { useToast } from '../../context/ToastContext';
import CustomSelect from '../common/CustomSelect';
import './css/Staff.css';

const Staff = () => {
    const { showToast } = useToast();
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [selectedAnalytics, setSelectedAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const initialFormData = {
        name: '',
        email: '',
        phone: '',
        role: '',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        password: '',
        confirmPassword: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await staffAPI.getAll();
            if (response.success) {
                setStaffList(response.data);
            }
        } catch (err) {
            setError(err.message);
            showToast('Failed to load staff list', 'error');
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

        if (!editingStaff && formData.password !== formData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        setSubmitting(true);

        try {
            if (editingStaff) {
                const response = await staffAPI.update(editingStaff._id, formData);
                if (response.success) {
                    await fetchStaff();
                    showToast('Staff member updated successfully');
                    closeModal();
                }
            } else {
                const response = await staffAPI.create(formData);
                if (response.success) {
                    await fetchStaff();
                    showToast('New staff member added successfully');
                    closeModal();
                }
            }
        } catch (err) {
            showToast(err.message || 'Failed to save staff information', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (staff) => {
        setEditingStaff(staff);
        setFormData({
            name: staff.name || '',
            email: staff.email || '',
            phone: staff.phone || '',
            role: staff.role || '',
            joiningDate: staff.joiningDate ? staff.joiningDate.split('T')[0] : '',
            status: staff.status || 'Active'
        });
        setShowModal(true);
    };

    const handleViewAnalytics = async (staff) => {
        setSelectedAnalytics(null);
        setAnalyticsLoading(true);
        setShowAnalytics(true);
        try {
            const response = await staffAPI.getAnalytics(staff._id);
            if (response.success) {
                setSelectedAnalytics(response.data);
            }
        } catch (err) {
            showToast('Failed to load performance analytics', 'error');
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) return;

        try {
            const response = await staffAPI.delete(id);
            if (response.success) {
                await fetchStaff();
                showToast('Staff member removed successfully');
            }
        } catch (err) {
            showToast('Failed to delete staff member', 'error');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingStaff(null);
        setFormData(initialFormData);
        setError(null);
    };

    const filteredStaff = staffList.filter(staff =>
        staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phone?.includes(searchTerm)
    );

    return (
        <div className="staff-container">
            <div className="staff-wrapper">
                <div className="staff-header">
                    <h2>Staff Management</h2>
                    <button className="btn-new-staff" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        <span>Add New Staff</span>
                    </button>
                </div>

                <div className="staff-search-container">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search staff by name, role, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="loading-state">
                        <Loader className="spinner" size={40} />
                        <p>Loading staff details...</p>
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <div className="empty-state">
                        <h4>No staff members found</h4>
                        <p>Add a new staff member to get started</p>
                    </div>
                ) : (
                    <div className="staff-table-container">
                        <table className="staff-table">
                            <thead>
                                <tr>
                                    <th>Staff Member</th>
                                    <th>Role</th>
                                    <th>Contact</th>
                                    <th>Joining Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.map((staff) => (
                                    <tr key={staff._id}>
                                        <td>
                                            <div className="staff-info-cell">
                                                <div className="staff-avatar">
                                                    {staff.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="staff-details">
                                                    <span className="staff-name">{staff.name}</span>
                                                    <span className="staff-phone">{staff.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="role-cell">
                                                <Briefcase size={14} />
                                                <span>{staff.role}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-cell">
                                                <div className="contact-item">
                                                    <Phone size={12} />
                                                    <span>{staff.phone}</span>
                                                </div>
                                                {staff.email && (
                                                    <div className="contact-item">
                                                        <Mail size={12} />
                                                        <span>{staff.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="date-cell">
                                                <Calendar size={14} />
                                                <span>{new Date(staff.joiningDate).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${staff.status?.toLowerCase().replace(' ', '-')}`}>
                                                {staff.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className="btn-icon analytics"
                                                    onClick={() => handleViewAnalytics(staff)}
                                                    title="View Performance"
                                                >
                                                    <BarChart2 size={16} />
                                                </button>
                                                <button
                                                    className="btn-icon edit"
                                                    onClick={() => handleEdit(staff)}
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="btn-icon delete"
                                                    onClick={() => handleDelete(staff._id)}
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

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingStaff ? 'Edit Staff Member' : 'Add New Staff'}</h3>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body" data-lenis-prevent>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Role / Job Title *</label>
                                        <input
                                            type="text"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Carpenter, Supervisor"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Enter phone number"
                                            required
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter email address"
                                            required
                                        />
                                    </div>

                                    {!editingStaff && (
                                        <>
                                            <div className="form-group">
                                                <label>Login Password *</label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    placeholder="Set login password"
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Confirm Password *</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Confirm password"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="form-group">
                                        <CustomSelect
                                            label="Status"
                                            name="status"
                                            options={[
                                                { value: 'Active', label: 'Active' },
                                                { value: 'On Leave', label: 'On Leave' },
                                                { value: 'Inactive', label: 'Inactive' }
                                            ]}
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            searchable={false}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Joining Date</label>
                                        <input
                                            type="date"
                                            name="joiningDate"
                                            value={formData.joiningDate}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModal} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit" disabled={submitting}>
                                    {submitting ? <Loader size={16} className="spinner" /> : 'Save Staff Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAnalytics && (
                <div className="modal-overlay">
                    <div className="modal-content analytics-modal">
                        <div className="modal-header">
                            <div className="header-title">
                                <BarChart2 size={24} />
                                <h3>Staff Performance Analytics</h3>
                            </div>
                            <button className="modal-close" onClick={() => setShowAnalytics(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {analyticsLoading ? (
                                <div className="loading-state">
                                    <Loader className="spinner" size={40} />
                                    <p>Gathering performance data...</p>
                                </div>
                            ) : selectedAnalytics ? (
                                <div className="analytics-grid">
                                    <div className="analytics-card main">
                                        <div className="staff-overview">
                                            <div className="staff-avatar large">
                                                {selectedAnalytics.staffName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="staff-info">
                                                <h4>{selectedAnalytics.staffName}</h4>
                                                <span>{selectedAnalytics.role}</span>
                                            </div>
                                        </div>
                                        <div className="performance-score">
                                            <div className="circular-progress">
                                                <span className="score">{selectedAnalytics.performanceScore}%</span>
                                                <span className="label">Completion Rate</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="analytics-stats-grid">
                                        <div className="stat-card">
                                            <div className="stat-icon completions">
                                                <CheckCircle size={20} />
                                            </div>
                                            <div className="stat-info">
                                                <span className="stat-value">{selectedAnalytics.tasksCompleted}</span>
                                                <span className="stat-label">Tasks Completed</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon trend">
                                                <TrendingUp size={20} />
                                            </div>
                                            <div className="stat-info">
                                                <span className="stat-value text-capitalize">{selectedAnalytics.efficiencyTrend}</span>
                                                <span className="stat-label">Efficiency Trend</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon on-time">
                                                <Clock size={20} />
                                            </div>
                                            <div className="stat-info">
                                                <span className="stat-value">{selectedAnalytics.onTimeCompletionRate}%</span>
                                                <span className="stat-label">On-Time Rate</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon pending">
                                                <AlertCircle size={20} />
                                            </div>
                                            <div className="stat-info">
                                                <span className="stat-value">{selectedAnalytics.pendingTasks}</span>
                                                <span className="stat-label">Pending Tasks</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="current-assignment">
                                        <h5>Current Assignment</h5>
                                        <div className="assignment-details">
                                            <div className="detail-item">
                                                <Briefcase size={16} />
                                                <div>
                                                    <label>Client</label>
                                                    <span>{selectedAnalytics.currentClient}</span>
                                                </div>
                                            </div>
                                            <div className="detail-item">
                                                <Briefcase size={16} />
                                                <div>
                                                    <label>Project</label>
                                                    <span>{selectedAnalytics.currentProject}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="analytics-note">
                                            <p>💡 <strong>Note:</strong> Assign tasks to this staff member from the <strong>Task Management</strong> section.</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>No analytics data available for this staff member.</p>
                                    <p>Assign tasks from the Task Management section to track performance.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;
