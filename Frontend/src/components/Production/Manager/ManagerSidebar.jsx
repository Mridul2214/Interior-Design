import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Wrench, ClipboardCheck, Box, CheckSquare, Target, LogOut, Menu, Users
} from 'lucide-react';
import { BASE_IMAGE_URL } from '../../../config/api';
import '../../AdminPanel/css/Sidebar.css';

const ManagerSidebar = ({ user, onLogout, isCollapsed, toggleSidebar }) => {
    const navGroups = [
        {
            title: "Production",
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/production-management/dashboard' },
                { name: 'Projects', icon: Target, path: '/production-management/projects' },
                { name: 'Tasks', icon: CheckSquare, path: '/production-management/tasks' },
                { name: 'Team', icon: Users, path: '/production-management/team' },
                { name: 'Approvals', icon: ClipboardCheck, path: '/production-management/approvals' },
            ]
        }
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
        <div className={`sidebar-container production ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="brand-wrapper">
                    <h1 className="brand-title">Project Manager</h1>
                </div>
                <button className="btn-toggle-sidebar" onClick={toggleSidebar}>
                    <Menu size={20} />
                </button>
            </div>

            <nav className="sidebar-nav">
                {navGroups.map((group) => (
                    <div key={group.title} className="nav-group">
                        <h3 className="nav-group-title" style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', margin: '15px 0 5px 15px', fontWeight: '600' }}>{group.title}</h3>
                        <ul className="nav-list">
                            {group.items.map((item) => (
                                <li key={item.name} className="nav-item">
                                    <NavLink to={item.path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <item.icon size={18} className="nav-icon" />
                                        <span>{item.name}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
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
