import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Send, Clock, Loader2, ChevronRight, Target } from 'lucide-react';
import { engineerAPI } from '../../../config/api';
import './Site.css';

const STAGE_LABELS = { PM:'Project Manager', PE:'Project Engineer', SE:'Site Engineer', SS:'Site Supervisor' };
const PIPELINE = ['PM','PE','SE','SS'];
const STATUS_OPTIONS = ['Pending','In Progress','Completed'];
const STATUS_FILTERS = ['All','Pending','In Progress','Completed','Approved'];
const PRIORITY_FILTERS = ['All','Low','Medium','High','Urgent'];

const getPriorityStyle = (p) => ({ Low:{color:'#64748b',bg:'#f1f5f9'}, Medium:{color:'#2563eb',bg:'#dbeafe'}, High:{color:'#d97706',bg:'#fef3c7'}, Urgent:{color:'#dc2626',bg:'#fee2e2'} }[p]||{color:'#64748b',bg:'#f1f5f9'});
const getStatusStyle   = (s) => ({ 'Pending':{label:'#92400e',bg:'#fef3c7',dot:'#f59e0b'}, 'In Progress':{label:'#1e40af',bg:'#dbeafe',dot:'#3b82f6'}, 'Completed':{label:'#065f46',bg:'#d1fae5',dot:'#10b981'}, 'Approved':{label:'#5b21b6',bg:'#ede9fe',dot:'#8b5cf6'} }[s]||{label:'#374151',bg:'#f3f4f6',dot:'#9ca3af'});

/* ── Task Detail Panel ── */
const SiteTaskDetail = ({ task, user, onBack, onUpdate }) => {
    const [comment, setComment] = useState('');
    const [note, setNote]       = useState('');
    const [showNote, setShowNote] = useState(false);
    const [saving, setSaving]   = useState(false);
    const [statusSaving, setStatusSaving] = useState(false);
    const [toast, setToast]     = useState(null);
    const [localTask, setLocalTask] = useState(task);

    const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

    const handleStatus = async (status) => {
        setStatusSaving(true);
        try {
            const res = await engineerAPI.updateStatus(localTask._id, status, note||undefined);
            if (res.success) { setLocalTask(p=>({...p,status})); setNote(''); setShowNote(false); showToast(`Status → "${status}"`); onUpdate(); }
        } catch { showToast('Failed','error'); }
        finally { setStatusSaving(false); }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setSaving(true);
        try {
            const res = await engineerAPI.addComment(localTask._id, comment);
            if (res.success) { setLocalTask(p=>({...p,comments:res.data})); setComment(''); showToast('Comment added'); }
        } catch { showToast('Failed','error'); }
        finally { setSaving(false); }
    };

    const pr = getPriorityStyle(localTask.priority);
    const st = getStatusStyle(localTask.status);
    const isMine = localTask.assignedTo?._id === user?._id || localTask.assignedTo === user?._id;
    const isOverdue = localTask.dueDate && new Date(localTask.dueDate) < new Date() && !['Completed','Approved'].includes(localTask.status);

    return (
        <div>
            {toast && <div className="site-toast" style={{background:toast.type==='success'?'#10b981':'#ef4444'}}>{toast.msg}</div>}
            <button className="site-back-btn" onClick={onBack}><ArrowLeft size={15}/>Back to Tasks</button>
            <div className="site-detail-grid">
                <div>
                    <div className="site-card" style={{marginBottom:20}}>
                        <div style={{padding:24}}>
                            <div style={{display:'flex',gap:16,flexWrap:'wrap',alignItems:'flex-start'}}>
                                <div style={{flex:1}}>
                                    {localTask.isSubtask && <div style={{fontSize:12,color:'#94a3b8',marginBottom:6}}>↳ Subtask</div>}
                                    <h2 style={{fontSize:20,fontWeight:700,color:'#0f172a',margin:'0 0 8px'}}>{localTask.title}</h2>
                                    {localTask.description && <p style={{fontSize:14,color:'#64748b',margin:0,lineHeight:1.6}}>{localTask.description}</p>}
                                </div>
                                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                                    <span className="site-badge" style={{color:pr.color,background:pr.bg}}>{localTask.priority}</span>
                                    <span className="site-badge" style={{color:st.label,background:st.bg}}>{localTask.status}</span>
                                    {isOverdue && <span className="site-badge" style={{color:'#dc2626',background:'#fee2e2'}}>⚠ Overdue</span>}
                                </div>
                            </div>
                            <div className="site-pipeline">
                                {PIPELINE.map((s,i)=>(
                                    <React.Fragment key={s}>
                                        <div className={`site-pipe-step${s===localTask.stage?' active':''}`}>
                                            <div className="site-pipe-dot"/><span>{STAGE_LABELS[s]}</span>
                                        </div>
                                        {i<PIPELINE.length-1 && <div className="site-pipe-line"/>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                    {isMine && localTask.status !== 'Approved' && (
                        <div className="site-card" style={{marginBottom:20}}>
                            <div className="site-card-header"><div className="site-card-title"><CheckSquare size={15}/>Update Status</div></div>
                            <div className="site-status-row">
                                {STATUS_OPTIONS.map(s=>(
                                    <button key={s} className={`site-status-btn${localTask.status===s?' active':''}`}
                                        onClick={()=>{ if(s!==localTask.status) handleStatus(s); }} disabled={statusSaving||localTask.status===s}>{s}</button>
                                ))}
                                <button className="site-status-btn" onClick={()=>setShowNote(!showNote)} style={{marginLeft:'auto'}}>{showNote?'Hide Note':'+ Note'}</button>
                            </div>
                            {showNote && <div style={{padding:'0 24px 14px'}}><textarea className="site-input" rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder="Note…"/></div>}
                        </div>
                    )}

                    <div className="site-card">
                        <div className="site-card-header">
                            <div className="site-card-title"><Send size={15}/>Comments</div>
                            <span className="site-count">{localTask.comments?.length||0}</span>
                        </div>
                        <div className="site-comments">
                            {!localTask.comments?.length ? (
                                <div style={{padding:'18px 24px',fontSize:13,color:'#94a3b8'}}>No comments yet.</div>
                            ) : localTask.comments.map((c,i)=>(
                                <div key={i} className="site-comment">
                                    <div className="site-comment-avatar">{c.postedBy?.fullName?.charAt(0)||'?'}</div>
                                    <div className="site-comment-body">
                                        <div>
                                            <span className="site-comment-name">{c.postedBy?.fullName}</span>
                                            <span className="site-comment-role">{c.postedBy?.role}</span>
                                            <span className="site-comment-time">{new Date(c.createdAt).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                                        </div>
                                        <p className="site-comment-text">{c.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleComment} className="site-comment-form">
                            <input className="site-input" placeholder="Add a comment…" value={comment} onChange={e=>setComment(e.target.value)}/>
                            <button type="submit" className="site-btn-primary" disabled={saving||!comment.trim()}>
                                {saving?<Loader2 size={14} className="site-spin"/>:<Send size={14}/>} Post
                            </button>
                        </form>
                    </div>
                </div>

                <div>
                    <div className="site-card">
                        <div className="site-card-header"><div className="site-card-title">Details</div></div>
                        <div className="site-info-rows">
                            {[['Project',localTask.projectId?.projectName||'—'],['Assigned By',localTask.assignedBy?.fullName||'—'],['Stage',STAGE_LABELS[localTask.stage]||localTask.stage],['Priority',localTask.priority],['Status',localTask.status],['Due',localTask.dueDate?new Date(localTask.dueDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—']].map(([k,v])=>(
                                <div key={k} className="site-info-row"><span className="site-info-label">{k}</span><span className="site-info-value">{v}</span></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Tasks List ── */
const SiteTasks = ({ user }) => {
    const [tasks,    setTasks]    = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [filters,  setFilters]  = useState({ status:'All', priority:'All' });
    const [selected, setSelected] = useState(null);

    useEffect(()=>{ load(); },[]);

    const load = async () => {
        try { const res = await engineerAPI.getMyTasks(); if(res.success) setTasks(res.data); }
        catch(e){ console.error(e); } finally { setLoading(false); }
    };

    const openTask = async (task) => {
        try { const res = await engineerAPI.getTaskById(task._id); if(res.success) setSelected(res.data); }
        catch { setSelected(task); }
    };

    const setFilter = (k,v) => setFilters(p=>({...p,[k]:v}));

    const filtered = tasks.filter(t=>{
        if(filters.status!=='All' && t.status!==filters.status) return false;
        if(filters.priority!=='All' && t.priority!==filters.priority) return false;
        return true;
    });

    if(selected) return (
        <div className="site-page">
            <SiteTaskDetail task={selected} user={user} onBack={()=>setSelected(null)} onUpdate={()=>{ setSelected(null); load(); }}/>
        </div>
    );

    return (
        <div className="site-page">
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
                <div>
                    <h1 style={{fontSize:20,fontWeight:700,color:'#0f172a',margin:0,display:'flex',alignItems:'center',gap:10}}>
                        <CheckSquare size={20} style={{color:'#10b981'}}/>My Tasks
                    </h1>
                    <p style={{fontSize:13,color:'#64748b',margin:'5px 0 0'}}>{filtered.length} of {tasks.length} tasks</p>
                </div>
            </div>
            <div className="site-filters">
                <div className="site-filter-row">
                    <span className="site-filter-label">Status</span>
                    {STATUS_FILTERS.map(o=><button key={o} className={`site-filter-btn${filters.status===o?' active':''}`} onClick={()=>setFilter('status',o)}>{o}</button>)}
                </div>
                <div className="site-filter-row">
                    <span className="site-filter-label">Priority</span>
                    {PRIORITY_FILTERS.map(o=><button key={o} className={`site-filter-btn${filters.priority===o?' active':''}`} onClick={()=>setFilter('priority',o)}>{o}</button>)}
                </div>
            </div>
            {loading ? <div className="site-loading">Loading…</div> :
             filtered.length===0 ? (
                <div className="site-card"><div className="site-empty" style={{padding:52}}><Target size={40}/><p>No tasks found</p></div></div>
             ) : (
                <div className="site-task-cards">
                    {filtered.map(task=>{
                        const pr=getPriorityStyle(task.priority), st=getStatusStyle(task.status);
                        const overdue=task.dueDate&&new Date(task.dueDate)<new Date()&&!['Completed','Approved'].includes(task.status);
                        return (
                            <div key={task._id} className="site-task-card" onClick={()=>openTask(task)}>
                                <div className="site-task-card-top">
                                    <span className="site-badge" style={{color:pr.color,background:pr.bg}}>{task.priority}</span>
                                    <span className="site-badge" style={{color:st.label,background:st.bg}}>{task.status}</span>
                                    {overdue&&<span className="site-badge" style={{color:'#dc2626',background:'#fee2e2'}}>Overdue</span>}
                                </div>
                                <h3 className="site-task-card-title">{task.title}</h3>
                                {task.description&&<p className="site-task-card-desc">{task.description}</p>}
                                <div className="site-task-card-meta">
                                    <span>{task.projectId?.projectName||'—'}</span>
                                    <span style={{fontSize:11,color:'#94a3b8'}}>{STAGE_LABELS[task.stage]||task.stage}</span>
                                </div>
                                <div className="site-task-card-footer">
                                    <span style={{fontSize:12,color:'#94a3b8'}}>By: {task.assignedBy?.fullName||'—'}</span>
                                    {task.dueDate&&<span style={{fontSize:12,color:overdue?'#ef4444':'#94a3b8',marginLeft:'auto'}}>{new Date(task.dueDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</span>}
                                    <ChevronRight size={13} style={{color:'#94a3b8'}}/>
                                </div>
                            </div>
                        );
                    })}
                </div>
             )}
        </div>
    );
};

export default SiteTasks;
