import React, { useState, useEffect } from 'react';
import { 
    CheckCircle, 
    X, 
    Eye, 
    Clock, 
    Calendar, 
    User, 
    Image as ImageIcon, 
    FileText, 
    Package, 
    ExternalLink,
    AlertCircle,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { taskAPI, procurementAPI, notificationAPI, BASE_IMAGE_URL } from '../../config/api';
import { useToast } from '../../context/ToastContext';
import './css/Tasks.css'; // Reusing some base styles

const DesignApprovals = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('design');
    const [tasks, setTasks] = useState([]);
    const [procurementItems, setProcurementItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showDesignModal, setShowDesignModal] = useState(false);

    useEffect(() => {
        fetchPendingApprovals();
    }, []);

    const fetchPendingApprovals = async () => {
        try {
            setLoading(true);
            const [taskRes, mrRes] = await Promise.all([
                taskAPI.getAll({ status: 'Pending Admin Review,Pending Procurement Admin Review' }),
                procurementAPI.getMaterialRequests({ status: 'Pending Admin Review' })
            ]);
            
            const tasksArray = Array.isArray(taskRes) ? taskRes : (taskRes?.data || []);
            const designPending = tasksArray.filter(t => t.status === 'Pending Admin Review');
            const procPendingTasks = tasksArray.filter(t => t.status === 'Pending Procurement Admin Review').map(t => ({ ...t, type: 'Task' }));
            
            setTasks(designPending);
            
            const mrsArray = Array.isArray(mrRes) ? mrRes : (mrRes?.data || []);
            const procPendingMRs = mrsArray.map(m => ({ ...m, type: 'MaterialRequest' }));
            
            setProcurementItems([...procPendingTasks, ...procPendingMRs]);
        } catch (err) {
            console.error(err);
            showToast('Failed to fetch approvals', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdminReview = async (taskId, approved) => {
        let note = null;
        let budget = 0;
        
        if (approved) {
            const confirmPayment = window.confirm('Have you verified that the client has made the necessary initial payments? Click OK to proceed to Procurement.');
            if (!confirmPayment) return;
            
            const budgetPrompt = window.prompt('Enter an Approved Budget limit in ₹ (or leave blank for no limit):');
            if (budgetPrompt === null) return; // User clicked Cancel
            budget = Number(budgetPrompt) || 0;
            
            const optionalNote = window.prompt('Add an optional approval note (e.g., "Ready for procurement"):');
            if (optionalNote) note = optionalNote;
        } else {
            note = window.prompt('Enter the reason for rejection (this will be sent to the designer):');
            if (!note) return; // Rejection requires a reason
        }

        try {
            const response = await taskAPI.adminReview(taskId, { approved, rejectionReason: note, approvedBudget: budget });
            if (response.success) {
                setTasks(prev => prev.filter(t => t._id !== taskId));
                showToast(approved ? 'Design approved and pushed to procurement' : 'Design sent back for revisions');
            }
        } catch (err) {
            showToast('Action failed', 'error');
        }
    };

    const handleProcurementApprove = async (item) => {
        try {
            if (item.type === 'Task') {
                await taskAPI.update(item._id, { status: 'Procurement Approved' });
            } else {
                await procurementAPI.updateMaterialRequest(item._id, { status: 'Procurement Approved' });
            }
            await notificationAPI.create({
                recipientRole: 'Procurement Manager',
                title: 'Procurement Approved',
                message: `Super Admin has approved the procurement for ${item.project?.name || item.requestNumber}. You may now hand off to production.`,
                type: 'success',
                relatedId: item.project?._id,
                relatedModel: 'Project'
            });
            setProcurementItems(prev => prev.filter(t => t._id !== item._id));
            showToast('Procurement approved successfully');
        } catch (err) {
            console.error(err);
            showToast('Action failed', 'error');
        }
    };

    if (loading) {
        return (
            <div className="tasks-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #6366f1', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                    <p style={{ color: '#64748b', fontWeight: 600 }}>Loading pending approvals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tasks-container">
            <div className="tasks-wrapper" style={{ maxWidth: '1400px' }}>
                <div className="t-tasks-header" style={{ marginBottom: '2.5rem' }}>
                    <div className="t-tasks-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                                <CheckCircle size={24} />
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Approval Hub</h2>
                        </div>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>Authorizing high-fidelity designs and procurement materials.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '12px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Queue Strength</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5' }}>{tasks.length + procurementItems.length} Pending</span>
                        </div>
                        <div style={{ width: '40px', height: '40px', background: '#eef2ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                            <Clock size={20} />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0' }}>
                    <button 
                        style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'design' ? '3px solid #6366f1' : '3px solid transparent', color: activeTab === 'design' ? '#4f46e5' : '#64748b', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => setActiveTab('design')}
                    >
                        <ImageIcon size={18} /> Design Pipeline ({tasks.length})
                    </button>
                    <button 
                        style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'procurement' ? '3px solid #6366f1' : '3px solid transparent', color: activeTab === 'procurement' ? '#4f46e5' : '#64748b', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => setActiveTab('procurement')}
                    >
                        <Package size={18} /> Procurement Pipeline ({procurementItems.length})
                    </button>
                </div>

                {activeTab === 'design' && (
                    <>

                {tasks.length === 0 ? (
                    <div style={{ background: 'white', borderRadius: '24px', padding: '5rem 2rem', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                        <div style={{ width: '80px', height: '80px', background: '#f0fdf4', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <CheckCircle size={40} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>All Caught Up!</h3>
                        <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>There are no designs currently awaiting your review.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
                        {tasks.map((task) => (
                            <div key={task._id} className="approval-card" style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'all 0.3s ease', position: 'relative' }}>
                                <div style={{ height: '200px', background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                                    {task.submissions?.[task.submissions.length - 1]?.files?.some(f => f.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                                        <img 
                                            src={`${BASE_IMAGE_URL}${task.submissions[task.submissions.length - 1].files.find(f => f.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i)).url}`} 
                                            alt="Design Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#94a3b8' }}>
                                            <ImageIcon size={48} strokeWidth={1.5} />
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>No Visual Assets Preview</span>
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                        {task.submissions?.[task.submissions.length - 1]?.files?.length || 0} Files
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{task.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' }}>
                                                <User size={14} />
                                                <span>{task.assignedTo?.name || 'Designer'}</span>
                                            </div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <Sparkles size={18} color="#4f46e5" />
                                        </div>
                                    </div>

                                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5', margin: '0 0 1.5rem 0', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {task.submissions?.[task.submissions.length - 1]?.designerNotes || 'No notes provided by designer.'}
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Client</span>
                                            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{task.client?.name || 'N/A'}</span>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Submitted</span>
                                            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{new Date(task.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button 
                                            onClick={() => { setSelectedTask(task); setShowDesignModal(true); }}
                                            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#f1f5f9', color: '#1e293b', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                                        >
                                            <Eye size={18} /> Review Assets
                                        </button>
                                        <button 
                                            onClick={() => handleAdminReview(task._id, true)}
                                            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)' }}
                                        >
                                            <CheckCircle size={18} /> Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </>
                )}

                {activeTab === 'procurement' && (
                    <>
                    {procurementItems.length === 0 ? (
                        <div style={{ background: 'white', borderRadius: '24px', padding: '5rem 2rem', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                            <div style={{ width: '80px', height: '80px', background: '#f0fdf4', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <CheckCircle size={40} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>All Caught Up!</h3>
                            <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>There are no procurement requests currently awaiting your review.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
                            {procurementItems.map((item) => (
                                <div key={item._id} className="approval-card" style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'all 0.3s ease', position: 'relative' }}>
                                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{item.requestNumber || item.title}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' }}>
                                                    <Package size={14} />
                                                    <span>{item.project?.name || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <span style={{ padding: '6px 12px', background: '#fef08a', color: '#a16207', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Pending Admin Review
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' }}>
                                            <User size={14} />
                                            <span>Sourced by: {item.assignedTo?.name || item.assignedTo?.fullName || 'Procurement Team'}</span>
                                        </div>
                                    </div>
    
                                    <div style={{ padding: '1.5rem' }}>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#1e293b' }}>Items to Approve:</h4>
                                            <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', maxHeight: '150px', overflowY: 'auto' }}>
                                                {item.items && item.items.length > 0 ? (
                                                    item.items.map((i, idx) => (
                                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: idx < item.items.length - 1 ? '1px solid #e2e8f0' : 'none', padding: '0.5rem 0' }}>
                                                            <span style={{ fontSize: '0.85rem', color: '#475569' }}>{i.itemName}</span>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{i.quantity} {i.unit}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Check materials in details.</div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                            <button 
                                                onClick={() => handleProcurementApprove(item)}
                                                style={{ padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}
                                                className="approve-btn"
                                            >
                                                <CheckCircle size={18} /> Approve Procurement
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    </>
                )}
            </div>

            {/* Design Preview Modal */}
            {showDesignModal && selectedTask && (
                <div className="modal-overlay" style={{ zIndex: 1100 }}>
                    <div className="modal-content-wide design-preview-admin" style={{ maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: '32px' }}>
                        <div className="modal-header" style={{ padding: '1.5rem 2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ background: '#6366f1', color: 'white', padding: '12px', borderRadius: '16px' }}><ImageIcon size={24} /></div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Design Authentication</h2>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{selectedTask.title}</p>
                                </div>
                            </div>
                            <button className="btn-close" onClick={() => setShowDesignModal(false)} style={{ background: '#f1f5f9', borderRadius: '50%', padding: '10px' }}><X size={20} /></button>
                        </div>
                        
                        <div className="modal-body" style={{ padding: '2.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '3rem' }}>
                                <div className="preview-assets">
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 750, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
                                        <ImageIcon size={20} color="#6366f1" /> Submitted Artwork & Assets
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                                        {selectedTask.submissions?.[selectedTask.submissions.length - 1]?.files?.map((file, i) => {
                                            const isImg = file.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                                            return (
                                                <div key={i} style={{ background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                                    {isImg ? (
                                                        <div style={{ height: '160px', background: '#eee' }}>
                                                            <img src={file.url.startsWith('http') ? file.url : `${BASE_IMAGE_URL}${file.url}`} alt="Design" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </div>
                                                    ) : (
                                                        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0' }}><FileText size={48} color="#64748b" /></div>
                                                    )}
                                                    <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 700, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name || `Asset ${i+1}`}</span>
                                                        <a href={file.url.startsWith('http') ? file.url : `${BASE_IMAGE_URL}${file.url}`} target="_blank" rel="noreferrer" style={{ background: '#eef2ff', color: '#6366f1', padding: '6px', borderRadius: '8px' }}><ExternalLink size={16} /></a>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="preview-details">
                                    <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '2rem', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 750, margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={20} color="#6366f1" /> Designer's Commentary</h3>
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: '1.7' }}>
                                            {selectedTask.submissions?.[selectedTask.submissions.length - 1]?.designerNotes || 'No specific notes provided for this submission.'}
                                        </p>
                                    </div>

                                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 750, margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}><Package size={20} color="#6366f1" /> Bill of Quantities (BOQ)</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {selectedTask.submissions?.[selectedTask.submissions.length - 1]?.designItems?.map((item, i) => (
                                                <div key={i} style={{ padding: '12px 15px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: 750, fontSize: '0.9rem', color: '#1e293b' }}>{item.name}</span>
                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Spec: {item.size || 'Standard'}</span>
                                                    </div>
                                                    <div style={{ background: '#eef2ff', color: '#4f46e5', padding: '4px 12px', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem' }}>
                                                        {item.quantity} {item.unit}
                                                    </div>
                                                </div>
                                            ))}
                                            {!selectedTask.submissions?.[selectedTask.submissions.length - 1]?.designItems?.length && (
                                                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', padding: '1rem' }}>No item list attached.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ padding: '1.5rem 3rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn-cancel" onClick={() => setShowDesignModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 700 }}>Close Preview</button>
                            <button className="btn-submit" onClick={() => { handleAdminReview(selectedTask._id, false); setShowDesignModal(false); }} style={{ background: '#ef4444', padding: '12px 24px', borderRadius: '12px', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Reject Design</button>
                            <button className="btn-submit" onClick={() => { handleAdminReview(selectedTask._id, true); setShowDesignModal(false); }} style={{ background: '#10b981', padding: '12px 24px', borderRadius: '12px', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Approve for Procurement</button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .approval-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border-color: #6366f1;
                }
            `}</style>
        </div>
    );
};

export default DesignApprovals;
