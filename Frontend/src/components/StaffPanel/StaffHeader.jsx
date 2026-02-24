import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, ClipboardList, FileText, Package, ShoppingCart, Users, Receipt, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { notificationAPI } from '../../config/api';
import './css/StaffHeader.css';

const ICON_MAP = {
    'Quote': FileText,
    'Invoice': Receipt,
    'Task': ClipboardList,
    'Inventory': Package,
    'PO': ShoppingCart,
    'Info': Info,
    'Success': CheckCircle,
    'Warning': AlertTriangle,
    'Error': XCircle,
};

const COLOR_MAP = {
    'Quote': '#6366f1',
    'Invoice': '#0ea5e9',
    'Task': '#f59e0b',
    'Inventory': '#8b5cf6',
    'PO': '#ec4899',
    'Info': '#3b82f6',
    'Success': '#10b981',
    'Warning': '#f59e0b',
    'Error': '#ef4444',
};

const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const StaffHeader = ({ title, subtitle }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const pollRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await notificationAPI.getAll({ limit: 30 });
            if (res.success) {
                setNotifications(res.data || []);
                setUnreadCount(res.unreadCount || 0);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        pollRef.current = setInterval(fetchNotifications, 30000);
        return () => clearInterval(pollRef.current);
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationAPI.delete(id);
            const wasUnread = notifications.find(n => n._id === id && !n.isRead);
            setNotifications(prev => prev.filter(n => n._id !== id));
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) fetchNotifications();
    };

    return (
        <div className="staff-page-header">
            <div className="staff-header-text">
                {title && <h1>{title}</h1>}
                {subtitle && <p>{subtitle}</p>}
            </div>

            <div className="staff-header-actions">
                <div className="staff-notif-wrapper">
                    <button
                        className={`staff-notif-btn ${showNotifications ? 'active' : ''}`}
                        onClick={toggleNotifications}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="staff-notif-badge">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="staff-notif-overlay" onClick={() => setShowNotifications(false)} />
                            <div className="staff-notif-popup">
                                <div className="staff-popup-header">
                                    <h3>Notifications</h3>
                                    <div className="staff-popup-header-actions">
                                        {unreadCount > 0 && (
                                            <button className="staff-popup-mark-all" onClick={handleMarkAllRead} title="Mark all as read">
                                                <CheckCheck size={16} />
                                            </button>
                                        )}
                                        <button className="staff-popup-close" onClick={() => setShowNotifications(false)}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="staff-popup-content">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif, index) => {
                                            const TypeIcon = ICON_MAP[notif.type] || Info;
                                            const typeColor = COLOR_MAP[notif.type] || '#6b7280';

                                            return (
                                                <div
                                                    key={notif._id}
                                                    className={`staff-notif-item ${!notif.isRead ? 'unread' : ''}`}
                                                    style={{ animationDelay: `${index * 0.05}s` }}
                                                    onClick={(e) => !notif.isRead && handleMarkAsRead(notif._id, e)}
                                                >
                                                    <div className="staff-notif-icon" style={{ backgroundColor: `${typeColor}15`, color: typeColor }}>
                                                        <TypeIcon size={16} />
                                                    </div>
                                                    <div className="staff-notif-body">
                                                        <div className="staff-notif-title-row">
                                                            <span className="staff-notif-title">{notif.title}</span>
                                                            <span className="staff-notif-time">{timeAgo(notif.createdAt)}</span>
                                                        </div>
                                                        <p className="staff-notif-desc">{notif.description}</p>
                                                    </div>
                                                    <div className="staff-notif-actions">
                                                        {!notif.isRead && (
                                                            <button className="staff-notif-action-btn" onClick={(e) => handleMarkAsRead(notif._id, e)} title="Mark as read">
                                                                <Check size={14} />
                                                            </button>
                                                        )}
                                                        <button className="staff-notif-action-btn delete" onClick={(e) => handleDelete(notif._id, e)} title="Delete">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="staff-no-notif">
                                            <Bell size={32} strokeWidth={1.5} />
                                            <p>No notifications yet</p>
                                            <span>You're all caught up!</span>
                                        </div>
                                    )}
                                </div>
                                {notifications.length > 0 && (
                                    <div className="staff-popup-footer">
                                        <span>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffHeader;
