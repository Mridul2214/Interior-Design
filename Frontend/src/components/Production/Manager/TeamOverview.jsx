import React, { useState } from 'react';
import { Search, Mail, Phone, MapPin, MoreVertical, Plus, Award, Briefcase, Activity } from 'lucide-react';
import '../css/ProductionManagement.css';

const MOCK_TEAM = [
    { id: 'EMP-01', name: 'Rahul K.', role: 'Senior Site Engineer', email: 'rahul.k@interiortech.com', phone: '+91 98765 43210', location: 'Jubilee Hills', activeProjects: 3, capacity: 85, performance: 'Excellent' },
    { id: 'EMP-02', name: 'Priya M.', role: 'Project Engineer', email: 'priya.m@interiortech.com', phone: '+91 98765 43211', location: 'HITEC City', activeProjects: 2, capacity: 60, performance: 'Good' },
    { id: 'EMP-03', name: 'Vikram S.', role: 'Site Supervisor', email: 'vikram.s@interiortech.com', phone: '+91 98765 43212', location: 'Gachibowli', activeProjects: 4, capacity: 95, performance: 'Outstanding' },
    { id: 'EMP-04', name: 'Anita R.', role: 'Design Coordinator', email: 'anita.r@interiortech.com', phone: '+91 98765 43213', location: 'Banjara Hills', activeProjects: 2, capacity: 40, performance: 'Good' },
    { id: 'EMP-05', name: 'Suresh P.', role: 'Site Engineer', email: 'suresh.p@interiortech.com', phone: '+91 98765 43214', location: 'Kondapur', activeProjects: 1, capacity: 20, performance: 'Needs Improvement' },
    { id: 'EMP-06', name: 'Ravi T.', role: 'Procurement Lead', email: 'ravi.t@interiortech.com', phone: '+91 98765 43215', location: 'Head Office', activeProjects: 6, capacity: 75, performance: 'Excellent' }
];

const TeamOverview = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTeam = MOCK_TEAM.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCapacityColor = (cap) => {
        if (cap >= 90) return '#ef4444'; // Overloaded
        if (cap >= 70) return '#f59e0b'; // High
        if (cap >= 40) return '#10b981'; // Optimal
        return '#3b82f6'; // Available
    };

    return (
        <div className="pm-dashboard">
            <div className="pm-welcome-header" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div className="pm-welcome-text">
                        <h1 style={{ fontSize: '1.5rem' }}>Team Directory</h1>
                        <p className="pm-welcome-date">Manage production team workload and details</p>
                    </div>
                    <button className="pm-quick-action-btn" style={{ padding: '0.75rem 1.25rem', flexDirection: 'row', gap: '0.5rem', background: '#3b82f6', color: 'white', borderColor: '#2563eb' }}>
                        <Plus size={18} />
                        <span>Add Member</span>
                    </button>
                </div>
                
                {/* Search Bar */}
                <div style={{ display: 'flex', gap: '1rem', width: '100%', zIndex: 1 }}>
                    <div className="pm-search-bar" style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <Search size={16} color="#64748b" />
                        <input 
                            type="text" 
                            placeholder="Search by name or role..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0f172a', paddingLeft: '0.5rem', width: '100%' }}
                        />
                    </div>
                </div>
            </div>

            <div className="pm-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="pm-table-container">
                    <table className="pm-table">
                        <thead>
                            <tr>
                                <th>Member Profile</th>
                                <th>Contact Info</th>
                                <th>Workload & Capacity</th>
                                <th>Performance</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeam.map(member => (
                                <tr key={member.id} className="pm-table-row">
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div className="pm-team-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0' }}>
                                                {member.name.split(' ').map(n=>n[0]).join('')}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>{member.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Briefcase size={12} /> {member.role}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#334155' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} color="#64748b" /> {member.email}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} color="#64748b" /> {member.phone}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={12} color="#64748b" /> {member.location}</div>
                                        </div>
                                    </td>
                                    <td style={{ minWidth: '180px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', display: 'flex', justifyContent: 'space-between' }}>
                                                <span><Activity size={12} style={{ marginRight: '4px', verticalAlign: 'middle', color: '#64748b' }}/> Active Projects: {member.activeProjects}</span>
                                                <span style={{ color: getCapacityColor(member.capacity) }}>{member.capacity}%</span>
                                            </div>
                                            <div className="pm-capacity-bar" style={{ background: '#f1f5f9', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div className="pm-capacity-fill" style={{ width: `${member.capacity}%`, background: getCapacityColor(member.capacity), height: '100%', borderRadius: '3px' }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}>
                                            <Award size={14} color={member.performance === 'Outstanding' ? '#f59e0b' : member.performance === 'Excellent' ? '#10b981' : '#64748b'} />
                                            {member.performance}
                                        </div>
                                    </td>
                                    <td>
                                        <button className="pm-icon-btn"><MoreVertical size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                            {filteredTeam.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No team members found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeamOverview;
