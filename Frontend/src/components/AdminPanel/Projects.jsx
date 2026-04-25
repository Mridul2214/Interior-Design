import React, { useState, useEffect } from 'react';
import { 
    Search, Plus, MoreVertical, Eye, Edit, Trash2, 
    ChevronDown, Filter, ArrowRight, CheckCircle, Clock,
    Play, Pause, XCircle, Target, Building2, Users, Calendar
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI } from '../../config/api';
import './css/Projects.css';

const Projects = () => {
    const navigate = useNavigate();
    const { id: urlProjectId } = useParams();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const handleClose = () => {
        if (urlProjectId) {
            navigate(-1);
        } else {
            setSelectedProject(null);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [stageFilter, statusFilter]);

    useEffect(() => {
        if (urlProjectId && projects.length > 0) {
            const project = projects.find(p => p._id === urlProjectId);
            if (project) {
                setSelectedProject(project);
            }
        }
    }, [urlProjectId, projects]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const params = {};
            if (stageFilter) params.stage = stageFilter;
            if (statusFilter) params.status = statusFilter;
            
            const res = await projectAPI.getAll(params);
            if (res.success) setProjects(res.data);
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        return `₹${amount.toLocaleString()}`;
    };

    const getStageColor = (stage) => {
        const colors = {
            'Design': '#8b5cf6',
            'Procurement': '#f59e0b',
            'Production': '#3b82f6',
            'Completed': '#10b981'
        };
        return colors[stage] || '#64748b';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'In Progress': return <Play size={14} />;
            case 'Completed': return <CheckCircle size={14} />;
            case 'On Hold': return <Pause size={14} />;
            case 'Not Started': return <Clock size={14} />;
            default: return <Clock size={14} />;
        }
    };

    const handleStageChange = async (projectId, newStage) => {
        try {
            await projectAPI.updateStage(projectId, { stage: newStage });
            fetchProjects();
        } catch (err) {
            console.error('Error updating stage:', err);
        }
    };

    if (urlProjectId && loading) {
        return <div className="loading-state">Loading Project Profile...</div>;
    }

    // Special View for Direct Project Review (Focused View)
    if (urlProjectId && selectedProject) {
        return (
            <div className="projects-page focused-view">
                <div className="page-header" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button 
                            className="btn-back-round" 
                            onClick={handleClose}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                            <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                        <div>
                            <h1 style={{ margin: 0 }}>{selectedProject.name}</h1>
                            <p style={{ margin: 0, color: '#64748b' }}>{selectedProject.projectNumber} • {selectedProject.client?.name}</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <span className="badge-premium" style={{ background: getStageColor(selectedProject.stage), color: 'white', padding: '6px 16px', borderRadius: '100px', fontWeight: 700 }}>
                            {selectedProject.stage} Stage
                        </span>
                    </div>
                </div>

                <div className="detail-container-premium" style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
                        <div className="info-block">
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Project Status</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600 }}>
                                {getStatusIcon(selectedProject.status)}
                                {selectedProject.status}
                            </div>
                        </div>
                        <div className="info-block">
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Financial Overview</label>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>{formatCurrency(selectedProject.budget)} Budget</div>
                        </div>
                        <div className="info-block">
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Completion</label>
                            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', marginTop: '12px', position: 'relative' }}>
                                <div style={{ position: 'absolute', height: '100%', width: `${selectedProject.progress || 0}%`, background: getStageColor(selectedProject.stage), borderRadius: '4px' }}></div>
                                <span style={{ position: 'absolute', right: 0, top: '-20px', fontSize: '0.8rem', fontWeight: 700 }}>{selectedProject.progress || 0}%</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                            <h4 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Building2 size={18} /> Client Information</h4>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <div><span style={{ color: '#64748b' }}>Name:</span> <strong>{selectedProject.client?.name}</strong></div>
                                <div><span style={{ color: '#64748b' }}>Email:</span> {selectedProject.client?.email || 'N/A'}</div>
                                <div><span style={{ color: '#64748b' }}>Phone:</span> {selectedProject.client?.phone || 'N/A'}</div>
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                            <h4 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={18} /> Timeline</h4>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <div><span style={{ color: '#64748b' }}>Created On:</span> {new Date(selectedProject.createdAt).toLocaleDateString()}</div>
                                <div><span style={{ color: '#64748b' }}>Last Updated:</span> {new Date(selectedProject.updatedAt).toLocaleDateString()}</div>
                                <div><span style={{ color: '#64748b' }}>Current Stage:</span> <strong>{selectedProject.stage}</strong></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="projects-page">
            <div className="page-header">
                <div className="header-left">
                    <h1><Target size={24} /> Projects</h1>
                    <p>Manage and track all interior design projects</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> New Project
                </button>
            </div>

            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search projects..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filter-group">
                    <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
                        <option value="">All Stages</option>
                        <option value="Design">Design</option>
                        <option value="Procurement">Procurement</option>
                        <option value="Production">Production</option>
                        <option value="Completed">Completed</option>
                    </select>
                    
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>

            <div className="workflow-stages">
                {['Design', 'Procurement', 'Production', 'Completed'].map(stage => (
                    <div 
                        key={stage} 
                        className={`stage-column ${stageFilter === stage ? 'active' : ''}`}
                        onClick={() => setStageFilter(stageFilter === stage ? '' : stage)}
                    >
                        <div className="stage-header" style={{ borderColor: getStageColor(stage) }}>
                            <span className="stage-name">{stage}</span>
                            <span className="stage-count">
                                {projects.filter(p => p.stage === stage).length}
                            </span>
                        </div>
                        <div className="stage-projects">
                            {projects
                                .filter(p => p.stage === stage)
                                .map(project => (
                                    <div key={project._id} className="project-card" onClick={() => setSelectedProject(project)}>
                                        <div className="card-header">
                                            <span className="project-name">{project.name}</span>
                                            <span className="project-code">{project.projectNumber}</span>
                                        </div>
                                        <div className="card-client">
                                            <Users size={14} />
                                            <span>{project.client?.name || 'No client'}</span>
                                        </div>
                                        <div className="card-progress">
                                            <div className="progress-bar">
                                                <div 
                                                    className="progress-fill" 
                                                    style={{ 
                                                        width: `${project.progress || 0}%`,
                                                        backgroundColor: getStageColor(stage)
                                                    }}
                                                ></div>
                                            </div>
                                            <span>{project.progress || 0}%</span>
                                        </div>
                                        <div className="card-footer">
                                            <span className="budget">{formatCurrency(project.budget)}</span>
                                            <span className="status" style={{ color: getStageColor(stage) }}>
                                                {getStatusIcon(project.status)}
                                                {project.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Project</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Project creation from approved quotations is automatic.</p>
                            <p>Quotations can be approved from the Quotations section.</p>
                        </div>
                    </div>
                </div>
            )}

            {selectedProject && (
                <div className="modal-overlay" onClick={handleClose}>
                    <div className="modal-content project-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedProject.name}</h2>
                            <button className="close-btn" onClick={handleClose}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Project Number</label>
                                    <span>{selectedProject.projectNumber}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Client</label>
                                    <span>{selectedProject.client?.name || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Stage</label>
                                    <span style={{ color: getStageColor(selectedProject.stage) }}>
                                        {selectedProject.stage}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Status</label>
                                    <span>{selectedProject.status}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Budget</label>
                                    <span>{formatCurrency(selectedProject.budget)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Spent</label>
                                    <span>{formatCurrency(selectedProject.spent)}</span>
                                </div>
                            </div>
                            <div className="stage-transition">
                                <h4>Move to Stage</h4>
                                <div className="stage-buttons">
                                    {['Design', 'Procurement', 'Production', 'Completed'].map(stage => (
                                        <button
                                            key={stage}
                                            className={`stage-btn ${selectedProject.stage === stage ? 'active' : ''}`}
                                            style={{ 
                                                borderColor: getStageColor(stage),
                                                backgroundColor: selectedProject.stage === stage ? getStageColor(stage) : 'transparent'
                                            }}
                                            onClick={() => handleStageChange(selectedProject._id, stage)}
                                        >
                                            {stage}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
