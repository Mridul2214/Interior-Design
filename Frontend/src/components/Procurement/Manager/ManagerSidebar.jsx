import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Box, ShoppingCart, Package, Users, CheckSquare, Building2, LogOut, Menu
} from 'lucide-react';
import { BASE_IMAGE_URL } from '../../../config/api';
import '../../AdminPanel/css/Sidebar.css';

const ManagerSidebar = ({ user, onLogout, isCollapsed, toggleSidebar }) => {
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Vendors', icon: Building2, path: '/vendors' },
        { name: 'Material Requests', icon: Package, path: '/material-requests' },
        { name: 'Purchase Orders', icon: ShoppingCart, path: '/purchase-orders' },
        { name: 'Inventory', icon: Box, path: '/inventory' },
        { name: 'PO Inventory', icon: Package, path: '/po-inventory' },
        { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
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
        <div className={`sidebar-container procurement ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="brand-wrapper">
                    <h1 className="brand-title">Procurement Manager</h1>
                </div>
                <button className="btn-toggle-sidebar" onClick={toggleSidebar}>
                    <Menu size={20} />
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {navItems.map((item) => (
                        <li key={item.name} className="nav-item">
                            <NavLink to={item.path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
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
