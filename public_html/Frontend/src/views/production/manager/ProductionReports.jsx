import React, { useState, useEffect } from 'react';
import { Download, FileText, CheckCircle2, AlertCircle, Clock, PieChart, BarChart2, Briefcase, Activity } from 'lucide-react';
import { productionAPI } from '../../../models/api';
import '../css/ProductionManagement.css';
// import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const ProductionReports = () => {
    const [reportsData, setReportsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await productionAPI.getProductionReports();
            if (res.success) {
                setReportsData(res.data);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (!reportsData || !reportsData.projectBreakdown) return;
        
        const headers = ['Project Name', 'Status', 'Total Tasks', 'Completed Tasks', 'Completion Rate (%)'];
        const csvRows = [headers.join(',')];

        reportsData.projectBreakdown.forEach(proj => {
            csvRows.push([
                `"${proj.projectName}"`,
                `"${proj.status}"`,
                proj.totalTasks,
                proj.completedTasks,
                proj.completionRate
            ].join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `production_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (loading) return <div className="pm-dashboard"><div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading Reports...</div></div>;
    if (error) return <div className="pm-dashboard"><div style={{ padding: 40, color: 'red' }}>Error: {error}</div></div>;

    const { projects, tasks, materials, leaves, projectBreakdown } = reportsData;

    return (
        <div className="pm-dashboard">
            <div style={{ padding: '0.5rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={downloadCSV} className="pm-quick-action-btn" style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', borderColor: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={16} /> Export Project Data (CSV)
                </button>
            </div>

            {/* High-level metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', padding: '0 1.5rem', marginBottom: '1.5rem' }}>
                <div className="pm-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                        <Briefcase size={20} /> <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Project Health</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{projects.active} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>Active</span></div>
                    <div style={{ fontSize: '0.85rem', color: projects.delayed > 0 ? '#ef4444' : '#10b981' }}>{projects.delayed} delayed projects</div>
                </div>

                <div className="pm-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                        <CheckCircle2 size={20} /> <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Task Completion</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{tasks.completed} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>/ {tasks.total}</span></div>
                    <div style={{ fontSize: '0.85rem', color: tasks.overdue > 0 ? '#ef4444' : '#10b981' }}>{tasks.overdue} tasks overdue</div>
                </div>

                <div className="pm-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                        <Activity size={20} /> <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Resource Requests</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{materials.pending} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>Pending</span></div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{materials.total} total material requests</div>
                </div>

                <div className="pm-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                        <Clock size={20} /> <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Team Leaves</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{leaves.pending} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>Pending</span></div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Require your review</div>
                </div>
            </div>

            {/* Project Breakdown Table */}
            <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
                <div className="pm-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={20} color="#334155" />
                        <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#0f172a' }}>Project Task Breakdown</h2>
                    </div>
                    {projectBreakdown.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No project data available.</div>
                    ) : (
                        <table className="pm-table">
                            <thead>
                                <tr>
                                    <th>Project Name</th>
                                    <th>Status</th>
                                    <th>Total Tasks</th>
                                    <th>Completed</th>
                                    <th>Completion Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projectBreakdown.map((proj, idx) => (
                                    <tr key={idx} className="pm-table-row">
                                        <td><strong style={{ color: '#0f172a' }}>{proj.projectName}</strong></td>
                                        <td>
                                            <span style={{ 
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
                                                background: proj.status === 'Completed' ? '#dcfce7' : proj.status === 'Delayed' ? '#fee2e2' : '#eff6ff',
                                                color: proj.status === 'Completed' ? '#16a34a' : proj.status === 'Delayed' ? '#ef4444' : '#3b82f6'
                                            }}>
                                                {proj.status}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{proj.totalTasks}</td>
                                        <td style={{ fontWeight: 500 }}>{proj.completedTasks}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '100px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', background: '#10b981', width: `${proj.completionRate}%` }} />
                                                </div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{proj.completionRate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductionReports;
