import React from 'react';
import { Target, MapPin, Users, ArrowRight, Package, ShoppingCart, Trash2, Save, Search, Filter, Plus, CheckSquare } from 'lucide-react';

const SourcingHub = ({ 
    sourcingSearch, 
    setSourcingSearch, 
    selectedSourcingProject, 
    setSelectedSourcingProject, 
    projects, 
    vendors, 
    sourcingBucket, 
    setSourcingBucket, 
    dailyUpdate, 
    setDailyUpdate, 
    savedSourcing, 
    handleSaveSourcing, 
    handleAddToBucket, 
    handleRemoveFromBucket, 
    handleDeleteSaved 
}) => {
    const marketResults = vendors.filter(v => 
        v.status === 'Active' && (
            v.name.toLowerCase().includes(sourcingSearch.toLowerCase()) ||
            v.products?.some(p => p.itemName.toLowerCase().includes(sourcingSearch.toLowerCase()))
        )
    );

    return (
        <div className="fade-in sourcing-hub">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Sourcing Hub</h3>
                    <p style={{ margin: '4px 0 0', color: '#64748b' }}>
                        {selectedSourcingProject ? `Sourcing for: ${selectedSourcingProject.name}` : 'Select a project to start curating materials.'}
                    </p>
                </div>
                {selectedSourcingProject && (
                    <button 
                        onClick={() => setSelectedSourcingProject(null)}
                        style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Projects
                    </button>
                )}
            </div>

            {!selectedSourcingProject ? (
                <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    {projects.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
                            <Target size={48} color="#94a3b8" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h4 style={{ color: '#475569', margin: '0 0 8px 0' }}>No Procurement Projects</h4>
                            <p style={{ color: '#94a3b8', margin: 0 }}>There are currently no active projects in the procurement stage.</p>
                        </div>
                    ) : (
                        projects.map(project => (
                            <div 
                                key={project._id} 
                                onClick={() => setSelectedSourcingProject(project)}
                                style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                                className="project-card-hover"
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{project.name}</h4>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{project.projectNumber}</span>
                                    </div>
                                    <div style={{ background: '#eef2ff', color: '#6366f1', padding: '8px', borderRadius: '10px' }}>
                                        <Target size={20} />
                                    </div>
                                </div>
                                
                                <div style={{ fontSize: '0.85rem', color: '#475569', display: 'grid', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MapPin size={14} color="#94a3b8" /> {project.location || 'Location not specified'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Users size={14} color="#94a3b8" /> Client: {project.client?.name || 'N/A'}
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6366f1' }}>Start Sourcing</span>
                                    <ArrowRight size={16} color="#6366f1" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="sourcing-workspace" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', height: 'calc(100vh - 250px)', minHeight: '600px', marginBottom: '3rem' }}>
                    {/* Left Side: Project Bucket */}
                    <div className="sourcing-bucket-column" style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={18} color="#6366f1" /> Project Item List</h4>
                                <span className="badge-lite" style={{ background: '#eef2ff', color: '#6366f1' }}>{sourcingBucket.length} Items</span>
                            </div>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                            {sourcingBucket.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
                                    <ShoppingCart size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>Your sourcing bucket is empty.<br/>Search and add items from the market.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {sourcingBucket.map((item, idx) => (
                                        <div key={idx} className="bucket-item-premium" style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', position: 'relative' }}>
                                            <button onClick={() => handleRemoveFromBucket(idx)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 }}><Trash2 size={16} /></button>
                                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.itemName}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> {item.vendorName}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {item.vendorLocation}</span>
                                            </div>
                                            <div style={{ marginTop: '8px', color: '#10b981', fontWeight: 700 }}>₹{item.unitPrice} / {item.unit}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Daily Update to Manager</label>
                                <textarea 
                                    value={dailyUpdate}
                                    onChange={(e) => setDailyUpdate(e.target.value)}
                                    placeholder="Enter progress update for the design/procurement manager..."
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '80px', outline: 'none', fontSize: '0.9rem' }}
                                />
                            </div>
                            <button 
                                onClick={handleSaveSourcing}
                                disabled={sourcingBucket.length === 0}
                                style={{ width: '100%', padding: '14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}
                            >
                                <Save size={18} /> Save & Send Update
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Search / Market */}
                    <div className="sourcing-market-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Search Items or Vendors..."
                                        value={sourcingSearch}
                                        onChange={(e) => setSourcingSearch(e.target.value)}
                                        style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '1rem', transition: 'all 0.2s' }}
                                    />
                                </div>
                                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '16px', color: '#64748b' }}><Filter size={20} /></div>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {marketResults.map(vendor => (
                                <div key={vendor._id} className="market-vendor-card" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div>
                                            <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{vendor.name}</h5>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><MapPin size={12} /> {vendor.location || vendor.address}</div>
                                        </div>
                                        <span className="badge-lite" style={{ height: 'fit-content' }}>{vendor.category}</span>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                                        {vendor.products?.map((p, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{p.itemName}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>₹{p.unitPrice} / {p.unit}</div>
                                                </div>
                                                <button 
                                                    onClick={() => handleAddToBucket(p, vendor)}
                                                    style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {marketResults.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '24px', color: '#94a3b8' }}>
                                    No matches found for "{sourcingSearch}"
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Saved Section */}
            <div style={{ marginTop: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '8px', background: '#f0fdf4', color: '#10b981', borderRadius: '10px' }}><CheckSquare size={20} /></div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Saved Sourcing Drafts</h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {savedSourcing.map(draft => (
                        <div key={draft.id} className="saved-sourcing-card" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div>
                                    <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{draft.project?.name}</h5>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Saved: {new Date(draft.savedAt).toLocaleDateString()}</span>
                                </div>
                                <button onClick={() => handleDeleteSaved(draft.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {draft.items.slice(0, 2).map((item, i) => (
                                    <div key={i} style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{item.itemName}</span>
                                        <span style={{ fontWeight: 600 }}>₹{item.unitPrice}</span>
                                    </div>
                                ))}
                                {draft.items.length > 2 && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>+{draft.items.length - 2} more items</span>}
                            </div>
                            <div style={{ marginTop: '1rem', padding: '12px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                                "{draft.dailyUpdate || 'No update provided'}"
                            </div>
                            <button 
                                onClick={() => {
                                    setSelectedSourcingProject(draft.project);
                                    setSourcingBucket(draft.items);
                                    setDailyUpdate(draft.dailyUpdate);
                                    handleDeleteSaved(draft.id); // Remove to re-save later
                                }}
                                style={{ width: '100%', marginTop: '1rem', padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                            >
                                Edit & Continue
                            </button>
                        </div>
                    ))}
                    {savedSourcing.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', border: '2px dashed #e2e8f0', borderRadius: '24px', color: '#94a3b8' }}>
                            No saved sourcing lists yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SourcingHub;
