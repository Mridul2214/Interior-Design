import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FolderOpen, ArrowLeft, Calendar, Users, CheckSquare,
    Activity, ClipboardList, Info, Plus, X, Loader2
} from 'lucide-react';
import { engineerAPI } from '../../../config/api';
import './Engineer.css';

const STAGE_LABELS = { PM:'Project Manager', PE:'Project Engineer', SE:'Site Engineer', SS:'Site Supervisor' };
const PIPELINE = ['PM','PE','SE','SS'];

const getPriorityStyle = (p) => ({ Low:{color:'#64748b',bg:'#f1f5f9'}, Medium:{color:'#2563eb',bg:'#dbeafe'}, High:{color:'#d97706',bg:'#fef3c7'}, Urgent:{color:'#dc2626',bg:'#fee2e2'} }[p]||{color:'#64748b',bg:'#f1f5f9'});
const getStatusStyle   = (s) => ({ 'Pending':{label:'#92400e',bg:'#fef3c7',dot:'#f59e0b'}, 'In Progress':{label:'#1e40af',bg:'#dbeafe',dot:'#3b82f6'}, 'Completed':{label:'#065f46',bg:'#d1fae5',dot:'#10b981'}, 'Approved':{label:'#5b21b6',bg:'#ede9fe',dot:'#8b5cf6'} }[s]||{label:'#374151',bg:'#f3f4f6',dot:'#9ca3af'});

const ProjectDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project,  setProject]  = useState(null);
    const [tasks,    setTasks]    = useState([]);
    const [activity, setActivity] = useState([]);
    const [siteTeam, setSiteTeam] = useState([]);
    const [tab,      setTab]      = useState('overview');
    const [loading,  setLoading]  = useState(true);
    const [showSubtaskModal, setShowSubtaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [subtask, setSubtask] = useState({ title:'', description:'', assignedTo:'', priority:'Medium', dueDate:'' });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => { load(); }, [id]);

    const load = async () => {
        try {
            const [pRes, tRes, aRes, sRes] = await Promise.all([
                engineerAPI.getProjectById(id),
                engineerAPI.getProjectTasks(id),
                engineerAPI.getActivity(id),
                engineerAPI.getSiteTeam()
            ]);
            if (pRes.success) setProject(pRes.data);
            if (tRes.success) setTasks(tRes.data);
            if (aRes.success) setActivity(aRes.data);
            if (sRes.success) setSiteTeam(sRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

    const handleCreateSubtask = async (e) => {
        e.preventDefault();
        if (!subtask.title || !subtask.assignedTo) return showToast('Title and assignee are required','error');
        setSaving(true);
        try {
            const res = await engineerAPI.createSubtask({ ...subtask, parentTaskId: selectedTask._id, projectId: id });
            if (res.success) {
                showToast('Subtask created!');
                setShowSubtaskModal(false);
                setSubtask({ title:'', description:'', assignedTo:'', priority:'Medium', dueDate:'' });
                const tRes = await engineerAPI.getProjectTasks(id);
                if (tRes.success) setTasks(tRes.data);
            }
        } catch (e) { showToast('Failed to create subtask','error'); }
        finally { setSaving(false); }
    };

    const myTasks  = tasks.filter(t => t.assignedTo?._id === user?._id || t.assignedTo === user?._id);
    const allTasks = tasks;

    if (loading) return <div className="eng-dashboard"><div className="eng-loading">Loading project…</div></div>;
    if (!project) return <div className="eng-dashboard"><div className="eng-empty"><p>Project not found</p></div></div>;

    return (
        <div className="eng-tasks-page">
            {toast && <div className="eng-toast" style={{ background: toast.type==='success'?'#10b981':'#ef4444' }}>{toast.msg}</div>}

            {/* Back + Title */}
            <div className="eng-page-header">
                <div>
                    <button className="eng-back-btn" onClick={() => navigate('/engineer/projects')}>
                        <ArrowLeft size={16}/> Back to Projects
                    </button>
                    <h1 className="eng-page-title" style={{ marginTop:10 }}>
                        <FolderOpen size={22}/>{project.projectName}
                    </h1>
                    <p className="eng-page-sub">
                        PM: {project.projectManager?.fullName} &nbsp;·&nbsp;
                        Status: <strong>{project.status}</strong>
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="eng-tabs">
                {[['overview','Overview',<Info size={15}/>],['tasks','Tasks',<ClipboardList size={15}/>],['activity','Activity',<Activity size={15}/>]].map(([key,label,icon])=>(
                    <button key={key} className={`eng-tab${tab===key?' active':''}`} onClick={()=>setTab(key)}>
                        {icon}{label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {tab === 'overview' && (
                <div className="eng-tab-content">
                    <div className="eng-overview-grid">
                        {/* Project info */}
                        <div className="eng-section-card">
                            <div className="eng-section-header">
                                <div className="eng-section-title"><Info size={16}/>Project Info</div>
                            </div>
                            <div className="eng-info-rows">
                                {[
                                    ['Client',    project.clientId?.name || '—'],
                                    ['Start Date', project.startDate ? new Date(project.startDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'],
                                    ['End Date',   project.endDate   ? new Date(project.endDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'],
                                    ['Status',     project.status],
                                ].map(([k,v])=>(
                                    <div key={k} className="eng-info-row">
                                        <span className="eng-info-label">{k}</span>
                                        <span className="eng-info-value">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="eng-section-card">
                            <div className="eng-section-header">
                                <div className="eng-section-title"><CheckSquare size={16}/>Progress</div>
                            </div>
                            <div style={{ padding:'20px 24px' }}>
                                <div className="eng-progress-label" style={{ marginBottom:8 }}>
                                    <span>Overall completion</span><span>{project.progress||0}%</span>
                                </div>
                                <div className="eng-progress-track" style={{ height:10 }}>
                                    <div className="eng-progress-fill" style={{ width:`${project.progress||0}%` }}/>
                                </div>
                                <div className="eng-overview-stats">
                                    {[['Total', allTasks.length,'#6366f1'], ['My Tasks', myTasks.length,'#3b82f6'],
                                      ['Done',  allTasks.filter(t=>['Completed','Approved'].includes(t.status)).length,'#10b981']
                                    ].map(([l,v,c])=>(
                                        <div key={l} className="eng-ov-stat">
                                            <span style={{ color:c, fontSize:28, fontWeight:800 }}>{v}</span>
                                            <span>{l}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Team */}
                        <div className="eng-section-card">
                            <div className="eng-section-header">
                                <div className="eng-section-title"><Users size={16}/>Team</div>
                            </div>
                            <div className="eng-info-rows">
                                {[
                                    ['Project Manager',  project.projectManager?.fullName],
                                    ['Project Engineer', project.projectEngineer?.fullName],
                                    ['Site Engineer',    project.siteEngineer?.fullName],
                                    ['Site Supervisor',  project.siteSupervisor?.fullName],
                                ].filter(([,v])=>v).map(([k,v])=>(
                                    <div key={k} className="eng-info-row">
                                        <span className="eng-info-label">{k}</span>
                                        <span className="eng-info-value">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tasks Tab */}
            {tab === 'tasks' && (
                <div className="eng-tab-content">
                    <div className="eng-table-card">
                        {tasks.length === 0 ? (
                            <div className="eng-empty" style={{ padding:48 }}>
                                <ClipboardList size={36}/><p>No tasks in this project</p>
                            </div>
                        ) : (
                            <table className="eng-table">
                                <thead>
                                    <tr>
                                        <th>Task</th>
                                        <th>Stage</th>
                                        <th>Assigned To</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        {user?.role === 'Project Engineer' && <th>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.map(t => {
                                        const pr = getPriorityStyle(t.priority);
                                        const st = getStatusStyle(t.status);
                                        const isMine = t.assignedTo?._id === user?._id;
                                        return (
                                            <tr key={t._id} style={{ cursor:'pointer' }} onClick={()=>navigate(`/engineer/tasks/${t._id}`)}>
                                                <td>
                                                    <div className="eng-td-title">{t.title}</div>
                                                    {t.isSubtask && <div className="eng-td-sub">↳ Subtask</div>}
                                                </td>
                                                <td><span className="eng-stage-chip">{STAGE_LABELS[t.stage]||t.stage}</span></td>
                                                <td style={{ fontSize:13, color: isMine?'#3b82f6':'#475569', fontWeight: isMine?700:400 }}>
                                                    {t.assignedTo?.fullName||'Unassigned'}{isMine?' (You)':''}
                                                </td>
                                                <td><span className="eng-badge" style={{color:pr.color,background:pr.bg}}>{t.priority}</span></td>
                                                <td><span className="eng-badge" style={{color:st.label,background:st.bg}}>{t.status}</span></td>
                                                {user?.role === 'Project Engineer' && (
                                                    <td onClick={e=>e.stopPropagation()}>
                                                        {!t.isSubtask && (
                                                            <button className="eng-subtask-btn" onClick={()=>{ setSelectedTask(t); setShowSubtaskModal(true); }}>
                                                                <Plus size={13}/> Subtask
                                                            </button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Activity Tab */}
            {tab === 'activity' && (
                <div className="eng-tab-content">
                    <div className="eng-section-card">
                        {activity.length === 0 ? (
                            <div className="eng-empty" style={{ padding:48 }}>
                                <Activity size={36}/><p>No activity yet</p>
                            </div>
                        ) : (
                            <div className="eng-activity-list">
                                {activity.map((log,i)=>(
                                    <div key={log._id||i} className="eng-activity-item">
                                        <div className="eng-activity-dot"/>
                                        <div className="eng-activity-body">
                                            <span className="eng-activity-msg">{log.message}</span>
                                            <span className="eng-activity-meta">
                                                {log.userId?.fullName} · {new Date(log.timestamp||log.createdAt).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Subtask Modal */}
            {showSubtaskModal && (
                <div className="eng-modal-overlay">
                    <div className="eng-modal">
                        <div className="eng-modal-header">
                            <h3>Create Subtask</h3>
                            <button className="eng-modal-close" onClick={()=>setShowSubtaskModal(false)}><X size={18}/></button>
                        </div>
                        <p className="eng-modal-sub">Under: <strong>{selectedTask?.title}</strong></p>
                        <form onSubmit={handleCreateSubtask} className="eng-modal-form">
                            <div className="eng-form-group">
                                <label>Title *</label>
                                <input className="eng-input" value={subtask.title} onChange={e=>setSubtask({...subtask,title:e.target.value})} required/>
                            </div>
                            <div className="eng-form-group">
                                <label>Description</label>
                                <textarea className="eng-input" rows={3} value={subtask.description} onChange={e=>setSubtask({...subtask,description:e.target.value})}/>
                            </div>
                            <div className="eng-form-row">
                                <div className="eng-form-group">
                                    <label>Assign To *</label>
                                    <select className="eng-input" value={subtask.assignedTo} onChange={e=>setSubtask({...subtask,assignedTo:e.target.value})} required>
                                        <option value="">Select engineer…</option>
                                        {siteTeam.map(m=><option key={m._id} value={m._id}>{m.fullName} ({m.role})</option>)}
                                    </select>
                                </div>
                                <div className="eng-form-group">
                                    <label>Priority</label>
                                    <select className="eng-input" value={subtask.priority} onChange={e=>setSubtask({...subtask,priority:e.target.value})}>
                                        {['Low','Medium','High','Urgent'].map(p=><option key={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="eng-form-group">
                                <label>Due Date</label>
                                <input type="date" className="eng-input" value={subtask.dueDate} onChange={e=>setSubtask({...subtask,dueDate:e.target.value})}/>
                            </div>
                            <div className="eng-modal-footer">
                                <button type="button" className="eng-btn-ghost" onClick={()=>setShowSubtaskModal(false)}>Cancel</button>
                                <button type="submit" className="eng-btn-primary" disabled={saving}>
                                    {saving?<><Loader2 size={14} className="eng-spin"/> Saving…</>:'Create Subtask'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetail;
