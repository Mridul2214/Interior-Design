import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    Camera,
    Users,
    FileText,
    LogOut,
    Menu,
    X,
    User
} from 'lucide-react';
import './css/StaffSidebar.css';

const StaffSidebar = ({ user, onLogout, isOpen, toggleSidebar }) => {
    const menuItems = [
        { name: 'Home', icon: LayoutDashboard, path: '/staff/dashboard' },
        { name: 'My Tasks', icon: CheckSquare, path: '/staff/tasks' },
        { name: 'Site Visits', icon: Camera, path: '/staff/site-visits' },
        { name: 'Clients', icon: Users, path: '/staff/clients' },
        { name: 'Quotations', icon: FileText, path: '/staff/quotations' },
    ];

    return (
        <>
            {/* Mobile Header */}
            <div className="staff-mobile-header">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="mobile-brand">Interior Design Staff</div>
                <div className="mobile-user-icon" style={{ visibility: 'hidden' }}>
                    <User size={20} />
                </div>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isOpen && <div className="staff-sidebar-overlay" onClick={toggleSidebar}></div>}

            {/* Sidebar content */}
            <div className={`staff-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="brand-logo">Interior Design</div>
                    <div className="brand-suffix">Staff Portal</div>
                </div>

                <div className="user-profile">
                    <div className="avatar">
                        {user?.fullName?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div className="user-info">
                        <span className="name">{user?.fullName}</span>
                        <span className="role">{user?.role}</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                    onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                >
                                    <item.icon size={20} />
                                    <span>{item.name}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={onLogout} className="logout-btn">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default StaffSidebar;
