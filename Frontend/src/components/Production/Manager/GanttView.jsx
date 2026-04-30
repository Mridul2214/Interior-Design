import React, { useState, useMemo } from 'react';
import { Calendar, ChevronRight, User, Filter } from 'lucide-react';
import { format, differenceInDays, addDays, startOfDay } from 'date-fns';
import '../css/PMAnalytics.css';

const STATUS_COLORS = {
    'Pending': { bg: 'linear-gradient(90deg, #94a3b8, #cbd5e1)', cls: 'pending' },
    'In Progress': { bg: 'linear-gradient(90deg, #3b82f6, #60a5fa)', cls: 'in-progress' },
    'Completed': { bg: 'linear-gradient(90deg, #10b981, #34d399)', cls: 'completed' },
    'Approved': { bg: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', cls: 'approved' },
};

const STAGE_LABELS = { PM: 'Manager', PE: 'Engineer', SE: 'Site Eng.', SS: 'Supervisor' };

const GanttView = ({ ganttData = [], projects = [] }) => {
    const [filterStage, setFilterStage] = useState('all');
    const [filterProject, setFilterProject] = useState('all');

    const filteredData = useMemo(() => {
        let data = [...ganttData];
        if (filterStage !== 'all') data = data.filter(t => t.stage === filterStage);
        if (filterProject !== 'all') data = data.filter(t => t.projectId?.toString() === filterProject);
        return data;
    }, [ganttData, filterStage, filterProject]);

    // Calculate timeline boundaries
    const { timelineStart, timelineEnd, totalDays } = useMemo(() => {
        if (filteredData.length === 0) return { timelineStart: new Date(), timelineEnd: addDays(new Date(), 30), totalDays: 30 };
        const starts = filteredData.map(t => new Date(t.start));
        const ends = filteredData.map(t => new Date(t.end));
        const earliest = new Date(Math.min(...starts));
        const latest = new Date(Math.max(...ends));
        const start = startOfDay(addDays(earliest, -2));
        const end = startOfDay(addDays(latest, 5));
        return { timelineStart: start, timelineEnd: end, totalDays: Math.max(differenceInDays(end, start), 7) };
    }, [filteredData]);

    // Generate date markers
    const dateMarkers = useMemo(() => {
        const markers = [];
        const interval = totalDays > 60 ? 14 : totalDays > 30 ? 7 : totalDays > 14 ? 3 : 1;
        for (let i = 0; i <= totalDays; i += interval) {
            markers.push({
                date: addDays(timelineStart, i),
                left: `${(i / totalDays) * 100}%`
            });
        }
        return markers;
    }, [timelineStart, totalDays]);

    const getBarStyle = (task) => {
        const start = differenceInDays(new Date(task.start), timelineStart);
        const duration = Math.max(differenceInDays(new Date(task.end), new Date(task.start)), 1);
        return {
            left: `${(start / totalDays) * 100}%`,
            width: `${Math.max((duration / totalDays) * 100, 3)}%`
        };
    };

    // Unique projects from data
    const uniqueProjects = useMemo(() => {
        const map = {};
        ganttData.forEach(t => { if (t.projectId) map[t.projectId] = t.project; });
        return Object.entries(map);
    }, [ganttData]);

    return (
        <div className="pm-gantt-container">
            <div className="pm-gantt-header">
                <div>
                    <h3 className="pm-chart-title"><Calendar size={16} style={{ color: '#3b82f6' }} />Gantt Timeline</h3>
                    <p className="pm-chart-subtitle">{filteredData.length} tasks across the timeline</p>
                </div>
                <div className="pm-gantt-toolbar">
                    <Filter size={14} style={{ color: '#94a3b8' }} />
                    {['all', 'PM', 'PE', 'SE', 'SS'].map(s => (
                        <button key={s} className={`pm-gantt-filter-btn ${filterStage === s ? 'active' : ''}`}
                            onClick={() => setFilterStage(s)}>
                            {s === 'all' ? 'All' : STAGE_LABELS[s]}
                        </button>
                    ))}
                    {uniqueProjects.length > 1 && (
                        <select
                            value={filterProject}
                            onChange={e => setFilterProject(e.target.value)}
                            style={{
                                padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0',
                                fontSize: '0.8rem', fontWeight: 500, color: '#64748b', background: 'white',
                                fontFamily: 'Inter, sans-serif', cursor: 'pointer'
                            }}>
                            <option value="all">All Projects</option>
                            {uniqueProjects.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                        </select>
                    )}
                </div>
            </div>

            {filteredData.length === 0 ? (
                <div className="pm-empty-analytics">
                    <Calendar size={40} />
                    <p>No tasks to display</p>
                    <span>Create tasks with start dates and due dates to see them here</span>
                </div>
            ) : (
                <div className="pm-gantt-table">
                    {/* Date markers header */}
                    <div className="pm-gantt-row pm-gantt-row-header">
                        <div className="pm-gantt-row-label">Task</div>
                        <div className="pm-gantt-timeline">
                            <div className="pm-gantt-dates">
                                {dateMarkers.map((m, i) => (
                                    <div key={i} className="pm-gantt-date-label" style={{ position: 'absolute', left: m.left }}>
                                        {format(m.date, 'dd MMM')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Task rows */}
                    {filteredData.map((task, i) => {
                        const barStyle = getBarStyle(task);
                        const statusCfg = STATUS_COLORS[task.status] || STATUS_COLORS['Pending'];
                        return (
                            <div key={task.id || i} className="pm-gantt-row">
                                <div className="pm-gantt-row-label">
                                    <div style={{
                                        width: 6, height: 6, borderRadius: 2,
                                        background: statusCfg.bg.includes('gradient') ? '#94a3b8' :
                                            task.status === 'In Progress' ? '#3b82f6' : task.status === 'Completed' ? '#10b981' : '#94a3b8'
                                    }} />
                                    <div>
                                        <div className="pm-gantt-task-name">{task.title}</div>
                                        <div className="pm-gantt-task-meta">
                                            {task.project} · {task.assignee} · {STAGE_LABELS[task.stage] || task.stage}
                                        </div>
                                    </div>
                                </div>
                                <div className="pm-gantt-timeline" style={{ position: 'relative', minHeight: 40 }}>
                                    <div className={`pm-gantt-bar ${statusCfg.cls}`} style={barStyle}>
                                        {task.progress > 0 && <div className="pm-gantt-bar-progress" style={{ width: `${task.progress}%` }} />}
                                        <span style={{ position: 'relative', zIndex: 1 }}>{task.progress}%</span>
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

export default GanttView;
