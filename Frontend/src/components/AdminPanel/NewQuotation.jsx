import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FileText,
    Plus,
    Trash2,
    Send,
    Save,
    Package,
    Layout,
    Upload,
    ArrowRight,
    MapPin,
    CheckCircle,
    Download,
    Printer,
    Home,
    Search,
    ArrowLeft,
    Layers,
    Loader,
    Calendar,
    DollarSign,
    Briefcase,
    Tag,
    X,
    Eye,
    SaveAll
} from 'lucide-react';
import { quotationAPI, clientAPI, inventoryAPI, uploadAPI } from '../../config/api';
import './css/NewQuotation.css';

const NewQuotation = ({ isEdit }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [clients, setClients] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetching, setFetching] = useState(isEdit && !!id);
    const [error, setError] = useState(null);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [activeSearchId, setActiveSearchId] = useState(null);
    const [activeSectionFilter, setActiveSectionFilter] = useState('All Items');
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');
    const [globalSearchResults, setGlobalSearchResults] = useState([]);
    const [showBillPreview, setShowBillPreview] = useState(false);
    const [pendingStatus, setPendingStatus] = useState('Pending');
    const [isSaving, setIsSaving] = useState(false);
    const [clientSearchQuery, setClientSearchQuery] = useState('');
    const [showClientSuggestions, setShowClientSuggestions] = useState(false);
    const [filteredClients, setFilteredClients] = useState([]);

    // Form States
    const [lineItems, setLineItems] = useState([]);
    const [taxRate, setTaxRate] = useState(18);
    const [includeTax, setIncludeTax] = useState(true);

    const [formData, setFormData] = useState({
        client: '',
        quoteNumber: `QT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        documentType: 'Quotation',
        projectName: '',
        projectDescription: '',
        projectStart: '',
        projectEnd: '',
        scopeOfWork: '',
        depositPercent: 30,
        paymentTerms: '',
        warrantyTerms: '',
        cancellationPolicy: '',
        notes: '',
        termsConditions: 'Payment due within 30 days. 50% deposit required to commence work.'
    });

    // Fetch clients and inventory
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const clientRes = await clientAPI.getAll();
                if (clientRes.success) setClients(clientRes.data);

                const inventoryRes = await inventoryAPI.getAll();
                if (inventoryRes.success) setInventoryItems(inventoryRes.data);

                if (isEdit && id) {
                    const quoteRes = await quotationAPI.getById(id);
                    if (quoteRes.success) {
                        const q = quoteRes.data;
                        const clientData = q.client?._id || q.client;
                        setFormData({
                            client: clientData,
                            quoteNumber: q.quotationNumber,
                            date: new Date(q.createdAt).toISOString().split('T')[0],
                            validUntil: q.validUntil ? new Date(q.validUntil).toISOString().split('T')[0] : '',
                            documentType: q.documentType || 'Quotation',
                            projectName: q.projectName,
                            projectDescription: q.projectDescription || '',
                            projectStart: q.projectStart ? new Date(q.projectStart).toISOString().split('T')[0] : '',
                            projectEnd: q.projectEnd ? new Date(q.projectEnd).toISOString().split('T')[0] : '',
                            scopeOfWork: q.scopeOfWork || '',
                            depositPercent: q.depositPercent || 30,
                            paymentTerms: q.paymentTerms || '',
                            warrantyTerms: q.warrantyTerms || '',
                            cancellationPolicy: q.cancellationPolicy || '',
                            notes: q.notes || '',
                            termsConditions: q.termsAndConditions || ''
                        });

                        // Set client search query if clients are already loaded
                        if (clientRes.success && clientRes.data.length > 0) {
                            const selected = clientRes.data.find(c => c._id === clientData);
                            if (selected) setClientSearchQuery(selected.name);
                        }

                        setLineItems(q.items.map(item => ({
                            id: item._id || Math.random(),
                            name: item.itemName,
                            description: item.description,
                            section: item.section || 'Uncategorized',
                            finishBrand: item.finish || '',
                            materialOrigin: item.material || '',
                            size: item.size || '',
                            quantity: item.quantity,
                            unit: item.unit,
                            rate: item.rate,
                            amount: item.amount,
                            image: item.image || null
                        })));
                        if (q.taxRate) setTaxRate(q.taxRate);
                    }
                }
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load data: ' + err.message);
            } finally {
                setFetching(false);
            }
        };
        loadInitialData();
    }, [isEdit, id]);

    // Cleanup suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowClientSuggestions(false);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handlePreview = (e, status = 'Pending') => {
        if (e) e.preventDefault();
        if (!formData.client || !formData.projectName || lineItems.length === 0) {
            setError('Please fill in required fields and add items.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setPendingStatus(status);
        setShowBillPreview(true);
    };

    const handleFinalSave = async () => {
        try {
            setIsSaving(true);
            const quotationData = {
                ...formData,
                quotationNumber: formData.quoteNumber,
                status: pendingStatus,
                taxRate,
                items: lineItems.map(item => ({
                    itemName: item.name,
                    description: item.description,
                    section: item.section,
                    finish: item.finishBrand,
                    material: item.materialOrigin,
                    size: item.size,
                    unit: item.unit,
                    quantity: item.quantity,
                    rate: item.rate,
                    amount: item.amount,
                    image: item.image
                }))
            };

            let response;
            if (isEdit) {
                response = await quotationAPI.update(id, quotationData);
            } else {
                response = await quotationAPI.create(quotationData);
            }

            if (response.success) {
                navigate('/quotations');
            }
        } catch (err) {
            setError(err.message);
            setShowBillPreview(false); // Go back to form to show error
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClientSearch = (query) => {
        setClientSearchQuery(query);
        if (!query.trim()) {
            setFilteredClients([]);
            setShowClientSuggestions(false);
            setFormData(prev => ({ ...prev, client: '' }));
            return;
        }

        const filtered = clients.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            (c.company && c.company.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 5);

        setFilteredClients(filtered);
        setShowClientSuggestions(true);
    };

    const selectClient = (client) => {
        setFormData(prev => ({ ...prev, client: client._id }));
        setClientSearchQuery(client.name);
        setShowClientSuggestions(false);
    };

    const updateLineItem = (id, field, value) => {
        setLineItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'quantity' || field === 'rate') {
                    updated.amount = (updated.quantity || 0) * (updated.rate || 0);
                }
                return updated;
            }
            return item;
        }));
    };

    const removeLineItem = (id) => {
        setLineItems(lineItems.filter(item => item.id !== id));
    };

    const handleImageUpload = async (itemId, file) => {
        if (!file) return;
        try {
            const formData = new FormData();
            formData.append('image', file);
            const result = await uploadAPI.image(formData);
            if (result.success) updateLineItem(itemId, 'image', result.data);
        } catch (err) {
            console.error('Upload error:', err);
        }
    };

    const handleProductSearch = (itemId, query) => {
        updateLineItem(itemId, 'name', query);
        if (!query.trim()) {
            setSearchResults([]);
            setActiveSearchId(null);
            return;
        }
        const filtered = inventoryItems.filter(p => p.itemName.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
        setSearchResults(filtered);
        setActiveSearchId(itemId);
    };

    const selectProduct = (itemId, item) => {
        setLineItems(prev => prev.map(li => {
            if (li.id === itemId) return {
                ...li,
                name: item.itemName,
                description: item.description || '',
                section: item.section || li.section || 'Uncategorized',
                finishBrand: item.finish || '',
                materialOrigin: item.material || '',
                size: item.size || '',
                unit: item.unit || 'SCM',
                rate: item.price || 0,
                image: item.image || null,
                amount: (li.quantity || 1) * (item.price || 0)
            };
            return li;
        }));
        setSearchResults([]);
        setActiveSearchId(null);
    };

    const addFromInventorySelect = (item) => {
        const newItem = {
            id: Date.now() + Math.random(),
            name: item.itemName,
            description: item.description || '',
            section: item.section || 'Uncategorized',
            finishBrand: item.finish || '',
            materialOrigin: item.material || '',
            size: item.size || '',
            quantity: 1,
            unit: item.unit || 'SCM',
            rate: item.price || 0,
            amount: item.price || 0,
            image: item.image || null
        };
        setLineItems([...lineItems, newItem]);
        setGlobalSearchQuery('');
        setGlobalSearchResults([]);
    };

    const handleGlobalSearch = (query) => {
        setGlobalSearchQuery(query);
        if (!query.trim()) {
            setGlobalSearchResults([]);
            return;
        }
        const filtered = inventoryItems.filter(p =>
            p.itemName.toLowerCase().includes(query.toLowerCase()) ||
            (p.section && p.section.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 8);
        setGlobalSearchResults(filtered);
    };

    const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = includeTax ? (subtotal * taxRate) / 100 : 0;
    const total = subtotal + taxAmount;
    const depositAmount = (total * formData.depositPercent) / 100;

    const createNewItem = () => ({
        id: Date.now() + Math.random(),
        name: '',
        description: '',
        section: 'Uncategorized',
        finishBrand: '',
        materialOrigin: '',
        size: '',
        quantity: 1,
        unit: 'SCM',
        rate: 0,
        amount: 0,
        image: null
    });

    const addLineItem = () => setLineItems([...lineItems, createNewItem()]);

    const sections = ['All Items', ...new Set(lineItems.map(item => item.section))];
    const sectionCounts = lineItems.reduce((acc, item) => {
        acc[item.section] = (acc[item.section] || 0) + 1;
        return acc;
    }, {});

    const filteredItems = activeSectionFilter === 'All Items'
        ? lineItems
        : lineItems.filter(item => item.section === activeSectionFilter);



    if (fetching) {
        return (
            <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Loader className="spinner" size={48} color="#4f46e5" />
                <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading quotation details...</p>
            </div>
        );
    }

    return (
        <div className="new-quote-wrapper" style={{ position: 'relative', overflow: showBillPreview ? 'hidden' : 'auto' }}>
            <div className="form-container" style={{
                filter: showBillPreview ? 'blur(10px) brightness(0.9)' : 'none',
                pointerEvents: showBillPreview ? 'none' : 'auto',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div className="back-navigation" style={{ marginBottom: '1.5rem' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/quotations')}
                        style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            padding: '10px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.transform = 'translateX(-3px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        <ArrowLeft size={20} color="#1e293b" />
                    </button>
                </div>

                {error && <div className="error-banner" style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>{error}</div>}

                <form onSubmit={(e) => handlePreview(e)}>
                    {/* Project Details */}
                    <div className="form-section">
                        <div className="section-header-row" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
                            <div className="section-header-left">
                                <Briefcase className="section-icon" size={18} />
                                <h3>Project Details</h3>
                            </div>
                        </div>
                        <div className="form-grid">
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label>Client *</label>
                                <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        className="input-styled"
                                        placeholder="Type to search client..."
                                        value={clientSearchQuery}
                                        onChange={(e) => handleClientSearch(e.target.value)}
                                        onFocus={() => clientSearchQuery.trim() && setShowClientSuggestions(true)}
                                        required
                                    />
                                    {showClientSuggestions && filteredClients.length > 0 && (
                                        <div className="product-search-dropdown" style={{ width: '100%', top: '100%', left: 0 }}>
                                            {filteredClients.map(c => (
                                                <div key={c._id} className="search-result-item" onClick={() => selectClient(c)}>
                                                    <div className="res-info">
                                                        <span className="res-name">{c.name}</span>
                                                        <span className="res-cat">{c.company || 'Individual'}</span>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Select</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Document Type</label>
                                <select name="documentType" className="select-styled" value={formData.documentType} onChange={handleInputChange}>
                                    <option value="Quotation">Quotation</option>
                                    <option value="Estimate">Estimate</option>
                                    <option value="Proposal">Proposal</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '1.25rem' }}>
                            <label>Project Name *</label>
                            <input type="text" name="projectName" className="input-styled" placeholder="e.g., Living Room Interior Design" value={formData.projectName} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group" style={{ marginTop: '1.25rem' }}>
                            <label>Description</label>
                            <textarea name="projectDescription" className="textarea-styled" placeholder="Brief description of the project scope..." value={formData.projectDescription} onChange={handleInputChange} rows="2"></textarea>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
                            <div className="form-group">
                                <label><Calendar size={14} style={{ marginRight: '4px' }} /> Project Start</label>
                                <input type="date" name="projectStart" className="input-styled" value={formData.projectStart} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label><Calendar size={14} style={{ marginRight: '4px' }} /> Project End</label>
                                <input type="date" name="projectEnd" className="input-styled" value={formData.projectEnd} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '1.25rem' }}>
                            <label>Scope of Work</label>
                            <textarea name="scopeOfWork" className="textarea-styled" placeholder="Define what is included in this project..." value={formData.scopeOfWork} onChange={handleInputChange} rows="2"></textarea>
                        </div>
                    </div>

                    {/* Payment Terms Section */}
                    <div className="form-section" style={{ marginTop: '1.5rem' }}>
                        <div className="section-header-row" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
                            <div className="section-header-left">
                                <DollarSign className="section-icon" size={18} />
                                <h3>Payment & Policies</h3>
                            </div>
                        </div>
                        <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <label style={{ color: '#166534', fontWeight: 600, margin: 0 }}>Deposit / Advance</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="number"
                                    name="depositPercent"
                                    style={{ width: '60px', padding: '4px 8px', border: '1px solid #bbf7d0', borderRadius: '4px' }}
                                    value={formData.depositPercent}
                                    onChange={handleInputChange}
                                />
                                <span style={{ color: '#166534' }}>% = ₹{depositAmount.toLocaleString()}</span>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label>Payment Terms</label>
                                <textarea name="paymentTerms" className="textarea-styled" placeholder="e.g., 50% advance, 50% on finish" value={formData.paymentTerms} onChange={handleInputChange} rows="2"></textarea>
                            </div>
                            <div className="form-group">
                                <label>Warranty Terms</label>
                                <textarea name="warrantyTerms" className="textarea-styled" placeholder="e.g., 1 year on materials" value={formData.warrantyTerms} onChange={handleInputChange} rows="2"></textarea>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '1.25rem' }}>
                            <label>Cancellation Policy</label>
                            <textarea name="cancellationPolicy" className="textarea-styled" placeholder="e.g., No refund after material purchase" value={formData.cancellationPolicy} onChange={handleInputChange} rows="2"></textarea>
                        </div>
                    </div>

                    {/* Line Items Section */}
                    <div className="form-section" style={{ marginTop: '1.5rem' }}>
                        <div className="section-header-row" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
                            <div className="section-header-left">
                                <Layers className="section-icon" size={18} />
                                <h3>Line Items</h3>
                            </div>
                            <button type="button" onClick={addLineItem} className="btn-add-item">
                                <Plus size={14} /> Add Item
                            </button>
                        </div>

                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <div style={{
                                background: '#ffffff',
                                padding: '0.4rem 1.25rem',
                                borderRadius: '12px',
                                border: '2px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }} className="global-search-container">
                                <Search size={20} color="#94a3b8" />
                                <input
                                    type="text"
                                    placeholder="Search inventory to quick-add (e.g., Marble, Paint, Wood)..."
                                    className="input-styled"
                                    style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: '0.6rem 0' }}
                                    value={globalSearchQuery}
                                    onChange={(e) => handleGlobalSearch(e.target.value)}
                                />
                                {globalSearchQuery && (
                                    <X
                                        size={18}
                                        color="#94a3b8"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            setGlobalSearchQuery('');
                                            setGlobalSearchResults([]);
                                        }}
                                    />
                                )}
                            </div>

                            {globalSearchResults.length > 0 && (
                                <div className="product-search-dropdown" style={{ width: '100%', top: '100%', left: 0 }}>
                                    {globalSearchResults.map(res => (
                                        <div key={res._id} className="search-result-item" onClick={() => addFromInventorySelect(res)}>
                                            <div className="res-info">
                                                <span className="res-name">{res.itemName}</span>
                                                <span className="res-cat">{res.section || 'General'}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span className="res-price">₹{res.price}</span>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>Click to Add</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="line-item-container">
                            {lineItems.map((item, index) => (
                                <div key={item.id} className="line-item-card">
                                    <div className="item-card-header">
                                        <span className="item-id-badge">Item #{index + 1}</span>
                                        <button type="button" onClick={() => removeLineItem(item.id)} className="btn-delete-item">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '2rem' }}>
                                        <div onClick={() => document.getElementById(`file-${item.id}`).click()} className="image-upload-dashed">
                                            {item.image ? (
                                                <img src={`http://localhost:5000${item.image}`} alt="P" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                                            ) : (
                                                <>
                                                    <Upload size={24} />
                                                    <span>Upload Photo</span>
                                                </>
                                            )}
                                            <input type="file" id={`file-${item.id}`} hidden onChange={(e) => handleImageUpload(item.id, e.target.files[0])} accept="image/*" />
                                        </div>

                                        <div className="item-inputs-grid">
                                            <div className="form-group">
                                                <label>Item Name</label>
                                                <input type="text" className="input-styled" placeholder="Name or search from inventory..." value={item.name} onChange={(e) => handleProductSearch(item.id, e.target.value)} />
                                                {activeSearchId === item.id && searchResults.length > 0 && (
                                                    <div className="product-search-dropdown">
                                                        {searchResults.map(res => (
                                                            <div key={res._id} className="search-result-item" onClick={() => selectProduct(item.id, res)}>
                                                                <div className="res-info">
                                                                    <span className="res-name">{res.itemName}</span>
                                                                    <span className="res-cat">{res.section}</span>
                                                                </div>
                                                                <span className="res-price">₹{res.price}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="triple-inputs">
                                                <div className="form-group">
                                                    <label>Qty</label>
                                                    <input type="number" className="input-styled" value={item.quantity} onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Unit</label>
                                                    <select className="select-styled" value={item.unit} onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}>
                                                        <option value="SCM">SCM</option>
                                                        <option value="SFT">SFT</option>
                                                        <option value="RFT">RFT</option>
                                                        <option value="Nos">Nos</option>
                                                        <option value="Lumpsum">Lumpsum</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Rate (₹)</label>
                                                    <input type="number" className="input-styled" value={item.rate} onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)} />
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                                                <div className="form-group">
                                                    <label>Finish/Brand</label>
                                                    <input type="text" className="input-styled" placeholder="e.g., Duco Paint" value={item.finishBrand} onChange={(e) => updateLineItem(item.id, 'finishBrand', e.target.value)} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Material/Origin</label>
                                                    <input type="text" className="input-styled" placeholder="e.g., Plywood" value={item.materialOrigin} onChange={(e) => updateLineItem(item.id, 'materialOrigin', e.target.value)} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Size</label>
                                                    <input type="text" className="input-styled" placeholder="e.g., 8' x 4'" value={item.size} onChange={(e) => updateLineItem(item.id, 'size', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item-card-footer">
                                        <div className="item-total-tag">Item Total</div>
                                        <div className="item-total-val">₹{item.amount?.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="totals-summary-card">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="summary-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <input type="checkbox" checked={includeTax} onChange={(e) => setIncludeTax(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                                <span>Add Tax</span>
                                <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px 8px', marginLeft: '4px' }}>
                                    <input
                                        type="number"
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                        style={{ width: '40px', border: 'none', background: 'transparent', outline: 'none', fontWeight: 700, fontSize: '0.9rem', textAlign: 'right' }}
                                    />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>%</span>
                                </div>
                            </div>
                            <span className="tax-val">+ ₹{taxAmount.toLocaleString()}</span>
                        </div>
                        <div className="summary-row main-total">
                            <span>Grand Total</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Terms and Notes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                        <div className="form-section">
                            <label style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Notes</label>
                            <textarea name="notes" className="textarea-styled" placeholder="Notes for the client..." value={formData.notes} onChange={handleInputChange} rows="2"></textarea>
                        </div>
                        <div className="form-section">
                            <label style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Terms & Conditions</label>
                            <textarea name="termsConditions" className="textarea-styled" value={formData.termsConditions} onChange={handleInputChange} rows="2"></textarea>
                        </div>
                    </div>

                    <div className="form-footer-actions">
                        <button type="button" className="btn-save-draft" onClick={(e) => handlePreview(e, 'Draft')}>
                            <Save size={18} /> Review Draft
                        </button>
                        <button type="submit" className="btn-send-quote">
                            <Send size={18} /> Review & Save
                        </button>
                    </div>
                </form>
            </div>

            {showBillPreview && (() => {
                const selectedClient = clients.find(c => c._id === formData.client);
                return (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(15, 23, 42, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 4000,
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <div className="premium-receipt-card no-scroller" style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            padding: '1.5rem',
                            borderRadius: '24px',
                            maxWidth: '450px',
                            width: '95%',
                            maxHeight: '92vh',
                            overflowY: 'auto',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            position: 'relative',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            animation: 'slideUpModal 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                            backdropFilter: 'blur(20px)'
                        }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 0.75rem',
                                    boxShadow: '0 8px 12px -3px rgba(16, 185, 129, 0.3)'
                                }}>
                                    <CheckCircle size={28} color="white" />
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Review Details</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Quotation NO: <strong>{formData.quoteNumber}</strong></p>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Client</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{selectedClient?.name || 'Walk-in'}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Type</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{formData.documentType}</span>
                                    </div>
                                    <div style={{ gridColumn: 'span 2', marginTop: '2px' }}>
                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Project</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2563eb' }}>{formData.projectName}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>Itemized Summary</h3>
                                <div className="no-scroller" style={{ maxHeight: '150px', overflowY: 'auto', paddingRight: '5px' }}>
                                    {lineItems.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.quantity} {item.unit} x ₹{item.rate.toLocaleString()}</div>
                                            </div>
                                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>₹{item.amount?.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '16px', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                {includeTax && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
                                        <span>GST ({taxRate}%)</span>
                                        <span>+ ₹{taxAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #cbd5e1' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Grand Total</span>
                                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#2563eb' }}>₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <button onClick={() => setShowBillPreview(false)} style={{ padding: '0.7rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem' }}>
                                        Back
                                    </button>
                                    <button
                                        onClick={() => {
                                            window.print();
                                            handleFinalSave();
                                        }}
                                        style={{ padding: '0.7rem', background: '#ffffff', color: '#1e293b', border: '2px solid #1e293b', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}
                                    >
                                        <Printer size={16} /> Print
                                    </button>
                                </div>
                                <button
                                    onClick={handleFinalSave}
                                    style={{
                                        padding: '0.85rem',
                                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontSize: '0.9rem',
                                        boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                                    }}
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader size={18} className="spinner" /> : <SaveAll size={18} />}
                                    Confirm & Save Quotation
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default NewQuotation;
