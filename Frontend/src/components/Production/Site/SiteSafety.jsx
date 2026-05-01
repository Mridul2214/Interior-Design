import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { engineerAPI, siteManagementAPI } from '../../../config/api';
import { format } from 'date-fns';
import './Site.css';

const STATUS_COLORS = { 'Open': '#f59e0b', 'Resolved': '#10b981' };
const SEVERITY_COLORS = { 'Low': '#3b82f6', 'Medium': '#f59e0b', 'High': '#ef4444', 'Critical': '#7f1d1d' };

const SiteSafety = ({ user }) => {
    const [projects, setProjects] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    
    const [form, setForm] = useState({
        projectId: '',
        type: 'Daily Check',
        severity: 'Low',
        description: '',
        actionTaken: '',
    });

    useEffect(() => {
        engineerAPI.getMyProjects().then(res => {
            if (res.success) setProjects(res.data);
        });
    }, []);

    useEffect(() => {
        if (projects.length > 0) {
            fetchLogs(projects[0]._id);
            setForm(f => ({ ...f, projectId: projects[0]._id }));
        }
    }, [projects]);

    const fetchLogs = async (projectId) => {
        setLoading(true);
        try {
            const res = await siteManagementAPI.getProjectSafetyLogs(projectId);
            if (res.success) setLogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await siteManagementAPI.reportSafetyIssue(form);
            if (res.success) {
                setLogs([res.data, ...logs]);
                setShowForm(false);
                setForm(f => ({ ...f, description: '', actionTaken: '', severity: 'Low', type: 'Daily Check' }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleResolve = async (logId) => {
        try {
            const res = await siteManagementAPI.updateSafetyLogStatus(logId, { status: 'Resolved' });
            if (res.success) {
                setLogs(logs.map(l => l._id === logId ? { ...l, status: 'Resolved' } : l));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="site-safety-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div className="site-form-group" style={{ margin: 0, minWidth: 200 }}>
                    <select className="site-form-input" value={form.projectId} onChange={(e) => {
                        setForm({...form, projectId: e.target.value});
                        fetchLogs(e.target.value);
                    }} style={{ height: 38 }}>
                        <option value="">Select Project</option>
                        {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                    </select>
                </div>
                <button className="site-btn" onClick={() => setShowForm(!showForm)}>
                    <Plus size={16} /> Log Incident / Check
                </button>
            </div>

            {showForm && (
                <div className="site-card" style={{ marginBottom: 24, padding: 20, borderLeft: '4px solid #ef4444' }}>
                    <h3 style={{ fontSize: 16, marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}><ShieldAlert size={18} color="#ef4444" /> New Safety Log</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                        <div className="site-form-group" style={{ margin: 0 }}>
                            <label className="shad-form-label">Log Type</label>
                            <select className="site-form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                <option value="Daily Check">Daily Check</option>
                                <option value="Incident">Incident</option>
                                <option value="Hazard">Hazard Warning</option>
                            </select>
                        </div>
                        <div className="site-form-group" style={{ margin: 0 }}>
                            <label className="shad-form-label">Severity</label>
                            <select className="site-form-input" value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                        <div className="site-form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                            <label className="shad-form-label">Description</label>
                            <textarea className="site-form-textarea" required rows={3} placeholder="Describe the incident or safety check..." value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                        </div>
                        <div className="site-form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                            <label className="shad-form-label">Action Taken (Optional)</label>
                            <input className="site-form-input" type="text" placeholder="What was done to address this?" value={form.actionTaken} onChange={e => setForm({...form, actionTaken: e.target.value})} />
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                            <button type="button" className="site-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="site-btn">Submit Log</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="safety-logs-list" style={{ display: 'grid', gap: 15 }}>
                {loading ? <div style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>Loading safety logs...</div> : 
                 logs.length === 0 ? <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 12, border: '1px dashed #cbd5e1', color: '#64748b' }}><ShieldAlert size={32} style={{ opacity: 0.5, marginBottom: 10 }} /><br/>No safety logs for this project yet.</div> :
                 logs.map(log => (
                    <div key={log._id} className="site-card" style={{ padding: 16, display: 'flex', gap: 15, alignItems: 'flex-start' }}>
                        <div style={{ padding: 10, background: SEVERITY_COLORS[log.severity] + '15', borderRadius: 8, color: SEVERITY_COLORS[log.severity] }}>
                            <AlertTriangle size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <h4 style={{ margin: 0, fontSize: 15, color: '#0f172a' }}>{log.type}</h4>
                                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: SEVERITY_COLORS[log.severity] + '20', color: SEVERITY_COLORS[log.severity], fontWeight: 600 }}>{log.severity}</span>
                                </div>
                                <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: STATUS_COLORS[log.status], background: STATUS_COLORS[log.status] + '15', padding: '2px 8px', borderRadius: 12, fontWeight: 500 }}>
                                    {log.status === 'Resolved' ? <CheckCircle2 size={12}/> : <Clock size={12}/>} {log.status}
                                </span>
                            </div>
                            <p style={{ margin: '5px 0 10px', fontSize: 14, color: '#475569', lineHeight: 1.5 }}>{log.description}</p>
                            {log.actionTaken && (
                                <div style={{ fontSize: 13, background: '#f8fafc', padding: '8px 12px', borderRadius: 6, color: '#334155', border: '1px solid #e2e8f0', marginBottom: 10 }}>
                                    <strong>Action Taken:</strong> {log.actionTaken}
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#94a3b8' }}>
                                <span>Reported by {log.reportedBy?.fullName || 'User'} on {format(new Date(log.date), 'MMM dd, yyyy')}</span>
                                {log.status === 'Open' && (
                                    <button onClick={() => handleResolve(log._id)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Mark Resolved</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SiteSafety;
