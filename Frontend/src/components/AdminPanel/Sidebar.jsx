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
    Briefcase,
    Menu,
    Target,
    Truck,
    Wrench,
    DollarSign,
    Building2,
    Palette,
    ClipboardCheck
} from 'lucide-react';
import { BASE_IMAGE_URL } from '../../config/api';
import { getRoleDepartment, useRoleDashboard } from '../../hooks/useRoleDashboard';
import './css/Sidebar.css';

const Sidebar = ({ user, onLogout, isCollapsed, toggleSidebar }) => {
    const department = getRoleDepartment(user?.role);
    const dashboardType = useRoleDashboard(user?.role);

    const getNavGroups = () => {
        const mainItems = [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
            { name: 'Projects', icon: Target, path: '/projects' },
        ];

        const salesItems = [
            { name: 'Quotations', icon: FileText, path: '/quotations' },
            { name: 'Invoice', icon: Receipt, path: '/invoice' },
            { name: 'Clients', icon: Users, path: '/clients' },
        ];

        const operationsItems = [
            { name: 'Inventory', icon: Box, path: '/inventory' },
            { name: 'Purchase Orders', icon: ShoppingCart, path: '/purchase-orders' },
            { name: 'PO Inventory', icon: Package, path: '/po-inventory' },
            { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
        ];

        const systemItems = [
            { name: 'Staff', icon: Briefcase, path: '/staff' },
            { name: 'Reports', icon: BarChart, path: '/reports' },
            { name: 'Users', icon: Shield, path: '/users' },
            { name: 'Settings', icon: Settings, path: '/settings' },
        ];

        // Add role-specific items
        let roleSpecificItems = [];
        
        if (dashboardType === 'design_manager') {
            roleSpecificItems = [
                { name: 'Design Overview', icon: Palette, path: '/' },
                { name: 'Material Requests', icon: Package, path: '/material-review' },
            ];
        } else if (dashboardType === 'procurement_manager') {
            roleSpecificItems = [
                { name: 'Vendors', icon: Building2, path: '/?tab=vendors' },
                { name: 'Material Requests', icon: Package, path: '/?tab=requests' },
            ];
        } else if (dashboardType === 'production_manager') {
            roleSpecificItems = [
                { name: 'Production Pipeline', icon: Wrench, path: '/' },
                { name: 'Checklists', icon: ClipboardCheck, path: '/checklists' },
            ];
        } else if (dashboardType === 'accounts_manager') {
            roleSpecificItems = [
                { name: 'Expenses', icon: DollarSign, path: '/expenses' },
                { name: 'Payments', icon: Receipt, path: '/payments' },
            ];
        }

        let filteredMain = [...mainItems];
        if (roleSpecificItems.length > 0) {
            // Replace 'Dashboard' with role-specific overview
            filteredMain[0] = roleSpecificItems[0];
            
            // Add other role-specific items after Dashboard
            if (roleSpecificItems.length > 1) {
                // Insert after dashboard
                filteredMain.splice(1, 0, ...roleSpecificItems.slice(1));
            }
        }

        const groups = [
            { title: "Main", items: filteredMain },
            { title: "Sales", items: salesItems },
            { title: "Operations", items: operationsItems },
            { title: "System", items: systemItems }
        ];

        // Filter groups based on role/department if not a Super Admin
        const roleLower = user?.role?.toLowerCase() || '';
        const isSuperAdmin = roleLower === 'super admin' || roleLower === 'admin';

        if (isSuperAdmin) return groups;

        // Departmet-based filtering
        return groups.map(group => {
            const filteredItems = group.items.filter(item => {
                const path = item.path.toLowerCase();
                
                // Dashboard is for everyone
                if (path === '/' || path === '/projects') return true;

                if (roleLower.includes('design')) {
                    return ['/quotations', '/clients', '/inventory', '/tasks', '/material-review'].includes(path);
                }
                if (roleLower.includes('procurement')) {
                    return ['/inventory', '/purchase-orders', '/po-inventory', '/tasks'].includes(path);
                }
                if (roleLower.includes('production')) {
                    return ['/tasks', '/inventory', '/projects'].includes(path);
                }
                if (roleLower.includes('accounts')) {
                    return ['/invoice', '/reports', '/clients', '/projects'].includes(path);
                }
                if (roleLower === 'manager') {
                    return ['/quotations', '/clients', '/tasks', '/projects', '/reports'].includes(path);
                }

                return true; // Default
            });
            return { ...group, items: filteredItems };
        }).filter(group => group.items.length > 0);
    };

    const navGroups = getNavGroups();

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${BASE_IMAGE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const userInitials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : '?';

    return (
        <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''} ${department?.toLowerCase()}`} data-lenis-prevent>
            <div className="sidebar-header">
                <div className="brand-wrapper">
                    <h1 className="brand-title">Interior Design</h1>
                    <p className="brand-subtitle">
                        {department} Dashboard
                    </p>
                </div>
                <button className="btn-toggle-sidebar" onClick={toggleSidebar} title="Toggle Sidebar">
                    <Menu size={20} />
                </button>
            </div>

            <nav className="sidebar-nav">
                {navGroups.map((group) => (
                    <div key={group.title} className="nav-group">
                        <h3 className="nav-group-title">{group.title}</h3>
                        <ul className="nav-list">
                            {group.items.map((item) => (
                                <li key={item.name} className="nav-item">
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `nav-link ${isActive ? 'active' : ''}`
                                        }
                                    >
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
                {user && (
                    <div className="footer-user-info">
                        <div className="footer-avatar">
                            {user.avatar ? (
                                <img src={getImageUrl(user.avatar)} alt="Avatar" />
                            ) : (
                                userInitials
                            )}
                        </div>
                        <div className="footer-details">
                            <p className="footer-name">{user.fullName}</p>
                            <p className="footer-role">{user.role}</p>
                        </div>
                    </div>
                )}
                <button className="btn-logout-icon" onClick={onLogout} title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
