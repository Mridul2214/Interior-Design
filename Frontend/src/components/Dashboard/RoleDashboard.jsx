import React from 'react';
import { useRoleDashboard } from '../../hooks/useRoleDashboard';
import DesignManagerDashboard from '../Designing/Manager/DesignManagerDashboard';
import DesignStaffDashboard from '../Designing/Staff/DesignStaffDashboard';
import ProcurementManagerDashboard from '../Procurement/Manager/ProcurementManagerDashboard';
import ProcurementStaffDashboard from '../Procurement/Staff/ProcurementStaffDashboard';
import ProductionManagerDashboard from '../Production/Manager/ProductionManagerDashboard';
import ProductionStaffDashboard from '../Production/Staff/ProductionStaffDashboard';
import AccountsManagerDashboard from './AccountsManagerDashboard';
import AccountsStaffDashboard from './AccountsStaffDashboard';
import WorkflowDashboard from './WorkflowDashboard';
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
            return <ProcurementManagerDashboard user={user} onLogout={onLogout} />;
        case 'production_manager':
            return <ProductionManagerDashboard user={user} onLogout={onLogout} />;
        case 'production_staff':
            return <ProductionStaffDashboard user={user} onLogout={onLogout} />;
        case 'accounts_manager':
            return <AccountsManagerDashboard user={user} onLogout={onLogout} />;
        case 'accounts_staff':
            return <AccountsStaffDashboard user={user} onLogout={onLogout} />;
        case 'staff':
            return <StaffDashboard user={user} onLogout={onLogout} />;
        case 'admin':
            return <WorkflowDashboard user={user} onLogout={onLogout} />;
        default:
            return <WorkflowDashboard user={user} onLogout={onLogout} />;
    }
};

export default RoleDashboard;
