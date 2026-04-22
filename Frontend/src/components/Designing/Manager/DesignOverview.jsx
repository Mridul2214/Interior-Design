import React from 'react';
import { Palette, FileText, Tag, List, CheckCircle, TrendingUp, ArrowRight, User, Clock, AlertCircle } from 'lucide-react';
import '../css/ManagerDashboard.css';

const DesignOverview = ({ stats, tasks, quotations, teamStats }) => {
    const pendingReviews = (tasks || []).filter(t => t.status === 'Review Pending');
    const redos = (tasks || []).filter(t => t.status === 'Revision Required');
    const approved = (tasks || []).filter(t => t.status === 'Approved');

    return (
        <div className="design-overview fade-in">
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="premium-stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div className="icon-box" style={{ background: '#f5f3ff', color: '#6366f1', padding: '12px', borderRadius: '16px' }}><Palette size={24} /></div>
                    <div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{tasks?.length || 0}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Designing Tasks</div>
                    </div>
                </div>
                
                <div className="premium-stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div className="icon-box" style={{ background: '#ecfdf5', color: '#10b981', padding: '12px', borderRadius: '16px' }}><CheckCircle size={24} /></div>
                    <div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{pendingReviews.length}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Pending Reviews</div>
                    </div>
                </div>

                <div className="premium-stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div className="icon-box" style={{ background: '#fff7ed', color: '#f59e0b', padding: '12px', borderRadius: '16px' }}><Clock size={24} /></div>
                    <div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{redos.length}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Active Redos</div>
                    </div>
                </div>

                <div className="premium-stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div className="icon-box" style={{ background: '#eff6ff', color: '#3b82f6', padding: '12px', borderRadius: '16px' }}><User size={24} /></div>
                    <div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{teamStats?.length || 0}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Design Team</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                <div className="section-card shadow-sm" style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Design Pipeline Summary</h3>
                            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>Overview of task statuses across the department</p>
                        </div>
                        <TrendingUp size={24} color="#8b5cf6" />
                    </div>
                    
                    <div className="summary-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{redos.length}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Redos Given</div>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{approved.length}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Approved</div>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>{tasks?.filter(t=>t.status==='Completed').length || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Handed Over</div>
                        </div>
                    </div>
                </div>

                <div className="section-card" style={{ padding: '2rem', borderRadius: '24px', background: 'white', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={20} color="#f59e0b" /> Critical Submissions
                    </h3>
                    <div className="critical-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {pendingReviews.length > 0 ? pendingReviews.slice(0, 4).map(task => (
                            <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '16px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                    <Clock size={18} color="#6366f1" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{task.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Submitted on {new Date(task.updatedAt).toLocaleDateString()}</div>
                                </div>
                                <ArrowRight size={16} color="#94a3b8" />
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                No pending reviews at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignOverview;
