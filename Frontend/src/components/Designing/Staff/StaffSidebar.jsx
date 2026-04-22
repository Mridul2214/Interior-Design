import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, CheckSquare, Package, Target, LogOut, Menu
} from 'lucide-react';
import { BASE_IMAGE_URL } from '../../../config/api';
import '../../AdminPanel/css/Sidebar.css';

const StaffSidebar = ({ user, onLogout, isCollapsed, toggleSidebar }) => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab') || 'overview';

    const navItems = [
        { name: 'My Dashboard', icon: LayoutDashboard, path: '/staff/dashboard?tab=overview', tab: 'overview' },
        { name: 'My Tasks', icon: CheckSquare, path: '/staff/dashboard?tab=tasks', tab: 'tasks' },
        { name: 'Revisions', icon: Target, path: '/staff/dashboard?tab=revisions', tab: 'revisions' },
        { name: 'Submitted Tasks', icon: CheckSquare, path: '/staff/dashboard?tab=submissions', tab: 'submissions' },
        { name: 'Material Hub', icon: Package, path: '/staff/material-review', tab: null },
    ];

    const userInitials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : '?';

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${BASE_IMAGE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    return (
        <div className={`sidebar-container design ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="brand-wrapper">
                    <h1 className="brand-title">Design Staff</h1>
                </div>
                <button className="btn-toggle-sidebar" onClick={toggleSidebar}>
                    <Menu size={20} />
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {navItems.map((item) => (
                        <li key={item.name} className="nav-item">
                            <NavLink
                                to={item.path}
                                className={() => {
                                    const isTabActive = item.tab ? currentTab === item.tab && location.pathname === '/staff/dashboard' : location.pathname === item.path;
                                    return `nav-link ${isTabActive ? 'active' : ''}`;
                                }}
                            >
                                <item.icon size={18} className="nav-icon" />
                                <span>{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="footer-user-info">
                    <div className="footer-avatar">
                        {user?.avatar ? <img src={getImageUrl(user.avatar)} alt="Avatar" /> : userInitials}
                    </div>
                    <div className="footer-details">
                        <p className="footer-name">{user?.fullName}</p>
                        <p className="footer-role">{user?.role}</p>
                    </div>
                </div>
                <button className="btn-logout-icon" onClick={onLogout} title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </div>
    );
};

export default StaffSidebar;
