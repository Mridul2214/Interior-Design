import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Box,
    ShoppingCart,
    Package,
    Users,
    CheckSquare,
    BarChart,
    Settings,
    Shield,
    Receipt,
    LogOut,
    User
} from 'lucide-react';
import './css/Sidebar.css';

const Sidebar = ({ user, onLogout }) => {
    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Quotations', icon: FileText, path: '/quotations' },
        { name: 'Inventory', icon: Box, path: '/inventory' },
        { name: 'Purchase Orders', icon: ShoppingCart, path: '/purchase-orders' },
        { name: 'PO Inventory', icon: Package, path: '/po-inventory' },
        { name: 'Clients', icon: Users, path: '/clients' },
        { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
        { name: 'Reports', icon: BarChart, path: '/reports' },
        { name: 'Invoice', icon: Receipt, path: '/invoice' },
        { name: 'Users', icon: Shield, path: '/users' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <div className="sidebar-container">
            <div className="sidebar-header">
                <h1 className="brand-title">Interior Design</h1>
                <p className="brand-subtitle">Admin Panel</p>
            </div>

            {user && (
                <div className="sidebar-user">
                    <div className="user-avatar">
                        <User size={24} />
                    </div>
                    <div className="user-info">
                        <p className="user-name">{user.fullName}</p>
                        <p className="user-role">{user.role}</p>
                    </div>
                </div>
            )}

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {menuItems.map((item) => (
                        <li key={item.name} className="nav-item">
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? 'active' : ''}`
                                }
                            >
                                <item.icon size={20} className="nav-icon" />
                                <span>{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="btn-logout" onClick={onLogout}>
                    <LogOut size={20} className="nav-icon" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
