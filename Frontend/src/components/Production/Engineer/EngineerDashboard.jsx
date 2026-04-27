import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckSquare, Clock, CheckCircle2, AlertCircle, Zap,
    Flame, CalendarClock, TriangleAlert, ChevronRight, Target
} from 'lucide-react';
import { engineerAPI } from '../../../config/api';
import './Engineer.css';

const STAGE_LABELS = { PM: 'Project Manager', PE: 'Project Engineer', SE: 'Site Engineer', SS: 'Site Supervisor' };

const getPriorityStyle = (p) => ({ Low: { color:'#64748b',bg:'#f1f5f9' }, Medium:{ color:'#2563eb',bg:'#dbeafe' }, High:{ color:'#d97706',bg:'#fef3c7' }, Urgent:{ color:'#dc2626',bg:'#fee2e2' } }[p] || { color:'#64748b',bg:'#f1f5f9' });
const getStatusStyle  = (s) => ({ 'Pending':{ dot:'#f59e0b',label:'#92400e',bg:'#fef3c7' }, 'In Progress':{ dot:'#3b82f6',label:'#1e40af',bg:'#dbeafe' }, 'Completed':{ dot:'#10b981',label:'#065f46',bg:'#d1fae5' }, 'Approved':{ dot:'#8b5cf6',label:'#5b21b6',bg:'#ede9fe' } }[s] || { dot:'#94a3b8',label:'#374151',bg:'#f3f4f6' });

const EngineerDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [data, setData]     = useState(null);
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

    const cards = [
        { label:'Total Tasks',  value: stats.total,      icon:<CheckSquare size={20}/>,  gradient:'linear-gradient(135deg,#818cf8,#6366f1)', shadow:'rgba(99,102,241,0.25)' },
        { label:'Pending',      value: stats.pending,    icon:<Clock size={20}/>,         gradient:'linear-gradient(135deg,#fbbf24,#f59e0b)', shadow:'rgba(245,158,11,0.25)' },
        { label:'In Progress',  value: stats.inProgress, icon:<AlertCircle size={20}/>,   gradient:'linear-gradient(135deg,#60a5fa,#3b82f6)', shadow:'rgba(59,130,246,0.25)' },
        { label:'Completed',    value: stats.completed,  icon:<CheckCircle2 size={20}/>,  gradient:'linear-gradient(135deg,#34d399,#10b981)', shadow:'rgba(16,185,129,0.25)' },
    ];

    const TaskRow = ({ task, onClick }) => {
        const st = getStatusStyle(task.status);
        const pr = getPriorityStyle(task.priority);
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !['Completed','Approved'].includes(task.status);
        return (
            <div className="eng-task-row eng-task-row-clickable" onClick={onClick}>
                <div className="eng-task-dot" style={{ background: st.dot }} />
                <div className="eng-task-info">
                    <span className="eng-task-title">{task.title}</span>
                    <span className="eng-task-meta">
                        {task.projectId?.projectName || 'General'}
                        {task.dueDate && (
                            <span style={{ color: isOverdue ? '#ef4444' : '#94a3b8', marginLeft: 6 }}>
                                · Due {new Date(task.dueDate).toLocaleDateString('en-IN',{ day:'2-digit', month:'short' })}
                            </span>
                        )}
                    </span>
                </div>
                <div className="eng-task-badges">
                    <span className="eng-badge" style={{ color: pr.color, background: pr.bg }}>{task.priority}</span>
                    <span className="eng-badge" style={{ color: st.label, background: st.bg }}>{task.status}</span>
                </div>
                <ChevronRight size={14} style={{ color:'#94a3b8', flexShrink:0 }} />
            </div>
        );
    };

    const Section = ({ icon, title, accentColor, tasks, empty }) => (
        <div className="eng-section-card">
            <div className="eng-section-header">
                <div className="eng-section-title" style={{ color: accentColor }}>
                    {icon} {title}
                </div>
                <span className="eng-task-count">{tasks?.length ?? 0}</span>
            </div>
            {!tasks?.length ? (
                <div className="eng-empty" style={{ padding:'28px 24px' }}>
                    <Target size={28} />
                    <p style={{ fontSize:14 }}>{empty}</p>
                </div>
            ) : (
                <div className="eng-task-list">
                    {tasks.slice(0, 5).map(t => (
                        <TaskRow key={t._id} task={t} onClick={() => navigate(`/engineer/tasks/${t._id}`)} />
                    ))}
                    {tasks.length > 5 && (
                        <div className="eng-see-all" onClick={() => navigate('/engineer/tasks')}>
                            See all {tasks.length} tasks <ChevronRight size={14} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    if (loading) return <div className="eng-dashboard"><div className="eng-loading">Loading dashboard…</div></div>;

    return (
        <div className="eng-dashboard">
            {/* Welcome Banner */}
            <div className="eng-welcome-banner">
                <div className="eng-welcome-left">
                    <div className="eng-welcome-badge"><Zap size={14} />{user?.role}</div>
                    <h1 className="eng-welcome-title">
                        Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
                        <span className="eng-name-highlight">{user?.fullName?.split(' ')[0]}</span> 👋
                    </h1>
                    <p className="eng-welcome-sub">
                        You have <strong>{stats.inProgress}</strong> task{stats.inProgress !== 1 ? 's' : ''} in progress
                        {data?.overdue?.length > 0 && <span style={{ color:'#fca5a5' }}> · <strong>{data.overdue.length}</strong> overdue</span>}
                    </p>
                </div>
                <div className="eng-welcome-right">
                    <div className="eng-progress-ring-wrapper">
                        <svg width="96" height="96" viewBox="0 0 96 96">
                            <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8"/>
                            <circle cx="48" cy="48" r="40" fill="none" stroke="white" strokeWidth="8"
                                strokeDasharray={`${2*Math.PI*40}`}
                                strokeDashoffset={`${2*Math.PI*40*(1-doneRate/100)}`}
                                strokeLinecap="round" transform="rotate(-90 48 48)"
                                style={{ transition:'stroke-dashoffset 1s ease' }}/>
                        </svg>
                        <div className="eng-ring-label">
                            <span className="eng-ring-pct">{doneRate}%</span>
                            <span className="eng-ring-sub">Done</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="eng-stats-grid">
                {cards.map(c => (
                    <div key={c.label} className="eng-stat-card" style={{ '--shadow-color': c.shadow }}>
                        <div className="eng-stat-icon" style={{ background: c.gradient }}>{c.icon}</div>
                        <div className="eng-stat-body">
                            <span className="eng-stat-value">{c.value}</span>
                            <span className="eng-stat-label">{c.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Three info sections */}
            <div className="eng-dash-grid">
                <Section icon={<Flame size={16}/>} title="Overdue Tasks"     accentColor="#ef4444" tasks={data?.overdue}      empty="No overdue tasks — great work!" />
                <Section icon={<CalendarClock size={16}/>} title="Due Today"  accentColor="#f59e0b" tasks={data?.dueToday}    empty="Nothing due today." />
                <Section icon={<TriangleAlert size={16}/>} title="High Priority" accentColor="#d97706" tasks={data?.highPriority} empty="No high priority tasks." />
            </div>

            {/* Recent Activity */}
            <div className="eng-section-card" style={{ marginTop:24 }}>
                <div className="eng-section-header">
                    <div className="eng-section-title"><CheckSquare size={18}/>Recent Tasks</div>
                    <button className="eng-see-all-btn" onClick={() => navigate('/engineer/tasks')}>View All</button>
                </div>
                {!data?.recentTasks?.length ? (
                    <div className="eng-empty"><Target size={36}/><p>No tasks assigned yet</p><span>Your Project Manager will assign tasks shortly.</span></div>
                ) : (
                    <div className="eng-task-list">
                        {data.recentTasks.map(t => (
                            <TaskRow key={t._id} task={t} onClick={() => navigate(`/engineer/tasks/${t._id}`)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EngineerDashboard;
