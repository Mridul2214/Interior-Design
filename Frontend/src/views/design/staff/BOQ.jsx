import React from 'react';
import { FileText, FileUp, Send, Lock as LockIcon, Plus, Trash2, AlertTriangle } from 'lucide-react';
import '../css/StaffDashboard.css';

const BOQ = ({ selectedProject, myWorkItems, onProjectChange, boqItems, onDeleteBoqItem, onAddBoqItem, newBoqItem, setNewBoqItem, quotationStatus, onSaveBOQ, onSubmitBOQ, totalBoqAmount }) => {
    return (
        <div className="view-boq fade-in">
            {myWorkItems.length === 0 ? (
                <div className="empty-state-card" style={{ padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '16px' }}>
                    <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                        <FileText size={36} color="#94a3b8" />
                    </div>
                    <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>No Projects Assigned</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>You need an assigned project to start drafting a BOQ.</p>
                </div>
            ) : (
                <>
                    <div className="boq-header-ctrl">
                        <div className="project-sel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Current Project:</label>
                            <select 
                                value={selectedProject?.id || ''} 
                                onChange={(e) => {
                                    const item = myWorkItems.find(it => it.id === e.target.value);
                                    onProjectChange(item);
                                }}
                                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', flex: 1 }}
                            >
                                <option value="">Choose your project...</option>
                                {myWorkItems.map(item => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="boq-mini-builder" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                        <div className="builder-header" style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <strong style={{ fontSize: '1.1rem' }}>BOQ Drafting Board</strong>
                                <span className={`status-pill ${quotationStatus?.toLowerCase().replace(/\s+/g, '-')}`} style={{
                                    fontSize: '0.7rem', padding: '2px 10px', borderRadius: '20px',
                                    fontWeight: 700, border: '1px solid currentColor'
                                }}>
                                    {quotationStatus || 'Draft'}
                                </span>
                            </div>
                        </div>

                        <div className="builder-body" style={{ padding: '1.5rem' }}>
                            <table className="mini-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <tr>
                                        <th style={{ padding: '1rem' }}>Item Name</th>
                                        <th style={{ padding: '1rem' }}>Qty</th>
                                        <th style={{ padding: '1rem' }}>Rate</th>
                                        <th style={{ padding: '1rem' }}>Total</th>
                                        <th style={{ padding: '1rem' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {boqItems.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem' }}>{item.name}</td>
                                            <td style={{ padding: '1rem' }}>{item.qty}</td>
                                            <td style={{ padding: '1rem' }}>₹ {item.rate}</td>
                                            <td style={{ padding: '1rem' }}>₹ {item.qty * item.rate}</td>
                                            <td style={{ padding: '1rem' }}><button className="btn-del" style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => onDeleteBoqItem(item.id)}><Trash2 size={16} /></button></td>
                                        </tr>
                                    ))}
                                    <tr style={{ background: '#fcfcfc' }}>
                                        <td style={{ padding: '1rem' }}><input type="text" placeholder="e.g. Living Room TV Unit" value={newBoqItem.name} 
                                            disabled={quotationStatus !== 'Draft' && quotationStatus !== 'Revision'}
                                            onChange={e => setNewBoqItem({...newBoqItem, name: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} /></td>
                                        <td style={{ padding: '1rem' }}><input type="number" value={newBoqItem.qty} 
                                            disabled={quotationStatus !== 'Draft' && quotationStatus !== 'Revision'}
                                            onChange={e => setNewBoqItem({...newBoqItem, qty: parseInt(e.target.value) || 1})} style={{ width: '60px', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} /></td>
                                        <td style={{ padding: '1rem' }}><input type="number" placeholder="₹ Rate" value={newBoqItem.rate} 
                                            disabled={quotationStatus !== 'Draft' && quotationStatus !== 'Revision'}
                                            onChange={e => setNewBoqItem({...newBoqItem, rate: e.target.value})} style={{ width: '100px', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} /></td>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>₹ {(newBoqItem.qty || 0) * (newBoqItem.rate || 0)}</td>
                                        <td style={{ padding: '1rem' }}><button className="btn-inline-add" style={{ padding: '8px 12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }} onClick={onAddBoqItem}><Plus size={16} /></button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="boq-footer-bar" style={{ padding: '1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="boq-total-display">
                                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>BOQ Draft Total</span>
                                <strong style={{ fontSize: '1.3rem', color: '#0f172a' }}>₹ {totalBoqAmount.toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="boq-footer-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                                {(quotationStatus === 'Draft' || quotationStatus === 'Revision') ? (
                                    <>
                                        <button className="btn-save-boq" style={{ padding: '10px 20px', border: '1px solid #cbd5e1', borderRadius: '10px', background: 'white', fontWeight: 600, cursor: 'pointer' }} onClick={onSaveBOQ}>
                                            Save Draft
                                        </button>
                                        <button className="btn-submit-boq" style={{ padding: '10px 20px', border: 'none', borderRadius: '10px', background: '#4f46e5', color: 'white', fontWeight: 600, cursor: 'pointer' }} onClick={onSubmitBOQ}>
                                            Submit for Review
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ padding: '10px 20px', background: '#f1f5f9', color: '#64748b', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <LockIcon size={16} /> Locked for Review
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BOQ;
