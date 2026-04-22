import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Box, Users, CheckSquare, Palette, Package, Target, LogOut, Menu, Clock, Image, Send
} from 'lucide-react';
import { BASE_IMAGE_URL } from '../../../config/api';
import '../../AdminPanel/css/Sidebar.css';

const ManagerSidebar = ({ user, onLogout, isCollapsed, toggleSidebar }) => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab') || 'overview';

    const navItems = [
        { name: 'Overview', icon: LayoutDashboard, path: '/?tab=overview', tab: 'overview' },
        { name: 'Quotations', icon: FileText, path: '/?tab=quotations', tab: 'quotations' },
        { name: 'Project Status', icon: Clock, path: '/?tab=project_status', tab: 'project_status' },
        { name: 'Task Assignment', icon: CheckSquare, path: '/?tab=tasks', tab: 'tasks' },
        { name: 'Staff Overview', icon: Users, path: '/?tab=staff_overview', tab: 'staff_overview' },
        { name: 'Submissions', icon: Image, path: '/?tab=submissions', tab: 'submissions' },
        { name: 'To Procurement', icon: Send, path: '/?tab=ready_for_procurement', tab: 'ready_for_procurement' },
        { name: 'Material Hub', icon: Package, path: '/material-review', tab: null },
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
                    <h1 className="brand-title">Design Manager</h1>
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
                                    const isTabActive = item.tab ? currentTab === item.tab && location.pathname === '/' : location.pathname === item.path;
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

export default ManagerSidebar;
