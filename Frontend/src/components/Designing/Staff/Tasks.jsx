import React, { useState } from 'react';
import { List, CheckSquare, Clock, CheckCircle, Target, Briefcase, Plus, Play, User, AlertTriangle, MessageSquare, X } from 'lucide-react';
import '../css/StaffDashboard.css';

const Tasks = ({ myTasks, myStandaloneTasks, onUpdateTaskStatus, getPriorityColor, taskAPI }) => {
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [showDailyUpdateModal, setShowDailyUpdateModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [dailyUpdateData, setDailyUpdateData] = useState({ update: '', emergencies: '', requestedDate: '', reason: '' });
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [submittingUpdate, setSubmittingUpdate] = useState(false);

    const isOverdue = (task) => {
        if (task.status === 'Completed' || task.status === 'Approved') return false;
        return task.dueDate && new Date(task.dueDate) < new Date();
    };

    const isDueSoon = (task) => {
        if (task.status === 'Completed' || task.status === 'Approved') return false;
        if (!task.dueDate) return false;
        const diff = new Date(task.dueDate) - new Date();
        const days = diff / (1000 * 60 * 60 * 24);
        return days <= 3 && days >= 0;
    };

    const handleOpenComments = async (task) => {
        setSelectedTask(task);
        setShowCommentModal(true);
        setLoadingComments(true);
        try {
            if (taskAPI) {
                const res = await taskAPI.getComments(task._id);
                if (res.success) {
                    setComments(res.data || []);
                }
            }
        } catch (err) {
            console.error('Failed to load comments:', err);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim() || !taskAPI) return;
        setSubmittingComment(true);
        try {
            const res = await taskAPI.addComment(selectedTask._id, commentText);
            if (res.success) {
                setCommentText('');
                const commentsRes = await taskAPI.getComments(selectedTask._id);
                if (commentsRes.success) {
                    setComments(commentsRes.data || []);
                }
            }
        } catch (err) {
            alert('Failed to add comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleSubmitDailyUpdate = async (e) => {
        e.preventDefault();
        if (!dailyUpdateData.update.trim() || !taskAPI) return;
        setSubmittingUpdate(true);
        try {
            const payload = {
                update: dailyUpdateData.update,
                emergencies: dailyUpdateData.emergencies,
                extensionRequest: dailyUpdateData.requestedDate ? {
                    requestedDate: dailyUpdateData.requestedDate,
                    reason: dailyUpdateData.reason
                } : undefined
            };
            const res = await taskAPI.addDailyUpdate(selectedTask._id, payload);
            if (res.success) {
                setShowDailyUpdateModal(false);
                setDailyUpdateData({ update: '', emergencies: '', requestedDate: '', reason: '' });
                alert('Daily update submitted successfully!');
            }
        } catch (err) {
            alert('Failed hide update: ' + err.message);
        } finally {
            setSubmittingUpdate(false);
        }
    };

    const TaskCard = ({ task }) => {
        const overdue = isOverdue(task);
        const dueSoon = isDueSoon(task);
        
        return (
            <div className={`task-item-card ${overdue ? 'overdue' : ''} ${dueSoon ? 'due-soon' : ''}`} style={{ 
                padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', marginBottom: '1rem',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                borderLeft: `5px solid ${dueSoon ? '#f59e0b' : getPriorityColor(task.priority)}`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{task.title}</div>
                            {overdue && <span className="badge danger"><AlertTriangle size={12} /> OVERDUE</span>}
                            {dueSoon && <span className="badge warning"><Clock size={12} /> DUE SOON</span>}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                            <Briefcase size={14} /> {task.project?.name || task.project || 'Standalone Task'}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: overdue ? '#ef4444' : '#64748b' }}>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Deadline'}
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4f46e5', marginTop: '4px' }}>{task.progress || 0}%</div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-icon-lite" onClick={() => handleOpenComments(task)} title="View Discussion"><MessageSquare size={16} /></button>
                        <button 
                            className="btn-status-update" 
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', 
                                background: dueSoon ? '#fffbeb' : '#f8fafc', color: dueSoon ? '#b45309' : '#64748b',
                                border: `1px solid ${dueSoon ? '#fde68a' : '#e2e8f0'}`, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                            }}
                            onClick={() => { setSelectedTask(task); setShowDailyUpdateModal(true); }}
                        >
                            <RefreshCw size={14} /> Daily Update
                        </button>
                    </div>
                    {task.status !== 'Completed' && task.status !== 'Approved' && (
                        <button 
                            className="play-btn-premium" 
                            style={{ 
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', 
                                border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
                            }} 
                            onClick={() => onUpdateTaskStatus(task._id, task.status)}
                        >
                            <Play size={14} /> Start / Update
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="view-tasks fade-in">
            <div className="tasks-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Task Assignment Board</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Manage your daily progress and report updates to the manager.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="task-stat-glass">
                        <span className="val">{myTasks.filter(t => t.status === 'In Progress').length}</span>
                        <span className="lab">Working</span>
                    </div>
                    <div className="task-stat-glass overdue">
                        <span className="val">{myTasks.filter(t => isOverdue(t)).length}</span>
                        <span className="lab">Overdue</span>
                    </div>
                </div>
            </div>

            <div className="tasks-sections" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                <div className="task-column">
                    <div className="column-header">
                        <Target size={20} color="#6366f1" />
                        <h4>Project Linked</h4>
                        <span className="count">{myTasks.filter(t => t.project).length}</span>
                    </div>
                    <div className="tasks-container">
                        {myTasks.filter(t => t.project).map(task => <TaskCard key={task._id} task={task} />)}
                        {myTasks.filter(t => t.project).length === 0 && <div className="empty-state-lite">No active project tasks.</div>}
                    </div>
                </div>

                <div className="task-column">
                    <div className="column-header">
                        <List size={20} color="#a855f7" />
                        <h4>General Tasks</h4>
                        <span className="count">{myStandaloneTasks.length}</span>
                    </div>
                    <div className="tasks-container">
                        {myStandaloneTasks.map(task => <TaskCard key={task._id} task={task} />)}
                        {myStandaloneTasks.length === 0 && <div className="empty-state-lite">No standalone tasks.</div>}
                    </div>
                </div>
            </div>

            {/* Daily Update Modal */}
            {showDailyUpdateModal && selectedTask && (
                <div className="modal-overlay">
                    <div className="modal-content-styled" style={{ maxWidth: '550px' }}>
                        <div className="modal-header">
                            <div>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><RefreshCw size={20} color="#6366f1" /> Daily Progress Update</h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>Repoting for: {selectedTask.title}</p>
                            </div>
                            <button className="close-btn" onClick={() => setShowDailyUpdateModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmitDailyUpdate} style={{ padding: '1.5rem' }}>
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                                    <MessageSquare size={14} /> What did you accomplish today?
                                </label>
                                <textarea 
                                    className="premium-input"
                                    value={dailyUpdateData.update}
                                    onChange={e => setDailyUpdateData({...dailyUpdateData, update: e.target.value})}
                                    placeholder="Describe your progress and completed sub-tasks..."
                                    required
                                    style={{ minHeight: '100px' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#ef4444' }}>
                                    <AlertTriangle size={14} /> Any emergencies or blockers?
                                </label>
                                <textarea 
                                    className="premium-input"
                                    value={dailyUpdateData.emergencies}
                                    onChange={e => setDailyUpdateData({...dailyUpdateData, emergencies: e.target.value})}
                                    placeholder="Mention if anything is slowing you down..."
                                    style={{ minHeight: '60px', border: '1px solid #fee2e2' }}
                                />
                            </div>

                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px' }}>
                                    <Clock size={14} color="#6366f1" /> Request Deadline Extension?
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input 
                                        type="date" 
                                        className="premium-input"
                                        value={dailyUpdateData.requestedDate}
                                        onChange={e => setDailyUpdateData({...dailyUpdateData, requestedDate: e.target.value})}
                                    />
                                    <input 
                                        type="text" 
                                        className="premium-input"
                                        value={dailyUpdateData.reason}
                                        onChange={e => setDailyUpdateData({...dailyUpdateData, reason: e.target.value})}
                                        placeholder="Reason for extension..."
                                    />
                                </div>
                            </div>

                            <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowDailyUpdateModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 2, background: '#4f46e5' }} disabled={submittingUpdate}>
                                    {submittingUpdate ? 'Submitting...' : 'Submit Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Comment Modal */}
            {showCommentModal && selectedTask && (
                <div className="modal-overlay">
                    <div className="modal-content-styled" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <div>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MessageSquare size={20} color="#6366f1" /> Task Communication History</h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Log of updates and comments for: {selectedTask.title}</p>
                            </div>
                            <button className="close-btn" onClick={() => { setShowCommentModal(false); setSelectedTask(null); setComments([]); }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div className="history-timeline" style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '10px' }}>
                                {/* History Mix: Daily Updates & Comments */}
                                {loadingComments ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading history...</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {/* Daily Updates Section */}
                                        {selectedTask.dailyUpdates?.length > 0 && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <h5 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>Progress Reports</h5>
                                                {selectedTask.dailyUpdates.map((dup, i) => (
                                                    <div key={i} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', borderLeft: '3px solid #6366f1', marginBottom: '8px' }}>
                                                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
                                                            {new Date(dup.createdAt).toLocaleString()}
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>{dup.update}</div>
                                                        {dup.emergencies && <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>🚨 Emergency: {dup.emergencies}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {/* Comments Section */}
                                        <div>
                                            <h5 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>General Comments</h5>
                                            {comments.map((comment, idx) => (
                                                <div key={idx} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '8px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#4f46e5' }}>{comment.user?.fullName}</span>
                                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{new Date(comment.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>{comment.text}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input 
                                    type="text" 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Type a message to the team..."
                                    className="premium-input"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                                />
                                <button 
                                    className="btn-primary" 
                                    style={{ padding: '0 1.5rem', background: '#6366f1' }}
                                    onClick={handleSubmitComment}
                                    disabled={submittingComment || !commentText.trim()}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
    
