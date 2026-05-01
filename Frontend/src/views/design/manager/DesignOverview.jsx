import React from 'react';
import { Palette, FileText, Tag, List, CheckCircle, TrendingUp, ArrowRight, User, Clock, AlertCircle, Package, Activity, Sparkles } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';
import '../css/ManagerDashboard.css';

const DesignOverview = ({ stats, tasks, quotations, teamStats, materialRequests }) => {
    const pendingReviews = (tasks || []).filter(t => t.status === 'Review Pending');
    const redos = (tasks || []).filter(t => t.status === 'Revision Required');
    const approved = (tasks || []).filter(t => t.status === 'Approved');

    const pieData = [
        { name: 'Pending', value: pendingReviews.length, color: '#f59e0b' },
        { name: 'Approved', value: approved.length, color: '#10b981' },
        { name: 'Revisions', value: redos.length, color: '#ef4444' }
    ];

    const weeklyVelocity = [
        { name: 'Mon', designs: 3 },
        { name: 'Tue', designs: 5 },
        { name: 'Wed', designs: 8 },
        { name: 'Thu', designs: 6 },
        { name: 'Fri', designs: 10 },
        { name: 'Sat', designs: 4 },
        { name: 'Sun', designs: 2 }
    ];

    const teamWorkload = (teamStats || []).map(member => ({
        name: member.name,
        tasks: member.activeTasks || 0
    })).slice(0, 5);

    return (
        <div className="design-overview fade-in">
            {/* Creative Banner */}
            <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)', borderRadius: '24px', padding: '2.5rem', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '100%', background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                            <Sparkles size={20} color="#fff" />
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Studio Intelligence</span>
                    </div>
                    <h3 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>Design Manager's Workspace</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '600px' }}>Curate experiences, review aesthetics, and monitor the creative pulse of every project.</p>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="stat-card premium">
                    <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                        <Palette size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Active Designs</span>
                        <span className="stat-value">{tasks?.length || 0}</span>
                    </div>
                </div>
                <div className="stat-card premium">
                    <div className="stat-icon" style={{ background: '#fff7ed', color: '#f97316' }}>
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Pending Reviews</span>
                        <span className="stat-value">{pendingReviews.length}</span>
                    </div>
                </div>
                <div className="stat-card premium">
                    <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Active Redos</span>
                        <span className="stat-value">{redos.length}</span>
                    </div>
                </div>
                <div className="stat-card premium">
                    <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Approved</span>
                        <span className="stat-value">{approved.length}</span>
                    </div>
                </div>
            </div>

            {/* Visual Analytics Row */}
            <div className="visuals-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="card-premium" style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>Creative Velocity</h4>
                        <span className="badge-lite">Weekly Output</span>
                    </div>
                    <div style={{ height: '260px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyVelocity}>
                                <defs>
                                    <linearGradient id="colorDesigns" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="designs" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorDesigns)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card-premium" style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#1e293b', marginBottom: '1.5rem' }}>Portfolio Health</h4>
                    <div style={{ height: '260px', width: '100%', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' }}>{tasks?.length || 0}</div>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Total Tasks</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Dynamics */}
            <div className="card-premium" style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>Designer Capacity</h4>
                    <span className="badge-lite">Active Workload</span>
                </div>
                <div style={{ height: '200px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={teamWorkload}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="tasks" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Operational Lists */}
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="card-premium" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                    <div className="card-header" style={{ border: 'none', padding: 0, marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={20} color="#f59e0b" /> Pending Manager Reviews
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Submissions awaiting your creative validation</p>
                    </div>
                    <div className="critical-list" style={{ display: 'grid', gap: '1rem' }}>
                        {pendingReviews.length > 0 ? pendingReviews.slice(0, 4).map(task => (
                            <div key={task._id} className="queue-item-premium" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '16px' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                    <Palette size={18} color="#8b5cf6" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{task.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Assigned to {task.assignedTo?.map(s => s.name).join(', ')}</div>
                                </div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#f59e0b', background: '#fffbeb', padding: '4px 8px', borderRadius: '12px' }}>Review</div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '16px', color: '#94a3b8', fontSize: '0.9rem' }}>No pending reviews</div>
                        )}
                    </div>
                </div>

                <div className="card-premium" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                    <div className="card-header" style={{ border: 'none', padding: 0, marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Activity size={20} color="#6366f1" /> Handoff Pipeline
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Design progression through Sales & Admin</p>
                    </div>
                    <div className="critical-list" style={{ display: 'grid', gap: '1rem' }}>
                        {tasks && tasks.filter(t => ['Approved', 'Pending Sales Review', 'Sales Approved', 'Pending Admin Review'].includes(t.status)).length > 0 ?
                            tasks.filter(t => ['Approved', 'Pending Sales Review', 'Sales Approved', 'Pending Admin Review'].includes(t.status)).slice(0, 4).map(task => (
                                <div key={task._id} className="queue-item-premium" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '16px' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                        {task.status === 'Approved' ? <Tag size={18} color="#f59e0b" /> : 
                                         task.status === 'Sales Approved' ? <CheckCircle size={18} color="#10b981" /> : 
                                         <Clock size={18} color="#6366f1" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{task.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Client: {task.project?.clientName || task.project?.projectName || task.quotation?.projectName || 'Private Client'}</div>
                                    </div>
                                    <div style={{ marginTop: 'auto' }}>
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '10px',
                                            background: task.status === 'Sales Approved' ? '#dcfce7' : '#f1f5f9',
                                            borderRadius: '12px',
                                            color: task.status === 'Sales Approved' ? '#166534' : '#475569',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}>
                                            {task.status === 'Sales Approved' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                            {task.status}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '16px', color: '#94a3b8', fontSize: '0.9rem' }}>No designs in pipeline</div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignOverview;
