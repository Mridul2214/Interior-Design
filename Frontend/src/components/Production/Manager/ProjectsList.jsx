import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Plus, Calendar, Target, Clock, CheckCircle } from 'lucide-react';
import '../css/ProductionManagement.css';

const MOCK_PROJECTS = [
    { id: 'PRJ-101', name: 'Villa Renovation - Jubilee Hills', client: 'Dr. Ramesh Kumar', status: 'Active', progress: 72, start: '2026-01-15', end: '2026-05-15', engineer: 'Rahul K.', type: 'Residential', budget: '₹18.5L' },
    { id: 'PRJ-102', name: 'Office Interior - HITEC City', client: 'TechNova Solutions', status: 'Active', progress: 45, start: '2026-02-10', end: '2026-06-01', engineer: 'Priya M.', type: 'Commercial', budget: '₹32L' },
    { id: 'PRJ-103', name: 'Residential Complex - Gachibowli', client: 'Prestige Builders', status: 'On Hold', progress: 28, start: '2026-01-05', end: '2026-06-20', engineer: 'Vikram S.', type: 'Residential', budget: '₹45L' },
    { id: 'PRJ-104', name: 'Showroom Design - Banjara Hills', client: 'Zara Interiors', status: 'Active', progress: 91, start: '2026-03-01', end: '2026-05-05', engineer: 'Anita R.', type: 'Commercial', budget: '₹12L' },
    { id: 'PRJ-105', name: 'Apartment Interiors - Kondapur', client: 'Sanjay Reddy', status: 'Planning', progress: 10, start: '2026-04-10', end: '2026-07-10', engineer: 'Suresh P.', type: 'Residential', budget: '₹28L' },
    { id: 'PRJ-106', name: 'Cafe Redesign - Jubilee Hills', client: 'Brew Coffee Co.', status: 'Completed', progress: 100, start: '2025-11-20', end: '2026-02-15', engineer: 'Rahul K.', type: 'Commercial', budget: '₹15L' },
    { id: 'PRJ-107', name: 'Penthouse - Manikonda', client: 'Arjun Das', status: 'Active', progress: 60, start: '2026-02-01', end: '2026-08-01', engineer: 'Vikram S.', type: 'Residential', budget: '₹55L' },
];

const ProjectsList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const getStatusClass = (status) => {
        const map = { 'Active': 'active', 'On Hold': 'on-hold', 'Planning': 'planning', 'Completed': 'completed' };
        return map[status] || 'default';
    };

    const filteredProjects = MOCK_PROJECTS.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

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
                    <div className="pm-search-bar" style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <Search size={16} color="rgba(255,255,255,0.7)" />
                        <input 
                            type="text" 
                            placeholder="Search projects or clients..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', paddingLeft: '0.5rem', width: '100%' }}
                        />
                    </div>
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', outline: 'none' }}
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
                            {filteredProjects.map(project => (
                                <tr key={project.id} className="pm-table-row">
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>{project.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{project.id}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500, color: '#334155', marginBottom: '2px' }}>{project.client}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{project.type}</div>
                                    </td>
                                    <td>
                                        <span className={`pm-status-badge ${getStatusClass(project.status)}`}>{project.status}</span>
                                    </td>
                                    <td style={{ minWidth: '150px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div className="pm-progress-bar-v2" style={{ flex: 1 }}>
                                                <div className="pm-progress-fill-v2" style={{ width: `${project.progress}%` }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{project.progress}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                            <Calendar size={12} color="#64748b" /> {new Date(project.start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Target size={12} color="#64748b" /> {new Date(project.end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div className="pm-team-avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem', background: '#eff6ff', color: '#3b82f6' }}>
                                                {project.engineer.split(' ').map(n=>n[0]).join('')}
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{project.engineer}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button className="pm-icon-btn"><MoreVertical size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProjects.length === 0 && (
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
