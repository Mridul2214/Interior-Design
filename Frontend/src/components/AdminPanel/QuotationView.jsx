import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Printer,
    ArrowLeft,
    Download,
    Mail,
    MapPin,
    Phone,
    Globe,
    CheckCircle,
    FileText,
    Calendar,
    Briefcase,
    IndianRupee,
    Loader,
    Edit
} from 'lucide-react';
import { quotationAPI } from '../../config/api';
import './css/QuotationView.css';

const QuotationView = ({ isStaff }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quotation, setQuotation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuotation = async () => {
            try {
                setLoading(true);
                const res = await quotationAPI.getById(id);
                if (res.success) {
                    setQuotation(res.data);
                } else {
                    setError('Quotation not found');
                }
            } catch (err) {
                console.error('Error fetching quotation:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchQuotation();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="qv-loading-container">
                <Loader className="spinner" size={48} />
                <p>Preparing document...</p>
            </div>
        );
    }

    if (error || !quotation) {
        return (
            <div className="qv-error-container">
                <div className="error-card">
                    <h2>Error</h2>
                    <p>{error || 'Something went wrong'}</p>
                    <button onClick={() => navigate(isStaff ? '/staff/quotations' : '/quotations')}>
                        <ArrowLeft size={18} /> Back to List
                    </button>
                </div>
            </div>
        );
    }

    const {
        quotationNumber,
        projectName,
        client,
        items = [],
        taxRate = 18,
        discount = 0,
        status,
        createdAt,
        validUntil,
        notes,
        termsAndConditions,
        projectName: projectTitle,
        projectDescription,
        depositPercent = 30
    } = quotation;

    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discountAmount = (subtotal * discount) / 100;
    const offerPrice = subtotal - discountAmount;
    const taxAmount = (offerPrice * taxRate) / 100;
    const grandTotal = offerPrice + taxAmount;

    return (
        <div className="qv-wrapper">
            <div className="qv-actions-bar no-print">
                <button className="btn-back" onClick={() => navigate(isStaff ? '/staff/quotations' : '/quotations')}>
                    <ArrowLeft size={18} /> Back
                </button>
                <div className="qv-right-actions">
                    <button className="btn-edit" onClick={() => navigate(isStaff ? `/staff/quotations/edit/${id}` : `/quotations/edit/${id}`)}>
                        <Edit size={18} /> Edit
                    </button>
                    <button className="btn-secondary" onClick={() => window.print()}>
                        <Printer size={18} /> Print
                    </button>
                    <button className="btn-primary" onClick={() => {/* Future: Download PDF */ }}>
                        <Download size={18} /> Download
                    </button>
                </div>
            </div>

            <div className="quotation-document">
                {/* Header */}
                <header className="doc-header">
                    <div className="company-logo-section">
                        <div className="qv-logo">
                            <span className="logo-accent">I</span>nterior Design
                        </div>
                        <div className="company-details">
                            <p><MapPin size={12} /> 123 Design Studio, Creative Avenue, NY</p>
                            <p><Phone size={12} /> +1 234 567 890</p>
                            <p><Globe size={12} /> www.interiordesign.com</p>
                        </div>
                    </div>
                    <div className="doc-title-section">
                        <h1>QUOTATION</h1>
                        <div className="doc-meta">
                            <div className="meta-item">
                                <label>Quote #</label>
                                <span>{quotationNumber}</span>
                            </div>
                            <div className="meta-item">
                                <label>Date</label>
                                <span>{new Date(createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="meta-item">
                                <label>Status</label>
                                <span className={`status-badge ${status?.toLowerCase()}`}>{status}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="doc-content">
                    {/* Parties Section */}
                    <section className="parties-grid">
                        <div className="party-box client-box">
                            <h3>Prepared For</h3>
                            <div className="party-details">
                                <p className="client-name">{client?.name || 'Walk-in Client'}</p>
                                <p>{client?.email}</p>
                                <p>{client?.phone}</p>
                                <p>{client?.company}</p>
                            </div>
                        </div>
                        <div className="party-box project-box">
                            <h3>Project Details</h3>
                            <div className="party-details">
                                <p className="project-title">{projectName}</p>
                                <p className="project-desc">{projectDescription}</p>
                                {validUntil && (
                                    <p className="validity">
                                        <Calendar size={14} /> Valid Until: {new Date(validUntil).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Items Table */}
                    <section className="items-section">
                        <table className="qv-items-table">
                            <thead>
                                <tr>
                                    <th className="col-idx">#</th>
                                    <th className="col-item">Description & Specifications</th>
                                    <th className="col-qty">Qty</th>
                                    <th className="col-rate">Rate</th>
                                    <th className="col-amount">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <React.Fragment key={idx}>
                                        <tr className="item-row">
                                            <td className="col-idx" data-label="#">{idx + 1}</td>
                                            <td className="col-item" data-label="Item">
                                                <div className="item-main-info">
                                                    <span className="item-name">{item.itemName}</span>
                                                    {item.section && <span className="item-section-tag">{item.section}</span>}
                                                </div>
                                                <p className="item-desc">{item.description}</p>
                                                <div className="item-specs">
                                                    {item.finish && <span><strong>Finish:</strong> {item.finish}</span>}
                                                    {item.material && <span><strong>Material:</strong> {item.material}</span>}
                                                    {item.size && <span><strong>Size:</strong> {item.size}</span>}
                                                </div>
                                            </td>
                                            <td className="col-qty" data-label="Qty">{item.quantity} {item.unit}</td>
                                            <td className="col-rate" data-label="Rate">₹{item.rate?.toLocaleString()}</td>
                                            <td className="col-amount" data-label="Amount">₹{item.amount?.toLocaleString()}</td>
                                        </tr>
                                        {item.image && (
                                            <tr className="image-row no-print">
                                                <td className="col-idx"></td>
                                                <td colSpan="4">
                                                    <div className="item-preview-img">
                                                        <img src={`http://localhost:5000${item.image}`} alt="Preview" />
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* Summary Section */}
                    <section className="summary-section">
                        <div className="notes-col">
                            {notes && (
                                <div className="doc-note-box">
                                    <h4>Notes</h4>
                                    <p>{notes}</p>
                                </div>
                            )}
                            {termsAndConditions && (
                                <div className="doc-note-box">
                                    <h4>Terms & Conditions</h4>
                                    <p>{termsAndConditions}</p>
                                </div>
                            )}
                        </div>
                        <div className="totals-col">
                            <div className="total-row">
                                <label>Subtotal</label>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>
                            {discount > 0 && (
                                <div className="total-row discount">
                                    <label>Discount ({discount}%)</label>
                                    <span>- ₹{discountAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="total-row offer">
                                <label>Offer Price</label>
                                <span>₹{offerPrice.toLocaleString()}</span>
                            </div>
                            <div className="total-row">
                                <label>GST ({taxRate}%)</label>
                                <span>+ ₹{taxAmount.toLocaleString()}</span>
                            </div>
                            <div className="total-row grand-total">
                                <label>Grand Total</label>
                                <span>₹{grandTotal.toLocaleString()}</span>
                            </div>
                            <div className="deposit-box">
                                <label>Advance Required ({depositPercent}%)</label>
                                <span>₹{((grandTotal * depositPercent) / 100).toLocaleString()}</span>
                            </div>
                        </div>
                    </section>
                </div>

                <footer className="doc-footer">
                    <div className="signature-area">
                        <div className="sig-line">
                            <p>Authorized Signatory</p>
                        </div>
                        <div className="sig-line">
                            <p>Client Signature</p>
                        </div>
                    </div>
                    <p className="thank-you">Thank you for your business!</p>
                </footer>
            </div>
        </div>
    );
};

export default QuotationView;
