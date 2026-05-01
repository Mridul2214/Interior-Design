import React from 'react';
import { Target, Truck, CheckCircle, AlertTriangle, TrendingUp, Package, ArrowRight, Layers } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../css/ProcurementPremium.css';

const Overview = ({ pendingRequests, designHandoffs, assignedRequests, completedRequests, extensionRequests, materialRequests, navigate }) => {
    const chartData = [
        { name: 'Pending', value: pendingRequests.length + designHandoffs.length, color: '#1c1917' },
        { name: 'Active', value: assignedRequests.length, color: '#78716c' },
        { name: 'Completed', value: completedRequests.length, color: '#e7e5e4' }
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
        <div className="procurement-premium-wrapper fade-in">
            {/* Elegant Minimalist Banner */}
            <div className="premium-banner">
                <div className="banner-pill">
                    <Layers size={14} />
                    Overview
                </div>
                <h1 className="banner-title">Procurement Center</h1>
                <p className="banner-subtitle">
                    Real-time supply chain visibility. Track handoffs, monitor pipeline velocity, and streamline vendor fulfillment.
                </p>
            </div>

            {/* Elegant Stat Cards */}
            <div className="glass-stats-grid">
                <div className="glass-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="glass-stat-value">{pendingRequests.length}</div>
                            <div className="glass-stat-label">Pending Reviews</div>
                        </div>
                        <div className="glass-stat-icon-wrapper icon-purple">
                            <Target size={20} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div style={{ height: '40px', width: '100%', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <Area type="monotone" dataKey="count" stroke="#a78bfa" fill="#f5f3ff" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="glass-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="glass-stat-value">{assignedRequests.length}</div>
                            <div className="glass-stat-label">Active Assignments</div>
                        </div>
                        <div className="glass-stat-icon-wrapper icon-blue">
                            <Truck size={20} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div style={{ height: '40px', width: '100%', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData.map(d => ({ ...d, count: d.count * 0.8 }))}>
                                <Area type="monotone" dataKey="count" stroke="#60a5fa" fill="#eff6ff" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="glass-stat-value">{completedRequests.length}</div>
                            <div className="glass-stat-label">Completed Orders</div>
                        </div>
                        <div className="glass-stat-icon-wrapper icon-green">
                            <CheckCircle size={20} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div style={{ height: '40px', width: '100%', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData.map(d => ({ ...d, count: d.count * 1.2 }))}>
                                <Area type="monotone" dataKey="count" stroke="#34d399" fill="#f0fdf4" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="glass-stat-value">{extensionRequests.length}</div>
                            <div className="glass-stat-label">Time Extensions</div>
                        </div>
                        <div className="glass-stat-icon-wrapper icon-orange">
                            <AlertTriangle size={20} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div style={{ height: '40px', width: '100%', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData.map(d => ({ ...d, count: d.count * 0.5 }))}>
                                <Area type="monotone" dataKey="count" stroke="#fbbf24" fill="#fffbeb" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="premium-chart-grid">
                <div className="premium-chart-card">
                    <div className="chart-header">
                        <h4 className="chart-title">Pipeline Velocity</h4>
                        <span className="banner-pill" style={{ margin: 0, border: '1px solid #e7e5e4', background: 'transparent' }}>7 Days</span>
                    </div>
                    <div style={{ height: '280px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1c1917" stopOpacity={0.08}/>
                                        <stop offset="95%" stopColor="#1c1917" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e', fontWeight: 400 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e', fontWeight: 400 }} dx={-10} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #f5f5f4', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)', padding: '12px', fontWeight: 400, fontSize: '13px' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#1c1917" strokeWidth={1.5} fillOpacity={1} fill="url(#colorVelocity)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="premium-chart-card">
                    <div className="chart-header">
                        <h4 className="chart-title">Status Distribution</h4>
                    </div>
                    <div style={{ height: '280px', width: '100%', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                {/* Background Track Ring */}
                                <Pie
                                    data={[{ value: 1 }]}
                                    innerRadius={75}
                                    outerRadius={95}
                                    fill="#f5f5f4"
                                    stroke="none"
                                    dataKey="value"
                                    isAnimationActive={false}
                                />
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={95}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #f5f5f4', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)', fontWeight: 400, fontSize: '13px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 300, color: '#1c1917', letterSpacing: '-0.02em' }}>{materialRequests.length}</div>
                            <div style={{ fontSize: '0.7rem', color: '#78716c', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dual Lists */}
            <div className="premium-list-grid">
                <div className="list-panel">
                    <div className="chart-header">
                        <h4 className="chart-title">Design Handoff Queue</h4>
                        <span className="banner-pill" style={{ margin: 0, border: '1px solid #e7e5e4', background: 'transparent' }}>{designHandoffs.length} New</span>
                    </div>
                    <div>
                        {designHandoffs.slice(0, 5).map(item => (
                            <div key={item._id} className="list-item-modern">
                                <div className="item-icon-box">
                                    <TrendingUp size={18} strokeWidth={1.5} className="icon-purple" />
                                </div>
                                <div className="item-details">
                                    <div className="item-title">{item.type === 'MaterialRequest' ? item.requestNumber : item.title}</div>
                                    <div className="item-subtitle">{item.project?.name} • {item.type === 'MaterialRequest' ? `${item.items?.length || 0} items` : 'Pending List'}</div>
                                </div>
                                <button className="btn-arrow-hover" onClick={() => navigate('?tab=handoffs')}>
                                    <ArrowRight size={16} strokeWidth={1.5} />
                                </button>
                            </div>
                        ))}
                        {designHandoffs.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#a8a29e', fontSize: '0.875rem' }}>No recent design handoffs</div>
                        )}
                    </div>
                </div>

                <div className="list-panel">
                    <div className="chart-header">
                        <h4 className="chart-title">Standard Requests</h4>
                        <span className="banner-pill" style={{ margin: 0, border: '1px solid #e7e5e4', background: 'transparent' }}>{pendingRequests.length} Total</span>
                    </div>
                    <div>
                        {pendingRequests.slice(0, 5).map(req => (
                            <div key={req._id} className="list-item-modern">
                                <div className="item-icon-box">
                                    <Package size={18} strokeWidth={1.5} color="#78716c" />
                                </div>
                                <div className="item-details">
                                    <div className="item-title">{req.requestNumber}</div>
                                    <div className="item-subtitle">{req.project?.name} • {req.items?.length || 0} items</div>
                                </div>
                                <button className="btn-arrow-hover" onClick={() => navigate('?tab=requests')}>
                                    <ArrowRight size={16} strokeWidth={1.5} />
                                </button>
                            </div>
                        ))}
                        {pendingRequests.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#a8a29e', fontSize: '0.875rem' }}>No pending standard requests</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
