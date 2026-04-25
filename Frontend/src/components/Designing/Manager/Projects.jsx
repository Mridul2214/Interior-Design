import React from 'react';
import { 
    Briefcase, 
    ChevronRight, 
    Maximize, 
    Clock, 
    TrendingUp, 
    AlertCircle, 
    Package,
    ArrowRight
} from 'lucide-react';
import '../css/DesignStudio.css';

const Projects = ({ projects = [], materialRequests = [], onReviewRequest, onUpdateStatus, onHandoffInitiate }) => {
    const moodImages = [
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1556912177-c54030639a75?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1615873968403-89e068628265?auto=format&fit=crop&q=80&w=600"
    ];

    return (
        <div className="design-studio-container fade-in">
            {/* Studio Header */}
            <header className="editorial-header">
                <div>
                    <div className="editorial-date">Studio Projects // Lifecycle Archive</div>
                    <h1>THE <span>PORT</span>FOLIO</h1>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#888' }}>{projects.length} ACTIVE DEVELOPMENTS</div>
                </div>
            </header>

            <div className="project-canvas">
                {projects.map((project, idx) => {
                    const projectMaterials = materialRequests?.filter(r => 
                        (r.project?._id || r.project)?.toString() === project._id?.toString()
                    ) || [];
                    const pendingMaterials = projectMaterials.filter(r => r.status === 'Design Review');

                    return (
                        <div key={project._id} className="canvas-item">
                            <div className="canvas-image" style={{ background: `url(${moodImages[idx % moodImages.length]}) center/cover` }}>
                                <div style={{ width: '100%', height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: 0, transition: '0.3s' }} className="canvas-hover">
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={{ background: 'white', padding: '6px 12px', borderRadius: '2px', fontSize: '0.65rem', fontWeight: 800 }}>
                                            {project.projectNumber}
                                        </div>
                                        <div style={{ background: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Maximize size={16} />
                                        </div>
                                    </div>
                                    <div style={{ color: 'white' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Stage</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{project.stage || 'Design Development'}</div>
                                    </div>
                                </div>
                                <style>{`.canvas-item:hover .canvas-hover { opacity: 1 !important; background: rgba(0,0,0,0.4); }`}</style>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <h3 className="canvas-title" style={{ margin: 0 }}>{project.name}</h3>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a1a1a' }}>{project.progress || 0}%</div>
                            </div>

                            <div className="canvas-meta" style={{ marginBottom: '1.5rem' }}>
                                <span>{project.client?.name || 'Private Client'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={12} color="#c4a484" /> 
                                    {project.targetEndDate ? new Date(project.targetEndDate).toLocaleDateString() : 'Set Date'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => onHandoffInitiate(project)}
                                    style={{ flex: 1, background: '#1a1a1a', color: 'white', border: 'none', padding: '12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    HANDOFF <ArrowRight size={14} />
                                </button>
                                {pendingMaterials.length > 0 && (
                                    <button 
                                        onClick={() => onReviewRequest(project._id)}
                                        style={{ width: '42px', height: '42px', background: '#fef3c7', border: '1px solid #fcd34d', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        title="Pending Approvals"
                                    >
                                        <AlertCircle size={18} color="#92400e" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Projects;
