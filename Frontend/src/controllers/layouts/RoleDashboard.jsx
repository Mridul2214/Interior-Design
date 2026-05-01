import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRoleDashboard } from '../hooks/useRoleDashboard';
import DesignManagerDashboard from '../../views/design/manager/DesignManagerDashboard';
import DesignStaffDashboard from '../../views/design/staff/DesignStaffDashboard';
import ProcurementManagerDashboard from '../../views/procurement/manager/ProcurementManagerDashboard';
import ProcurementStaffDashboard from '../../views/procurement/staff/ProcurementStaffDashboard';
import AdminDashboard from '../../views/admin/Dashboard';
import StaffDashboard from '../../views/staff/StaffDashboard';

const RoleDashboard = ({ user, onLogout }) => {
    const dashboardType = useRoleDashboard(user?.role);

    switch (dashboardType) {
        case 'design_manager':
            return <DesignManagerDashboard user={user} onLogout={onLogout} />;
        case 'design_staff':
            return <DesignStaffDashboard user={user} onLogout={onLogout} />;
        case 'procurement_manager':
            return <ProcurementManagerDashboard user={user} onLogout={onLogout} />;
        case 'procurement_staff':
            return <ProcurementStaffDashboard user={user} onLogout={onLogout} />;
        case 'project_manager':
            return <Navigate to="/production-management/dashboard" replace />;
        case 'project_engineer':
            return <Navigate to="/engineer/dashboard" replace />;
        case 'site_engineer':
        case 'site_supervisor':
            return <Navigate to="/site/dashboard" replace />;
        case 'staff':
            return <StaffDashboard user={user} onLogout={onLogout} />;
        case 'admin':
        default:
            return <AdminDashboard user={user} onLogout={onLogout} />;
    }
};

export default RoleDashboard;
