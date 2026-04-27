import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import DeptSidebar from '../common/DeptSidebar';
import Header from './Header';
import { getRoleDepartment } from '../../hooks/useRoleDashboard';
import './css/Layout.css';

const Layout = ({ user, onLogout }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const location = useLocation();
    const department = getRoleDepartment(user?.role);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const renderSidebar = () => {
        const props = { user, onLogout, isCollapsed, toggleSidebar };
        if (department === 'Design' || department === 'Procurement' || department === 'Production') {
            return <DeptSidebar role={user?.role} {...props} />;
        }
        return <Sidebar {...props} />;
    };


    return (
        <div className={`layout-container ${isCollapsed ? 'sidebar-collapsed' : ''} ${department?.toLowerCase()}-layout`}>
            {renderSidebar()}
            <main className="main-content">
                <Header user={user} />
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
