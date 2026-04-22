import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import DesigningManagerSidebar from '../Designing/Manager/ManagerSidebar';
import ProcurementManagerSidebar from '../Procurement/Manager/ManagerSidebar';
import ProductionManagerSidebar from '../Production/Manager/ManagerSidebar';
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
        if (department === 'Design') return <DesigningManagerSidebar {...props} />;
        if (department === 'Procurement') return <ProcurementManagerSidebar {...props} />;
        if (department === 'Production') return <ProductionManagerSidebar {...props} />;
        return <Sidebar {...props} />;
    };


    return (
        <div className={`layout-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            {renderSidebar()}
            <main className="main-content">
                <Header user={user} />
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
