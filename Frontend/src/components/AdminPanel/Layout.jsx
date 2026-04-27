import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import DeptSidebar from '../common/DeptSidebar';
import ProductionManagerSidebar from '../Production/Manager/ManagerSidebar';
import EngineerSidebar from '../Production/Engineer/EngineerSidebar';
import SiteEngineerSidebar from '../Production/Site/SiteEngineerSidebar';
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
        if (department === 'Design' || department === 'Procurement') {
            return <DeptSidebar role={user?.role} {...props} />;
        }
        if (department === 'Production') {
            if (user?.role === 'Project Manager')  return <ProductionManagerSidebar {...props} />;
            if (user?.role === 'Project Engineer') return <EngineerSidebar {...props} />;
            // Site Engineer & Site Supervisor get dedicated sidebar
            return <SiteEngineerSidebar {...props} />;
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
