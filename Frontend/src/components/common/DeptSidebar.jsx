/**
 * DeptSidebar.jsx — Unified Department Sidebar
 *
 * Single file that houses the sidebar UI and nav-item config for every
 * department role. Layout.jsx and StaffLayout.jsx both import from here.
 *
 * Props:
 *   role         {string}   - The user's role string (e.g. 'Design Manager')
 *   user         {object}   - User object ({ fullName, role, avatar })
 *   onLogout     {function} - Logout callback
 *   isCollapsed  {bool}     - Whether the sidebar is in collapsed/icon-only mode
 *   toggleSidebar{function} - Callback to toggle collapsed state
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Users, CheckSquare, Package, Send,
    ShoppingCart, Building2, Box, ClipboardCheck, Target,
    Wrench, Clock, Image, LogOut, Menu, Plus, CheckCircle,
    FolderOpen, CalendarOff
} from 'lucide-react';
import { BASE_IMAGE_URL } from '../../config/api';
import '../AdminPanel/css/Sidebar.css';

// ─────────────────────────────────────────────────────────────────────────────
// Nav-item config map — keyed by role string
// ─────────────────────────────────────────────────────────────────────────────
const NAV_CONFIG = {
    'Design Manager': {
        brandTitle:    'STUDIO DESIGN',
        brandSubtitle: 'CREATIVE MANAGEMENT',
        sidebarClass:  'design',
        basePath:      '/',
        items: [
            { name: 'Dashboard',         icon: LayoutDashboard, path: '/?tab=dashboard',              tab: 'dashboard' },
            { name: 'Quotations',        icon: FileText,        path: '/quotations',                  tab: null },
            { name: 'Project Status',    icon: Clock,           path: '/?tab=pipeline',               tab: 'pipeline' },
            { name: 'Project Details',   icon: FileText,        path: '/?tab=project_details',        tab: 'project_details' },
            { name: 'Task Assignment',   icon: CheckSquare,     path: '/?tab=tasks',                   tab: 'tasks' },
            { name: 'Staff Overview',    icon: Users,           path: '/?tab=staff_overview',          tab: 'staff_overview' },
            { name: 'Material Hub',      icon: Package,         path: '/material-review',              tab: null },
        ],
    },

    'Design Staff': {
        brandTitle:   'Design Staff',
        sidebarClass: 'design',
        basePath:     '/staff/dashboard',
        items: [
            { name: 'My Dashboard',    icon: LayoutDashboard, path: '/staff/dashboard?tab=overview',    tab: 'overview' },
            { name: 'My Tasks',        icon: CheckSquare,     path: '/staff/dashboard?tab=tasks',        tab: 'tasks' },
            { name: 'Revisions',       icon: Target,          path: '/staff/dashboard?tab=revisions',    tab: 'revisions' },
            { name: 'Submitted Tasks', icon: CheckSquare,     path: '/staff/dashboard?tab=submissions',  tab: 'submissions' },
        ],
    },

    'Procurement Manager': {
        brandTitle:   'Procurement Manager',
        sidebarClass: 'procurement',
        basePath:     '/',
        items: [
            { name: 'Dashboard',         icon: LayoutDashboard, path: '/?tab=overview',    tab: 'overview' },
            { name: 'Design Handoffs',   icon: Plus,            path: '/?tab=handoffs',    tab: 'handoffs' },
            { name: 'Material Requests', icon: Package,         path: '/?tab=requests',    tab: 'requests' },
            { name: 'Assignments',       icon: CheckSquare,     path: '/?tab=assignments', tab: 'assignments' },
            { name: 'Vendors',           icon: Building2,       path: '/?tab=vendors',     tab: 'vendors' },
            { name: 'Completed & Handoff', icon: CheckCircle,   path: '/?tab=completed',   tab: 'completed' },
        ],
    },

    'Procurement Staff': {
        brandTitle:   'Procurement Staff',
        sidebarClass: 'procurement',
        basePath:     '/staff/dashboard',
        items: [
            { name: 'My Dashboard',     icon: LayoutDashboard, path: '/staff/dashboard?tab=overview', tab: 'overview' },
            { name: 'Sourcing Hub',     icon: ShoppingCart,    path: '/staff/dashboard?tab=sourcing',  tab: 'sourcing' },
            { name: 'My Tasks',         icon: CheckSquare,     path: '/staff/dashboard?tab=tasks',     tab: 'tasks' },
            { name: 'Purchase History', icon: Package,         path: '/staff/dashboard?tab=history',   tab: 'history' },
            { name: 'Vendors',          icon: Box,             path: '/staff/dashboard?tab=vendors',   tab: 'vendors' },
        ],
    },

    'Project Manager': {
        brandTitle:   'Project Manager',
        sidebarClass: 'production',
        basePath:     '/production-management/dashboard',
        items: [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/production-management/dashboard' },
            { name: 'Projects',  icon: Target,          path: '/production-management/projects' },
            { name: 'Tasks',     icon: CheckSquare,     path: '/production-management/tasks' },
            { name: 'Team',      icon: Users,           path: '/production-management/team' },
            { name: 'Approvals', icon: ClipboardCheck,  path: '/production-management/approvals' },
        ],
    },

    'Project Engineer': {
        brandTitle:   'Engineer Portal',
        sidebarClass: 'production',
        basePath:     '/engineer/dashboard',
        items: [
            { name: 'Dashboard',     icon: LayoutDashboard, path: '/engineer/dashboard' },
            { name: 'Projects',      icon: FolderOpen,      path: '/engineer/projects' },
            { name: 'My Tasks',      icon: CheckSquare,     path: '/engineer/tasks' },
            { name: 'Leave Request', icon: CalendarOff,     path: '/engineer/leave' },
        ],
    },

    'Site Engineer': {
        brandTitle:   'Site Portal',
        sidebarClass: 'production',
        basePath:     '/site/dashboard',
        items: [
            { name: 'Dashboard',     icon: LayoutDashboard, path: '/site/dashboard' },
            { name: 'Tasks',         icon: CheckSquare,     path: '/site/tasks' },
            { name: 'Reports',       icon: FileText,        path: '/site/reports' },
            { name: 'Leave Request', icon: CalendarOff,     path: '/site/leave' },
        ],
    },

    'Site Supervisor': {
        brandTitle:   'Site Portal',
        sidebarClass: 'production',
        basePath:     '/site/dashboard',
        items: [
            { name: 'Dashboard',     icon: LayoutDashboard, path: '/site/dashboard' },
            { name: 'Tasks',         icon: CheckSquare,     path: '/site/tasks' },
            { name: 'Reports',       icon: FileText,        path: '/site/reports' },
            { name: 'Leave Request', icon: CalendarOff,     path: '/site/leave' },
        ],
    },

    'Production Staff': {
        brandTitle:   'Production Staff',
        sidebarClass: 'production',
        basePath:     '/staff/dashboard',
        items: [
            { name: 'My Dashboard',  icon: LayoutDashboard, path: '/staff/dashboard' },
            { name: 'Task Tracker',  icon: CheckSquare,     path: '/staff/tasks' },
            { name: 'Site Inventory', icon: Box,            path: '/inventory' },
            { name: 'Checklists',    icon: ClipboardCheck,  path: '/checklists' },
        ],
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared helper — resolves avatar URL
// ─────────────────────────────────────────────────────────────────────────────
const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_IMAGE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// DeptSidebar — the single exported component
// ─────────────────────────────────────────────────────────────────────────────
const DeptSidebar = ({ role, user, onLogout, isCollapsed, toggleSidebar }) => {
    const location   = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const currentTab   = searchParams.get('tab') || 'overview';

    const config = NAV_CONFIG[role];

    // Graceful fallback — unknown role renders nothing
    if (!config) return null;

    const { brandTitle, brandSubtitle, sidebarClass, basePath, items } = config;

    const userInitials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : '?';

    return (
        <div className={`sidebar-container ${sidebarClass} ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header" style={role === 'Design Manager' ? { borderBottom: '1px solid rgba(0,0,0,0.05)' } : {}}>
                <div className="brand-wrapper">
                    {role === 'Design Manager' ? (
                        <>
                            <h1 className="brand-title" style={{ fontWeight: 300, letterSpacing: '3px', fontSize: '1rem' }}>
                                STUDIO <span style={{ fontWeight: 800 }}>DESIGN</span>
                            </h1>
                            <p className="brand-subtitle" style={{ fontSize: '0.6rem', color: '#c4a484', letterSpacing: '1px' }}>
                                CREATIVE MANAGEMENT
                            </p>
                        </>
                    ) : (
                        <h1 className="brand-title">{brandTitle}</h1>
                    )}
                </div>
                <button className="btn-toggle-sidebar" onClick={toggleSidebar}>
                    <Menu size={20} />
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {items.map((item) => (
                        <li key={item.name} className="nav-item">
                            <NavLink
                                to={item.path}
                                className={() => {
                                    const isTabActive = item.tab
                                        ? currentTab === item.tab && location.pathname === basePath
                                        : location.pathname === item.path;
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

export default DeptSidebar;
