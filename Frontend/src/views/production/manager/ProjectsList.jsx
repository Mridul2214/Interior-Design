import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Plus, Calendar, Target, Clock, CheckCircle, ChevronDown, X } from 'lucide-react';
import '../css/ProductionManagement.css';
import { productionManagerAPI } from '../../../models/api';

const ProjectsList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);

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

    const STATUS_OPTIONS = ['All', 'Active', 'Planning', 'On Hold', 'Completed'];
    const activeFilterCount = (filterStatus !== 'All' ? 1 : 0) + (searchTerm ? 1 : 0);

    const displayProjects = projects;

    return (
        <div className="pm-dashboard">
            {/* Toolbar */}
            <div style={{ padding: '0 1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setFiltersOpen(o => !o)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                            background: filtersOpen ? '#0f172a' : 'white',
                            color: filtersOpen ? 'white' : '#334155',
                            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                            transition: 'all 0.2s ease', position: 'relative'
                        }}
                    >
                        <Filter size={15} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span style={{
                                background: '#3b82f6', color: 'white', borderRadius: '99px',
                                fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px',
                                marginLeft: '2px'
                            }}>
                                {activeFilterCount}
                            </span>
                        )}
                        <ChevronDown size={14} style={{ transition: 'transform 0.2s ease', transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </button>

                    {/* Active filter chips */}
                    {filterStatus !== 'All' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '99px', fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 600 }}>
                            {filterStatus}
                            <button onClick={() => setFilterStatus('All')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#3b82f6' }}>
                                <X size={12} />
                            </button>
                        </div>
                    )}
                </div>

                <button className="pm-quick-action-btn">
                    <Plus size={15} />
                    <span>New Project</span>
                </button>
            </div>

            {/* Collapsible Filter Panel */}
            <div style={{
                overflow: 'hidden',
                maxHeight: filtersOpen ? '160px' : '0',
                transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                marginBottom: filtersOpen ? '1rem' : '0'
            }}>
                <div style={{ margin: '0 1.5rem', padding: '1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Search */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <Search size={15} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Search projects or clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0f172a', width: '100%', fontSize: '0.875rem' }}
                        />
                        {searchTerm && <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}><X size={14} /></button>}
                    </div>
                    {/* Status chips */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>Status:</span>
                        {STATUS_OPTIONS.map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)} style={{
                                padding: '4px 14px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                border: '1px solid', transition: 'all 0.15s ease',
                                background: filterStatus === s ? '#0f172a' : 'white',
                                color: filterStatus === s ? 'white' : '#475569',
                                borderColor: filterStatus === s ? '#0f172a' : '#e2e8f0'
                            }}>
                                {s === 'All' ? 'All Statuses' : s}
                            </button>
                        ))}
                    </div>
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
