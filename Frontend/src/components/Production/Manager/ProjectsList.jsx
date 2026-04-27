import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Plus, Calendar, Target, Clock, CheckCircle } from 'lucide-react';
import '../css/ProductionManagement.css';
import { productionManagerAPI } from '../../../config/api';

const ProjectsList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const res = await productionManagerAPI.getProjects({
                    status: filterStatus !== 'All' ? filterStatus : '',
                    search: searchTerm
                });
                if (res?.success) {
                    setProjects(res.data);
                }
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchProjects();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterStatus]);

    const getStatusClass = (status) => {
        const map = { 'Active': 'active', 'On Hold': 'on-hold', 'Planning': 'planning', 'Completed': 'completed' };
        return map[status] || 'default';
    };

    // Filter logic is now handled in the backend, but we keep the mapping
    const displayProjects = projects;

    return (
        <div className="pm-dashboard">
            <div className="pm-welcome-header" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div className="pm-welcome-text">
                        <h1 style={{ fontSize: '1.5rem' }}>Projects Overview</h1>
                        <p className="pm-welcome-date">Manage and track all production projects</p>
                    </div>
                    <button className="pm-quick-action-btn" style={{ padding: '0.75rem 1.25rem', flexDirection: 'row', gap: '0.5rem', background: '#3b82f6', color: 'white', borderColor: '#2563eb' }}>
                        <Plus size={18} />
                        <span>New Project</span>
                    </button>
                </div>
                
                {/* Filters */}
                <div style={{ display: 'flex', gap: '1rem', width: '100%', zIndex: 1 }}>
                    <div className="pm-search-bar" style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <Search size={16} color="#64748b" />
                        <input 
                            type="text" 
                            placeholder="Search projects or clients..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0f172a', paddingLeft: '0.5rem', width: '100%' }}
                        />
                    </div>
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', padding: '0.5rem 1rem', borderRadius: '8px', outline: 'none' }}
                    >
                        <option value="All" style={{ color: '#0f172a' }}>All Statuses</option>
                        <option value="Active" style={{ color: '#0f172a' }}>Active</option>
                        <option value="Planning" style={{ color: '#0f172a' }}>Planning</option>
                        <option value="On Hold" style={{ color: '#0f172a' }}>On Hold</option>
                        <option value="Completed" style={{ color: '#0f172a' }}>Completed</option>
                    </select>
                </div>
            </div>

            <div className="pm-card">
                <div className="pm-table-container">
                    <table className="pm-table">
                        <thead>
                            <tr>
                                <th>Project ID & Name</th>
                                <th>Client / Type</th>
                                <th>Status</th>
                                <th>Progress</th>
                                <th>Timeline</th>
                                <th>Engineer</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading projects...</td>
                                </tr>
                            ) : displayProjects.map(project => (
                                <tr key={project._id} className="pm-table-row">
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>{project.projectName}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{project._id.toString().substring(0, 8)}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500, color: '#334155', marginBottom: '2px' }}>{project.clientId?.name || 'N/A'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{project.projectType || 'Residential'}</div>
                                    </td>
                                    <td>
                                        <span className={`pm-status-badge ${getStatusClass(project.status)}`}>{project.status}</span>
                                    </td>
                                    <td style={{ minWidth: '150px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div className="pm-progress-bar-v2" style={{ flex: 1 }}>
                                                <div className="pm-progress-fill-v2" style={{ width: `${project.progress || 0}%` }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{project.progress || 0}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                            <Calendar size={12} color="#64748b" /> {project.startDate ? new Date(project.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' }) : 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Target size={12} color="#64748b" /> {project.endDate ? new Date(project.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' }) : 'N/A'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div className="pm-team-avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem', background: '#eff6ff', color: '#3b82f6' }}>
                                                {(project.projectEngineer?.fullName || project.projectManager?.fullName || 'N A').split(' ').map(n=>n[0]).join('')}
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{project.projectEngineer?.fullName || project.projectManager?.fullName || 'Unassigned'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button className="pm-icon-btn"><MoreVertical size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && displayProjects.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No projects found matching your criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProjectsList;
