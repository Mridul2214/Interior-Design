import React, { useState, useEffect } from 'react';
import { 
    Truck, Package, CheckCircle, Clock, AlertTriangle,
    ArrowRight, Plus, Eye, DollarSign, Scale, FileText,
    ShoppingCart, Target, Users, BarChart3
} from 'lucide-react';
import { projectAPI, procurementAPI, notificationAPI, staffAPI, vendorAPI, inventoryAPI, taskAPI, purchaseOrderAPI } from '../../../config/api';
import '../css/StaffDashboard.css';

const ProcurementManagerDashboard = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [projects, setProjects] = useState([]);
    const [materialRequests, setMaterialRequests] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projRes, procRes, vendorStats, vendorList] = await Promise.all([
                projectAPI.getByStage('Procurement'),
                procurementAPI.getStats(),
                vendorAPI.getStats(),
                vendorAPI.getAll({ limit: 5 })
            ]);

            if (projRes.success) setProjects(projRes.data);
            if (procRes.success) setStats(procRes.data);
            if (vendorStats.success) setVendors(vendorList.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        return `₹${amount.toLocaleString()}`;
    };

    return (
        <div className="role-dashboard procurement-manager">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="role-icon procurement">
                        <Truck size={24} />
                    </div>
                    <div>
                        <h1>Procurement Manager Dashboard</h1>
                        <p>Welcome back, {user?.fullName?.split(' ')[0]}</p>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon procurement">
                        <Target size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{projects.length}</span>
                        <span className="stat-label">Active Procurement</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon pending">
                        <Clock size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.materialRequests?.pending || 0}</span>
                        <span className="stat-label">Pending Requests</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success">
                        <CheckCircle size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.purchaseOrders?.received || 0}</span>
                        <span className="stat-label">POs Received</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon info">
                        <Scale size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.purchaseOrders?.pending || 0}</span>
                        <span className="stat-label">POs Pending</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="section-card">
                    <div className="section-header">
                        <h3><Package size={18} /> Projects in Procurement</h3>
                        <a href="/projects" className="view-all">View All <ArrowRight size={14} /></a>
                    </div>
                    <div className="projects-list">
                        {projects.length > 0 ? projects.map(project => (
                            <div key={project._id} className="project-item">
                                <div className="project-info">
                                    <span className="project-name">{project.name}</span>
                                    <span className="project-client">{project.client?.name}</span>
                                </div>
                                <div className="project-budget">
                                    <span className="budget-label">Budget:</span>
                                    <span>{formatCurrency(project.budget)}</span>
                                </div>
                                <div className="project-status">
                                    <span className="status-badge procurement">Procurement</span>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">No projects in procurement</div>
                        )}
                    </div>
                </div>

                <div className="section-card">
                    <div className="section-header">
                        <h3><Scale size={18} /> Vendor Comparison</h3>
                        <button className="btn-add"><Plus size={14} /> New Comparison</button>
                    </div>
                    <div className="vendors-list">
                        {vendors.length > 0 ? vendors.map(vendor => (
                            <div key={vendor._id} className="vendor-item">
                                <div className="vendor-info">
                                    <span className="vendor-name">{vendor.name}</span>
                                    <span className="vendor-code">{vendor.vendorCode}</span>
                                </div>
                                <div className="vendor-rating">
                                    {'★'.repeat(Math.floor(vendor.rating || 0))}
                                </div>
                                <div className="vendor-status">
                                    <span className={`status-dot ${vendor.status?.toLowerCase()}`}></span>
                                    {vendor.status}
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">No vendors added</div>
                        )}
                    </div>
                </div>

                <div className="section-card">
                    <div className="section-header">
                        <h3><ShoppingCart size={18} /> Purchase Orders</h3>
                        <a href="/purchase-orders" className="view-all">View All <ArrowRight size={14} /></a>
                    </div>
                    <div className="po-list">
                        <div className="po-item">
                            <div className="po-info">
                                <span className="po-number">PO-2024-001</span>
                                <span className="po-vendor">ABC Suppliers</span>
                            </div>
                            <div className="po-amount">₹1,50,000</div>
                            <div className="po-status">
                                <span className="status-badge pending">Pending</span>
                            </div>
                        </div>
                        <div className="po-item">
                            <div className="po-info">
                                <span className="po-number">PO-2024-002</span>
                                <span className="po-vendor">XYZ Materials</span>
                            </div>
                            <div className="po-amount">₹85,000</div>
                            <div className="po-status">
                                <span className="status-badge received">Received</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="workflow-actions">
                <h3>Procurement Workflow Actions</h3>
                <div className="action-buttons">
                    <button className="action-btn">
                        <Plus size={18} /> Create Material Request
                    </button>
                    <button className="action-btn">
                        <Scale size={18} /> Compare Vendors
                    </button>
                    <button className="action-btn">
                        <ShoppingCart size={18} /> Create PO
                    </button>
                    <button className="action-btn primary">
                        <CheckCircle size={18} /> Mark Materials Ready
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProcurementManagerDashboard;
