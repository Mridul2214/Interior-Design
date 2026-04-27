import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Target, Calendar, ChevronRight } from 'lucide-react';
import { engineerAPI } from '../../../config/api';
import './Engineer.css';

const STAGE_LABELS = { PM:'Project Manager', PE:'Project Engineer', SE:'Site Engineer', SS:'Site Supervisor' };
const STATUS_OPTIONS  = ['All','Pending','In Progress','Completed','Approved'];
const PRIORITY_OPTIONS = ['All','Low','Medium','High','Urgent'];
const STAGE_OPTIONS   = ['All','PM','PE','SE','SS'];

const getPriorityStyle = (p) => ({ Low:{color:'#64748b',bg:'#f1f5f9'}, Medium:{color:'#2563eb',bg:'#dbeafe'}, High:{color:'#d97706',bg:'#fef3c7'}, Urgent:{color:'#dc2626',bg:'#fee2e2'} }[p]||{color:'#64748b',bg:'#f1f5f9'});
const getStatusStyle   = (s) => ({ 'Pending':{label:'#92400e',bg:'#fef3c7'}, 'In Progress':{label:'#1e40af',bg:'#dbeafe'}, 'Completed':{label:'#065f46',bg:'#d1fae5'}, 'Approved':{label:'#5b21b6',bg:'#ede9fe'} }[s]||{label:'#374151',bg:'#f3f4f6'});

const EngineerTasks = ({ user }) => {
    const navigate = useNavigate();
    const [tasks,    setTasks]    = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [projects, setProjects] = useState([]);
    const [filters,  setFilters]  = useState({ status:'All', priority:'All', stage:'All', projectId:'All' });
    const [toast,    setToast]    = useState(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const [tRes, pRes] = await Promise.all([
                engineerAPI.getMyTasks(),
                engineerAPI.getMyProjects()
            ]);
            if (tRes.success) setTasks(tRes.data);
            if (pRes.success) setProjects(pRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

    const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

    const filtered = tasks.filter(t => {
        if (filters.status    !== 'All' && t.status   !== filters.status)           return false;
        if (filters.priority  !== 'All' && t.priority !== filters.priority)         return false;
        if (filters.stage     !== 'All' && t.stage    !== filters.stage)            return false;
        if (filters.projectId !== 'All' && t.projectId?._id !== filters.projectId)  return false;
        return true;
    });

    const FilterBar = ({ label, key, options }) => (
        <div className="eng-filter-group">
            <span className="eng-filter-label">{label}</span>
            <div className="eng-filter-bar">
                {options.map(o => (
                    <button key={o} className={`eng-filter-btn${filters[key]===o?' active':''}`} onClick={()=>setFilter(key,o)}>
                        {o === 'All' ? 'All' : (key === 'stage' ? STAGE_LABELS[o]||o : o)}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="eng-tasks-page">
            {toast && <div className="eng-toast" style={{ background: toast.type==='success'?'#10b981':'#ef4444' }}>{toast.msg}</div>}

            {/* Header */}
            <div className="eng-page-header">
                <div>
                    <h1 className="eng-page-title"><CheckSquare size={22}/>My Tasks</h1>
                    <p className="eng-page-sub">{filtered.length} of {tasks.length} task{tasks.length!==1?'s':''}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="eng-filters-panel">
                <FilterBar label="Status"   key="status"   options={STATUS_OPTIONS}  />
                <FilterBar label="Priority" key="priority" options={PRIORITY_OPTIONS} />
                <FilterBar label="Stage"    key="stage"    options={STAGE_OPTIONS}   />
                {projects.length > 0 && (
                    <div className="eng-filter-group">
                        <span className="eng-filter-label">Project</span>
                        <div className="eng-filter-bar">
                            <button className={`eng-filter-btn${filters.projectId==='All'?' active':''}`} onClick={()=>setFilter('projectId','All')}>All</button>
                            {projects.map(p=>(
                                <button key={p._id} className={`eng-filter-btn${filters.projectId===p._id?' active':''}`} onClick={()=>setFilter('projectId',p._id)}>
                                    {p.projectName}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Task Cards */}
            {loading ? (
                <div className="eng-loading">Loading tasks…</div>
            ) : filtered.length === 0 ? (
                <div className="eng-section-card">
                    <div className="eng-empty" style={{ padding:56 }}>
                        <Target size={40}/>
                        <p>No tasks found</p>
                        <span>Try adjusting your filters.</span>
                    </div>
                </div>
            ) : (
                <div className="eng-task-cards">
                    {filtered.map(task => {
                        const pr = getPriorityStyle(task.priority);
                        const st = getStatusStyle(task.status);
                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !['Completed','Approved'].includes(task.status);
                        return (
                            <div key={task._id} className="eng-task-card" onClick={()=>navigate(`/engineer/tasks/${task._id}`)}>
                                <div className="eng-task-card-top">
                                    <span className="eng-badge" style={{color:pr.color,background:pr.bg}}>{task.priority}</span>
                                    <span className="eng-badge" style={{color:st.label,background:st.bg}}>{task.status}</span>
                                    {isOverdue && <span className="eng-badge" style={{color:'#dc2626',background:'#fee2e2'}}>Overdue</span>}
                                    {task.isSubtask && <span className="eng-badge" style={{color:'#7c3aed',background:'#ede9fe'}}>Subtask</span>}
                                </div>
                                <h3 className="eng-task-card-title">{task.title}</h3>
                                {task.description && <p className="eng-task-card-desc">{task.description}</p>}
                                <div className="eng-task-card-meta">
                                    <span><strong>{task.projectId?.projectName||'—'}</strong></span>
                                    <span className="eng-stage-chip" style={{ fontSize:11 }}>{STAGE_LABELS[task.stage]||task.stage}</span>
                                </div>
                                <div className="eng-task-card-footer">
                                    <span style={{ fontSize:12, color:'#94a3b8' }}>By: {task.assignedBy?.fullName||'—'}</span>
                                    {task.dueDate && (
                                        <span style={{ fontSize:12, color: isOverdue?'#ef4444':'#94a3b8', display:'flex', alignItems:'center', gap:4 }}>
                                            <Calendar size={11}/>
                                            {new Date(task.dueDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
                                        </span>
                                    )}
                                    <ChevronRight size={14} style={{ color:'#94a3b8', marginLeft:'auto' }}/>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EngineerTasks;
