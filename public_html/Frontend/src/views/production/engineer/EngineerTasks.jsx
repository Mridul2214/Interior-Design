import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Target, Calendar, ChevronRight, Filter, ChevronDown, X } from 'lucide-react';
import { engineerAPI } from '../../../models/api';
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
    const [filtersOpen, setFiltersOpen] = useState(false);
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

    const activeFilterCount = [
        filters.status !== 'All',
        filters.priority !== 'All',
        filters.stage !== 'All',
        filters.projectId !== 'All'
    ].filter(Boolean).length;

    const ChipRow = ({ label, filterKey, options }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '60px' }}>{label}</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {options.map(o => (
                    <button key={o} onClick={() => setFilter(filterKey, o)} style={{
                        padding: '4px 14px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600,
                        cursor: 'pointer', border: '1px solid', transition: 'all 0.15s ease',
                        background: filters[filterKey] === o ? '#0f172a' : 'white',
                        color: filters[filterKey] === o ? 'white' : '#475569',
                        borderColor: filters[filterKey] === o ? '#0f172a' : '#e2e8f0'
                    }}>
                        {o === 'All' ? `All ${label}` : (filterKey === 'stage' ? STAGE_LABELS[o]||o : o)}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="eng-tasks-page">
            {toast && <div className="eng-toast" style={{ background: toast.type==='success'?'#10b981':'#ef4444' }}>{toast.msg}</div>}

            {/* Header */}
            <div className="eng-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="eng-page-title"><CheckSquare size={22}/>My Tasks</h1>
                    <p className="eng-page-sub">{filtered.length} of {tasks.length} task{tasks.length!==1?'s':''}</p>
                </div>

                {/* Filter Toggle Button */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {/* Active filter chips */}
                    {filters.status !== 'All' && (
                        <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'4px 10px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'99px', fontSize:'0.8rem', color:'#1d4ed8', fontWeight:600 }}>
                            {filters.status}
                            <button onClick={() => setFilter('status','All')} style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', color:'#3b82f6' }}><X size={12}/></button>
                        </div>
                    )}
                    {filters.priority !== 'All' && (
                        <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'4px 10px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'99px', fontSize:'0.8rem', color:'#1d4ed8', fontWeight:600 }}>
                            {filters.priority}
                            <button onClick={() => setFilter('priority','All')} style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', color:'#3b82f6' }}><X size={12}/></button>
                        </div>
                    )}
                    <button
                        onClick={() => setFiltersOpen(o => !o)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '0.5rem 1.1rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                            background: filtersOpen ? '#0f172a' : 'white',
                            color: filtersOpen ? 'white' : '#334155',
                            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Filter size={15} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span style={{ background: '#3b82f6', color: 'white', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px', marginLeft: '2px' }}>
                                {activeFilterCount}
                            </span>
                        )}
                        <ChevronDown size={14} style={{ transition: 'transform 0.2s ease', transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </button>
                    {activeFilterCount > 0 && (
                        <button onClick={() => setFilters({ status:'All', priority:'All', stage:'All', projectId:'All' })}
                            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fff5f5', color: '#ef4444', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Collapsible Filter Panel */}
            <div style={{
                overflow: 'hidden',
                maxHeight: filtersOpen ? '300px' : '0',
                transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                marginBottom: filtersOpen ? '20px' : '0'
            }}>
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                    <ChipRow label="Status"   filterKey="status"   options={STATUS_OPTIONS}  />
                    <ChipRow label="Priority" filterKey="priority" options={PRIORITY_OPTIONS} />
                    <ChipRow label="Stage"    filterKey="stage"    options={STAGE_OPTIONS}   />
                    {projects.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '60px' }}>Project</span>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button onClick={() => setFilter('projectId','All')} style={{
                                    padding: '4px 14px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s ease',
                                    background: filters.projectId === 'All' ? '#0f172a' : 'white',
                                    color: filters.projectId === 'All' ? 'white' : '#475569',
                                    borderColor: filters.projectId === 'All' ? '#0f172a' : '#e2e8f0'
                                }}>All Projects</button>
                                {projects.map(p => (
                                    <button key={p._id} onClick={() => setFilter('projectId', p._id)} style={{
                                        padding: '4px 14px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s ease',
                                        background: filters.projectId === p._id ? '#0f172a' : 'white',
                                        color: filters.projectId === p._id ? 'white' : '#475569',
                                        borderColor: filters.projectId === p._id ? '#0f172a' : '#e2e8f0'
                                    }}>{p.projectName}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
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
