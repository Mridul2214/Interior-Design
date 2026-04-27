import React, { useState, useEffect } from 'react';
import { ClipboardList, Send, CheckCircle2, Loader2, Target } from 'lucide-react';
import { engineerAPI } from '../../../config/api';
import { format } from 'date-fns';
import './Site.css';

const WORK_STATUS = ['On Track','Delayed','Blocked','Completed'];
const WEATHER     = ['Clear','Cloudy','Rainy','Windy'];

const SiteReports = ({ user }) => {
    const [projects, setProjects] = useState([]);
    const [reports,  setReports]  = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted,  setSubmitted]  = useState(false);
    const [errors,     setErrors]     = useState({});
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
        engineerAPI.getMyProjects().then(res => { if (res.success) setProjects(res.data); });
    }, []);

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
        await new Promise(r => setTimeout(r, 900));
        const projectName = projects.find(p => p._id === form.projectId)?.projectName || '—';
        setReports(prev => [{
            id: Date.now(),
            ...form,
            projectName,
            submittedBy: user?.fullName,
            createdAt: new Date(),
        }, ...prev]);
        setForm({ projectId:'', reportDate:format(new Date(),'yyyy-MM-dd'), workStatus:'On Track', weather:'Clear', workDone:'', issues:'', nextDayPlan:'', workersPresent:'' });
        setErrors({});
        setSubmitting(false);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
    };

    const STATUS_COLORS = { 'On Track':{color:'#065f46',bg:'#d1fae5'}, 'Delayed':{color:'#92400e',bg:'#fef3c7'}, 'Blocked':{color:'#991b1b',bg:'#fee2e2'}, 'Completed':{color:'#5b21b6',bg:'#ede9fe'} };

    return (
        <div className="site-page">
            {submitted && (
                <div className="site-toast" style={{background:'#10b981'}}>
                    <CheckCircle2 size={16}/> Site report submitted!
                </div>
            )}
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
                <div>
                    <h1 style={{fontSize:20,fontWeight:700,color:'#0f172a',margin:0,display:'flex',alignItems:'center',gap:10}}>
                        <ClipboardList size={20} style={{color:'#10b981'}}/>Site Reports
                    </h1>
                    <p style={{fontSize:13,color:'#64748b',margin:'5px 0 0'}}>Submit daily site progress updates</p>
                </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,alignItems:'start'}}>
                {/* Form */}
                <div className="site-card">
                    <div className="site-card-header">
                        <div className="site-card-title"><Send size={15}/>New Report</div>
                    </div>
                    <form onSubmit={handleSubmit} className="site-report-form">

                        <div className="site-form-row">
                            <div className="site-form-group">
                                <label>Project *</label>
                                <select className={`site-input${errors.projectId?' site-input-err':''}`}
                                    value={form.projectId} onChange={e=>{ setForm(f=>({...f,projectId:e.target.value})); setErrors(er=>({...er,projectId:undefined})); }}>
                                    <option value="">Select project…</option>
                                    {projects.map(p=><option key={p._id} value={p._id}>{p.projectName}</option>)}
                                </select>
                                {errors.projectId && <span className="site-field-err">{errors.projectId}</span>}
                            </div>
                            <div className="site-form-group">
                                <label>Report Date</label>
                                <input type="date" className="site-input" value={form.reportDate}
                                    onChange={e=>setForm(f=>({...f,reportDate:e.target.value}))}/>
                            </div>
                        </div>

                        <div className="site-form-row">
                            <div className="site-form-group">
                                <label>Work Status</label>
                                <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:4}}>
                                    {WORK_STATUS.map(s=>{
                                        const sc = STATUS_COLORS[s];
                                        const isActive = form.workStatus===s;
                                        return (
                                            <button type="button" key={s}
                                                style={{padding:'5px 12px',borderRadius:20,border:`1.5px solid ${isActive?sc.color:'#e2e8f0'}`,
                                                    background:isActive?sc.color:'white',color:isActive?sc.color==='#065f46'?'white':'#374151':'#64748b',
                                                    fontSize:12,fontWeight:isActive?700:500,cursor:'pointer'}}
                                                onClick={()=>setForm(f=>({...f,workStatus:s}))}>
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="site-form-group">
                                <label>Weather</label>
                                <select className="site-input" value={form.weather}
                                    onChange={e=>setForm(f=>({...f,weather:e.target.value}))}>
                                    {WEATHER.map(w=><option key={w}>{w}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="site-form-group">
                            <label>Workers Present</label>
                            <input type="number" min={0} className="site-input" placeholder="Number of workers on site"
                                value={form.workersPresent} onChange={e=>setForm(f=>({...f,workersPresent:e.target.value}))}/>
                        </div>

                        <div className="site-form-group">
                            <label>Work Done Today *</label>
                            <textarea className={`site-input${errors.workDone?' site-input-err':''}`} rows={4}
                                placeholder="Describe the work completed today…"
                                value={form.workDone} onChange={e=>{ setForm(f=>({...f,workDone:e.target.value})); setErrors(er=>({...er,workDone:undefined})); }}/>
                            {errors.workDone && <span className="site-field-err">{errors.workDone}</span>}
                        </div>

                        <div className="site-form-group">
                            <label>Issues / Blockers</label>
                            <textarea className="site-input" rows={3} placeholder="Any issues or blockers encountered…"
                                value={form.issues} onChange={e=>setForm(f=>({...f,issues:e.target.value}))}/>
                        </div>

                        <div className="site-form-group">
                            <label>Next Day Plan</label>
                            <textarea className="site-input" rows={3} placeholder="Plan for tomorrow…"
                                value={form.nextDayPlan} onChange={e=>setForm(f=>({...f,nextDayPlan:e.target.value}))}/>
                        </div>

                        <button type="submit" className="site-btn-primary"
                            style={{width:'100%',justifyContent:'center',padding:12}} disabled={submitting}>
                            {submitting?<><Loader2 size={15} className="site-spin"/>Submitting…</>:<><Send size={15}/>Submit Report</>}
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
                                    <div key={r.id} className="site-report-card">
                                        <div className="site-report-card-top">
                                            <span className="site-report-date">{format(new Date(r.reportDate),'dd MMM yyyy')}</span>
                                            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                                                <span className="site-report-project">{r.projectName}</span>
                                                <span className="site-badge" style={{color:sc.color,background:sc.bg}}>{r.workStatus}</span>
                                                <span style={{fontSize:11,color:'#94a3b8'}}>{r.weather}</span>
                                                {r.workersPresent && <span style={{fontSize:11,color:'#64748b'}}>👷 {r.workersPresent}</span>}
                                            </div>
                                        </div>
                                        <p className="site-report-body">{r.workDone}</p>
                                        {r.issues && <p style={{fontSize:12,color:'#ef4444',margin:'2px 0 0'}}><strong>Issue:</strong> {r.issues}</p>}
                                        {r.nextDayPlan && <p style={{fontSize:12,color:'#6366f1',margin:'2px 0 0'}}><strong>Tomorrow:</strong> {r.nextDayPlan}</p>}
                                        <span className="site-report-meta">Submitted {format(r.createdAt,'dd MMM yyyy, HH:mm')}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SiteReports;
