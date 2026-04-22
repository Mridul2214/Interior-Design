import React from 'react';
import { Users, Mail, Phone, Briefcase, ChevronRight } from 'lucide-react';
import '../css/ManagerDashboard.css';

const Clients = ({ projects }) => {
    // Extract unique clients from projects
    const uniqueClients = projects.reduce((acc, proj) => {
        if (!proj.client?._id) return acc;
        if (!acc.some(c => c._id === proj.client._id)) {
            acc.push({
                ...proj.client,
                projects: [proj]
            });
        } else {
            const clientIdx = acc.findIndex(c => c._id === proj.client._id);
            acc[clientIdx].projects.push(proj);
        }
        return acc;
    }, []);

    return (
        <div className="design-clients">
            <div className="section-card">
                <div className="section-header">
                    <h3><Users size={18} /> My Project Clients</h3>
                </div>
                <div className="clients-list" style={{ marginTop: '1.5rem' }}>
                    <div className="table-responsive" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Client Name</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Projects</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Contact</th>
                                    <th style={{ textAlign: 'right', padding: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uniqueClients.map(client => (
                                    <tr key={client._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1.25rem 1rem' }}>
                                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{client.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {client._id?.slice(-6).toUpperCase()}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem' }}>
                                            {client.projects.map(p => (
                                                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                                                    <Briefcase size={12} />
                                                    {p.name}
                                                </div>
                                            ))}
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                                                <Mail size={12} /> {client.email || 'No email provided'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                                                <Phone size={12} /> {client.phone || 'No phone provided'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                                            <button 
                                                className="action-btn-small"
                                                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #4f46e5', color: '#4f46e5', background: 'transparent', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                                            >
                                                Details <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {uniqueClients.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                            No clients associated with your design projects.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Clients;
