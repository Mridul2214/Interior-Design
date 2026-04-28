import React, { useState, useEffect } from 'react';
import { 
    Truck, Package, CheckCircle, Clock, AlertTriangle,
    ArrowRight, Plus, Eye, DollarSign, Scale, FileText,
    ShoppingCart, Target, Users, BarChart3, UserPlus,
    Calendar, MessageSquare, Filter, ClipboardCheck, X, Save,
    TrendingUp, PieChart as PieIcon, Activity
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { projectAPI, procurementAPI, notificationAPI, vendorAPI, taskAPI, purchaseOrderAPI } from '../../../config/api';
import '../css/ManagerDashboard.css';
import Overview from './Overview';
import DesignHandoffs from './DesignHandoffs';
import MaterialRequests from './MaterialRequests';
import Assignments from './Assignments';
import Vendors from './Vendors';

const ProcurementManagerDashboard = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    const [showHandoffModal, setShowHandoffModal] = useState(false);

    const [stats, setStats] = useState(null);
    const [projects, setProjects] = useState([]);
    const [materialRequests, setMaterialRequests] = useState([]);
    const [pushedTasks, setPushedTasks] = useState([]);
    const [staff, setStaff] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedVendorDetail, setSelectedVendorDetail] = useState(null);
    const [vendorHistory, setVendorHistory] = useState([]);
    const [showAddVendorModal, setShowAddVendorModal] = useState(false);
    const emptyVendorForm = { name: '', email: '', phone: '', address: '', category: '', gstin: '', products: [] };
    const [vendorForm, setVendorForm] = useState({ name: '', email: '', phone: '', address: '', category: '', gstin: '', products: [] });
    const [vendorSaving, setVendorSaving] = useState(false);
    const [selectedReviewItem, setSelectedReviewItem] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log('Fetching procurement data...');
            const [vendorList, staffRes, requestsRes, taskRes] = await Promise.all([
                vendorAPI.getAll(),
                procurementAPI.getProcurementStaff(),
                procurementAPI.getMaterialRequests({ limit: 500, sort: '-createdAt' }),
                taskAPI.getAll({ status: 'Pushed to Procurement,Assigned to Procurement,Pending Manager Review,Pending Procurement Admin Review,Procurement Approved', limit: 500 })
            ]);

            if (vendorList.success) setVendors(vendorList.data);
            if (staffRes.success) setStaff(staffRes.data);
            if (requestsRes.success) {
                console.log('MRs fetched:', requestsRes.data.length);
                setMaterialRequests(requestsRes.data);
            }
            if (taskRes.success) {
                console.log('Pushed Tasks fetched:', taskRes.data.length);
                setPushedTasks(taskRes.data);
            }

            const projRes = await projectAPI.getByStage('Procurement');
            if (projRes.success) setProjects(projRes.data);

            const procRes = await procurementAPI.getStats();
            if (procRes.success) setStats(procRes.data);
        } catch (err) {
            console.error('Error fetching procurement data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveToAdmin = async (request) => {
        try {
            if (request.type === 'Task') {
                await taskAPI.update(request._id, { status: 'Pending Procurement Admin Review' });
            } else {
                await procurementAPI.updateMaterialRequest(request._id, { status: 'Pending Admin Review' });
            }
            await notificationAPI.create({
                recipientRole: 'Super Admin',
                title: 'Procurement Ready for Approval',
                message: `Procurement for ${request.project?.name || request.requestNumber || request.title} is ready for final admin approval.`,
                type: 'info',
                relatedId: request.project?._id,
                relatedModel: 'Project'
            });
            fetchData();
            alert('Sent to Admin for final approval!');
        } catch (err) {
            console.error(err);
            alert('Failed to send to admin.');
        }
    };

    const handleHandoff = async (request) => {
        try {
            // 1. Create a task for Production
            const prodRes = await productionAPI.createTask({
                project: request.project?._id,
                title: `Production Start: ${request.requestNumber || request.title}`,
                description: `Materials procured and ready for production. Items: ${request.items?.map(i => i.itemName).join(', ') || 'See details'}`,
                priority: 'High',
                status: 'To Do',
                materialRequest: request._id
            });

            if (prodRes.success) {
                // 2. Update MR status to reflected it's been handed off
                if (request.type === 'Task') {
                    await taskAPI.update(request._id, { status: 'Handed Off' });
                } else {
                    await procurementAPI.updateMaterialRequest(request._id, {
                        status: 'Handed Off',
                        handoffDate: new Date()
                    });
                }
                
                // 3. Notify Production Manager
                await notificationAPI.create({
                    recipientRole: 'Production Manager',
                    title: 'New Production Handoff',
                    message: `Materials for ${request.requestNumber || request.title} are ready. Production task created.`,
                    type: 'success',
                    relatedId: prodRes.data._id,
                    relatedModel: 'ProductionTask'
                });

                fetchData();
                alert('Project handed off to Production Manager!');
            }
        } catch (err) {
            console.error('Handoff error:', err);
            alert('Failed to handoff: ' + err.message);
        }
    };

    const handleAssignStaff = async (staffId) => {
        try {
            let res;
            if (selectedRequest.type === 'Task') {
                res = await taskAPI.update(selectedRequest._id, { 
                    assignedTo: staffId, 
                    status: 'Assigned to Procurement'
                });
            } else {
                res = await procurementAPI.assignStaff(selectedRequest._id, staffId);
            }

            if (res.success) {
                setShowAssignModal(false);
                setSelectedRequest(null);
                fetchData();
            }
        } catch (err) {
            console.error('Error assigning staff:', err);
            alert('Failed to assign staff: ' + err.message);
        }
    };

    const handleTimeExtension = async (requestId, status, managerRemarks) => {
        try {
            const res = await procurementAPI.respondTimeExtension(requestId, { status, managerRemarks });
            if (res.success) {
                fetchData();
            }
        } catch (err) {
            console.error('Error responding to time extension:', err);
        }
    };

    const handleAddVendor = async () => {
        if (!vendorForm.name || !vendorForm.phone) return alert('Name and phone are required.');
        try {
            setVendorSaving(true);
            const res = await vendorAPI.create(vendorForm);
            if (res.success) {
                setShowAddVendorModal(false);
                setVendorForm(emptyVendorForm);
                fetchData();
            }
        } catch (err) {
            console.error('Error adding vendor:', err);
            alert('Failed to add vendor: ' + err.message);
        } finally {
            setVendorSaving(false);
        }
    };

    const handleViewVendorDetails = async (vendor) => {
        setSelectedVendorDetail(vendor);
        try {
            const historyRes = await procurementAPI.getVendorPurchaseHistory({ vendorId: vendor._id });
            if (historyRes.success) {
                setVendorHistory(historyRes.data);
            } else {
                setVendorHistory([]);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
            setVendorHistory([]);
        }
    };

    const addProductRow = () => setVendorForm(prev => ({ ...prev, products: [...prev.products, { itemName: '', unitPrice: '', unit: 'pieces' }] }));
    const removeProductRow = (i) => setVendorForm(prev => ({ ...prev, products: prev.products.filter((_, idx) => idx !== i) }));
    const updateProductRow = (i, field, val) => setVendorForm(prev => {
        const products = [...prev.products];
        products[i] = { ...products[i], [field]: val };
        return { ...prev, products };
    });

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        return `₹${amount.toLocaleString()}`;
    };

    const pendingRequests = materialRequests.filter(r => (r.status === 'Pending' || r.status === 'Approved') && !r.isPushedFromDesign);
    
    // Combine MRs from design and pushed tasks (prioritizing MRs)
    const handoffMRs = materialRequests.filter(r => (r.status === 'Pending' || r.status === 'Approved') && r.isPushedFromDesign);
    const handoffTasks = pushedTasks.filter(t => !handoffMRs.some(mr => mr.quotation === t.quotation?._id || mr.notes?.includes(t.title)) && t.status === 'Pushed to Procurement');
    
    const designHandoffs = [
        ...handoffMRs.map(r => ({ ...r, type: 'MaterialRequest' })),
        ...handoffTasks.map(t => ({ ...t, type: 'Task' }))
    ];
    
    const allAssigned = [
        ...materialRequests.filter(r => ['Assigned', 'In Progress', 'Purchasing', 'Pending Manager Review', 'Pending Admin Review', 'Pending Procurement Admin Review', 'Procurement Approved'].includes(r.status)).map(r => ({ ...r, type: 'MaterialRequest' })),
        ...pushedTasks.filter(t => ['Assigned to Procurement', 'In Progress', 'Pending Manager Review', 'Pending Procurement Admin Review', 'Procurement Approved'].includes(t.status)).map(t => ({ ...t, type: 'Task' }))
    ];

    const pendingReviews = allAssigned.filter(r => r.status === 'Pending Manager Review');
    const assignedRequests = allAssigned.filter(r => ['Assigned', 'In Progress', 'Purchasing', 'Assigned to Procurement'].includes(r.status));
    const completedRequests = allAssigned.filter(r => r.status === 'Procurement Approved');
    const extensionRequests = materialRequests.filter(r => r.timeExtension && r.timeExtension.status === 'Pending');

    if (loading) return <div className="loading-state">Initializing Procurement Manager Workspace...</div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <Overview 
                    pendingRequests={pendingRequests} 
                    designHandoffs={designHandoffs} 
                    assignedRequests={assignedRequests} 
                    completedRequests={completedRequests} 
                    extensionRequests={extensionRequests} 
                    materialRequests={materialRequests} 
                    navigate={navigate} 
                />;

            case 'handoffs':
                return <DesignHandoffs 
                    designHandoffs={designHandoffs} 
                    setSelectedRequest={setSelectedRequest} 
                    setShowAssignModal={setShowAssignModal} 
                    selectedReviewItem={selectedReviewItem} 
                    setSelectedReviewItem={setSelectedReviewItem} 
                    formatCurrency={formatCurrency} 
                />;

            case 'requests':
                return <MaterialRequests 
                    pendingRequests={pendingRequests} 
                    setSelectedRequest={setSelectedRequest} 
                    setShowAssignModal={setShowAssignModal} 
                />;

            case 'assignments':
                return <Assignments 
                    assignedRequests={assignedRequests} 
                    pendingReviews={pendingReviews}
                    handleApproveToAdmin={handleApproveToAdmin}
 
                />;

            case 'vendors':
                return <Vendors 
                    vendors={vendors} 
                    setShowAddVendorModal={setShowAddVendorModal} 
                    handleViewVendorDetails={handleViewVendorDetails} 
                />;

            case 'completed':
                return (
                    <div className="procurement-premium-wrapper">
                        <div className="premium-banner">
                            <h1 className="banner-title">Completed & Handoff</h1>
                            <p className="banner-subtitle">Finalize procurement and transition projects to Production phase.</p>
                        </div>
                        <div className="premium-list-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="list-panel">
                                <div className="chart-header">
                                    <h4 className="chart-title">Completed Requests ({completedRequests.length})</h4>
                                </div>
                                <div className="completed-list">
                                    {completedRequests.map(req => (
                                        <div key={req._id} className="list-item-modern">
                                            <div className="item-icon-box" style={{ background: '#f0fdf4' }}>
                                                <CheckCircle size={18} color="#10b981" />
                                            </div>
                                            <div className="item-details">
                                                <div className="item-title">{req.requestNumber}</div>
                                                <div className="item-subtitle">{req.project?.name} • Ready for Production</div>
                                            </div>
                                            <button 
                                                className="btn-add" 
                                                onClick={() => handleHandoff(req)}
                                                style={{ padding: '8px 16px', fontSize: '0.8rem', background: '#0ea5e9', color: 'white' }}
                                            >
                                                Handoff to Production <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {completedRequests.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                                            No completed requests waiting for handoff.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="role-dashboard fade-in">
            <main style={{ flex: 1 }}>
                {renderContent()}
            </main>

            {showAssignModal && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="modal-content" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Assign Procurement Task</h3>
                            <button className="close-btn" onClick={() => setShowAssignModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Request Detail</div>
                                <div style={{ fontWeight: 700 }}>{selectedRequest?.requestNumber}</div>
                                <div style={{ fontSize: '0.9rem', color: '#475569' }}>Project: {selectedRequest?.project?.name}</div>
                            </div>
                            
                            <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Select Procurement Staff</h4>
                            <div className="staff-list" style={{ display: 'grid', gap: '0.75rem' }}>
                                {staff.map(member => (
                                    <div 
                                        key={member._id} 
                                        className="staff-option"
                                        onClick={() => handleAssignStaff(member._id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0f3ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                            {member.fullName?.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{member.fullName}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{member.email}</div>
                                        </div>
                                        <button className="btn-select-staff" style={{ padding: '6px 12px', borderRadius: '8px', background: '#f0f3ff', color: '#4f46e5', border: 'none', fontSize: '0.75rem', fontWeight: 700 }}>Select</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        {showAddVendorModal && (
            <div className="modal-overlay" onClick={() => setShowAddVendorModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="modal-content" style={{ background: 'white', width: '640px', borderRadius: '16px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Add New Vendor</h3>
                        <button onClick={() => setShowAddVendorModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                    </div>

                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem 0' }}>Vendor Details</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.5rem' }}>
                        {[['Vendor Name *', 'name', 'text', 'e.g. Regal Timber Co.'], ['Phone *', 'phone', 'tel', '+91 98765 43210'], ['Email', 'email', 'email', 'vendor@example.com'], ['Category', 'category', 'text', 'e.g. Wood, Fabric'], ['Address', 'address', 'text', 'City, State'], ['GSTIN', 'gstin', 'text', '22AAAAA0000A1Z5']].map(([label, field, type, placeholder]) => (
                            <div key={field}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>{label}</label>
                                <input type={type} placeholder={placeholder} value={vendorForm[field]} onChange={e => setVendorForm(prev => ({ ...prev, [field]: e.target.value }))} style={{ width: '100%', padding: '9px 11px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Product Catalog</p>
                        <button onClick={addProductRow} style={{ background: '#f0fdf4', color: '#10b981', border: '1px solid #bbf7d0', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={13} /> Add Item</button>
                    </div>
                    {vendorForm.products.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1rem' }}>No products yet — click "+ Add Item" to build the catalog.</p>
                    ) : (
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1fr auto', gap: '0.5rem', marginBottom: '0.4rem', paddingLeft: '2px' }}>
                                {['Item Name', 'Unit Price (₹)', 'Unit', ''].map(h => <span key={h} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</span>)}
                            </div>
                            {vendorForm.products.map((p, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <input placeholder="e.g. Teak Wood" value={p.itemName} onChange={e => updateProductRow(i, 'itemName', e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none' }} />
                                    <input type="number" placeholder="0.00" value={p.unitPrice} min="0" onChange={e => updateProductRow(i, 'unitPrice', e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                                    <select value={p.unit} onChange={e => updateProductRow(i, 'unit', e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none' }}>
                                        {['pieces', 'kg', 'meters', 'sqft', 'liters', 'boxes', 'rolls', 'sets'].map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                    <button onClick={() => removeProductRow(i)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                        <button onClick={() => setShowAddVendorModal(false)} style={{ flex: 1, padding: '11px', background: '#f1f5f9', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleAddVendor} disabled={vendorSaving} style={{ flex: 1, padding: '11px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Save size={16} /> {vendorSaving ? 'Saving...' : 'Save Vendor'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        {selectedVendorDetail && (
            <div className="modal-overlay" onClick={() => setSelectedVendorDetail(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="modal-content" style={{ background: 'white', width: '700px', borderRadius: '16px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{selectedVendorDetail.name} Details</h3>
                        <button onClick={() => setSelectedVendorDetail(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#64748b' }}>Contact</p>
                            <p style={{ margin: 0, fontWeight: 600 }}>{selectedVendorDetail.phone} {selectedVendorDetail.email ? `• ${selectedVendorDetail.email}` : ''}</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#64748b' }}>Location</p>
                            <p style={{ margin: 0, fontWeight: 600 }}>{selectedVendorDetail.address || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#64748b' }}>Category</p>
                            <p style={{ margin: 0, fontWeight: 600 }}>{selectedVendorDetail.category || selectedVendorDetail.categories?.[0] || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#64748b' }}>GSTIN</p>
                            <p style={{ margin: 0, fontWeight: 600 }}>{selectedVendorDetail.gstin || 'N/A'}</p>
                        </div>
                    </div>

                    {selectedVendorDetail.products?.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#475569', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>Product Catalog</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                {selectedVendorDetail.products.map((p, i) => (
                                    <div key={i} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{p.itemName}</div>
                                        <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 700 }}>₹{p.unitPrice} / {p.unit}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#475569', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>Purchase History</h4>
                        {vendorHistory.length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', background: '#f8fafc', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>No purchases recorded for this vendor.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {vendorHistory.map(purchase => (
                                    <div key={purchase._id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{purchase.purchaseNumber || 'Purchase'}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>
                                            {purchase.items?.map(i => `${i.quantity}x ${i.itemName}`).join(', ')}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>By: {purchase.purchasedBy?.fullName || 'Staff'}</span>
                                            <span style={{ fontWeight: 700, color: '#10b981' }}>{formatCurrency(purchase.finalAmount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default ProcurementManagerDashboard;