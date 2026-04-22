import React, { useState, useEffect } from 'react';
import { 
    Search, Plus, MoreVertical, Eye, Edit, Trash2, 
    ChevronDown, Filter, ArrowRight, CheckCircle, Clock,
    Play, Pause, XCircle, Target, Building2, Users
} from 'lucide-react';
import { projectAPI } from '../../config/api';
import './css/Projects.css';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, [stageFilter, statusFilter]);

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

    const filteredProjects = projects.filter(project =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        return `₹${amount.toLocaleString()}`;
    };

    const handleStageChange = async (projectId, newStage) => {
        try {
            await projectAPI.updateStage(projectId, { stage: newStage });
            fetchProjects();
        } catch (err) {
            console.error('Error updating stage:', err);
        }
    };

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
                <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
                    <div className="modal-content project-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedProject.name}</h2>
                            <button className="close-btn" onClick={() => setSelectedProject(null)}>×</button>
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
