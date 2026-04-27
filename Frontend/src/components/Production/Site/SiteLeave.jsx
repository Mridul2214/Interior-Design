import React, { useState } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { CalendarOff, Send, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import DateRangePicker from '../Engineer/DateRangePicker';
import './Site.css';

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Emergency Leave', 'Annual Leave', 'Work From Home'];
const STATUS_STYLE = {
    Pending:  { color:'#92400e', bg:'#fef3c7', icon:<Clock size={13}/> },
    Approved: { color:'#065f46', bg:'#d1fae5', icon:<CheckCircle2 size={13}/> },
    Rejected: { color:'#991b1b', bg:'#fee2e2', icon:<XCircle size={13}/> },
};

const SiteLeave = ({ user }) => {
    const [form, setForm] = useState({ leaveType:'', dateRange:{ from:null, to:null }, reason:'' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted,  setSubmitted]  = useState(false);
    const [history,    setHistory]    = useState([]);
    const [errors,     setErrors]     = useState({});

    const validate = () => {
        const e = {};
        if (!form.leaveType)       e.leaveType = 'Select a leave type';
        if (!form.dateRange?.from) e.dateRange = 'Select a date range';
        if (!form.reason.trim())   e.reason    = 'Reason is required';
        return e;
    };

    const calcDays = () => {
        if (!form.dateRange?.from) return 0;
        if (!form.dateRange?.to)   return 1;
        return differenceInCalendarDays(form.dateRange.to, form.dateRange.from) + 1;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 900));
        setHistory(prev => [{
            id: Date.now(),
            leaveType: form.leaveType,
            fromDate:  form.dateRange.from,
            toDate:    form.dateRange.to || form.dateRange.from,
            days:      calcDays(),
            reason:    form.reason,
            status:    'Pending',
            appliedOn: new Date(),
        }, ...prev]);
        setForm({ leaveType:'', dateRange:{ from:null, to:null }, reason:'' });
        setErrors({});
        setSubmitting(false);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
    };

    const days = calcDays();

    return (
        <div className="site-page">
            {submitted && (
                <div className="site-toast" style={{background:'#10b981',display:'flex',alignItems:'center',gap:8}}>
                    <CheckCircle2 size={16}/> Leave request submitted!
                </div>
            )}

            <div style={{marginBottom:20}}>
                <h1 style={{fontSize:20,fontWeight:700,color:'#0f172a',margin:0,display:'flex',alignItems:'center',gap:10}}>
                    <CalendarOff size={20} style={{color:'#10b981'}}/>Leave Request
                </h1>
                <p style={{fontSize:13,color:'#64748b',margin:'5px 0 0'}}>Submit and track your leave applications</p>
            </div>

            <div className="site-leave-grid">
                {/* Form */}
                <div className="site-card">
                    <div className="site-card-header"><div className="site-card-title"><Send size={15}/>New Application</div></div>
                    <form onSubmit={handleSubmit} className="site-leave-form">
                        <div className="site-form-group">
                            <label>Leave Type *</label>
                            <div className="site-leave-type-grid">
                                {LEAVE_TYPES.map(t=>(
                                    <button type="button" key={t}
                                        className={`site-leave-type-btn${form.leaveType===t?' active':''}`}
                                        onClick={()=>{ setForm(f=>({...f,leaveType:t})); setErrors(er=>({...er,leaveType:undefined})); }}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                            {errors.leaveType && <span className="site-field-err">{errors.leaveType}</span>}
                        </div>

                        <div className="site-form-group">
                            <label>Date Range *</label>
                            <DateRangePicker
                                value={form.dateRange}
                                onChange={range=>{ setForm(f=>({...f,dateRange:range||{from:null,to:null}})); setErrors(er=>({...er,dateRange:undefined})); }}
                                placeholder="Select leave dates"
                                minDate={new Date()}
                            />
                            {errors.dateRange && <span className="site-field-err">{errors.dateRange}</span>}
                        </div>

                        {days>0 && (
                            <div className="site-leave-duration">
                                <Clock size={14}/>Duration: <strong>{days} day{days>1?'s':''}</strong>
                                {form.dateRange?.from && (
                                    <span style={{color:'#64748b',fontWeight:400,fontSize:12}}>
                                        &nbsp;({format(form.dateRange.from,'dd MMM')}{form.dateRange?.to&&form.dateRange.to!==form.dateRange.from?` – ${format(form.dateRange.to,'dd MMM yyyy')}`:` ${format(form.dateRange.from,'yyyy')}`})
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="site-form-group">
                            <label>Reason *</label>
                            <textarea className={`site-input${errors.reason?' site-input-err':''}`} rows={4}
                                placeholder="Reason for leave…" value={form.reason}
                                onChange={e=>{ setForm(f=>({...f,reason:e.target.value})); setErrors(er=>({...er,reason:undefined})); }}/>
                            {errors.reason && <span className="site-field-err">{errors.reason}</span>}
                        </div>

                        <button type="submit" className="site-btn-primary"
                            style={{width:'100%',justifyContent:'center',padding:12}} disabled={submitting}>
                            {submitting?<><Loader2 size={15} className="site-spin"/>Submitting…</>:<><Send size={15}/>Submit Leave Request</>}
                        </button>
                    </form>
                </div>

                {/* History */}
                <div className="site-card">
                    <div className="site-card-header">
                        <div className="site-card-title"><Clock size={15}/>My Applications</div>
                        <span className="site-count">{history.length}</span>
                    </div>
                    {history.length===0 ? (
                        <div className="site-empty" style={{padding:52}}>
                            <CalendarOff size={36}/><p>No applications yet</p><span>Submitted requests will appear here.</span>
                        </div>
                    ) : (
                        <div style={{padding:'8px 0'}}>
                            {history.map(h=>{
                                const st=STATUS_STYLE[h.status]||STATUS_STYLE.Pending;
                                return (
                                    <div key={h.id} className="site-leave-card">
                                        <div className="site-leave-card-top">
                                            <span className="site-leave-type-chip">{h.leaveType}</span>
                                            <span className="site-badge" style={{color:st.color,background:st.bg,display:'flex',alignItems:'center',gap:4}}>
                                                {st.icon}{h.status}
                                            </span>
                                        </div>
                                        <div className="site-leave-dates">
                                            <CalendarOff size={12}/>
                                            {format(h.fromDate,'dd MMM yyyy')}
                                            {h.toDate&&h.toDate!==h.fromDate&&<> → {format(h.toDate,'dd MMM yyyy')}</>}
                                            <span className="site-leave-days">· {h.days} day{h.days>1?'s':''}</span>
                                        </div>
                                        <p className="site-leave-reason">{h.reason}</p>
                                        <span className="site-leave-applied">Applied: {format(h.appliedOn,'dd MMM yyyy')}</span>
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

export default SiteLeave;
