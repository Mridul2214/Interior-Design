import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, MapPin, MoreVertical, Plus, Award, Briefcase, Activity, Users, X } from 'lucide-react';
import '../css/ProductionManagement.css';
import { teamMemberAPI } from '../../../config/api';

const TeamOverview = () => {
    const [teamData, setTeamData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [newMember, setNewMember] = useState({
        name: '',
        role: '',
        email: '',
        phone: '',
        location: '',
        reportingManager: '', // Will split by comma on submit
        activeProjects: 0,
        workloadPercentage: 0,
        performance: 'Good'
    });

    const fetchTeam = async () => {
        try {
            setLoading(true);
            const res = await teamMemberAPI.getMembers();
            if (res.success) {
                setTeamData(res.data);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const filteredTeam = teamData.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCapacityColor = (cap) => {
        if (cap >= 90) return '#ef4444'; // Overloaded
        if (cap >= 70) return '#f59e0b'; // High
        if (cap >= 40) return '#10b981'; // Optimal
        return '#3b82f6'; // Available
    };

    const handleCreateMember = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...newMember,
                reportingManager: newMember.reportingManager
                    ? newMember.reportingManager.split(',').map(m => m.trim()).filter(Boolean)
                    : []
            };
            const res = await teamMemberAPI.createMember(dataToSubmit);
            if (res.success) {
                setIsModalOpen(false);
                setNewMember({
                    name: '', role: '', email: '', phone: '', location: '',
                    reportingManager: '', activeProjects: 0, workloadPercentage: 0, performance: 'Good'
                });
                fetchTeam();
            } else {
                alert("Error: " + res.message);
            }
        } catch (err) {
            alert("Error creating member: " + err.message);
        }
    };

    return (
        <div className="pm-dashboard">
            <div className="pm-welcome-header" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div className="pm-welcome-text">
                        <h1 style={{ fontSize: '1.5rem' }}>Team Directory</h1>
                        <p className="pm-welcome-date">Manage production team workload and details</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="pm-quick-action-btn" style={{ padding: '0.75rem 1.25rem', flexDirection: 'row', gap: '0.5rem', background: '#3b82f6', color: 'white', borderColor: '#2563eb' }}>
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

            {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>{error}</div>}

            <div className="pm-card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading team members...</div>
                ) : (
                    <div className="pm-table-container">
                        <table className="pm-table">
                            <thead>
                                <tr>
                                    <th>Member Profile</th>
                                    <th>Contact Info</th>
                                    <th>Reporting Team</th>
                                    <th>Workload & Capacity</th>
                                    <th>Performance</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeam.map(member => (
                                    <tr key={member._id} className="pm-table-row">
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div className="pm-team-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0' }}>
                                                    {member.name ? member.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() : '?'}
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
                                        <td>
                                            {member.reportingManager && member.reportingManager.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {member.reportingManager.map((sub, idx) => (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                                                            <Users size={12} color="#94a3b8" />
                                                            <span style={{ fontWeight: 600, color: '#334155' }}>{sub}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>None</span>
                                            )}
                                        </td>
                                        <td style={{ minWidth: '180px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span><Activity size={12} style={{ marginRight: '4px', verticalAlign: 'middle', color: '#64748b' }}/> Active Projects: {member.activeProjects}</span>
                                                    <span style={{ color: getCapacityColor(member.workloadPercentage) }}>{member.workloadPercentage}%</span>
                                                </div>
                                                <div className="pm-capacity-bar" style={{ background: '#f1f5f9', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div className="pm-capacity-fill" style={{ width: `${member.workloadPercentage}%`, background: getCapacityColor(member.workloadPercentage), height: '100%', borderRadius: '3px' }}></div>
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
                                            <button 
                                                onClick={async () => {
                                                    if(window.confirm('Delete this team member?')) {
                                                        await teamMemberAPI.deleteMember(member._id);
                                                        fetchTeam();
                                                    }
                                                }}
                                                className="pm-icon-btn" style={{ color: '#ef4444' }}>
                                                <X size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredTeam.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No team members found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Member Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Add Team Member</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateMember} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Full Name *</label>
                                <input required type="text" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: 'span 1' }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Role *</label>
                                <input required type="text" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} placeholder="e.g. Project Engineer" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: 'span 1' }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Email *</label>
                                <input required type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: 'span 1' }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Phone *</label>
                                <input required type="text" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: 'span 1' }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Location *</label>
                                <input required type="text" value={newMember.location} onChange={e => setNewMember({...newMember, location: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Reporting Team (Comma separated names)</label>
                                <input type="text" value={newMember.reportingManager} onChange={e => setNewMember({...newMember, reportingManager: e.target.value})} placeholder="e.g. Arjun M., Neha S." style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: 'span 1' }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Active Projects</label>
                                <input type="number" min="0" value={newMember.activeProjects} onChange={e => setNewMember({...newMember, activeProjects: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: 'span 1' }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Workload %</label>
                                <input type="number" min="0" max="100" value={newMember.workloadPercentage} onChange={e => setNewMember({...newMember, workloadPercentage: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Performance</label>
                                <select value={newMember.performance} onChange={e => setNewMember({...newMember, performance: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}>
                                    <option value="Good">Good</option>
                                    <option value="Excellent">Excellent</option>
                                    <option value="Outstanding">Outstanding</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                                <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                                    Add Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamOverview;
