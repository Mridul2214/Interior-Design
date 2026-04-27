import React from 'react';
import { useRoleDashboard } from '../../hooks/useRoleDashboard';
import DesignManagerDashboard from '../Designing/Manager/DesignManagerDashboard';
import DesignStaffDashboard from '../Designing/Staff/DesignStaffDashboard';
import ProcurementManagerDashboard from '../Procurement/Manager/ProcurementManagerDashboard';
import ProcurementStaffDashboard from '../Procurement/Staff/ProcurementStaffDashboard';
import AdminDashboard from '../AdminPanel/Dashboard';
import StaffDashboard from '../StaffPanel/StaffDashboard';

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
        case 'staff':
            return <StaffDashboard user={user} onLogout={onLogout} />;
        case 'admin':
        default:
            return <AdminDashboard user={user} onLogout={onLogout} />;
    }
};

export default RoleDashboard;
