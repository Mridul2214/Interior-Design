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

const ProcurementManagerDashboard = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';

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
                procurementAPI.getMaterialRequests({ limit: 100, sort: '-createdAt' }),
                taskAPI.getAll({ status: 'Pushed to Procurement', limit: 100 })
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
    const handoffTasks = pushedTasks.filter(t => !handoffMRs.some(mr => mr.quotation === t.quotation?._id || mr.notes?.includes(t.title)));
    
    const designHandoffs = [
        ...handoffMRs.map(r => ({ ...r, type: 'MaterialRequest' })),
        ...handoffTasks.map(t => ({ ...t, type: 'Task' }))
    ];
    const assignedRequests = materialRequests.filter(r => r.status === 'Assigned' || r.status === 'In Progress' || r.status === 'Purchasing');
    const completedRequests = materialRequests.filter(r => r.status === 'Completed');
    const extensionRequests = materialRequests.filter(r => r.timeExtension && r.timeExtension.status === 'Pending');

    if (loading) return <div className="loading-state">Initializing Procurement Manager Workspace...</div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                const chartData = [
                    { name: 'Pending', value: pendingRequests.length + designHandoffs.length, color: '#6366f1' },
                    { name: 'Active', value: assignedRequests.length, color: '#3b82f6' },
                    { name: 'Completed', value: completedRequests.length, color: '#10b981' }
                ];

                const performanceData = [
                    { day: 'Mon', count: 4 },
                    { day: 'Tue', count: 7 },
                    { day: 'Wed', count: 5 },
                    { day: 'Thu', count: 9 },
                    { day: 'Fri', count: 12 },
                    { day: 'Sat', count: 6 },
                    { day: 'Sun', count: 3 }
                ];

                return (
                    <div className="fade-in">
                        <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderRadius: '24px', padding: '2.5rem', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1))', pointerEvents: 'none' }}></div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '10px' }}>
                                        <Activity size={20} color="#818cf8" />
                                    </div>
                                    <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Operations Overview</span>
                                </div>
                                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Procurement Intelligence</h3>
                                <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '600px' }}>Monitor supply chain efficiency, material handoffs, and fulfillment status in real-time.</p>
                            </div>
                        </div>

                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div className="stat-card premium">
                                <div className="stat-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>
                                    <Target size={24} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-label">Pending Reviews</span>
                                    <span className="stat-value">{pendingRequests.length}</span>
                                </div>
                            </div>
                            <div className="stat-card premium">
                                <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                                    <Truck size={24} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-label">Active Assignments</span>
                                    <span className="stat-value">{assignedRequests.length}</span>
                                </div>
                            </div>
                            <div className="stat-card premium">
                                <div className="stat-icon" style={{ background: '#f0fdf4', color: '#10b981' }}>
                                    <CheckCircle size={24} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-label">Completed Orders</span>
                                    <span className="stat-value">{completedRequests.length}</span>
                                </div>
                            </div>
                            <div className="stat-card premium">
                                <div className="stat-icon" style={{ background: '#fff7ed', color: '#f97316' }}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-label">Time Extensions</span>
                                    <span className="stat-value">{extensionRequests.length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="visuals-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div className="card-premium chart-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>Assignment Velocity</h4>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <span className="badge-lite">Weekly</span>
                                    </div>
                                </div>
                                <div style={{ height: '240px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={performanceData}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                            />
                                            <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="card-premium chart-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#1e293b', marginBottom: '1.5rem' }}>Status Breakdown</h4>
                                <div style={{ height: '240px', width: '100%', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{materialRequests.length}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overview-split" style={{ gap: '1.5rem' }}>
                            <div className="overview-left" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>Design Handoff Queue</h4>
                                    <span style={{ padding: '4px 12px', background: '#eef2ff', color: '#6366f1', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700 }}>{designHandoffs.length} New</span>
                                </div>
                                <div className="queue-list-premium">
                                    {designHandoffs.slice(0, 5).map(item => (
                                        <div key={item._id} className="queue-item-premium" style={{ display: 'flex', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '16px', marginBottom: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                                <TrendingUp size={18} color="#6366f1" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{item.type === 'MaterialRequest' ? item.requestNumber : item.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.project?.name} • {item.type === 'MaterialRequest' ? `${item.items?.length || 0} items` : 'Pending List'}</div>
                                            </div>
                                            <button className="btn-action-round" onClick={() => navigate('?tab=handoffs')} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                                <ArrowRight size={14} color="#6366f1" />
                                            </button>
                                        </div>
                                    ))}
                                    {designHandoffs.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>No recent design handoffs</div>
                                    )}
                                </div>
                            </div>

                            <div className="overview-right" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>Standard Requests</h4>
                                    <span style={{ padding: '4px 12px', background: '#f8fafc', color: '#64748b', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700 }}>{pendingRequests.length} Total</span>
                                </div>
                                <div className="queue-list-premium">
                                    {pendingRequests.slice(0, 5).map(req => (
                                        <div key={req._id} className="queue-item-premium" style={{ display: 'flex', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '16px', marginBottom: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                                <Package size={18} color="#94a3b8" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{req.requestNumber}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.project?.name} • {req.items?.length || 0} items</div>
                                            </div>
                                            <button className="btn-action-round" onClick={() => navigate('?tab=requests')} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                                <ArrowRight size={14} color="#94a3b8" />
                                            </button>
                                        </div>
                                    ))}
                                    {pendingRequests.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>No pending standard requests</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'handoffs':
                return (
                    <div className="fade-in">
                        <div className="section-card">
                            <div className="section-header" style={{ borderLeft: '4px solid #6366f1', paddingLeft: '1rem' }}>
                                <h3><Plus size={18} color="#6366f1" /> Pushed Designs from Design Manager</h3>
                                <span className="badge" style={{ background: '#6366f1' }}>Priority Action</span>
                            </div>
                            <div className="requests-list">
                                {designHandoffs.length > 0 ? designHandoffs.map(item => (
                                    <div key={item._id} className="request-item-premium" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem', background: item.type === 'Task' ? '#f8fafc' : '#eef2ff', borderRadius: '16px', marginBottom: '1rem', border: item.type === 'Task' ? '1px dashed #cbd5e1' : '1px solid #c7d2fe' }}>
                                        <div className="request-info">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>{item.type === 'MaterialRequest' ? item.requestNumber : item.title}</span>
                                                <span style={{ fontSize: '0.65rem', background: item.type === 'Task' ? '#64748b' : '#6366f1', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                                                    {item.type === 'Task' ? 'DESIGN PUSHED (NO MR)' : 'MATERIAL REQUEST'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                                                Project: <strong>{item.project?.name}</strong> • {item.type === 'MaterialRequest' ? `${item.items?.length || 0} items` : 'Needs Material Verification'}
                                            </div>
                                            <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', marginTop: '10px', fontSize: '0.8rem', color: '#4338ca' }}>
                                                <strong>Design Note:</strong> {item.type === 'MaterialRequest' ? (item.notes || 'Final design approved and pushed for procurement.') : (item.description || 'Pushed from design stage. Please check drawings and create material list.')}
                                            </div>
                                        </div>
                                        <div className="request-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <button 
                                                className="btn-assign-staff"
                                                onClick={() => {
                                                    setSelectedRequest(item);
                                                    setShowAssignModal(true);
                                                }}
                                                style={{ background: '#6366f1', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}
                                            >
                                                <UserPlus size={18} /> {item.type === 'Task' ? 'Assign Design Review' : 'Assign Immediately'}
                                            </button>
                                                                             <button 
                                                className="btn-secondary-outline"
                                                onClick={() => setSelectedReviewItem(item)}
                                                style={{ background: 'white', color: '#64748b', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '10px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                                            >
                                                Review Project Details
                                            </button>
                                            {item.type === 'Task' && <span style={{ fontSize: '0.7rem', color: '#f59e0b', textAlign: 'center', fontWeight: 600 }}>Needs Material List</span>}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="empty-state">No design handoffs waiting for assignment</div>
                                )}
                            </div>
                        </div>

                        {/* Review Handoff Modal */}
                        {selectedReviewItem && (
                            <div className="modal-overlay" onClick={() => setSelectedReviewItem(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
                                <div className="modal-content" style={{ background: 'white', width: '700px', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }} onClick={e => e.stopPropagation()}>
                                    <button onClick={() => setSelectedReviewItem(null)} style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                                    
                                    <div style={{ marginBottom: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px' }}>Project Review</span>
                                            <span className="badge-lite" style={{ background: '#eef2ff', color: '#6366f1' }}>{selectedReviewItem.project?.projectNumber}</span>
                                        </div>
                                        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>{selectedReviewItem.project?.name}</h2>
                                        <p style={{ margin: '4px 0 0', color: '#64748b' }}>Client: {selectedReviewItem.project?.client?.name}</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                        <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                            <h4 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}><Target size={16} /> Status Info</h4>
                                            <div style={{ display: 'grid', gap: '8px', fontSize: '0.85rem' }}>
                                                <div><span style={{ color: '#64748b' }}>Project Stage:</span> <strong style={{ color: '#6366f1' }}>{selectedReviewItem.project?.stage}</strong></div>
                                                <div><span style={{ color: '#64748b' }}>Status:</span> <strong>{selectedReviewItem.project?.status}</strong></div>
                                                <div><span style={{ color: '#64748b' }}>Budget:</span> <strong>{formatCurrency(selectedReviewItem.project?.budget)}</strong></div>
                                            </div>
                                        </div>
                                        <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                            <h4 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}><FileText size={16} /> Handoff Details</h4>
                                            <div style={{ display: 'grid', gap: '8px', fontSize: '0.85rem' }}>
                                                <div><span style={{ color: '#64748b' }}>Type:</span> <strong>{selectedReviewItem.type === 'Task' ? 'Design Push' : 'Material Request'}</strong></div>
                                                <div><span style={{ color: '#64748b' }}>Items:</span> <strong>{selectedReviewItem.items?.length || 0} items listed</strong></div>
                                                <div><span style={{ color: '#64748b' }}>Date:</span> <strong>{new Date(selectedReviewItem.createdAt).toLocaleDateString()}</strong></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={16} /> Designer's Notes</h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#b45309', lineHeight: 1.6 }}>
                                            {selectedReviewItem.type === 'Task' 
                                                ? (selectedReviewItem.description || "No specific notes provided for this design push.")
                                                : (selectedReviewItem.notes || "No specific notes provided for this material request.")
                                            }
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button 
                                            onClick={() => {
                                                setSelectedRequest(selectedReviewItem);
                                                setSelectedReviewItem(null);
                                                setShowAssignModal(true);
                                            }}
                                            style={{ flex: 1, padding: '14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}
                                        >
                                            Assign Staff Now
                                        </button>
                                        <button 
                                            onClick={() => setSelectedReviewItem(null)}
                                            style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '14px', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Close Review
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
            );

            case 'requests':
                return (
                    <div className="fade-in">
                        <div className="section-card">
                            <div className="section-header">
                                <h3><Package size={18} /> Requests from Design Team</h3>
                                <span className="badge">New</span>
                            </div>
                            <div className="requests-list">
                                {pendingRequests.length > 0 ? pendingRequests.map(request => (
                                    <div key={request._id} className="request-item-premium" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', marginBottom: '1rem', border: '1px solid #f1f5f9' }}>
                                        <div className="request-info">
                                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>{request.requestNumber}</span>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                                                Project: <strong>{request.project?.name}</strong> • {request.items?.length || 0} items
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                <span className={`priority-badge ${request.priority?.toLowerCase()}`}>{request.priority} Priority</span>
                                                <span className="badge-outline">{request.project?.stage} Stage</span>
                                            </div>
                                        </div>
                                        <div className="request-actions">
                                            <button 
                                                className="btn-assign-staff"
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowAssignModal(true);
                                                }}
                                                style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                            >
                                                <UserPlus size={18} /> Assign Staff
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="empty-state">No requests currently pending assignment</div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'assignments':
                return (
                    <div className="fade-in">
                        <div className="section-card">
                            <div className="section-header">
                                <h3><ClipboardCheck size={18} /> Active Assignments</h3>
                            </div>
                            <div className="assigned-list">
                                {assignedRequests.length > 0 ? assignedRequests.map(request => (
                                    <div key={request._id} className="assigned-item-premium" style={{ padding: '1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div>
                                                <span style={{ fontWeight: 700 }}>{request.requestNumber}</span>
                                                <span style={{ marginLeft: '12px', color: '#64748b', fontSize: '0.9rem' }}>{request.project?.name}</span>
                                            </div>
                                            <span className={`status-pill ${request.status?.toLowerCase().replace(' ', '-')}`}>{request.status}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {request.assignedTo?.fullName?.charAt(0)}
                                            </div>
                                            <div style={{ fontSize: '0.9rem' }}>
                                                <span style={{ color: '#64748b' }}>Assigned to:</span> <strong>{request.assignedTo?.fullName}</strong>
                                            </div>
                                            <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#64748b' }}>
                                                {request.items?.length || 0} items in pipeline
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="empty-state">No active assignments found</div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'vendors':
                return (
                    <div className="fade-in">
                        <div className="section-card">
                            <div className="section-header">
                                <h3><Users size={18} /> Verified Vendor Network</h3>
                                <button className="btn-add-vendor" onClick={() => setShowAddVendorModal(true)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={14} /> Add Vendor</button>
                            </div>
                            <div className="vendors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {vendors.map(vendor => (
                                    <div key={vendor._id} className="vendor-card-premium" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div className="vendor-icon-box" style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f0f9ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Users size={24} />
                                            </div>
                                            <span className={`status-badge ${vendor.status?.toLowerCase()}`} style={{ height: 'fit-content' }}>{vendor.status}</span>
                                        </div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{vendor.name}</h4>
                                        <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>{vendor.vendorCode} • {vendor.category || 'General Supplier'}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                            <div style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: 700 }}>
                                                {'★'.repeat(Math.floor(vendor.rating || 0))}
                                                <span style={{ color: '#cbd5e1' }}>{'★'.repeat(5 - Math.floor(vendor.rating || 0))}</span>
                                            </div>
                                            <button onClick={() => handleViewVendorDetails(vendor)} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>View Details</button>
                                        </div>
                                    </div>
                                ))}
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