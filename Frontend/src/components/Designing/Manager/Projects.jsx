import React from 'react';
import { Palette, TrendingUp, Briefcase, ChevronRight, CheckCircle, Package, Eye, Send, X, Clock, User, ArrowRight } from 'lucide-react';
import '../css/ManagerDashboard.css';

const Projects = ({ projects = [], materialRequests = [], onReviewRequest, onUpdateStatus, onHandoffInitiate }) => {
    return (
        <div className="design-projects fade-in">
            <div className="pipeline-section-header" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Briefcase size={22} />
                    </div>
                    Active Interior Design Projects
                </h2>
                <p style={{ color: '#64748b', marginTop: '0.5rem', marginLeft: '52px' }}>Monitor the design progress and current status of active projects in your pipeline.</p>
            </div>

            <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
                {Array.isArray(projects) && projects.length > 0 ? projects.map(project => {
                    const projectMaterials = Array.isArray(materialRequests) ? materialRequests.filter(r => {
                        const projId = r.project?._id || r.project;
                        return projId && projId.toString() === project._id?.toString();
                    }) : [];
                    const pendingMaterials = projectMaterials.filter(r => r.status === 'Pending' || r.status === 'Review Pending');
                    
                    return (
                        <div key={project._id} className="premium-project-card" style={{ 
                            background: 'white', 
                            borderRadius: '24px', 
                            border: '1px solid #f1f5f9', 
                            padding: '1.5rem', 
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Gradient Background Decoration */}
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.03) 0%, transparent 70%)', zIndex: 0 }}></div>
                            
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>{project.projectNumber}</div>
                                        <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{project.name}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                            <User size={14} color="#94a3b8" />
                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{project.client?.name || 'Private Client'}</span>
                                        </div>
                                    </div>
                                    <span style={{ 
                                        padding: '6px 12px', 
                                        borderRadius: '100px', 
                                        fontSize: '0.7rem', 
                                        fontWeight: 800,
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                        background: project.status === 'Completed' ? '#dcfce7' : '#f1f5f9',
                                        color: project.status === 'Completed' ? '#15803d' : '#64748b',
                                        border: '1px solid',
                                        borderColor: project.status === 'Completed' ? '#bbf7d0' : '#e2e8f0'
                                    }}>
                                        {project.status}
                                    </span>
                                </div>

                                <div className="project-detail-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Timeline</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>
                                            <Clock size={14} color="#6366f1" />
                                            {project.targetEndDate ? new Date(project.targetEndDate).toLocaleDateString() : 'Set Deadline'}
                                        </div>
                                    </div>
                                    <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Progress</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>
                                            <TrendingUp size={14} color="#10b981" />
                                            {project.progress || 0}%
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ marginTop: '1.5rem', width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: `${project.progress || 0}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '10px' }}></div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                        <Clock size={48} color="#cbd5e1" style={{ marginBottom: '1.5rem' }} />
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#64748b' }}>No active design projects found</h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '400px', margin: '0.5rem auto 0' }}>All projects are either in production, completed, or starting soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Projects;
