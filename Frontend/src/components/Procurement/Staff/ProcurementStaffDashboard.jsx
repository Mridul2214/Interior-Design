import React, { useState, useEffect } from 'react';
import { 
    Truck, Package, CheckCircle, Clock, AlertTriangle,
    ArrowRight, Plus, Eye, DollarSign, Scale, FileText,
    ShoppingCart, Target, Users, BarChart3, Search, Filter,
    Calendar, Save, X, History, Trash2, MapPin, CheckSquare
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { projectAPI, vendorAPI, procurementAPI, notificationAPI, taskAPI } from '../../../config/api';
import '../css/StaffDashboard.css';
import StaffOverview from './StaffOverview';
import SourcingHub from './SourcingHub';
import StaffTasks from './StaffTasks';
import StaffHistory from './StaffHistory';
import StaffVendors from './StaffVendors';

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

    const handleCompleteTask = async (task) => {
        try {
            if (task.type === 'Task') {
                await taskAPI.update(task._id, { status: 'Pending Manager Review' });
            } else {
                await procurementAPI.updateMaterialRequest(task._id, { status: 'Pending Manager Review', completedAt: new Date() });
            }
            
            // Notify the manager
            await notificationAPI.create({
                recipientRole: 'Procurement Manager',
                title: `Task Submitted for Review: ${task.requestNumber || task.title}`,
                message: `Staff member ${user?.fullName || 'A staff member'} has submitted sourcing for project ${task.project?.name || 'N/A'}.`,
                type: 'info',
                relatedId: task.project?._id,
                relatedModel: 'Project'
            });
            
            setShowTaskDetailsModal(false);
            fetchData();
            alert('Task submitted to manager for review!');
        } catch (err) {
            console.error('Error completing task:', err);
            alert('Failed to submit task.');
        }
    };

    const recordPurchase = async (purchaseData) => {
        try {
            await procurementAPI.createVendorPurchase(purchaseData);
            setShowPurchaseModal(false);
            await procurementAPI.updateMaterialRequest(selectedTask._id, {
                status: 'Pending Manager Review',
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

    const pendingTasks = tasks.filter(t => t.status === 'Assigned' || t.status === 'Assigned to Procurement');
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress' || t.status === 'Purchasing');
    const completedTasks = tasks.filter(t => ['Completed', 'Pending Manager Review', 'Pending Admin Review', 'Pending Procurement Admin Review', 'Procurement Approved'].includes(t.status));

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
                    <StaffOverview 
                        pendingTasks={pendingTasks}
                        inProgressTasks={inProgressTasks}
                        completedTasks={completedTasks}
                        purchaseHistory={purchaseHistory}
                        formatCurrency={formatCurrency}
                        setActiveTab={setActiveTab}
                    />
                );

            case 'sourcing':
                return (
                    <SourcingHub 
                        sourcingSearch={sourcingSearch}
                        setSourcingSearch={setSourcingSearch}
                        selectedSourcingProject={selectedSourcingProject}
                        setSelectedSourcingProject={setSelectedSourcingProject}
                        projects={projects}
                        vendors={vendors}
                        sourcingBucket={sourcingBucket}
                        setSourcingBucket={setSourcingBucket}
                        dailyUpdate={dailyUpdate}
                        setDailyUpdate={setDailyUpdate}
                        savedSourcing={savedSourcing}
                        handleSaveSourcing={handleSaveSourcing}
                        handleAddToBucket={handleAddToBucket}
                        handleRemoveFromBucket={handleRemoveFromBucket}
                        handleDeleteSaved={handleDeleteSaved}
                    />
                );

            case 'tasks':
                return (
                    <StaffTasks 
                        pendingTasks={pendingTasks}
                        inProgressTasks={inProgressTasks}
                        setSelectedTask={setSelectedTask}
                        setShowTaskDetailsModal={setShowTaskDetailsModal}
                        setShowTimeExtension={setShowTimeExtension}
                    />
                );

            case 'history':
                return (
                    <StaffHistory 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        handleSearch={handleSearch}
                        vendorStats={vendorStats}
                        formatCurrency={formatCurrency}
                        handleComparePrices={handleComparePrices}
                        itemsToBuy={itemsToBuy}
                    />
                );

            case 'vendors':
                return (
                    <StaffVendors 
                        vendors={vendors}
                        vendorSearch={vendorSearch}
                        setVendorSearch={setVendorSearch}
                        setSelectedVendor={setSelectedVendor}
                        fetchPurchaseHistory={fetchPurchaseHistory}
                        vendorPurchaseCounts={vendorPurchaseCounts}
                    />
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

                            {!['Completed', 'Pending Manager Review', 'Pending Admin Review', 'Pending Procurement Admin Review', 'Procurement Approved'].includes(selectedTask?.status) && (
                                <button 
                                    style={{ marginTop: '1.5rem', width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    onClick={() => handleCompleteTask(selectedTask)}
                                >
                                    <CheckSquare size={18} /> Submit to Manager for Review
                                </button>
                            )}
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