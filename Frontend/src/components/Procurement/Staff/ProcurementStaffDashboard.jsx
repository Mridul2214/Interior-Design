import React, { useState, useEffect } from 'react';
import { 
    Truck, Package, CheckCircle, Clock, AlertTriangle,
    ArrowRight, Plus, Eye, DollarSign, Scale, FileText,
    ShoppingCart, Target, Users, BarChart3, Search, Filter,
    Calendar, Save, X, History, Trash2, MapPin, CheckSquare
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { projectAPI, vendorAPI, procurementAPI } from '../../../config/api';
import '../css/StaffDashboard.css';

const ProcurementStaffDashboard = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [vendorStats, setVendorStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [vendorSearch, setVendorSearch] = useState('');
    
    // Sourcing Hub States
    const [selectedSourcingProject, setSelectedSourcingProject] = useState(null);
    const [sourcingBucket, setSourcingBucket] = useState([]);
    const [savedSourcing, setSavedSourcing] = useState([]);
    const [sourcingSearch, setSourcingSearch] = useState('');
    const [dailyUpdate, setDailyUpdate] = useState('');

    const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
    const [showTimeExtension, setShowTimeExtension] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [itemsToBuy, setItemsToBuy] = useState([]);
    const [extensionReason, setExtensionReason] = useState('');
    const [extensionDate, setExtensionDate] = useState('');
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [compareResults, setCompareResults] = useState([]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksRes, vendorsRes, projectsRes] = await Promise.all([
                procurementAPI.getStaffTasks(),
                vendorAPI.getAll(),
                projectAPI.getByStage('Procurement')
            ]);

            if (tasksRes.success) setTasks(tasksRes.data);
            if (vendorsRes.success) setVendors(vendorsRes.data);
            
            if (projectsRes.success || tasksRes.success) {
                const projMap = new Map();
                if (projectsRes.success) {
                    projectsRes.data.forEach(p => projMap.set(p._id, p));
                }
                if (tasksRes.success) {
                    tasksRes.data.forEach(t => {
                        if (t.project && t.project._id) {
                            projMap.set(t.project._id, t.project);
                        }
                    });
                }
                setProjects(Array.from(projMap.values()));
            }

            const saved = localStorage.getItem('savedSourcing');
            if (saved) setSavedSourcing(JSON.parse(saved));

            await fetchPurchaseHistory();
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSourcing = async () => {
        if (!selectedSourcingProject || sourcingBucket.length === 0) return;
        
        try {
            const newEntry = {
                id: Date.now(),
                project: selectedSourcingProject,
                items: sourcingBucket,
                dailyUpdate,
                savedAt: new Date()
            };
            const updated = [newEntry, ...savedSourcing];
            setSavedSourcing(updated);
            localStorage.setItem('savedSourcing', JSON.stringify(updated));
            
            // Send daily update notification to manager
            await notificationAPI.create({
                recipientRole: 'Procurement Manager',
                title: `Sourcing Update: ${selectedSourcingProject.name}`,
                message: `Staff ${user?.fullName || ''} has updated the sourcing list for project ${selectedSourcingProject.projectNumber}. Status: ${dailyUpdate || 'In Progress'}`,
                type: 'info',
                relatedId: selectedSourcingProject._id,
                relatedModel: 'Project'
            });

            setSourcingBucket([]);
            setSelectedSourcingProject(null);
            setDailyUpdate('');
            alert('Sourcing list saved and manager notified!');
        } catch (err) {
            console.error('Error saving sourcing:', err);
            alert('Saved locally, but failed to notify manager.');
        }
    };

    const handleAddToBucket = (product, vendor) => {
        const newItem = {
            ...product,
            vendorName: vendor.name,
            vendorLocation: vendor.location || vendor.address,
            vendorId: vendor._id,
            addedAt: new Date()
        };
        setSourcingBucket(prev => [...prev, newItem]);
    };

    const handleRemoveFromBucket = (idx) => {
        setSourcingBucket(prev => prev.filter((_, i) => i !== idx));
    };

    const handleDeleteSaved = (id) => {
        const updated = savedSourcing.filter(s => s.id !== id);
        setSavedSourcing(updated);
        localStorage.setItem('savedSourcing', JSON.stringify(updated));
    };

    const fetchPurchaseHistory = async (query = '') => {
        try {
            const historyRes = await procurementAPI.getVendorPurchaseHistory(
                query ? { search: query } : {}
            );
            if (historyRes.success) {
                setPurchaseHistory(historyRes.data);
                setVendorStats(historyRes.vendorStats);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        }
    };

    const handleSearch = () => {
        fetchPurchaseHistory(searchQuery);
    };

    const handleComparePrices = async () => {
        try {
            const items = itemsToBuy.map(item => ({
                itemName: item.itemName,
                quantity: item.quantity || 1
            }));
            const result = await procurementAPI.compareVendorPrices(items);
            if (result.success) {
                setCompareResults(result.data);
                setShowCompareModal(true);
            }
        } catch (err) {
            console.error('Error comparing prices:', err);
        }
    };

    const handleRequestTimeExtension = async () => {
        try {
            await procurementAPI.requestTimeExtension(selectedTask._id, {
                requestedDate: extensionDate,
                reason: extensionReason
            });
            setShowTimeExtension(false);
            setExtensionDate('');
            setExtensionReason('');
            fetchData();
        } catch (err) {
            console.error('Error requesting extension:', err);
        }
    };

    const recordPurchase = async (purchaseData) => {
        try {
            await procurementAPI.createVendorPurchase(purchaseData);
            setShowPurchaseModal(false);
            await procurementAPI.updateMaterialRequest(selectedTask._id, {
                status: 'Completed',
                completedAt: new Date()
            });
            fetchData();
        } catch (err) {
            console.error('Error recording purchase:', err);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        return `₹${amount.toLocaleString()}`;
    };

    const pendingTasks = tasks.filter(t => t.status === 'Assigned');
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress' || t.status === 'Purchasing');
    const completedTasks = tasks.filter(t => t.status === 'Completed');

    const vendorPurchaseCounts = (vendorStats || []).reduce((acc, v) => {
        const vid = v.vendor?._id || v.vendor;
        if (vid) {
            acc[vid] = {
                totalPurchases: v.totalPurchases,
                totalAmount: v.totalAmount,
                totalDiscount: v.totalDiscount
            };
        }
        return acc;
    }, {});

    if (loading) return <div className="loading-state">Initializing Procurement Workspace...</div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="fade-in">
                        <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                            <h3>Procurement Workspace</h3>
                            <p>Manage your assigned material requests and vendor interactions.</p>
                        </div>

                        <div className="stats-row">
                            <div className="stat-pill">
                                <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '12px', color: '#f59e0b' }}>
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <strong>{pendingTasks.length}</strong>
                                    <span>Pending Tasks</span>
                                </div>
                            </div>
                            <div className="stat-pill">
                                <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '12px', color: '#0ea5e9' }}>
                                    <Target size={24} />
                                </div>
                                <div>
                                    <strong>{inProgressTasks.length}</strong>
                                    <span>In Progress</span>
                                </div>
                            </div>
                            <div className="stat-pill">
                                <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px', color: '#10b981' }}>
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <strong>{completedTasks.length}</strong>
                                    <span>Completed</span>
                                </div>
                            </div>
                        </div>

                        <div className="overview-split">
                            <div className="overview-left">
                                <h4>Current Assignments</h4>
                                <div className="queue-list">
                                    {[...pendingTasks, ...inProgressTasks].slice(0, 5).map(task => (
                                        <div key={task._id} className="queue-item">
                                            <div className={`queue-dot ${task.status === 'Assigned' ? 'to-do' : 'in-progress'}`}></div>
                                            <div className="queue-info">
                                                <strong>{task.requestNumber}</strong>
                                                <span>{task.project?.name} • {task.items?.length || 0} items</span>
                                            </div>
                                            <button className="btn-go" onClick={() => setActiveTab('tasks')}>
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    {pendingTasks.length === 0 && inProgressTasks.length === 0 && (
                                        <div className="empty-mini">No active tasks</div>
                                    )}
                                </div>
                            </div>
                            <div className="overview-right">
                                <h4>Recent Activity</h4>
                                <div className="feedback-small-list">
                                    {purchaseHistory.slice(0, 3).map(purchase => (
                                        <div key={purchase._id} className="feed-small-item">
                                            <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '8px', color: '#10b981' }}>
                                                <DollarSign size={18} />
                                            </div>
                                            <div className="feed-text">
                                                <strong>{purchase.vendor?.name}</strong>
                                                <p>Purchased {purchase.items?.length || 0} items for {formatCurrency(purchase.finalAmount)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'sourcing':
                const marketResults = vendors.filter(v => 
                    v.status === 'Active' && (
                        v.name.toLowerCase().includes(sourcingSearch.toLowerCase()) ||
                        v.products?.some(p => p.itemName.toLowerCase().includes(sourcingSearch.toLowerCase()))
                    )
                );

                return (
                    <div className="fade-in sourcing-hub">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Sourcing Hub</h3>
                                <p style={{ margin: '4px 0 0', color: '#64748b' }}>
                                    {selectedSourcingProject ? `Sourcing for: ${selectedSourcingProject.name}` : 'Select a project to start curating materials.'}
                                </p>
                            </div>
                            {selectedSourcingProject && (
                                <button 
                                    onClick={() => setSelectedSourcingProject(null)}
                                    style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Projects
                                </button>
                            )}
                        </div>

                        {!selectedSourcingProject ? (
                            <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                                {projects.length === 0 ? (
                                    <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
                                        <Target size={48} color="#94a3b8" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                        <h4 style={{ color: '#475569', margin: '0 0 8px 0' }}>No Procurement Projects</h4>
                                        <p style={{ color: '#94a3b8', margin: 0 }}>There are currently no active projects in the procurement stage.</p>
                                    </div>
                                ) : (
                                    projects.map(project => (
                                        <div 
                                            key={project._id} 
                                            onClick={() => setSelectedSourcingProject(project)}
                                            style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                                            className="project-card-hover"
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{project.name}</h4>
                                                    <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{project.projectNumber}</span>
                                                </div>
                                                <div style={{ background: '#eef2ff', color: '#6366f1', padding: '8px', borderRadius: '10px' }}>
                                                    <Target size={20} />
                                                </div>
                                            </div>
                                            
                                            <div style={{ fontSize: '0.85rem', color: '#475569', display: 'grid', gap: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <MapPin size={14} color="#94a3b8" /> {project.location || 'Location not specified'}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Users size={14} color="#94a3b8" /> Client: {project.client?.name || 'N/A'}
                                                </div>
                                            </div>

                                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6366f1' }}>Start Sourcing</span>
                                                <ArrowRight size={16} color="#6366f1" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="sourcing-workspace" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', height: 'calc(100vh - 250px)', minHeight: '600px', marginBottom: '3rem' }}>
                                {/* Left Side: Project Bucket */}
                                <div className="sourcing-bucket-column" style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={18} color="#6366f1" /> Project Item List</h4>
                                            <span className="badge-lite" style={{ background: '#eef2ff', color: '#6366f1' }}>{sourcingBucket.length} Items</span>
                                        </div>
                                    </div>
                                    
                                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                                        {sourcingBucket.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
                                                <ShoppingCart size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                                <p>Your sourcing bucket is empty.<br/>Search and add items from the market.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {sourcingBucket.map((item, idx) => (
                                                    <div key={idx} className="bucket-item-premium" style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', position: 'relative' }}>
                                                        <button onClick={() => handleRemoveFromBucket(idx)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 }}><Trash2 size={16} /></button>
                                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.itemName}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> {item.vendorName}</span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {item.vendorLocation}</span>
                                                        </div>
                                                        <div style={{ marginTop: '8px', color: '#10b981', fontWeight: 700 }}>₹{item.unitPrice} / {item.unit}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Daily Update to Manager</label>
                                            <textarea 
                                                value={dailyUpdate}
                                                onChange={(e) => setDailyUpdate(e.target.value)}
                                                placeholder="Enter progress update for the design/procurement manager..."
                                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '80px', outline: 'none', fontSize: '0.9rem' }}
                                            />
                                        </div>
                                        <button 
                                            onClick={handleSaveSourcing}
                                            disabled={sourcingBucket.length === 0}
                                            style={{ width: '100%', padding: '14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}
                                        >
                                            <Save size={18} /> Save & Send Update
                                        </button>
                                    </div>
                                </div>

                                {/* Right Side: Search / Market */}
                                <div className="sourcing-market-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ flex: 1, position: 'relative' }}>
                                                <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                                <input 
                                                    type="text" 
                                                    placeholder="Search Items or Vendors..."
                                                    value={sourcingSearch}
                                                    onChange={(e) => setSourcingSearch(e.target.value)}
                                                    style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '1rem', transition: 'all 0.2s' }}
                                                />
                                            </div>
                                            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '16px', color: '#64748b' }}><Filter size={20} /></div>
                                        </div>
                                    </div>

                                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {marketResults.map(vendor => (
                                            <div key={vendor._id} className="market-vendor-card" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                    <div>
                                                        <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{vendor.name}</h5>
                                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><MapPin size={12} /> {vendor.location || vendor.address}</div>
                                                    </div>
                                                    <span className="badge-lite" style={{ height: 'fit-content' }}>{vendor.category}</span>
                                                </div>
                                                
                                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                                    {vendor.products?.map((p, i) => (
                                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                                            <div>
                                                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{p.itemName}</div>
                                                                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>₹{p.unitPrice} / {p.unit}</div>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleAddToBucket(p, vendor)}
                                                                style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {marketResults.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '24px', color: '#94a3b8' }}>
                                                No matches found for "{sourcingSearch}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Saved Section */}
                        <div style={{ marginTop: '3rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                <div style={{ padding: '8px', background: '#f0fdf4', color: '#10b981', borderRadius: '10px' }}><CheckSquare size={20} /></div>
                                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Saved Sourcing Drafts</h4>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                {savedSourcing.map(draft => (
                                    <div key={draft.id} className="saved-sourcing-card" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div>
                                                <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{draft.project?.name}</h5>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Saved: {new Date(draft.savedAt).toLocaleDateString()}</span>
                                            </div>
                                            <button onClick={() => handleDeleteSaved(draft.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {draft.items.slice(0, 2).map((item, i) => (
                                                <div key={i} style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{item.itemName}</span>
                                                    <span style={{ fontWeight: 600 }}>₹{item.unitPrice}</span>
                                                </div>
                                            ))}
                                            {draft.items.length > 2 && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>+{draft.items.length - 2} more items</span>}
                                        </div>
                                        <div style={{ marginTop: '1rem', padding: '12px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                                            "{draft.dailyUpdate || 'No update provided'}"
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setSelectedSourcingProject(draft.project);
                                                setSourcingBucket(draft.items);
                                                setDailyUpdate(draft.dailyUpdate);
                                                handleDeleteSaved(draft.id); // Remove to re-save later
                                            }}
                                            style={{ width: '100%', marginTop: '1rem', padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                                        >
                                            Edit & Continue
                                        </button>
                                    </div>
                                ))}
                                {savedSourcing.length === 0 && (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', border: '2px dashed #e2e8f0', borderRadius: '24px', color: '#94a3b8' }}>
                                        No saved sourcing lists yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'tasks':
                return (
                    <div className="fade-in">
                        <div className="section-card">
                            <div className="section-header">
                                <h3><Package size={18} /> My Assigned Tasks</h3>
                            </div>
                            <div className="tasks-list">
                                {(pendingTasks.length > 0 || inProgressTasks.length > 0) ? (
                                    [...pendingTasks, ...inProgressTasks].map(task => (
                                        <div key={task._id} className="task-item" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '0.5rem' }}>
                                            <div className="task-info">
                                                <span className="task-number" style={{ fontSize: '1rem', fontWeight: 700 }}>{task.requestNumber}</span>
                                                <span className="task-project" style={{ fontSize: '0.8rem', color: '#64748b' }}>{task.project?.name}</span>
                                                <span className="task-items" style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.8rem' }}>
                                                    {task.items?.length || 0} items requested
                                                </span>
                                            </div>
                                            <div className="task-status">
                                                <span className={`status-pill ${task.status?.toLowerCase().replace(' ', '-')}`} style={{ 
                                                    background: task.status === 'Assigned' ? '#fffbeb' : '#f0f9ff',
                                                    color: task.status === 'Assigned' ? '#d97706' : '#0ea5e9'
                                                }}>
                                                    {task.status}
                                                </span>
                                            </div>
                                            <div className="task-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button 
                                                    className="btn-details"
                                                    style={{ padding: '8px 16px', background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        setShowTaskDetailsModal(true);
                                                    }}
                                                >
                                                    <Eye size={14} /> Details
                                                </button>
                                                <button 
                                                    className="btn-extend"
                                                    style={{ padding: '8px 16px', background: '#e0e7ff', color: '#6366f1', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        setShowTimeExtension(true);
                                                    }}
                                                >
                                                    <Calendar size={14} /> Time
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
                                        <Package size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                        <p>No material requests assigned to you yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'history':
                return (
                    <div className="fade-in">
                        <div className="search-section" style={{ marginBottom: '1.5rem' }}>
                            <div className="search-input-group" style={{ display: 'flex', gap: '0.5rem', background: 'white', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <Search size={18} />
                                <input
                                    style={{ flex: 1, border: 'none', outline: 'none' }}
                                    type="text"
                                    placeholder="Search products in vendor history..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button className="btn-search" style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }} onClick={handleSearch}>Search</button>
                            </div>
                        </div>
                        <div className="section-card">
                            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3><History size={18} /> Purchase History</h3>
                                <button 
                                    className="btn-compare"
                                    style={{ padding: '8px 16px', background: '#e0e7ff', color: '#6366f1', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    onClick={handleComparePrices}
                                    disabled={itemsToBuy.length === 0}
                                >
                                    <Filter size={14} /> Compare Market Prices
                                </button>
                            </div>
                            <div className="vendor-history-list">
                                {vendorStats.length > 0 ? (
                                    vendorStats.map(v => (
                                        <div key={v.vendor?._id || Math.random()} className="vendor-history-item" style={{ border: '1px solid #f1f5f9', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
                                            <div className="vendor-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span className="vendor-name" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{v.vendor?.name}</span>
                                                <span className="vendor-code" style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>{v.vendor?.vendorCode}</span>
                                            </div>
                                            <div className="vendor-details" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', margin: '1rem 0' }}>
                                                <div className="detail-row" style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className="label" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Orders</span>
                                                    <span className="value" style={{ fontWeight: 700 }}>{v.totalPurchases}</span>
                                                </div>
                                                <div className="detail-row" style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className="label" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Spent</span>
                                                    <span className="value" style={{ fontWeight: 700 }}>{formatCurrency(v.totalAmount)}</span>
                                                </div>
                                                <div className="detail-row" style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className="label" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Saved</span>
                                                    <span className="value discount" style={{ fontWeight: 700, color: '#10b981' }}>{formatCurrency(v.totalDiscount)}</span>
                                                </div>
                                            </div>
                                            <div className="vendor-items">
                                                <span className="items-title" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Commonly Purchased Items</span>
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    {Object.entries(v.items).slice(0, 3).map(([itemName, data]) => (
                                                        <div key={itemName} className="item-row" style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', marginTop: '6px' }}>
                                                            <span className="item-name">{itemName}</span>
                                                            <span className="item-qty">x{data.quantity}</span>
                                                            <span className="item-amount" style={{ fontWeight: 600 }}>{formatCurrency(data.totalAmount)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">No purchase history found</div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'vendors':
                const searchLower = vendorSearch.toLowerCase();
                const filteredVendors = vendors.filter(v =>
                    v.status === 'Active' &&
                    (vendorSearch === '' ||
                        v.name?.toLowerCase().includes(searchLower) ||
                        v.category?.toLowerCase().includes(searchLower) ||
                        v.phone?.includes(searchLower) ||
                        v.address?.toLowerCase().includes(searchLower) ||
                        v.location?.toLowerCase().includes(searchLower) ||
                        v.products?.some(p => p.itemName?.toLowerCase().includes(searchLower)))
                );
                return (
                    <div className="fade-in">
                        <div className="section-card">
                            <div className="section-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3><Users size={18} /> Verified Vendors</h3>
                                <div style={{ background: '#f1f5f9', borderRadius: '50px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '10px', width: '260px' }}>
                                    <Search size={15} color="#94a3b8" />
                                    <input
                                        type="text"
                                        placeholder="Search vendors..."
                                        value={vendorSearch}
                                        onChange={e => setVendorSearch(e.target.value)}
                                        style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%' }}
                                    />
                                </div>
                            </div>
                            {filteredVendors.length === 0 ? (
                                <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                    {vendorSearch ? `No vendors matching "${vendorSearch}"` : 'No active vendors found.'}
                                </div>
                            ) : (
                                <div className="vendors-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {filteredVendors.map(vendor => (
                                        <div
                                            key={vendor._id}
                                            className="vendor-item"
                                            style={{ background: 'white', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onClick={() => {
                                                setSelectedVendor(vendor);
                                                fetchPurchaseHistory(vendor._id);
                                                navigate('?tab=history');
                                            }}
                                        >
                                            <div className="vendor-info">
                                                <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '4px' }}>{vendor.name}</strong>
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{vendor.category || vendor.address || 'General Supplier'}</span>
                                            </div>
                                            {vendor.products?.length > 0 && (
                                                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {vendor.products.slice(0, 3).map((p, i) => (
                                                        <span key={i} style={{ background: '#f0fdf4', color: '#10b981', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '50px' }}>
                                                            {p.itemName} — ₹{p.unitPrice}/{p.unit}
                                                        </span>
                                                    ))}
                                                    {vendor.products.length > 3 && <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>+{vendor.products.length - 3} more</span>}
                                                </div>
                                            )}
                                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6366f1' }}>{vendor.phone}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{vendorPurchaseCounts[vendor._id]?.totalPurchases || 0} Deals</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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

            {showTaskDetailsModal && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowTaskDetailsModal(false)}>
                    <div className="modal-content" style={{ background: 'white', width: '550px', borderRadius: '20px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800 }}>Task Details</h3>
                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedTask?.requestNumber}</span>
                            </div>
                            <button style={{ border: 'none', background: '#f1f5f9', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }} onClick={() => setShowTaskDetailsModal(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Project</span>
                                        <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{selectedTask?.project?.name || 'N/A'}</strong>
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Status</span>
                                        <span className={`status-pill ${selectedTask?.status?.toLowerCase().replace(' ', '-')}`} style={{ background: '#fffbeb', color: '#d97706' }}>
                                            {selectedTask?.status || 'Assigned'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Package size={16} color="#6366f1" /> Assigned Items ({selectedTask?.items?.length || 0})
                            </h4>
                            
                            <div className="items-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {selectedTask?.items?.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{item.itemName}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 800, color: '#6366f1' }}>{item.quantity} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.unit}</span></div>
                                        </div>
                                    </div>
                                ))}
                                {(!selectedTask?.items || selectedTask.items.length === 0) && (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px' }}>
                                        No items listed in this task.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showTimeExtension && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowTimeExtension(false)}>
                    <div className="modal-content" style={{ background: 'white', width: '450px', borderRadius: '16px', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>Request Time Extension</h3>
                            <button style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setShowTimeExtension(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Requested Date</label>
                                <input 
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    type="date" 
                                    value={extensionDate}
                                    onChange={(e) => setExtensionDate(e.target.value)}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Reason</label>
                                <textarea 
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    rows="4"
                                    value={extensionReason}
                                    onChange={(e) => setExtensionReason(e.target.value)}
                                    placeholder="Why is more time needed?"
                                ></textarea>
                            </div>
                            <button 
                                style={{ width: '100%', padding: '12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                                onClick={handleRequestTimeExtension}
                                disabled={!extensionDate || !extensionReason}
                            >
                                Send Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcurementStaffDashboard;