import React from 'react';
import { 
    Users, 
    Mail, 
    Phone, 
    Briefcase, 
    ArrowRight,
    Search
} from 'lucide-react';
import '../css/DesignStudio.css';

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
        <div className="design-studio-container fade-in">
            {/* Studio Header */}
            <header className="editorial-header">
                <div>
                    <div className="editorial-date">Studio Relations // Client Portfolio</div>
                    <h1>THE <span>PATRON</span> LIST</h1>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ background: '#eee', padding: '10px 20px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Search size={16} />
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Filter Patrons...</span>
                    </div>
                </div>
            </header>

            <div style={{ borderTop: '2px solid #1a1a1a', paddingTop: '3rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '20px 0', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#888' }}>PATRON</th>
                            <th style={{ padding: '20px 0', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#888' }}>CONTACT</th>
                            <th style={{ padding: '20px 0', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#888' }}>ENGAGEMENTS</th>
                            <th style={{ padding: '20px 0', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#888', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {uniqueClients.map((client, idx) => (
                            <tr key={client._id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                <td style={{ padding: '30px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 300, color: '#ccc' }}>0{idx + 1}</div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{client.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#c4a484', fontWeight: 700 }}>PREMIUM CLIENT</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '30px 0' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Mail size={14} color="#aaa" /> {client.email || 'N/A'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Phone size={14} color="#aaa" /> {client.phone || 'N/A'}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '30px 0' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {client.projects.map(p => (
                                            <span key={p._id} style={{ fontSize: '0.7rem', fontWeight: 700, background: '#fcfaf7', border: '1px solid #eee', padding: '4px 10px', borderRadius: '2px' }}>
                                                {p.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td style={{ padding: '30px 0', textAlign: 'right' }}>
                                    <button style={{ background: 'transparent', border: 'none', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', cursor: 'pointer' }}>
                                        VIEW PORTFOLIO <ArrowRight size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {uniqueClients.length === 0 && (
                    <div style={{ padding: '10rem 0', textAlign: 'center' }}>
                        <h2 style={{ fontWeight: 300, color: '#ccc' }}>No clients recorded in the studio archive.</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Clients;
