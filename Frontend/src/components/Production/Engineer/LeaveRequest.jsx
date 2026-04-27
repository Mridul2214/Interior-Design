import React, { useState } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { CalendarOff, Send, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import DateRangePicker from './DateRangePicker';
import './Engineer.css';

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Emergency Leave', 'Annual Leave', 'Work From Home'];

const STATUS_STYLE = {
    Pending:  { color: '#92400e', bg: '#fef3c7', icon: <Clock size={13}/> },
    Approved: { color: '#065f46', bg: '#d1fae5', icon: <CheckCircle2 size={13}/> },
    Rejected: { color: '#991b1b', bg: '#fee2e2', icon: <XCircle size={13}/> },
};

const LeaveRequest = ({ user }) => {
    const [form, setForm] = useState({
        leaveType: '',
        dateRange: { from: null, to: null },
        reason: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted,  setSubmitted]  = useState(false);
    const [history,    setHistory]    = useState([]);
    const [errors,     setErrors]     = useState({});

    const validate = () => {
        const e = {};
        if (!form.leaveType)         e.leaveType = 'Please select a leave type';
        if (!form.dateRange?.from)   e.dateRange = 'Please select a date range';
        if (!form.reason.trim())     e.reason    = 'Reason is required';
        return e;
    };

    const calcDays = () => {
        if (!form.dateRange?.from || !form.dateRange?.to) return form.dateRange?.from ? 1 : 0;
        return differenceInCalendarDays(form.dateRange.to, form.dateRange.from) + 1;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 1000));
        const days = calcDays();
        setHistory(prev => [{
            id: Date.now(),
            leaveType:  form.leaveType,
            fromDate:   form.dateRange.from,
            toDate:     form.dateRange.to || form.dateRange.from,
            days,
            reason:     form.reason,
            status:     'Pending',
            appliedOn:  new Date(),
        }, ...prev]);
        setForm({ leaveType:'', dateRange:{ from:null, to:null }, reason:'' });
        setErrors({});
        setSubmitted(true);
        setSubmitting(false);
        setTimeout(() => setSubmitted(false), 4000);
    };

    const days = calcDays();

    return (
        <div className="eng-tasks-page">
            {submitted && (
                <div className="eng-toast" style={{ background:'#10b981', display:'flex', alignItems:'center', gap:8 }}>
                    <CheckCircle2 size={16}/> Leave request submitted successfully!
                </div>
            )}

            <div className="eng-page-header">
                <div>
                    <h1 className="eng-page-title"><CalendarOff size={22}/>Leave Request</h1>
                    <p className="eng-page-sub">Submit and track your leave applications</p>
                </div>
            </div>

            <div className="eng-leave-grid">
                {/* ── Form ── */}
                <div className="eng-section-card">
                    <div className="eng-section-header">
                        <div className="eng-section-title"><Send size={16}/>New Application</div>
                    </div>
                    <form onSubmit={handleSubmit} className="eng-leave-form">

                        {/* Leave Type */}
                        <div className="eng-form-group">
                            <label>Leave Type *</label>
                            <div className="eng-leave-type-grid">
                                {LEAVE_TYPES.map(t => (
                                    <button type="button" key={t}
                                        className={`eng-leave-type-btn${form.leaveType === t ? ' active' : ''}`}
                                        onClick={() => { setForm(f=>({...f, leaveType:t})); setErrors(er=>({...er,leaveType:undefined})); }}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                            {errors.leaveType && <span className="eng-field-err">{errors.leaveType}</span>}
                        </div>

                        {/* Date Range Picker */}
                        <div className="eng-form-group">
                            <label>Date Range *</label>
                            <DateRangePicker
                                value={form.dateRange}
                                onChange={(range) => {
                                    setForm(f => ({ ...f, dateRange: range || { from:null, to:null } }));
                                    setErrors(er => ({ ...er, dateRange: undefined }));
                                }}
                                placeholder="Select leave dates"
                                minDate={new Date()}
                            />
                            {errors.dateRange && <span className="eng-field-err">{errors.dateRange}</span>}
                        </div>

                        {/* Duration pill */}
                        {days > 0 && (
                            <div className="eng-leave-duration">
                                <Clock size={14}/>
                                Duration: <strong>{days} day{days > 1 ? 's' : ''}</strong>
                                {form.dateRange?.from && (
                                    <span style={{ color:'#64748b', fontWeight:400, fontSize:12 }}>
                                        &nbsp;({format(form.dateRange.from,'dd MMM')}
                                        {form.dateRange?.to && form.dateRange.to !== form.dateRange.from
                                            ? ` – ${format(form.dateRange.to,'dd MMM yyyy')}`
                                            : ` ${format(form.dateRange.from,'yyyy')}`})
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Reason */}
                        <div className="eng-form-group">
                            <label>Reason *</label>
                            <textarea
                                className={`eng-input${errors.reason?' eng-input-err':''}`}
                                rows={4}
                                placeholder="Briefly describe the reason for your leave…"
                                value={form.reason}
                                onChange={e => { setForm(f=>({...f,reason:e.target.value})); setErrors(er=>({...er,reason:undefined})); }}
                            />
                            {errors.reason && <span className="eng-field-err">{errors.reason}</span>}
                        </div>

                        <button type="submit" className="eng-btn-primary"
                            style={{ width:'100%', justifyContent:'center', padding:'12px' }}
                            disabled={submitting}>
                            {submitting
                                ? <><Loader2 size={15} className="eng-spin"/>Submitting…</>
                                : <><Send size={15}/>Submit Leave Request</>}
                        </button>
                    </form>
                </div>

                {/* ── History ── */}
                <div className="eng-section-card">
                    <div className="eng-section-header">
                        <div className="eng-section-title"><Clock size={16}/>My Applications</div>
                        <span className="eng-task-count">{history.length}</span>
                    </div>

                    {history.length === 0 ? (
                        <div className="eng-empty" style={{ padding:'52px 24px' }}>
                            <CalendarOff size={36}/>
                            <p>No applications yet</p>
                            <span>Your submitted leave requests will appear here.</span>
                        </div>
                    ) : (
                        <div style={{ padding:'8px 0' }}>
                            {history.map(h => {
                                const st = STATUS_STYLE[h.status] || STATUS_STYLE.Pending;
                                return (
                                    <div key={h.id} className="eng-leave-card">
                                        <div className="eng-leave-card-top">
                                            <span className="eng-leave-type-chip">{h.leaveType}</span>
                                            <span className="eng-badge" style={{ color:st.color, background:st.bg, display:'flex', alignItems:'center', gap:4 }}>
                                                {st.icon}{h.status}
                                            </span>
                                        </div>
                                        <div className="eng-leave-card-dates">
                                            <CalendarOff size={12}/>
                                            {format(h.fromDate,'dd MMM yyyy')}
                                            {h.toDate && h.toDate !== h.fromDate && (
                                                <> → {format(h.toDate,'dd MMM yyyy')}</>
                                            )}
                                            <span className="eng-leave-days">· {h.days} day{h.days>1?'s':''}</span>
                                        </div>
                                        <p className="eng-leave-reason">{h.reason}</p>
                                        <span className="eng-leave-applied">
                                            Applied: {format(h.appliedOn,'dd MMM yyyy')}
                                        </span>
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

export default LeaveRequest;
