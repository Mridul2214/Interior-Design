import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, CheckCircle, XCircle, FileText, User, IndianRupee, Clock, Loader, LayoutGrid, List, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { quotationAPI } from '../../config/api';
import { getRolePermissions } from '../../hooks/useRoleDashboard';
import './css/Quotations.css';

const Quotations = ({ isStaff, user }) => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [submitting, setSubmitting] = useState(false);

    // Use role permissions to determine if user can approve
    const canApprove = getRolePermissions(user?.role).canApproveQuotations;

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const response = await quotationAPI.getAll();
            if (response.success) {
                setQuotations(response.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this quotation?')) return;
        setSubmitting(true);
        try {
            const response = await quotationAPI.approve(id);
            if (response.success) {
                alert('Quotation approved successfully');
                fetchQuotations();
            }
        } catch (err) {
            alert(err.message || 'Failed to approve');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quotation?')) return;
        setSubmitting(true);
        try {
            const response = await quotationAPI.delete(id);
            if (response.success) {
                alert('Quotation deleted successfully');
                fetchQuotations();
            }
        } catch (err) {
            alert(err.message || 'Failed to delete');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredQuotations = quotations.filter(q => {
        const matchesSearch = (
            q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const matchesTab = (
            activeTab === 'All' ||
            (activeTab === 'Under Review' && q.status === 'Under Review') ||
            (activeTab === 'Approved' && q.status === 'Approved')
        );

        return matchesSearch && matchesTab;
    });

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'q-status-approved';
            case 'under review': return 'q-status-pending';
            case 'rejected': return 'q-status-rejected';
            default: return 'q-status-default';
        }
    };

    return (
        <div className={`quotations-wrapper ${isStaff ? 'staff-view' : ''}`}>
            <div className="quotations-content">
                <div className="quotations-header-row">
                    <div className="q-header-left">
                        <h2>Quotations</h2>
                        <div className="q-tabs-list">
                            {['All', 'Under Review', 'Approved'].map(tab => (
                                <button
                                    key={tab}
                                    className={`q-tab-item ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                    <span className="q-tab-badge">
                                        {tab === 'All' ? quotations.length : quotations.filter(q => q.status === tab).length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="quotations-controls-row">
                    <div className="q-search-container">
                        <Search className="q-search-icon" size={20} />
                        <input
                            type="text"
                            className="q-search-input"
                            placeholder="Search projects, quotes or clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link to={isStaff ? "/staff/quotations/new" : "/quotations/new"} className="btn-new-quotation">
                        <Plus size={18} />
                        <span>New Quotation</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="q-loading-state">
                        <Loader className="q-spinner" size={40} />
                        <p>Loading quotations...</p>
                    </div>
                ) : filteredQuotations.length === 0 ? (
                    <div className="q-empty-state-card">
                        <FileText size={48} />
                        <h4>No quotations found</h4>
                        <p>Try matching your search or filters to different criteria.</p>
                    </div>
                ) : (
                    <div className="quotations-table-container">
                        <table className="quotations-table">
                            <thead>
                                <tr>
                                    <th>Quote #</th>
                                    <th>Project & Client</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQuotations.map((q) => (
                                    <tr key={q._id}>
                                        <td data-label="Quote #">#{q.quotationNumber}</td>
                                        <td data-label="Project & Client">
                                            <div className="project-client-cell">
                                                <span className="project-name">{q.projectName}</span>
                                                <span className="client-name">{q.client?.name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td data-label="Amount">₹{(q.totalAmount || 0).toLocaleString()}</td>
                                        <td data-label="Date">{new Date(q.createdAt).toLocaleDateString()}</td>
                                        <td data-label="Status">
                                            <span className={`q-status-badge ${getStatusClass(q.status)}`}>
                                                {q.status}
                                            </span>
                                        </td>
                                        <td data-label="Actions">
                                            <div className="q-action-buttons">
                                                <Link to={`/quotations/view/${q._id}`} className="btn-icon view" title="View">
                                                    <Eye size={18} />
                                                </Link>
                                                {!isStaff && canApprove && q.status === 'Under Review' && (
                                                    <button
                                                        className="btn-icon approve"
                                                        onClick={() => handleApprove(q._id)}
                                                        disabled={submitting}
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                {!isStaff && canApprove && (
                                                    <button
                                                        className="btn-icon delete"
                                                        onClick={() => handleDelete(q._id)}
                                                        disabled={submitting}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quotations;
