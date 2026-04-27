import React from 'react';
import { Clock, Target, CheckCircle, ArrowRight, DollarSign, Layers, Package } from 'lucide-react';
import '../css/ProcurementPremium.css';

const StaffOverview = ({ pendingTasks, inProgressTasks, completedTasks, purchaseHistory, formatCurrency, setActiveTab }) => {
    return (
        <div className="procurement-premium-wrapper fade-in">
            {/* Elegant Minimalist Banner */}
            <div className="premium-banner">
                <div className="banner-pill">
                    <Layers size={14} />
                    Staff Workspace
                </div>
                <h1 className="banner-title">Procurement Hub</h1>
                <p className="banner-subtitle">
                    Manage your assigned material requests, track incoming stock, and log your vendor interactions all in one place.
                </p>
            </div>

            {/* Elegant Stat Cards */}
            <div className="glass-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="glass-stat-card">
                    <div className="glass-stat-icon-wrapper icon-orange">
                        <Clock size={20} strokeWidth={1.5} />
                    </div>
                    <div className="glass-stat-value">{pendingTasks.length}</div>
                    <div className="glass-stat-label">Pending Tasks</div>
                </div>
                
                <div className="glass-stat-card">
                    <div className="glass-stat-icon-wrapper icon-blue">
                        <Target size={20} strokeWidth={1.5} />
                    </div>
                    <div className="glass-stat-value">{inProgressTasks.length}</div>
                    <div className="glass-stat-label">In Progress</div>
                </div>

                <div className="glass-stat-card">
                    <div className="glass-stat-icon-wrapper icon-green">
                        <CheckCircle size={20} strokeWidth={1.5} />
                    </div>
                    <div className="glass-stat-value">{completedTasks.length}</div>
                    <div className="glass-stat-label">Completed</div>
                </div>
            </div>

            {/* Dual Lists */}
            <div className="premium-list-grid">
                <div className="list-panel">
                    <div className="chart-header">
                        <h4 className="chart-title">Current Assignments</h4>
                        <span className="banner-pill" style={{ margin: 0, border: '1px solid #e7e5e4', background: 'transparent' }}>{pendingTasks.length + inProgressTasks.length} Active</span>
                    </div>
                    <div>
                        {[...pendingTasks, ...inProgressTasks].slice(0, 5).map(task => (
                            <div key={task._id} className="list-item-modern">
                                <div className="item-icon-box">
                                    <Package size={18} strokeWidth={1.5} className={task.status === 'Assigned' ? 'icon-orange' : 'icon-blue'} />
                                </div>
                                <div className="item-details">
                                    <div className="item-title">{task.requestNumber}</div>
                                    <div className="item-subtitle">{task.project?.name} • {task.items?.length || 0} items</div>
                                </div>
                                <button className="btn-arrow-hover" onClick={() => setActiveTab('tasks')}>
                                    <ArrowRight size={16} strokeWidth={1.5} />
                                </button>
                            </div>
                        ))}
                        {pendingTasks.length === 0 && inProgressTasks.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#a8a29e', fontSize: '0.875rem' }}>No active assignments</div>
                        )}
                    </div>
                </div>

                <div className="list-panel">
                    <div className="chart-header">
                        <h4 className="chart-title">Recent Purchases</h4>
                        <span className="banner-pill" style={{ margin: 0, border: '1px solid #e7e5e4', background: 'transparent' }}>History</span>
                    </div>
                    <div>
                        {purchaseHistory.slice(0, 5).map(purchase => (
                            <div key={purchase._id} className="list-item-modern">
                                <div className="item-icon-box">
                                    <DollarSign size={18} strokeWidth={1.5} className="icon-green" />
                                </div>
                                <div className="item-details">
                                    <div className="item-title">{purchase.vendor?.name}</div>
                                    <div className="item-subtitle">{purchase.items?.length || 0} items for {formatCurrency(purchase.finalAmount)}</div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#a8a29e', fontWeight: 400, marginLeft: '1rem' }}>
                                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                        {purchaseHistory.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#a8a29e', fontSize: '0.875rem' }}>No recent purchases</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffOverview;
