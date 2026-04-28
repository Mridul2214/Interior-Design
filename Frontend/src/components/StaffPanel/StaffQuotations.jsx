import React, { useState, useEffect } from 'react';
import { Search, Loader, Eye, FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { quotationAPI } from '../../config/api';
import './css/StaffQuotations.css';

const StaffQuotations = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
            console.error('Failed to load quotations:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredQuotations = quotations.filter(q =>
        q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="sq-quotations-container">
                <div className="sq-loading">
                    <Loader size={40} className="spinner" />
                    <p>Loading quotations list...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sq-quotations-container">
            <div className="sq-quotations-wrapper">
                <div className="sq-header">
                    <h2>Project Quotations</h2>
                    <Link to="/staff/quotations/new" className="sq-btn-add">
                        <Plus size={18} />
                        <span>New Quotation</span>
                    </Link>
                </div>

                <div className="sq-controls">
                    <div className="sq-search-wrapper">
                        <Search className="sq-search-icon" size={18} />
                        <input
                            type="text"
                            className="sq-search-input"
                            placeholder="Search by quote number, project, or client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="sq-list-card">
                    <div className="sq-table-container">
                        <table className="sq-table">
                            <thead>
                                <tr>
                                    <th>Quote No</th>
                                    <th>Project & Client</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQuotations.map(q => (
                                    <tr key={q._id}>
                                        <td data-label="Quote No">
                                            <span className="sq-quote-num">{q.quotationNumber}</span>
                                            <span className="sq-date">{new Date(q.createdAt).toLocaleDateString()}</span>
                                        </td>
                                        <td data-label="Project">
                                            <div className="sq-project-info">
                                                <span className="sq-project-name">{q.projectName}</span>
                                                <span className="sq-client-name">{q.client?.name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td data-label="Amount">
                                            ₹{(q.totalAmount || 0).toLocaleString()}
                                        </td>
                                        <td data-label="Status">
                                            <span className={`sq-status-badge sq-status-${(q.status || 'pending').toLowerCase()}`}>
                                                {q.status || 'Under Review'}
                                            </span>
                                        </td>
                                        <td data-label="Actions">
                                            <Link to={`/staff/quotations/view/${q._id}`} className="sq-btn-view">
                                                <Eye size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredQuotations.length === 0 && (
                        <div className="sq-empty">
                            <FileText size={40} />
                            <p>No project quotations found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffQuotations;
