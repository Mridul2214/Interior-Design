import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Target, Calendar, Users, CheckSquare, ChevronRight } from 'lucide-react';
import { engineerAPI } from '../../../config/api';
import './Engineer.css';

const getStatusStyle = (s) => ({
    'Planning':   { color:'#92400e', bg:'#fef3c7', dot:'#f59e0b' },
    'Active':     { color:'#065f46', bg:'#d1fae5', dot:'#10b981' },
    'On Hold':    { color:'#374151', bg:'#f3f4f6', dot:'#9ca3af' },
    'Completed':  { color:'#5b21b6', bg:'#ede9fe', dot:'#8b5cf6' },
}[s] || { color:'#374151', bg:'#f3f4f6', dot:'#9ca3af' });

const EngineerProjects = ({ user }) => {
    const navigate  = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading,  setLoading]  = useState(true);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const res = await engineerAPI.getMyProjects();
            if (res.success) setProjects(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const myRole = (p) => {
        const uid = user?._id;
        if (p.projectEngineer?._id === uid || p.projectEngineer === uid) return 'Project Engineer';
        if (p.siteEngineer?._id    === uid || p.siteEngineer    === uid) return 'Site Engineer';
        return 'Site Supervisor';
    };

    return (
        <div className="eng-tasks-page">
            <div className="eng-page-header">
                <div>
                    <h1 className="eng-page-title"><FolderOpen size={22}/>My Projects</h1>
                    <p className="eng-page-sub">{projects.length} project{projects.length !== 1 ? 's' : ''} assigned to you</p>
                </div>
            </div>

            {loading ? (
                <div className="eng-loading">Loading projects…</div>
            ) : projects.length === 0 ? (
                <div className="eng-section-card">
                    <div className="eng-empty" style={{ padding:'64px 24px' }}>
                        <Target size={40}/>
                        <p>No projects assigned yet</p>
                        <span>Your Project Manager will assign you to a project shortly.</span>
                    </div>
                </div>
            ) : (
                <div className="eng-projects-grid">
                    {projects.map(p => {
                        const st = getStatusStyle(p.status);
                        return (
                            <div key={p._id} className="eng-project-card eng-project-card-clickable"
                                onClick={() => navigate(`/engineer/projects/${p._id}`)}>
                                <div className="eng-project-card-header">
                                    <div className="eng-project-icon"><FolderOpen size={20}/></div>
                                    <span className="eng-badge" style={{ color:st.color, background:st.bg, marginLeft:'auto', display:'flex', alignItems:'center', gap:5 }}>
                                        <span style={{ width:6, height:6, borderRadius:'50%', background:st.dot, display:'inline-block' }}/>
                                        {p.status || 'Active'}
                                    </span>
                                </div>
                                <div className="eng-project-body">
                                    <h3 className="eng-project-name">{p.projectName}</h3>
                                    {p.description && <p className="eng-project-desc">{p.description}</p>}
                                </div>
                                <div className="eng-project-progress">
                                    <div className="eng-progress-label">
                                        <span>Progress</span><span>{p.progress || 0}%</span>
                                    </div>
                                    <div className="eng-progress-track">
                                        <div className="eng-progress-fill" style={{ width:`${p.progress||0}%` }}/>
                                    </div>
                                </div>
                                <div className="eng-project-meta">
                                    {p.clientId?.name && (
                                        <span className="eng-project-meta-item"><Users size={12}/>{p.clientId.name}</span>
                                    )}
                                    {p.endDate && (
                                        <span className="eng-project-meta-item">
                                            <Calendar size={12}/>
                                            {new Date(p.endDate).toLocaleDateString('en-IN',{ day:'2-digit', month:'short', year:'numeric' })}
                                        </span>
                                    )}
                                    <span className="eng-project-meta-item"><CheckSquare size={12}/>{p.taskCount ?? 0} tasks</span>
                                </div>
                                <div className="eng-project-footer">
                                    <div className="eng-project-role">
                                        <span>Your role:</span>
                                        <strong>{myRole(p)}</strong>
                                    </div>
                                    <div className="eng-project-open">
                                        View Details <ChevronRight size={13}/>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EngineerProjects;
