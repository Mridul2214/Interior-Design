import React, { useState, useEffect } from 'react';
import { ClipboardList, Send, CheckCircle2, Loader2, Target, ChevronRight, Calendar as CalendarIcon, Users, ShieldAlert, Package } from 'lucide-react';
import { engineerAPI, siteManagementAPI } from '../../../config/api';
import { format } from 'date-fns';
import SiteAttendance from './SiteAttendance';
import SiteSafety from './SiteSafety';
import './Site.css';

const WORK_STATUS = ['On Track', 'Delayed', 'Blocked', 'Completed'];
const WEATHER = ['Clear', 'Cloudy', 'Rainy', 'Windy'];

/* ── Custom UI Components (Shadcn Style) ── */
const ShadSelect = ({ label, value, options, onChange, placeholder, error }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="site-form-group" style={{ position: 'relative' }}>
            <label className="shad-form-label">{label}</label>
            <div className={`shad-select-trigger ${error ? 'site-input-err' : ''}`} onClick={() => setOpen(!open)}>
                <span>{options.find(o => o.id === value || o === value)?.name || options.find(o => o.id === value || o === value) || placeholder}</span>
                <ChevronRight size={14} style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: '0.2s' }} />
            </div>
            {open && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
                    <div className="shad-popover">
                        {options.map(o => (
                            <div key={o.id || o} className={`shad-select-item ${value === (o.id || o) ? 'active' : ''}`}
                                onClick={() => { onChange(o.id || o); setOpen(false); }}>
                                {o.name || o}
                            </div>
                        ))}
                    </div>
                </>
            )}
            {error && <span className="site-field-err">{error}</span>}
        </div>
    );
};

const ShadCalendar = ({ label, value, onChange }) => {
    const [open, setOpen] = useState(false);
    const date = new Date(value);

    return (
        <div className="site-form-group" style={{ position: 'relative' }}>
            <label className="shad-form-label">{label}</label>
            <div className="shad-date-trigger" onClick={() => setOpen(!open)}>
                <span>{format(date, 'PPP')}</span>
                <CalendarIcon size={14} style={{ color: '#94a3b8' }} />
            </div>
            {open && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
                    <div className="shad-popover" style={{ width: 'max-content', minWidth: 'auto' }}>
                        <div className="shad-calendar">
                            <div className="shad-cal-header">
                                <span className="shad-cal-month">{format(date, 'MMMM yyyy')}</span>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button type="button" className="site-filter-toggle" style={{ padding: 4 }}><ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /></button>
                                    <button type="button" className="site-filter-toggle" style={{ padding: 4 }}><ChevronRight size={14} /></button>
                                </div>
                            </div>
                            <div className="shad-cal-grid">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="shad-cal-day-label">{d}</div>)}
                                {[...Array(30)].map((_, i) => (
                                    <div key={i} className={`shad-cal-day ${i + 1 === date.getDate() ? 'selected' : ''}`}
                                        onClick={() => {
                                            const newDate = new Date(date);
                                            newDate.setDate(i + 1);
                                            onChange(format(newDate, 'yyyy-MM-dd'));
                                            setOpen(false);
                                        }}>
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                <button type="button" className="site-filter-chip" onClick={() => { onChange(format(new Date(), 'yyyy-MM-dd')); setOpen(false); }}>Today</button>
                                <button type="button" className="site-filter-chip" onClick={() => setOpen(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const SupervisorReports = ({ user, projects }) => {
    const [reports, setReports] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        projectId: projects[0]?._id || '',
        reportDate: format(new Date(), 'yyyy-MM-dd'),
        materialReceived: '',
        materialUsed: '',
        laborCount: '',
        equipmentStatus: [{ equipmentName: '', status: 'Working' }],
        comments: ''
    });

    useEffect(() => {
        if (projects.length > 0) {
            setForm(f => ({ ...f, projectId: projects[0]._id }));
            fetchReports(projects[0]._id);
        }
    }, [projects]);

    const fetchReports = async (projectId) => {
        try {
            const res = await siteManagementAPI.getSupervisorReports(projectId);
            if (res.success) setReports(res.data);
        } catch (error) { console.error('Failed to fetch supervisor reports', error); }
    };

    const handleProjectChange = (projectId) => {
        setForm(f => ({ ...f, projectId }));
        fetchReports(projectId);
    };

    const validate = () => {
        const e = {};
        if (!form.projectId) e.projectId = 'Select a project';
        return e;
    };

    const addEquipment = () => setForm(f => ({ ...f, equipmentStatus: [...f.equipmentStatus, { equipmentName: '', status: 'Working' }] }));
    const updateEquipment = (index, field, value) => {
        const newEq = [...form.equipmentStatus];
        newEq[index][field] = value;
        setForm(f => ({ ...f, equipmentStatus: newEq }));
    };
    const removeEquipment = (index) => {
        const newEq = form.equipmentStatus.filter((_, i) => i !== index);
        setForm(f => ({ ...f, equipmentStatus: newEq }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitting(true);
        try {
            // Clean empty equipment
            const cleanEq = form.equipmentStatus.filter(eq => eq.equipmentName.trim() !== '');
            const payload = { ...form, equipmentStatus: cleanEq };
            
            const res = await siteManagementAPI.submitSupervisorReport(payload);
            if (res.success) {
                setReports([res.data, ...reports]);
                setForm({ ...form, reportDate: format(new Date(), 'yyyy-MM-dd'), materialReceived: '', materialUsed: '', laborCount: '', equipmentStatus: [{ equipmentName: '', status: 'Working' }], comments: '' });
                setErrors({});
                setSubmitted(true);
                setTimeout(() => setSubmitted(false), 4000);
            }
        } catch (error) { console.error('Failed to submit supervisor report', error); }
        finally { setSubmitting(false); }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'start' }}>
            {submitted && (
                <div className="site-toast" style={{ background: '#10b981', position: 'fixed', top: 20, right: 20, zIndex: 1000, color: 'white', padding: '12px 20px', borderRadius: 8, display: 'flex', gap: 8 }}>
                    <CheckCircle2 size={16} /> Supervisor report submitted!
                </div>
            )}
            
            <div className="site-card">
                <div className="site-card-header">
                    <div className="site-card-title"><Send size={15} />New Supervisor Report</div>
                </div>
                <form onSubmit={handleSubmit} className="site-report-form">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <ShadSelect label="Project *" placeholder="Select project..." value={form.projectId} options={projects.map(p => ({ id: p._id, name: p.projectName }))} onChange={handleProjectChange} error={errors.projectId} />
                        <ShadCalendar label="Report Date" value={form.reportDate} onChange={v => setForm(f => ({ ...f, reportDate: v }))} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div className="site-form-group">
                            <label className="shad-form-label">Material Received</label>
                            <textarea className="site-input" rows={2} placeholder="E.g. 100 bags of cement..." value={form.materialReceived} onChange={e => setForm(f => ({ ...f, materialReceived: e.target.value }))} />
                        </div>
                        <div className="site-form-group">
                            <label className="shad-form-label">Material Used</label>
                            <textarea className="site-input" rows={2} placeholder="E.g. 20 bags used for foundation..." value={form.materialUsed} onChange={e => setForm(f => ({ ...f, materialUsed: e.target.value }))} />
                        </div>
                    </div>

                    <div className="site-form-group">
                        <label className="shad-form-label">Total Labor Count</label>
                        <input type="number" min={0} className="site-input" placeholder="Number of laborers today" value={form.laborCount} onChange={e => setForm(f => ({ ...f, laborCount: e.target.value }))} />
                    </div>

                    <div className="site-form-group">
                        <label className="shad-form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Equipment Status</span>
                            <button type="button" onClick={addEquipment} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Add Equipment</button>
                        </label>
                        {form.equipmentStatus.map((eq, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                                <input className="site-input" placeholder="Equipment Name" value={eq.equipmentName} onChange={e => updateEquipment(i, 'equipmentName', e.target.value)} style={{ flex: 1 }} />
                                <select className="site-input" value={eq.status} onChange={e => updateEquipment(i, 'status', e.target.value)} style={{ width: 140 }}>
                                    <option value="Working">Working</option>
                                    <option value="Broken">Broken</option>
                                    <option value="Maintenance">Maintenance</option>
                                </select>
                                {form.equipmentStatus.length > 1 && (
                                    <button type="button" onClick={() => removeEquipment(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={18} /></button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="site-form-group">
                        <label className="shad-form-label">General Comments / Hurdles</label>
                        <textarea className="site-input" rows={3} placeholder="Any general comments..." value={form.comments} onChange={e => setForm(f => ({ ...f, comments: e.target.value }))} />
                    </div>

                    <button type="submit" className="site-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: '10px', marginTop: '10px' }} disabled={submitting}>
                        {submitting ? <><Loader2 size={15} className="site-spin" />Submitting…</> : <><Send size={15} />Submit Report</>}
                    </button>
                </form>
            </div>

            <div className="site-card">
                <div className="site-card-header">
                    <div className="site-card-title"><ClipboardList size={15}/>Report History</div>
                    <span className="site-count">{reports.length}</span>
                </div>
                {reports.length === 0 ? (
                    <div className="site-empty" style={{padding:52}}><Target size={40}/><p>No reports yet</p></div>
                ) : (
                    <div style={{padding:'8px 0'}}>
                        {reports.map(r => (
                            <div key={r._id} className="site-report-card">
                                <div className="site-report-card-top">
                                    <span className="site-report-date">{format(new Date(r.date),'dd MMM yyyy')}</span>
                                    <span className="site-report-project">{r.project?.projectName}</span>
                                </div>
                                {r.laborCount && <p style={{fontSize:13, margin:'6px 0 0'}}><strong>Laborers:</strong> {r.laborCount}</p>}
                                {r.materialReceived && <p style={{fontSize:12, color:'#64748b', margin:'4px 0 0'}}><strong>Received:</strong> {r.materialReceived}</p>}
                                {r.materialUsed && <p style={{fontSize:12, color:'#64748b', margin:'4px 0 0'}}><strong>Used:</strong> {r.materialUsed}</p>}
                                {r.equipmentStatus?.length > 0 && r.equipmentStatus.some(eq => eq.equipmentName) && (
                                    <div style={{marginTop: 8}}>
                                        <strong style={{fontSize:12}}>Equipment:</strong>
                                        <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:4}}>
                                            {r.equipmentStatus.filter(eq => eq.equipmentName).map((eq, i) => (
                                                <span key={i} style={{fontSize: 11, padding: '2px 6px', borderRadius: 4, background: eq.status==='Working'?'#d1fae5':eq.status==='Broken'?'#fee2e2':'#fef3c7', color: eq.status==='Working'?'#065f46':eq.status==='Broken'?'#991b1b':'#92400e'}}>
                                                    {eq.equipmentName}: {eq.status}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {r.comments && <p style={{fontSize:12, fontStyle:'italic', marginTop:8}}>{r.comments}</p>}
                                <span className="site-report-meta" style={{marginTop: 8, display: 'block'}}>Submitted by {r.submittedBy?.fullName} on {format(new Date(r.createdAt),'dd MMM HH:mm')}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const SiteReports = ({ user }) => {
    const [activeTab, setActiveTab] = useState('daily');
    const [projects, setProjects] = useState([]);
    const [reports, setReports] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        projectId: '',
        reportDate: format(new Date(), 'yyyy-MM-dd'),
        workStatus: 'On Track',
        weather: 'Clear',
        workDone: '',
        issues: '',
        nextDayPlan: '',
        workersPresent: '',
    });

    useEffect(() => {
        engineerAPI.getMyProjects().then(res => { 
            if (res.success) {
                setProjects(res.data);
                if (res.data.length > 0) {
                    setForm(f => ({ ...f, projectId: res.data[0]._id }));
                    fetchReports(res.data[0]._id);
                }
            } 
        });
    }, []);

    const fetchReports = async (projectId) => {
        try {
            const res = await siteManagementAPI.getProjectReports(projectId);
            if (res.success) setReports(res.data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        }
    };

    const validate = () => {
        const e = {};
        if (!form.projectId) e.projectId = 'Select a project';
        if (!form.workDone.trim()) e.workDone = 'Describe today\'s work';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitting(true);
        try {
            const res = await siteManagementAPI.submitDailyReport(form);
            if (res.success) {
                setReports([res.data, ...reports]);
                setForm({ projectId: form.projectId, reportDate: format(new Date(), 'yyyy-MM-dd'), workStatus: 'On Track', weather: 'Clear', workDone: '', issues: '', nextDayPlan: '', workersPresent: '' });
                setErrors({});
                setSubmitted(true);
                setTimeout(() => setSubmitted(false), 4000);
            }
        } catch (error) {
            console.error('Failed to submit report', error);
        } finally {
            setSubmitting(false);
        }
    };

    const STATUS_COLORS = { 'On Track': { color: '#065f46', bg: '#d1fae5' }, 'Delayed': { color: '#92400e', bg: '#fef3c7' }, 'Blocked': { color: '#991b1b', bg: '#fee2e2' }, 'Completed': { color: '#5b21b6', bg: '#ede9fe' } };

    return (
        <div className="site-page">
            {submitted && activeTab === 'daily' && (
                <div className="site-toast" style={{ background: '#10b981' }}>
                    <CheckCircle2 size={16} /> Site report submitted!
                </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ClipboardList size={20} style={{ color: '#10b981' }} />Site Portal
                    </h1>
                    <p style={{ fontSize: 13, color: '#64748b', margin: '5px 0 0' }}>Manage daily reports, attendance, and safety logs</p>
                </div>
            </div>

            <div className="pm-tabs" style={{ marginBottom: 20 }}>
                <button className={`pm-tab-btn ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>
                    <ClipboardList size={16}/> Daily Reports
                </button>
                {user?.role === 'Site Supervisor' && (
                    <button className={`pm-tab-btn ${activeTab === 'supervisor' ? 'active' : ''}`} onClick={() => setActiveTab('supervisor')}>
                        <Package size={16}/> Supervisor Report
                    </button>
                )}
                <button className={`pm-tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
                    <Users size={16}/> Attendance
                </button>
                <button className={`pm-tab-btn ${activeTab === 'safety' ? 'active' : ''}`} onClick={() => setActiveTab('safety')}>
                    <ShieldAlert size={16}/> Safety Logs
                </button>
            </div>

            {activeTab === 'daily' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'start' }}>
                    {/* Form */}
                    <div className="site-card">
                        <div className="site-card-header">
                            <div className="site-card-title"><Send size={15} />New Report</div>
                        </div>
                        <form onSubmit={handleSubmit} className="site-report-form">
    
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <ShadSelect
                                    label="Project *"
                                    placeholder="Select project..."
                                    value={form.projectId}
                                    options={projects.map(p => ({ id: p._id, name: p.projectName }))}
                                    onChange={v => { setForm(f => ({ ...f, projectId: v })); setErrors(er => ({ ...er, projectId: undefined })); }}
                                    error={errors.projectId}
                                />
                                <ShadCalendar
                                    label="Report Date"
                                    value={form.reportDate}
                                    onChange={v => setForm(f => ({ ...f, reportDate: v }))}
                                />
                            </div>
    
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
                                <div className="site-form-group">
                                    <label className="shad-form-label">Work Status</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {WORK_STATUS.map(s => (
                                            <button
                                                type="button"
                                                key={s}
                                                className={`site-status-chip ${form.workStatus === s ? 'active' : ''}`}
                                                onClick={() => setForm(f => ({ ...f, workStatus: s }))}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <ShadSelect
                                    label="Weather"
                                    value={form.weather}
                                    options={WEATHER}
                                    onChange={v => setForm(f => ({ ...f, weather: v }))}
                                />
                            </div>
    
                            <div className="site-form-group">
                                <label className="shad-form-label">Workers Present</label>
                                <input type="number" min={0} className="site-input" placeholder="Number of workers on site"
                                    value={form.workersPresent} onChange={e => setForm(f => ({ ...f, workersPresent: e.target.value }))} />
                            </div>
    
                            <div className="site-form-group">
                                <label className="shad-form-label">Work Done Today *</label>
                                <textarea className={`site-input ${errors.workDone ? 'site-input-err' : ''}`} rows={4}
                                    placeholder="Describe the work completed today…"
                                    value={form.workDone} onChange={e => { setForm(f => ({ ...f, workDone: e.target.value })); setErrors(er => ({ ...er, workDone: undefined })); }} />
                                {errors.workDone && <span className="site-field-err">{errors.workDone}</span>}
                            </div>
    
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div className="site-form-group">
                                    <label className="shad-form-label">Issues / Blockers</label>
                                    <textarea className="site-input" rows={3} placeholder="Any issues encountered…"
                                        value={form.issues} onChange={e => setForm(f => ({ ...f, issues: e.target.value }))} />
                                </div>
                                <div className="site-form-group">
                                    <label className="shad-form-label">Next Day Plan</label>
                                    <textarea className="site-input" rows={3} placeholder="Plan for tomorrow…"
                                        value={form.nextDayPlan} onChange={e => setForm(f => ({ ...f, nextDayPlan: e.target.value }))} />
                                </div>
                            </div>
    
                            <button type="submit" className="site-btn-primary"
                                style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: '10px', marginTop: '10px' }} disabled={submitting}>
                                {submitting ? <><Loader2 size={15} className="site-spin" />Submitting…</> : <><Send size={15} />Submit Report</>}
                            </button>
                        </form>
                    </div>
    
                    {/* History */}
                    <div className="site-card">
                        <div className="site-card-header">
                            <div className="site-card-title"><ClipboardList size={15}/>Report History</div>
                            <span className="site-count">{reports.length}</span>
                        </div>
                        {reports.length===0 ? (
                            <div className="site-empty" style={{padding:52}}>
                                <Target size={40}/><p>No reports yet</p><span>Submitted reports will appear here.</span>
                            </div>
                        ) : (
                            <div style={{padding:'8px 0'}}>
                                {reports.map(r=>{
                                    const sc = STATUS_COLORS[r.workStatus]||{color:'#374151',bg:'#f3f4f6'};
                                    return (
                                        <div key={r._id || r.id} className="site-report-card">
                                            <div className="site-report-card-top">
                                                <span className="site-report-date">{format(new Date(r.date || r.reportDate),'dd MMM yyyy')}</span>
                                                <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                                                    <span className="site-report-project">{r.project?.projectName || r.projectName}</span>
                                                    <span className="site-badge" style={{color:sc.color,background:sc.bg}}>{r.workStatus}</span>
                                                    <span style={{fontSize:11,color:'#94a3b8'}}>{r.weather}</span>
                                                    {r.workersPresent && <span style={{fontSize:11,color:'#64748b'}}>👷 {r.workersPresent}</span>}
                                                </div>
                                            </div>
                                            <p className="site-report-body">{r.workDone}</p>
                                            {r.issues && <p style={{fontSize:12,color:'#ef4444',margin:'2px 0 0'}}><strong>Issue:</strong> {r.issues}</p>}
                                            {r.nextDayPlan && <p style={{fontSize:12,color:'#6366f1',margin:'2px 0 0'}}><strong>Tomorrow:</strong> {r.nextDayPlan}</p>}
                                            <span className="site-report-meta">Submitted by {r.submittedBy?.fullName || r.submittedBy} on {format(new Date(r.createdAt),'dd MMM yyyy, HH:mm')}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'supervisor' && user?.role === 'Site Supervisor' && <SupervisorReports user={user} projects={projects} />}
            {activeTab === 'attendance' && <SiteAttendance user={user} />}
            {activeTab === 'safety' && <SiteSafety user={user} />}

        </div>
    );
};

export default SiteReports;
