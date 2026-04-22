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
    User,
    Target,
    Truck,
    Wrench,
    DollarSign,
    Building2,
    Palette,
    ShoppingCart,
    ClipboardCheck
} from 'lucide-react';
import { getRoleDepartment, useRoleDashboard } from '../../hooks/useRoleDashboard';
import './css/StaffSidebar.css';

const StaffSidebar = ({ user, onLogout, isOpen, toggleSidebar }) => {
    const department = getRoleDepartment(user?.role);
    const dashboardType = useRoleDashboard(user?.role);

    const getMenuItems = () => {
        const baseItems = [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard' },
        ];

        const departmentItems = {
            Design: [
                { name: 'Design Tasks', icon: Palette, path: '/staff/dashboard' },
                { name: 'My Tasks', icon: CheckSquare, path: '/staff/tasks' },
                { name: 'Site Visits', icon: Camera, path: '/staff/site-visits' },
                { name: 'Clients', icon: Users, path: '/staff/clients' },
                { name: 'Quotations', icon: FileText, path: '/staff/quotations' },
            ],
            Procurement: [
                { name: 'Procurement', icon: Truck, path: '/staff/dashboard' },
                { name: 'My Tasks', icon: CheckSquare, path: '/staff/tasks' },
                { name: 'Clients', icon: Users, path: '/staff/clients' },
            ],
            Production: [
                { name: 'Production Tasks', icon: Wrench, path: '/staff/dashboard' },
                { name: 'My Tasks', icon: CheckSquare, path: '/staff/tasks' },
                { name: 'Site Visits', icon: Camera, path: '/staff/site-visits' },
                { name: 'Clients', icon: Users, path: '/staff/clients' },
            ],
            Accounts: [
                { name: 'Finance Tasks', icon: DollarSign, path: '/staff/dashboard' },
                { name: 'My Tasks', icon: CheckSquare, path: '/staff/tasks' },
                { name: 'Clients', icon: Users, path: '/staff/clients' },
            ],
            Sales: [
                { name: 'Sales Tasks', icon: FileText, path: '/staff/dashboard' },
                { name: 'My Tasks', icon: CheckSquare, path: '/staff/tasks' },
                { name: 'Clients', icon: Users, path: '/staff/clients' },
                { name: 'Quotations', icon: FileText, path: '/staff/quotations' },
            ],
            Admin: [
                { name: 'My Tasks', icon: CheckSquare, path: '/staff/tasks' },
                { name: 'Site Visits', icon: Camera, path: '/staff/site-visits' },
                { name: 'Clients', icon: Users, path: '/staff/clients' },
                { name: 'Quotations', icon: FileText, path: '/staff/quotations' },
            ]
        };

        return [...baseItems, ...(departmentItems[department] || departmentItems.Admin)];
    };

    const menuItems = getMenuItems();

    const getDepartmentIcon = () => {
        switch (department) {
            case 'Design': return <Palette size={20} />;
            case 'Procurement': return <Truck size={20} />;
            case 'Production': return <Wrench size={20} />;
            case 'Accounts': return <DollarSign size={20} />;
            case 'Sales': return <FileText size={20} />;
            default: return <Building2 size={20} />;
        }
    };

    return (
        <>
            <div className="staff-mobile-header">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="mobile-brand">Interior Design</div>
                <div className="mobile-user-icon" style={{ visibility: 'hidden' }}>
                    <User size={20} />
                </div>
            </div>

            {isOpen && <div className="staff-sidebar-overlay" onClick={toggleSidebar}></div>}

            <div className={`staff-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="brand-logo">Interior Design</div>
                    <div className="brand-suffix">{department} Portal</div>
                </div>

                <div className="user-profile">
                    <div className="avatar">
                        {getDepartmentIcon()}
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
