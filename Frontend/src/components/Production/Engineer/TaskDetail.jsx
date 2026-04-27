import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Send, Plus, Loader2, X, Clock } from 'lucide-react';
import { engineerAPI } from '../../../config/api';
import './Engineer.css';

const STAGE_LABELS = { PM:'Project Manager', PE:'Project Engineer', SE:'Site Engineer', SS:'Site Supervisor' };
const PIPELINE = ['PM','PE','SE','SS'];
const STATUS_OPTIONS = ['Pending','In Progress','Completed'];

const getPriorityStyle = (p) => ({ Low:{color:'#64748b',bg:'#f1f5f9'}, Medium:{color:'#2563eb',bg:'#dbeafe'}, High:{color:'#d97706',bg:'#fef3c7'}, Urgent:{color:'#dc2626',bg:'#fee2e2'} }[p]||{color:'#64748b',bg:'#f1f5f9'});
const getStatusStyle   = (s) => ({ 'Pending':{label:'#92400e',bg:'#fef3c7',dot:'#f59e0b'}, 'In Progress':{label:'#1e40af',bg:'#dbeafe',dot:'#3b82f6'}, 'Completed':{label:'#065f46',bg:'#d1fae5',dot:'#10b981'}, 'Approved':{label:'#5b21b6',bg:'#ede9fe',dot:'#8b5cf6'} }[s]||{label:'#374151',bg:'#f3f4f6',dot:'#9ca3af'});

const TaskDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task,       setTask]       = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [comment,    setComment]    = useState('');
    const [saving,     setSaving]     = useState(false);
    const [statusSaving, setStatusSaving] = useState(false);
    const [toast,      setToast]      = useState(null);
    const [showNote,   setShowNote]   = useState(false);
    const [note,       setNote]       = useState('');

    useEffect(() => { load(); }, [id]);

    const load = async () => {
        try {
            const res = await engineerAPI.getTaskById(id);
            if (res.success) setTask(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

    const handleStatusChange = async (newStatus) => {
        setStatusSaving(true);
        try {
            const res = await engineerAPI.updateStatus(id, newStatus, note||undefined);
            if (res.success) {
                setTask(prev => ({ ...prev, status: newStatus }));
                setNote(''); setShowNote(false);
                showToast(`Status updated to "${newStatus}"`);
            }
        } catch(e) { showToast('Failed to update status','error'); }
        finally { setStatusSaving(false); }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setSaving(true);
        try {
            const res = await engineerAPI.addComment(id, comment);
            if (res.success) {
                setTask(prev => ({ ...prev, comments: res.data }));
                setComment('');
                showToast('Comment added');
            }
        } catch(e) { showToast('Failed to add comment','error'); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="eng-dashboard"><div className="eng-loading">Loading task…</div></div>;
    if (!task)   return <div className="eng-dashboard"><div className="eng-empty"><p>Task not found</p></div></div>;

    const pr = getPriorityStyle(task.priority);
    const st = getStatusStyle(task.status);
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !['Completed','Approved'].includes(task.status);
    const isMine = task.assignedTo?._id === user?._id || task.assignedTo === user?._id;
    const currentPipelineStage = task.stage;

    return (
        <div className="eng-tasks-page">
            {toast && <div className="eng-toast" style={{ background: toast.type==='success'?'#10b981':'#ef4444' }}>{toast.msg}</div>}

            {/* Back */}
            <button className="eng-back-btn" style={{ marginBottom:16 }} onClick={() => navigate(-1)}>
                <ArrowLeft size={16}/> Back
            </button>

            <div className="eng-detail-grid">
                {/* Main Column */}
                <div className="eng-detail-main">
                    {/* Header Card */}
                    <div className="eng-section-card" style={{ marginBottom:20 }}>
                        <div style={{ padding:'24px' }}>
                            <div style={{ display:'flex', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
                                <div style={{ flex:1 }}>
                                    {task.isSubtask && <div style={{ fontSize:12, color:'#94a3b8', marginBottom:6 }}>↳ Subtask {task.parentTask?.title ? `of "${task.parentTask.title}"` : ''}</div>}
                                    <h2 style={{ fontSize:20, fontWeight:700, color:'#0f172a', margin:'0 0 8px' }}>{task.title}</h2>
                                    {task.description && <p style={{ fontSize:14, color:'#64748b', margin:0, lineHeight:1.6 }}>{task.description}</p>}
                                </div>
                                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                    <span className="eng-badge" style={{ color:pr.color, background:pr.bg }}>{task.priority}</span>
                                    <span className="eng-badge" style={{ color:st.label, background:st.bg }}>{task.status}</span>
                                    {isOverdue && <span className="eng-badge" style={{ color:'#dc2626', background:'#fee2e2' }}>⚠ Overdue</span>}
                                </div>
                            </div>

                            {/* Pipeline */}
                            <div className="eng-pipeline">
                                {PIPELINE.map((s,i)=>(
                                    <React.Fragment key={s}>
                                        <div className={`eng-pipe-step${s===currentPipelineStage?' active':''}`}>
                                            <div className="eng-pipe-dot"/>
                                            <span>{STAGE_LABELS[s]}</span>
                                        </div>
                                        {i < PIPELINE.length-1 && <div className="eng-pipe-line"/>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Update Status (only assigned user) */}
                    {isMine && task.status !== 'Approved' && (
                        <div className="eng-section-card" style={{ marginBottom:20 }}>
                            <div className="eng-section-header">
                                <div className="eng-section-title"><CheckSquare size={16}/>Update Status</div>
                            </div>
                            <div style={{ padding:'16px 24px', display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                                {STATUS_OPTIONS.map(s => (
                                    <button key={s}
                                        className={`eng-status-btn${task.status===s?' active':''}`}
                                        onClick={() => { if(s !== task.status) handleStatusChange(s); }}
                                        disabled={statusSaving || task.status === s}>
                                        {statusSaving && task.status !== s ? <Loader2 size={12} className="eng-spin"/> : null}
                                        {s}
                                    </button>
                                ))}
                                <button className="eng-status-btn" onClick={()=>setShowNote(!showNote)} style={{ marginLeft:'auto' }}>
                                    {showNote?'Hide Note':'+ Add Note'}
                                </button>
                            </div>
                            {showNote && (
                                <div style={{ padding:'0 24px 16px' }}>
                                    <textarea className="eng-input" placeholder="Add a note with your status update…" rows={2}
                                        value={note} onChange={e=>setNote(e.target.value)}/>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Subtasks */}
                    {task.subtasks?.length > 0 && (
                        <div className="eng-section-card" style={{ marginBottom:20 }}>
                            <div className="eng-section-header">
                                <div className="eng-section-title"><Plus size={16}/>Subtasks</div>
                                <span className="eng-task-count">{task.subtasks.length}</span>
                            </div>
                            <div className="eng-task-list">
                                {task.subtasks.map(st => {
                                    const sst = getStatusStyle(st.status);
                                    return (
                                        <div key={st._id} className="eng-task-row eng-task-row-clickable"
                                            onClick={()=>navigate(`/engineer/tasks/${st._id}`)}>
                                            <div className="eng-task-dot" style={{ background:sst.dot }}/>
                                            <div className="eng-task-info">
                                                <span className="eng-task-title">{st.title}</span>
                                                <span className="eng-task-meta">{st.assignedTo?.fullName||'Unassigned'} · {st.assignedTo?.role}</span>
                                            </div>
                                            <span className="eng-badge" style={{color:sst.label,background:sst.bg}}>{st.status}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Comments */}
                    <div className="eng-section-card">
                        <div className="eng-section-header">
                            <div className="eng-section-title"><Send size={16}/>Comments</div>
                            <span className="eng-task-count">{task.comments?.length||0}</span>
                        </div>
                        <div className="eng-comments">
                            {!task.comments?.length ? (
                                <div style={{ padding:'20px 24px', color:'#94a3b8', fontSize:13 }}>No comments yet. Be the first.</div>
                            ) : task.comments.map((c,i) => (
                                <div key={i} className="eng-comment">
                                    <div className="eng-comment-avatar">{c.postedBy?.fullName?.charAt(0)||'?'}</div>
                                    <div className="eng-comment-body">
                                        <div className="eng-comment-header">
                                            <strong>{c.postedBy?.fullName}</strong>
                                            <span className="eng-comment-role">{c.postedBy?.role}</span>
                                            <span className="eng-comment-time">{new Date(c.createdAt).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                                        </div>
                                        <p className="eng-comment-text">{c.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleComment} className="eng-comment-form">
                            <input className="eng-input" placeholder="Add a comment…"
                                value={comment} onChange={e=>setComment(e.target.value)}/>
                            <button type="submit" className="eng-btn-primary" disabled={saving||!comment.trim()}>
                                {saving?<Loader2 size={14} className="eng-spin"/>:<Send size={14}/>}
                                Post
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="eng-detail-side">
                    <div className="eng-section-card">
                        <div className="eng-section-header">
                            <div className="eng-section-title">Details</div>
                        </div>
                        <div className="eng-info-rows">
                            {[
                                ['Project',     task.projectId?.projectName||'—'],
                                ['Assigned By', task.assignedBy?.fullName||'—'],
                                ['Assigned To', task.assignedTo?.fullName||'Unassigned'],
                                ['Stage',       STAGE_LABELS[task.stage]||task.stage],
                                ['Priority',    task.priority],
                                ['Status',      task.status],
                                ['Due Date',    task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'],
                                ['Created',     new Date(task.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})],
                            ].map(([k,v])=>(
                                <div key={k} className="eng-info-row">
                                    <span className="eng-info-label">{k}</span>
                                    <span className="eng-info-value">{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Activity / Updates */}
                    {task.updates?.length > 0 && (
                        <div className="eng-section-card" style={{ marginTop:16 }}>
                            <div className="eng-section-header">
                                <div className="eng-section-title"><Clock size={16}/>Update Log</div>
                            </div>
                            <div className="eng-activity-list" style={{ padding:'8px 0' }}>
                                {task.updates.slice(-5).reverse().map((u,i)=>(
                                    <div key={i} className="eng-activity-item">
                                        <div className="eng-activity-dot"/>
                                        <div className="eng-activity-body">
                                            {u.note && <span className="eng-activity-msg">{u.note}</span>}
                                            <span className="eng-activity-meta">
                                                {u.updatedBy?.fullName} · {new Date(u.timestamp).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;
