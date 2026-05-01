import React from 'react';
import { Briefcase, Target, CheckCircle, Clock, Eye, FileText, Tag } from 'lucide-react';
import '../css/StaffDashboard.css';

const Projects = ({ projects, myWorkItems, taskCountFor, completedTaskCountFor, onOpenWorkspace, onOpenBOQ, onOpenMaterials, searchQuery, setSearchQuery }) => {
    return (
        <div className="view-projects fade-in">
            <div className="projects-toolbar">
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="projects-detailed-grid">
                {myWorkItems
                    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(p => {
                        const total = taskCountFor(p.id);
                        const done = completedTaskCountFor(p.id);
                        const taskProgress = total > 0 ? Math.round((done / total) * 100) : 0;
                        return (
                            <div key={p.id} className="project-detail-card" style={{ padding: '1.25rem' }}>
                                <div className="pd-header">
                                    <div className="pd-title">
                                        <strong>{p.name}</strong>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {p.id?.slice(-6).toUpperCase()}</span>
                                </div>

                                <div className="pd-meta">
                                    <div className="meta-row" style={{ marginTop: '4px' }}>
                                        <CheckCircle size={14} style={{ color: done === total && total > 0 ? '#10b981' : '#94a3b8' }} />
                                        <span style={{ fontWeight: 600, color: '#475569' }}>
                                            {done}/{total} tasks done
                                        </span>
                                    </div>
                                </div>

                                <div className="pd-progress" style={{ marginTop: '1rem' }}>
                                    <div className="pd-prog-info">
                                        <span>My Contribution</span>
                                        <span>{taskProgress}%</span>
                                    </div>
                                    <div className="prog-bar-bg" style={{ height: '8px', borderRadius: '4px', background: '#e2e8f0' }}>
                                        <div className="prog-bar-fill" style={{ width: `${taskProgress}%`, background: '#8b5cf6', height: '100%', borderRadius: '4px' }}></div>
                                    </div>
                                </div>

                                <div className="pd-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '6px' }}>
                                    <button className="btn-open" style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', background: '#4f46e5', color: 'white', fontWeight: 600, cursor: 'pointer' }} onClick={() => onOpenWorkspace(p)}>Workspace</button>
                                    <button className="btn-edit" style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer' }} onClick={() => onOpenBOQ(p)}>Draft BOQ</button>
                                </div>
                                <button
                                    className="btn-materials"
                                    style={{ width: '100%', marginTop: '6px', padding: '8px', border: '1px solid #bbf7d0', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                    onClick={() => onOpenMaterials(p)}
                                >
                                    <Tag size={14} /> Tag Materials
                                </button>
                            </div>
                        );
                    })}
                {myWorkItems.length === 0 && <div className="empty-state">No projects assigned yet.</div>}
            </div>
        </div>
    );
};

export default Projects;
