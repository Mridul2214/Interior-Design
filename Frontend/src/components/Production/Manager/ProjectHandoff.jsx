import React, { useState, useEffect } from 'react';
import { 
    CheckCircle, 
    UserPlus, 
    AlertCircle, 
    Clock, 
    Building, 
    ArrowRight 
} from 'lucide-react';
import { productionAPI } from '../../../config/api';
import { useToast } from '../../../context/ToastContext';
import '../css/ProductionManagement.css'; // Reusing base styles

const ProjectHandoff = () => {
    const { showToast } = useToast();
    const [projects, setProjects] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState({}); // { [projectId]: boolean }
    
    // Track selected staff for each project: { [projectId]: { projectEngineer: '', siteEngineer: '', siteSupervisor: '' } }
    const [assignments, setAssignments] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectsRes, staffRes] = await Promise.all([
                productionAPI.getHandoffProjects(),
                productionAPI.getProductionStaff()
            ]);

            const handoffProjects = projectsRes?.data || [];
            setProjects(handoffProjects);
            setStaff(staffRes?.data || []);

            // Initialize assignment state
            const initialAssignments = {};
            handoffProjects.forEach(p => {
                initialAssignments[p._id] = {
                    projectEngineer: '',
                    siteEngineer: '',
                    siteSupervisor: ''
                };
            });
            setAssignments(initialAssignments);
        } catch (err) {
            console.error('Error fetching handoff data:', err);
            showToast('Failed to load project handoffs', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = (projectId, role, userId) => {
        setAssignments(prev => ({
            ...prev,
            [projectId]: {
                ...prev[projectId],
                [role]: userId
            }
        }));
    };

    const handleAcceptHandoff = async (project) => {
        const projectAssignments = assignments[project._id];
        
        // Optional: validate at least one person is assigned
        if (!projectAssignments.projectEngineer && !projectAssignments.siteEngineer && !projectAssignments.siteSupervisor) {
            const proceed = window.confirm("You haven't assigned any team members. Do you still want to activate this project?");
            if (!proceed) return;
        }

        try {
            setSubmitting(prev => ({ ...prev, [project._id]: true }));
            
            await productionAPI.acceptHandoff(project._id, {
                projectEngineer: projectAssignments.projectEngineer || null,
                siteEngineer: projectAssignments.siteEngineer || null,
                siteSupervisor: projectAssignments.siteSupervisor || null
            });

            showToast('Project activated and team assigned successfully');
            
            // Remove the project from the list
            setProjects(prev => prev.filter(p => p._id !== project._id));
            
        } catch (err) {
            console.error('Accept handoff error:', err);
            showToast('Failed to accept handoff', 'error');
        } finally {
            setSubmitting(prev => ({ ...prev, [project._id]: false }));
        }
    };

    // Filter staff by role for dropdowns
    const projectEngineers = staff.filter(s => s.role === 'Project Engineer');
    const siteEngineers = staff.filter(s => s.role === 'Site Engineer');
    const siteSupervisors = staff.filter(s => s.role === 'Site Supervisor');

    return (
        <div className="pm-dashboard">


            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading new projects...</div>
            ) : projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                    <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3 style={{ color: '#1e293b', fontSize: '1.25rem', marginBottom: '0.5rem' }}>You're all caught up!</h3>
                    <p style={{ color: '#64748b' }}>There are no pending project handoffs requiring your attention right now.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '2rem' }}>
                    {projects.map(project => {
                        const isSubmitting = submitting[project._id];
                        const currAssigned = assignments[project._id] || {};
                        
                        return (
                            <div key={project._id} className="pm-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                {/* Header */}
                                <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#0f172a' }}>{project.projectName}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                                                {project.clientId && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Building size={14} /> {project.clientId.name}
                                                    </span>
                                                )}
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={14} /> Received {new Date(project.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <span style={{ padding: '6px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                            Pending Team Assignment
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f1f5f9', borderRadius: '12px' }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                            <AlertCircle size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                                            Admin has approved procurement for this project and assigned you as the Project Manager. Assign your team to begin production.
                                        </p>
                                    </div>

                                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1e293b' }}>Assign Team</h4>
                                    
                                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                                        {/* Project Engineer */}
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                                                <UserPlus size={14} /> Project Engineer
                                            </label>
                                            <select 
                                                value={currAssigned.projectEngineer || ''}
                                                onChange={(e) => handleAssign(project._id, 'projectEngineer', e.target.value)}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                            >
                                                <option value="">-- Optional --</option>
                                                {projectEngineers.map(s => (
                                                    <option key={s._id} value={s._id}>{s.fullName} ({s.email})</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Site Engineer */}
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                                                <UserPlus size={14} /> Site Engineer
                                            </label>
                                            <select 
                                                value={currAssigned.siteEngineer || ''}
                                                onChange={(e) => handleAssign(project._id, 'siteEngineer', e.target.value)}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                            >
                                                <option value="">-- Optional --</option>
                                                {siteEngineers.map(s => (
                                                    <option key={s._id} value={s._id}>{s.fullName} ({s.email})</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Site Supervisor */}
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                                                <UserPlus size={14} /> Site Supervisor
                                            </label>
                                            <select 
                                                value={currAssigned.siteSupervisor || ''}
                                                onChange={(e) => handleAssign(project._id, 'siteSupervisor', e.target.value)}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                            >
                                                <option value="">-- Optional --</option>
                                                {siteSupervisors.map(s => (
                                                    <option key={s._id} value={s._id}>{s.fullName} ({s.email})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <button 
                                        onClick={() => handleAcceptHandoff(project)}
                                        disabled={isSubmitting}
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px', 
                                            background: '#10b981', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '8px', 
                                            fontWeight: 600, 
                                            display: 'flex', 
                                            justifyContent: 'center', 
                                            alignItems: 'center', 
                                            gap: '8px',
                                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                            opacity: isSubmitting ? 0.7 : 1
                                        }}
                                    >
                                        {isSubmitting ? 'Activating...' : (
                                            <><CheckCircle size={18} /> Accept Project & Notify Team</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProjectHandoff;
