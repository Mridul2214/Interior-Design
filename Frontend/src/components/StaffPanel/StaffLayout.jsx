import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import StaffHomeSidebar from './StaffSidebar';
import DesigningStaffSidebar from '../Designing/Staff/StaffSidebar';
import ProcurementStaffSidebar from '../Procurement/Staff/StaffSidebar';
import ProductionStaffSidebar from '../Production/Staff/StaffSidebar';
import StaffHeader from './StaffHeader';
import { getRoleDepartment } from '../../hooks/useRoleDashboard';
import './css/StaffLayout.css';

const StaffLayout = ({ user, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const department = getRoleDepartment(user?.role);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const getPageDetails = () => {
        const path = location.pathname;
        if (path === '/staff/dashboard') return { title: 'Dashboard', subtitle: 'Welcome back! Here\'s your task overview.' };
        if (path === '/staff/tasks') return { title: 'My Tasks', subtitle: 'View and manage your assigned tasks.' };
        if (path === '/staff/site-visits') return { title: 'Site Visits', subtitle: 'Document and track your site visit logs.' };
        if (path === '/staff/clients') return { title: 'Clients', subtitle: 'View your assigned client details.' };
        if (path === '/staff/quotations') return { title: 'Quotations', subtitle: 'View project quotations assigned to you.' };
        return { title: '', subtitle: '' };
    };

    const { title, subtitle } = getPageDetails();

    const renderSidebar = () => {
        const props = { user, onLogout, isCollapsed: !isSidebarOpen, toggleSidebar };
        if (department === 'Design') return <DesigningStaffSidebar {...props} />;
        if (department === 'Procurement') return <ProcurementStaffSidebar {...props} />;
        if (department === 'Production') return <ProductionStaffSidebar {...props} />;
        return <StaffHomeSidebar user={user} onLogout={onLogout} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />;
    };

    return (
        <div className="staff-layout">
            {renderSidebar()}

            <main className="staff-main-content">
                <div className="staff-header-container">
                    <StaffHeader title={title} subtitle={subtitle} />
                </div>
                <div className="content-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StaffLayout;
