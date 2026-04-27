import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckSquare, Clock, CheckCircle2, AlertCircle,
    Flame, CalendarClock, TriangleAlert, ChevronRight,
    Wrench, Target
} from 'lucide-react';
import { engineerAPI } from '../../../config/api';
import './Site.css';

const getPriorityStyle = (p) => ({ Low:{color:'#64748b',bg:'#f1f5f9'}, Medium:{color:'#2563eb',bg:'#dbeafe'}, High:{color:'#d97706',bg:'#fef3c7'}, Urgent:{color:'#dc2626',bg:'#fee2e2'} }[p]||{color:'#64748b',bg:'#f1f5f9'});
const getStatusStyle   = (s) => ({ 'Pending':{dot:'#f59e0b',label:'#92400e',bg:'#fef3c7'}, 'In Progress':{dot:'#3b82f6',label:'#1e40af',bg:'#dbeafe'}, 'Completed':{dot:'#10b981',label:'#065f46',bg:'#d1fae5'}, 'Approved':{dot:'#8b5cf6',label:'#5b21b6',bg:'#ede9fe'} }[s]||{dot:'#94a3b8',label:'#374151',bg:'#f3f4f6'});

const SiteDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const res = await engineerAPI.getDashboard();
            if (res.success) setData(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const stats = data?.stats || { total:0, pending:0, inProgress:0, completed:0, approved:0 };
    const doneRate = stats.total > 0 ? Math.round(((stats.completed + stats.approved) / stats.total) * 100) : 0;
    const isSS = user?.role === 'Site Supervisor';

    const cards = [
        { label:'Total',      value:stats.total,      gradient:'linear-gradient(135deg,#818cf8,#6366f1)', shadow:'rgba(99,102,241,0.25)' },
        { label:'Pending',    value:stats.pending,    gradient:'linear-gradient(135deg,#fbbf24,#f59e0b)', shadow:'rgba(245,158,11,0.25)' },
        { label:'In Progress',value:stats.inProgress, gradient:'linear-gradient(135deg,#34d399,#10b981)', shadow:'rgba(16,185,129,0.25)' },
        { label:'Completed',  value:stats.completed,  gradient:'linear-gradient(135deg,#a78bfa,#8b5cf6)', shadow:'rgba(139,92,246,0.25)' },
    ];

    const TaskRow = ({ task }) => {
        const st = getStatusStyle(task.status);
        const pr = getPriorityStyle(task.priority);
        const overdue = task.dueDate && new Date(task.dueDate) < new Date() && !['Completed','Approved'].includes(task.status);
        return (
            <div className="site-task-row" onClick={()=>navigate(`/site/tasks/${task._id}`)}>
                <div className="site-task-dot" style={{background:st.dot}}/>
                <div style={{flex:1,minWidth:0}}>
                    <div className="site-task-title">{task.title}</div>
                    <div className="site-task-meta">
                        {task.projectId?.projectName||'General'}
                        {task.dueDate && <span style={{color:overdue?'#ef4444':'#94a3b8',marginLeft:6}}>
                            · Due {new Date(task.dueDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
                        </span>}
                    </div>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                    <span className="site-badge" style={{color:pr.color,background:pr.bg}}>{task.priority}</span>
                    <span className="site-badge" style={{color:st.label,background:st.bg}}>{task.status}</span>
                </div>
                <ChevronRight size={14} style={{color:'#94a3b8',flexShrink:0}}/>
            </div>
        );
    };

    const Section = ({icon,title,color,tasks,empty}) => (
        <div className="site-card">
            <div className="site-card-header">
                <div className="site-card-title" style={{color}}>{icon}{title}</div>
                <span className="site-count">{tasks?.length||0}</span>
            </div>
            {!tasks?.length ? (
                <div className="site-empty" style={{padding:'24px'}}><Target size={28}/><p style={{fontSize:13}}>{empty}</p></div>
            ) : (
                <div>
                    {tasks.slice(0,4).map(t=><TaskRow key={t._id} task={t}/>)}
                    {tasks.length>4 && (
                        <div style={{padding:'12px 24px',fontSize:13,color:'#10b981',fontWeight:600,cursor:'pointer',borderTop:'1px solid #f1f5f9'}}
                            onClick={()=>navigate('/site/tasks')}>
                            See all {tasks.length} →
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    if (loading) return <div className="site-page"><div className="site-loading">Loading dashboard…</div></div>;

    return (
        <div className="site-page">
            {/* Banner */}
            <div className={`site-banner ${isSS?'ss':'se'}`}>
                <div>
                    <div className="site-banner-badge"><Wrench size={13}/>{user?.role}</div>
                    <h1>
                        Good {new Date().getHours()<12?'Morning':new Date().getHours()<17?'Afternoon':'Evening'},{' '}
                        {user?.fullName?.split(' ')[0]} 👷
                    </h1>
                    <p>
                        <strong>{stats.inProgress}</strong> task{stats.inProgress!==1?'s':''} in progress
                        {data?.overdue?.length>0 && <span style={{color:'#fca5a5'}}> · <strong>{data.overdue.length}</strong> overdue</span>}
                    </p>
                </div>
                <div className="site-ring-wrapper">
                    <svg width="90" height="90" viewBox="0 0 90 90">
                        <circle cx="45" cy="45" r="37" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8"/>
                        <circle cx="45" cy="45" r="37" fill="none" stroke="white" strokeWidth="8"
                            strokeDasharray={`${2*Math.PI*37}`}
                            strokeDashoffset={`${2*Math.PI*37*(1-doneRate/100)}`}
                            strokeLinecap="round" transform="rotate(-90 45 45)"
                            style={{transition:'stroke-dashoffset 1s ease'}}/>
                    </svg>
                    <div className="site-ring-label">
                        <span className="site-ring-pct">{doneRate}%</span>
                        <span className="site-ring-sub">Done</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="site-stats-grid">
                {cards.map(c=>(
                    <div key={c.label} className="site-stat-card" style={{'--site-shadow':c.shadow}}>
                        <div className="site-stat-icon" style={{background:c.gradient}}>
                            <CheckSquare size={20}/>
                        </div>
                        <div>
                            <div className="site-stat-value">{c.value}</div>
                            <div className="site-stat-label">{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sections */}
            <div className="site-dash-grid">
                <Section icon={<Flame size={15}/>}         title="Overdue"      color="#ef4444" tasks={data?.overdue}      empty="No overdue tasks!" />
                <Section icon={<CalendarClock size={15}/>}  title="Due Today"    color="#f59e0b" tasks={data?.dueToday}     empty="Nothing due today." />
                <Section icon={<TriangleAlert size={15}/>}  title="High Priority" color="#d97706" tasks={data?.highPriority} empty="No urgent tasks." />
            </div>

            {/* Recent */}
            <div className="site-card" style={{marginTop:24}}>
                <div className="site-card-header">
                    <div className="site-card-title"><CheckSquare size={16}/>Recent Tasks</div>
                    <button style={{fontSize:13,color:'#10b981',fontWeight:600,background:'none',border:'none',cursor:'pointer'}}
                        onClick={()=>navigate('/site/tasks')}>View All</button>
                </div>
                {!data?.recentTasks?.length ? (
                    <div className="site-empty"><Target size={36}/><p>No tasks assigned yet</p><span>Your Project Engineer will assign tasks shortly.</span></div>
                ) : data.recentTasks.map(t=><TaskRow key={t._id} task={t}/>)}
            </div>
        </div>
    );
};

export default SiteDashboard;
