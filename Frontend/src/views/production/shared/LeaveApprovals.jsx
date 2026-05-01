import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, CalendarOff, MessageSquare } from 'lucide-react';
import { leaveAPI } from '../../../models/api';
import './Shared.css';

const LeaveApprovals = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [comments, setComments] = useState('');

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await leaveAPI.getPendingLeaves();
            if (res.success) setLeaves(res.data);
        } catch (error) {
            console.error('Failed to fetch pending leaves', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        try {
            const res = await leaveAPI.updateLeaveStatus(id, { status, managerComments: comments });
            if (res.success) {
                setLeaves(prev => prev.filter(l => l._id !== id));
                setActionId(null);
                setComments('');
            }
        } catch (error) {
            console.error('Failed to update leave status', error);
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading pending leave requests...</div>;

    if (leaves.length === 0) return (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
            <CalendarOff size={40} style={{ color: '#94a3b8', margin: '0 auto 15px' }} />
            <h3 style={{ margin: '0 0 5px', color: '#334155', fontSize: 16 }}>All Caught Up!</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>There are no pending leave requests from your team.</p>
        </div>
    );

    return (
        <div style={{ display: 'grid', gap: 16 }}>
            {leaves.map(leave => (
                <div key={leave._id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                                <h4 style={{ margin: 0, fontSize: 16, color: '#0f172a' }}>{leave.user?.fullName}</h4>
                                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>{leave.user?.role}</span>
                                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: '#e0e7ff', color: '#4338ca', fontWeight: 600 }}>{leave.leaveType}</span>
                            </div>
                            <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <CalendarOff size={14} />
                                {format(new Date(leave.fromDate), 'dd MMM yyyy')}
                                {leave.toDate && new Date(leave.toDate).getTime() !== new Date(leave.fromDate).getTime() && (
                                    <> → {format(new Date(leave.toDate), 'dd MMM yyyy')}</>
                                )}
                                <span style={{ fontWeight: 500, color: '#334155' }}>· {leave.days} day{leave.days > 1 ? 's' : ''}</span>
                            </div>
                        </div>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Applied: {format(new Date(leave.createdAt), 'dd MMM')}</span>
                    </div>

                    <div style={{ fontSize: 14, color: '#334155', background: '#f8fafc', padding: 12, borderRadius: 8, borderLeft: '3px solid #cbd5e1' }}>
                        <strong>Reason:</strong> {leave.reason}
                    </div>

                    {actionId === leave._id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <textarea 
                                placeholder="Add optional comments for the applicant..."
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: 60 }}
                            />
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                <button onClick={() => { setActionId(null); setComments(''); }} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Cancel</button>
                                <button onClick={() => handleAction(leave._id, 'Rejected')} style={{ padding: '8px 16px', border: 'none', background: '#fee2e2', color: '#991b1b', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}><XCircle size={15}/> Reject</button>
                                <button onClick={() => handleAction(leave._id, 'Approved')} style={{ padding: '8px 16px', border: 'none', background: '#d1fae5', color: '#065f46', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}><CheckCircle2 size={15}/> Approve</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setActionId(leave._id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                                Review Request
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default LeaveApprovals;
