import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, X, Plus } from 'lucide-react';
import './css/Header.css';

const Header = () => {
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);

    // Mock Notifications - In a real app, this would come from Context or Redux
    const notifications = [
        { id: 1, title: 'New Quote Request', desc: 'Client "Villa A" requested a quote.', time: '2m ago', unread: true },
        { id: 2, title: 'Inventory Alert', desc: 'Teak Wood stock is running low.', time: '1h ago', unread: false },
        { id: 3, title: 'PO Approved', desc: 'Purchase Order #002 has been approved.', time: '3h ago', unread: false },
    ];

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
                {/* Dashboard & Quotations Specific Action: New Quotation Button */}
                {(location.pathname === '/' || location.pathname === '/quotations') && (
                    <Link to="/quotations/new" style={{ textDecoration: 'none' }}>
                        <button className="btn-primary">
                            <Plus size={20} />
                            <span>New Quotation</span>
                        </button>
                    </Link>
                )}

                {location.pathname === '/inventory' && (
                    <button className="btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('open-inventory-modal'))}>
                        <Plus size={20} />
                        <span>Add Item</span>
                    </button>
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
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {notifications.some(n => n.unread) && <span className="notification-badge"></span>}
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
                                    <button className="popup-close" onClick={() => setShowNotifications(false)}>
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="popup-content">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif, index) => (
                                            <div
                                                key={notif.id}
                                                className={`notification-item ${notif.unread ? 'unread' : ''}`}
                                                style={{ animationDelay: `${index * 0.1}s` }}
                                            >
                                                <div className="notif-title-row">
                                                    <span className="notif-title">{notif.title}</span>
                                                    <span className="notif-time">{notif.time}</span>
                                                </div>
                                                <p className="notif-desc">{notif.desc}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-notif">No new notifications</p>
                                    )}
                                </div>
                                <div className="popup-footer">
                                    <button onClick={() => setShowNotifications(false)}>Mark all as read</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
