import React, { useState, useEffect } from 'react';
import { Target, User, Clock, AlertTriangle, Plus, Filter, LayoutGrid, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import '../css/ProductionManagement.css';
import { kanbanAPI } from '../../../config/api';

const COLUMN_ORDER = ['todo', 'in-progress', 'review', 'completed'];
const COLUMN_TITLES = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'review': 'Review',
    'completed': 'Completed'
};

const TasksBoard = () => {
    const [tasks, setTasks] = useState({
        'todo': [],
        'in-progress': [],
        'review': [],
        'completed': []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        projectName: '',
        assignedTo: '',
        priority: 'Medium',
        dueDate: ''
    });

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await kanbanAPI.getTasks();
            if (res.success) {
                const grouped = {
                    'todo': [],
                    'in-progress': [],
                    'review': [],
                    'completed': []
                };
                res.data.forEach(task => {
                    if (grouped[task.status]) {
                        grouped[task.status].push(task);
                    }
                });
                setTasks(grouped);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const res = await kanbanAPI.createTask(newTask);
            if (res.success) {
                setIsModalOpen(false);
                setNewTask({ title: '', projectName: '', assignedTo: '', priority: 'Medium', dueDate: '' });
                fetchTasks();
            }
        } catch (err) {
            console.error("Error creating task", err);
        }
    };

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const sourceCol = [...tasks[source.droppableId]];
        const destCol = source.droppableId === destination.droppableId ? sourceCol : [...tasks[destination.droppableId]];
        
        const [removed] = sourceCol.splice(source.index, 1);
        removed.status = destination.droppableId;
        destCol.splice(destination.index, 0, removed);

        setTasks({
            ...tasks,
            [source.droppableId]: sourceCol,
            [destination.droppableId]: destCol
        });

        try {
            await kanbanAPI.updateTask(removed._id, { status: destination.droppableId });
        } catch (err) {
            console.error("Failed to update task status", err);
            fetchTasks(); // Revert on failure
        }
    };

    const getPriorityColor = (priority) => {
        const p = priority.toLowerCase();
        const colors = { urgent: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#94a3b8' };
        const bgs = { urgent: '#fee2e2', high: '#fef3c7', medium: '#eff6ff', low: '#f1f5f9' };
        return { color: colors[p] || '#94a3b8', bg: bgs[p] || '#f1f5f9' };
    };

    return (
        <div className="pm-dashboard">
            <div className="pm-welcome-header" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="pm-welcome-text">
                    <h1 style={{ fontSize: '1.5rem' }}>Tasks Board</h1>
                    <p className="pm-welcome-date">Kanban view of all production tasks</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', zIndex: 1 }}>
                    <button className="pm-quick-action-btn" style={{ padding: '0.5rem 1rem', flexDirection: 'row', gap: '0.5rem', background: '#f8fafc', color: '#334155', borderColor: '#e2e8f0' }}>
                        <Filter size={16} /> Filters
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="pm-quick-action-btn" style={{ padding: '0.5rem 1rem', flexDirection: 'row', gap: '0.5rem', background: '#3b82f6', color: 'white', borderColor: '#2563eb' }}>
                        <Plus size={16} /> New Task
                    </button>
                </div>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>{error}</div>}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading tasks...</div>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="pm-kanban-container">
                        {COLUMN_ORDER.map(columnId => (
                            <Droppable droppableId={columnId} key={columnId}>
                                {(provided) => (
                                    <div 
                                        className="pm-kanban-column"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        <div className="pm-kanban-column-header">
                                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <LayoutGrid size={16} color="#64748b" />
                                                {COLUMN_TITLES[columnId]}
                                                <span style={{ background: '#e2e8f0', color: '#475569', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '99px' }}>
                                                    {tasks[columnId].length}
                                                </span>
                                            </h3>
                                        </div>
                                        
                                        <div className="pm-kanban-cards" style={{ minHeight: '100px' }}>
                                            {tasks[columnId].map((task, index) => {
                                                const prio = getPriorityColor(task.priority);
                                                return (
                                                    <Draggable draggableId={task._id} index={index} key={task._id}>
                                                        {(provided, snapshot) => (
                                                            <div 
                                                                className="pm-kanban-card"
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    opacity: snapshot.isDragging ? 0.8 : 1
                                                                }}
                                                            >
                                                                <div className="pm-kanban-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{task.taskId}</span>
                                                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', background: prio.bg, color: prio.color }}>
                                                                        {task.priority}
                                                                    </span>
                                                                </div>
                                                                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#0f172a', lineHeight: 1.3 }}>{task.title}</h4>
                                                                <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <Target size={12} /> {task.projectName}
                                                                </p>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748b' }}>
                                                                        <div className="pm-team-avatar" style={{ width: '20px', height: '20px', fontSize: '0.6rem', background: '#f1f5f9', color: '#475569' }}>
                                                                            {task.assignedTo ? task.assignedTo.split(' ').map(n=>n[0]).join('') : '?'}
                                                                        </div>
                                                                        {task.assignedTo || 'Unassigned'}
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: task.priority === 'Urgent' ? '#ef4444' : '#64748b' }}>
                                                                        <Clock size={12} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'No Date'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>
            )}

            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Create New Task</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Title *</label>
                                <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Project Name *</label>
                                <input required type="text" value={newTask.projectName} onChange={e => setNewTask({...newTask, projectName: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Assigned To</label>
                                <input type="text" value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Priority</label>
                                <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Due Date</label>
                                <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                                Create Task
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TasksBoard;
