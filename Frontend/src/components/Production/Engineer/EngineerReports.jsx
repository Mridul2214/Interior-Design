import React, { useState, useEffect } from 'react';
import { ClipboardList, Users, ShieldAlert, CheckCircle2, Clock, AlertTriangle, Target, Box } from 'lucide-react';
import { engineerAPI, siteManagementAPI } from '../../../config/api';
import { format } from 'date-fns';
import './Engineer.css';

const STATUS_COLORS = { 'On Track': { color: '#065f46', bg: '#d1fae5' }, 'Delayed': { color: '#92400e', bg: '#fef3c7' }, 'Blocked': { color: '#991b1b', bg: '#fee2e2' }, 'Completed': { color: '#5b21b6', bg: '#ede9fe' } };
const SEVERITY_COLORS = { 'Low': '#3b82f6', 'Medium': '#f59e0b', 'High': '#ef4444', 'Critical': '#7f1d1d' };
const LOG_STATUS_COLORS = { 'Open': '#f59e0b', 'Resolved': '#10b981' };

const EngineerReports = () => {
    const [activeTab, setActiveTab] = useState('daily');
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('all');
    
    const [dailyReports, setDailyReports] = useState([]);
    const [supervisorReports, setSupervisorReports] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [safetyLogs, setSafetyLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        engineerAPI.getMyProjects().then(res => {
            if (res.success) setProjects(res.data);
        });
    }, []);

    useEffect(() => {
        fetchData();
    }, [activeTab, selectedProject]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'daily') {
                const res = await siteManagementAPI.getProjectReports(selectedProject);
                if (res.success) setDailyReports(res.data);
            } else if (activeTab === 'supervisor') {
                const res = await siteManagementAPI.getSupervisorReports(selectedProject);
                if (res.success) setSupervisorReports(res.data);
            } else if (activeTab === 'attendance') {
                if (selectedProject !== 'all') {
                    const res = await siteManagementAPI.getProjectAttendance(selectedProject);
                    if (res.success) setAttendance(res.data);
                } else {
                    setAttendance([]); // Attendance requires a specific project
                }
            } else if (activeTab === 'safety') {
                // If "all", we might need to fetch logs for all projects, but the API currently supports specific projectId.
                // For simplicity, we assume 'all' isn't supported by the generic route if we used :projectId without 'all' handler.
                // Wait, I updated getProjectReports to handle 'all'. Did I do that for Safety? No. Let's just require project selection for safety & attendance, or fetch for the first project if 'all'.
                if (selectedProject !== 'all') {
                    const res = await siteManagementAPI.getProjectSafetyLogs(selectedProject);
                    if (res.success) setSafetyLogs(res.data);
                } else {
                    setSafetyLogs([]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="eng-dashboard">
            <div className="eng-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="eng-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ClipboardList size={24} style={{ color: '#2563eb' }} /> Site Monitoring
                    </h1>
                    <p className="eng-subtitle">Review daily progress, attendance, and safety logs from Site Engineers</p>
                </div>
                <div>
                    <select className="eng-input" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} style={{ padding: '8px 12px', width: 250 }}>
                        <option value="all">All Projects</option>
                        {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                    </select>
                </div>
            </div>

            <div className="eng-tabs" style={{ marginBottom: 24, borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 20 }}>
                <button className={`eng-tab-btn ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')} style={{ padding: '10px 0', background: 'none', border: 'none', borderBottom: activeTab === 'daily' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'daily' ? '#2563eb' : '#64748b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ClipboardList size={16}/> Daily Reports
                </button>
                <button className={`eng-tab-btn ${activeTab === 'supervisor' ? 'active' : ''}`} onClick={() => setActiveTab('supervisor')} style={{ padding: '10px 0', background: 'none', border: 'none', borderBottom: activeTab === 'supervisor' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'supervisor' ? '#2563eb' : '#64748b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Box size={16}/> Supervisor Logs
                </button>
                <button className={`eng-tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')} style={{ padding: '10px 0', background: 'none', border: 'none', borderBottom: activeTab === 'attendance' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'attendance' ? '#2563eb' : '#64748b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={16}/> Attendance
                </button>
                <button className={`eng-tab-btn ${activeTab === 'safety' ? 'active' : ''}`} onClick={() => setActiveTab('safety')} style={{ padding: '10px 0', background: 'none', border: 'none', borderBottom: activeTab === 'safety' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'safety' ? '#2563eb' : '#64748b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldAlert size={16}/> Safety Logs
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading data...</div>
            ) : (
                <>
                    {/* DAILY REPORTS TAB */}
                    {activeTab === 'daily' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                            {dailyReports.length === 0 ? (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, background: 'white', borderRadius: 12, border: '1px dashed #cbd5e1' }}>No daily reports found.</div>
                            ) : dailyReports.map(r => {
                                const sc = STATUS_COLORS[r.workStatus] || { color: '#374151', bg: '#f3f4f6' };
                                return (
                                    <div key={r._id} className="eng-section-card" style={{ padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{format(new Date(r.date), 'dd MMM yyyy')}</span>
                                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: sc.bg, color: sc.color, fontWeight: 600 }}>{r.workStatus}</span>
                                        </div>
                                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12, display: 'flex', gap: 10 }}>
                                            <span>Project: {r.project?.projectName}</span>
                                            <span>Weather: {r.weather}</span>
                                            {r.workersPresent && <span>Workers: {r.workersPresent}</span>}
                                        </div>
                                        <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.5, marginBottom: 10 }}><strong>Work Done:</strong><br/>{r.workDone}</p>
                                        {r.issues && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 5 }}><strong>Issues:</strong> {r.issues}</p>}
                                        {r.nextDayPlan && <p style={{ fontSize: 13, color: '#6366f1' }}><strong>Tomorrow:</strong> {r.nextDayPlan}</p>}
                                        <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#94a3b8' }}>
                                            Submitted by {r.submittedBy?.fullName} ({r.submittedBy?.role})
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* SUPERVISOR REPORTS TAB */}
                    {activeTab === 'supervisor' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                            {supervisorReports.length === 0 ? (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, background: 'white', borderRadius: 12, border: '1px dashed #cbd5e1' }}>No supervisor logs found.</div>
                            ) : supervisorReports.map(r => (
                                <div key={r._id} className="eng-section-card" style={{ padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{format(new Date(r.date), 'dd MMM yyyy')}</span>
                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: '#f8fafc', color: '#475569', fontWeight: 600 }}>Log</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12, display: 'flex', gap: 10 }}>
                                        <span>Project: {r.project?.projectName}</span>
                                        {r.laborCount && <span>Laborers: {r.laborCount}</span>}
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                                        {r.materialReceived && <div style={{ fontSize: 13, background: '#f8fafc', padding: '8px', borderRadius: 6 }}><strong>Received:</strong> {r.materialReceived}</div>}
                                        {r.materialUsed && <div style={{ fontSize: 13, background: '#f8fafc', padding: '8px', borderRadius: 6 }}><strong>Used:</strong> {r.materialUsed}</div>}
                                    </div>

                                    {r.equipmentStatus?.length > 0 && r.equipmentStatus.some(eq => eq.equipmentName) && (
                                        <div style={{ marginBottom: 12 }}>
                                            <strong style={{ fontSize: 13, color: '#334155' }}>Equipment Status:</strong>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                                                {r.equipmentStatus.filter(eq => eq.equipmentName).map((eq, i) => (
                                                    <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: eq.status==='Working'?'#d1fae5':eq.status==='Broken'?'#fee2e2':'#fef3c7', color: eq.status==='Working'?'#065f46':eq.status==='Broken'?'#991b1b':'#92400e' }}>
                                                        {eq.equipmentName}: {eq.status}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {r.comments && <p style={{ fontSize: 13, color: '#475569', fontStyle: 'italic', marginBottom: 0 }}>"{r.comments}"</p>}
                                    
                                    <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#94a3b8' }}>
                                        Submitted by {r.submittedBy?.fullName} ({r.submittedBy?.role})
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ATTENDANCE TAB */}
                    {activeTab === 'attendance' && (
                        <div>
                            {selectedProject === 'all' ? (
                                <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 12, border: '1px dashed #cbd5e1' }}>Please select a specific project to view attendance.</div>
                            ) : attendance.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 12, border: '1px dashed #cbd5e1' }}>No attendance records found for this project.</div>
                            ) : (
                                <div style={{ display: 'grid', gap: 15 }}>
                                    {attendance.map(a => (
                                        <div key={a._id} className="eng-section-card" style={{ padding: 20 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
                                                <h3 style={{ margin: 0, fontSize: 16 }}>Attendance: {format(new Date(a.date), 'dd MMM yyyy')}</h3>
                                                <span style={{ fontSize: 12, color: '#64748b' }}>Submitted by {a.submittedBy?.fullName}</span>
                                            </div>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                                                        <th style={{ padding: '8px 0' }}>Worker Name</th>
                                                        <th style={{ padding: '8px 0' }}>Role</th>
                                                        <th style={{ padding: '8px 0' }}>Status</th>
                                                        <th style={{ padding: '8px 0' }}>Time In/Out</th>
                                                        <th style={{ padding: '8px 0' }}>Notes</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {a.records.map((r, i) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ padding: '10px 0', fontWeight: 500, color: '#0f172a' }}>{r.workerName}</td>
                                                            <td style={{ padding: '10px 0', color: '#475569' }}>{r.role}</td>
                                                            <td style={{ padding: '10px 0' }}>
                                                                <span style={{ color: r.status === 'Present' ? '#10b981' : r.status === 'Absent' ? '#ef4444' : '#f59e0b', fontWeight: 500 }}>
                                                                    {r.status}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '10px 0', color: '#475569' }}>{r.status === 'Absent' ? '—' : `${r.checkInTime} - ${r.checkOutTime}`}</td>
                                                            <td style={{ padding: '10px 0', color: '#64748b' }}>{r.notes || '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SAFETY TAB */}
                    {activeTab === 'safety' && (
                        <div>
                            {selectedProject === 'all' ? (
                                <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 12, border: '1px dashed #cbd5e1' }}>Please select a specific project to view safety logs.</div>
                            ) : safetyLogs.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 12, border: '1px dashed #cbd5e1' }}>No safety logs found for this project.</div>
                            ) : (
                                <div style={{ display: 'grid', gap: 15 }}>
                                    {safetyLogs.map(log => (
                                        <div key={log._id} className="eng-section-card" style={{ padding: 16, display: 'flex', gap: 15, alignItems: 'flex-start' }}>
                                            <div style={{ padding: 10, background: SEVERITY_COLORS[log.severity] + '15', borderRadius: 8, color: SEVERITY_COLORS[log.severity] }}>
                                                <AlertTriangle size={24} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                                        <h4 style={{ margin: 0, fontSize: 15, color: '#0f172a' }}>{log.type}</h4>
                                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: SEVERITY_COLORS[log.severity] + '20', color: SEVERITY_COLORS[log.severity], fontWeight: 600 }}>{log.severity}</span>
                                                    </div>
                                                    <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: LOG_STATUS_COLORS[log.status], background: LOG_STATUS_COLORS[log.status] + '15', padding: '2px 8px', borderRadius: 12, fontWeight: 500 }}>
                                                        {log.status === 'Resolved' ? <CheckCircle2 size={12}/> : <Clock size={12}/>} {log.status}
                                                    </span>
                                                </div>
                                                <p style={{ margin: '5px 0 10px', fontSize: 14, color: '#475569', lineHeight: 1.5 }}>{log.description}</p>
                                                {log.actionTaken && (
                                                    <div style={{ fontSize: 13, background: '#f8fafc', padding: '8px 12px', borderRadius: 6, color: '#334155', border: '1px solid #e2e8f0', marginBottom: 10 }}>
                                                        <strong>Action Taken:</strong> {log.actionTaken}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                                                    Reported by {log.reportedBy?.fullName} on {format(new Date(log.date), 'MMM dd, yyyy')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default EngineerReports;
