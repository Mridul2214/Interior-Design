import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, X, Plus, Check, CheckCheck, Trash2, FileText, Package, ShoppingCart, Users, ClipboardList, Receipt, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { notificationAPI } from '../../config/api';
import './css/Header.css';

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

const Header = () => {
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
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
        // Poll every 30 seconds for new notifications
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
            setNotifications(prev => prev.filter(n => n._id !== id));
            const wasUnread = notifications.find(n => n._id === id && !n.isRead);
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            fetchNotifications(); // Refresh when opening
        }
    };

    // Determine Title and Subtitle based on Route
    const getPageDetails = () => {
        const path = location.pathname;
        if (path === '/') return { title: 'Dashboard', subtitle: "Welcome back! Here's your business overview." };
        if (path === '/quotations') return { title: 'Quotations', subtitle: 'Detailed overview of your project estimates and proposals.' };
        if (path === '/quotations/new') return { title: 'New Quotation', subtitle: 'Craft a professional estimate for your client.' };
        if (path === '/inventory') return { title: 'Global Inventory', subtitle: 'Track your primary design materials and stock levels.' };
        if (path === '/purchase-orders') return { title: 'Purchase Orders', subtitle: 'Manage supplier orders and procurement status.' };
        if (path === '/po-inventory') return { title: 'PO Tracking', subtitle: 'Monitor stock received specifically through purchase orders.' };
        if (path === '/clients') return { title: 'Relationships', subtitle: 'Manage your client database and contact details.' };
        if (path === '/tasks') return { title: 'Tasks Hub', subtitle: 'Keep track of project milestones and team assignments.' };
        if (path === '/reports') return { title: 'Analytics', subtitle: 'Deep dive into your revenue and conversion metrics.' };
        if (path === '/settings') return { title: 'System Controls', subtitle: 'Configure your preferences and account security.' };
        if (path === '/users') return { title: 'Team Access', subtitle: 'Manage staff accounts and administrative permissions.' };
        if (path === '/invoice') return { title: 'Billing Manager', subtitle: 'Generate and track professional client invoices.' };

        // Fallback for unknown routes
        return {
            title: path.replace('/', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            subtitle: ''
        };
    };

    const { title, subtitle } = getPageDetails();

    return (
        <div className="page-header">
            <div className="welcome-text">
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>

            <div className="header-actions">
                {/* Dashboard Specific Action: New Quotation Button */}
                {(location.pathname === '/') && (
                    <Link to="/quotations/new" style={{ textDecoration: 'none' }}>
                        <button className="btn-primary">
                            <Plus size={20} />
                            <span>New Quotation</span>
                        </button>
                    </Link>
                )}

                {location.pathname === '/po-inventory' && (
                    <button className="btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('open-po-inventory-modal'))}>
                        <Plus size={20} />
                        <span>Add Item</span>
                    </button>
                )}

                {/* Global Notification Icon & Popup */}
                <div className="notification-wrapper">
                    <button
                        className={`btn-icon ${showNotifications ? 'active' : ''}`}
                        onClick={toggleNotifications}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="notification-badge">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div
                                className="notification-overlay"
                                onClick={() => setShowNotifications(false)}
                            ></div>
                            <div className="notification-popup">
                                <div className="popup-header">
                                    <h3>Notifications</h3>
                                    <div className="popup-header-actions">
                                        {unreadCount > 0 && (
                                            <button className="popup-mark-all" onClick={handleMarkAllRead} title="Mark all as read">
                                                <CheckCheck size={16} />
                                            </button>
                                        )}
                                        <button className="popup-close" onClick={() => setShowNotifications(false)}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="popup-content">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif, index) => {
                                            const TypeIcon = ICON_MAP[notif.type] || Info;
                                            const typeColor = COLOR_MAP[notif.type] || '#6b7280';

                                            return (
                                                <div
                                                    key={notif._id}
                                                    className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                                                    style={{ animationDelay: `${index * 0.05}s` }}
                                                    onClick={(e) => !notif.isRead && handleMarkAsRead(notif._id, e)}
                                                >
                                                    <div className="notif-icon-wrap" style={{ backgroundColor: `${typeColor}15`, color: typeColor }}>
                                                        <TypeIcon size={16} />
                                                    </div>
                                                    <div className="notif-body">
                                                        <div className="notif-title-row">
                                                            <span className="notif-title">{notif.title}</span>
                                                            <span className="notif-time">{timeAgo(notif.createdAt)}</span>
                                                        </div>
                                                        <p className="notif-desc">{notif.description}</p>
                                                    </div>
                                                    <div className="notif-actions">
                                                        {!notif.isRead && (
                                                            <button
                                                                className="notif-action-btn"
                                                                onClick={(e) => handleMarkAsRead(notif._id, e)}
                                                                title="Mark as read"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                        )}
                                                        <button
                                                            className="notif-action-btn delete"
                                                            onClick={(e) => handleDelete(notif._id, e)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="no-notif">
                                            <Bell size={32} strokeWidth={1.5} />
                                            <p>No notifications yet</p>
                                            <span>You're all caught up!</span>
                                        </div>
                                    )}
                                </div>
                                {notifications.length > 0 && (
                                    <div className="popup-footer">
                                        <span className="notif-summary">
                                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                                        </span>
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

export default Header;
