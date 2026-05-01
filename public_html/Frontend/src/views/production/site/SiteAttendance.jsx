import React, { useState, useEffect } from 'react';
import { Users, Save, CheckCircle2, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { engineerAPI, siteManagementAPI } from '../../../models/api';
import { format } from 'date-fns';
import CustomSelect from '../../common/CustomSelect';
import DatePicker from '../../common/DatePicker';
import './Site.css';

const ROLE_OPTIONS = [
    { value: 'Laborer', label: 'Laborer' },
    { value: 'Carpenter', label: 'Carpenter' },
    { value: 'Electrician', label: 'Electrician' },
    { value: 'Plumber', label: 'Plumber' },
    { value: 'Painter', label: 'Painter' },
    { value: 'Supervisor', label: 'Supervisor' },
];

const STATUS_OPTIONS = [
    { value: 'Present', label: 'Present' },
    { value: 'Half-Day', label: 'Half-Day' },
    { value: 'Absent', label: 'Absent' },
];

const SiteAttendance = ({ user }) => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [records, setRecords] = useState([
        { id: 1, workerName: '', role: 'Laborer', status: 'Present', checkInTime: '09:00', checkOutTime: '18:00', notes: '' }
    ]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        engineerAPI.getMyProjects().then(res => {
            if (res.success) {
                setProjects(res.data);
                if (res.data.length > 0) setSelectedProject(res.data[0]._id);
            }
        });
    }, []);

    useEffect(() => {
        if (!selectedProject || !date) return;
        fetchAttendance();
    }, [selectedProject, date]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await siteManagementAPI.getProjectAttendance(selectedProject);
            if (res.success) {
                // Find attendance for selected date
                const todayRecord = res.data.find(a => format(new Date(a.date), 'yyyy-MM-dd') === date);
                if (todayRecord && todayRecord.records.length > 0) {
                    setRecords(todayRecord.records.map((r, i) => ({ ...r, id: i })));
                } else {
                    setRecords([{ id: Date.now(), workerName: '', role: 'Laborer', status: 'Present', checkInTime: '09:00', checkOutTime: '18:00', notes: '' }]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch attendance', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRow = () => {
        setRecords([...records, { id: Date.now(), workerName: '', role: 'Laborer', status: 'Present', checkInTime: '09:00', checkOutTime: '18:00', notes: '' }]);
    };

    const handleRemoveRow = (id) => {
        setRecords(records.filter(r => r.id !== id));
    };

    const handleChange = (id, field, value) => {
        setRecords(records.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const markAllPresent = () => {
        setRecords(records.map(r => ({ ...r, status: 'Present' })));
    };

    const handleSubmit = async () => {
        if (!selectedProject) {
            setError('Please select a project');
            return;
        }

        // Filter out empty rows
        const validRecords = records.filter(r => r.workerName.trim() !== '');
        if (validRecords.length === 0) {
            setError('Please enter at least one worker name');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const res = await siteManagementAPI.submitAttendance({
                projectId: selectedProject,
                date: new Date(date).toISOString(),
                records: validRecords
            });
            if (res.success) {
                setSubmitted(true);
                setTimeout(() => setSubmitted(false), 3000);
            } else {
                setError(res.message || 'Failed to submit attendance');
            }
        } catch (err) {
            setError('An error occurred while saving attendance');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="site-attendance-container">
            {submitted && (
                <div className="site-toast" style={{ background: '#10b981' }}>
                    <CheckCircle2 size={16} /> Attendance saved successfully!
                </div>
            )}
            
            <div className="site-attendance-header" style={{ marginBottom: 20, display: 'flex', gap: 15, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="site-form-group" style={{ margin: 0, minWidth: 220 }}>
                    <label className="shad-form-label">Project</label>
                    <CustomSelect
                        options={[{ value: '', label: 'Select Project...' }, ...projects.map(p => ({ value: p._id, label: p.projectName }))]}
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        placeholder="Select Project..."
                    />
                </div>
                <div className="site-form-group" style={{ margin: 0, minWidth: 190 }}>
                    <label className="shad-form-label">Date</label>
                    <DatePicker
                        value={date}
                        onChange={(val) => setDate(val)}
                    />
                </div>
                <button className="site-btn-secondary" onClick={markAllPresent} style={{ marginLeft: 'auto' }}>
                    <CheckCircle2 size={16} /> Mark All Present
                </button>
                <button className="site-btn" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Saving...' : <><Save size={16} /> Save Attendance</>}
                </button>
            </div>

            {error && <div style={{ color: '#ef4444', marginBottom: 15, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}><AlertTriangle size={14}/> {error}</div>}

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading records...</div>
            ) : (
                <div className="site-table-container">
                    <table className="site-table">
                        <thead>
                            <tr>
                                <th>Worker Name</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>In / Out Time</th>
                                <th>Notes</th>
                                <th style={{ width: 48 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r, index) => (
                                <tr key={r.id || index}>
                                    <td>
                                        <input
                                            type="text"
                                            className="site-form-input"
                                            placeholder="e.g. John Doe"
                                            value={r.workerName}
                                            onChange={(e) => handleChange(r.id, 'workerName', e.target.value)}
                                        />
                                    </td>
                                    <td style={{ minWidth: 160 }}>
                                        <CustomSelect
                                            options={ROLE_OPTIONS}
                                            value={r.role}
                                            onChange={(e) => handleChange(r.id, 'role', e.target.value)}
                                        />
                                    </td>
                                    <td style={{ minWidth: 140 }}>
                                        <CustomSelect
                                            options={STATUS_OPTIONS}
                                            value={r.status}
                                            onChange={(e) => handleChange(r.id, 'status', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <input
                                                type="time"
                                                className="site-form-input"
                                                value={r.checkInTime}
                                                onChange={(e) => handleChange(r.id, 'checkInTime', e.target.value)}
                                                disabled={r.status === 'Absent'}
                                                style={{ width: 120 }}
                                            />
                                            <span style={{ color: '#94a3b8', flexShrink: 0 }}>–</span>
                                            <input
                                                type="time"
                                                className="site-form-input"
                                                value={r.checkOutTime}
                                                onChange={(e) => handleChange(r.id, 'checkOutTime', e.target.value)}
                                                disabled={r.status === 'Absent'}
                                                style={{ width: 120 }}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="site-form-input"
                                            placeholder="Notes (optional)"
                                            value={r.notes}
                                            onChange={(e) => handleChange(r.id, 'notes', e.target.value)}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="site-row-del-btn" onClick={() => handleRemoveRow(r.id)}>
                                            <Trash2 size={13} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="site-add-row-btn" onClick={handleAddRow}>
                        <Plus size={14} /> Add Worker
                    </button>
                </div>
            )}
        </div>
    );
};

export default SiteAttendance;
