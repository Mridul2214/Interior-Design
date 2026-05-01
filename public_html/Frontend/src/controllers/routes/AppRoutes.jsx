import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Controllers — Layouts
import Layout from '../layouts/AdminLayout';
import StaffLayout from '../layouts/StaffLayout';
import RoleDashboard from '../layouts/RoleDashboard';

// Views — Admin
import Quotations from '../../views/admin/Quotations';
import NewQuotation from '../../views/admin/NewQuotation';
import Inventory from '../../views/admin/Inventory';
import PurchaseOrders from '../../views/admin/PurchaseOrders';
import POInventory from '../../views/admin/POInventory';
import Clients from '../../views/admin/Clients';
import Staff from '../../views/admin/Staff';
import Tasks from '../../views/admin/Tasks';
import Reports from '../../views/admin/Reports';
import Settings from '../../views/admin/Settings';
import Users from '../../views/admin/Users';
import Invoice from '../../views/admin/Invoice';
import QuotationView from '../../views/admin/QuotationView';
import Projects from '../../views/admin/Projects';
import DesignApprovals from '../../views/admin/DesignApprovals';

// Views — Production Manager
import ProductionDashboard from '../../views/production/manager/Dashboard';
import ProductionProjectsList from '../../views/production/manager/ProjectsList';
import ProductionTasksBoard from '../../views/production/manager/TasksBoard';
import ProductionTeamOverview from '../../views/production/manager/TeamOverview';
import ProductionApprovals from '../../views/production/manager/Approvals';
import ProjectHandoff from '../../views/production/manager/ProjectHandoff';
import ProductionReports from '../../views/production/manager/ProductionReports';

// Views — Engineer
import EngineerDashboard from '../../views/production/engineer/EngineerDashboard';
import EngineerTasks from '../../views/production/engineer/EngineerTasks';
import EngineerProjects from '../../views/production/engineer/EngineerProjects';
import ProjectDetail from '../../views/production/engineer/ProjectDetail';
import TaskDetail from '../../views/production/engineer/TaskDetail';
import EngineerReports from '../../views/production/engineer/EngineerReports';
import LeaveRequest from '../../views/production/engineer/LeaveRequest';
import EngineerApprovals from '../../views/production/engineer/EngineerApprovals';

// Views — Site
import SiteDashboard from '../../views/production/site/SiteDashboard';
import SiteTasks from '../../views/production/site/SiteTasks';
import SiteReports from '../../views/production/site/SiteReports';
import SiteLeave from '../../views/production/site/SiteLeave';

// Views — Staff
import StaffDashboard from '../../views/staff/StaffDashboard';
import SiteVisit from '../../views/staff/SiteVisit';
import StaffTasks from '../../views/staff/StaffTasks';
import StaffClients from '../../views/staff/StaffClients';
import StaffQuotations from '../../views/staff/StaffQuotations';

// Views — Design
import MaterialReviewHub from '../../views/design/manager/MaterialReviewHub';

// Controllers — Hooks
import { isAdminLayout, isStaffLayout } from '../hooks/useRoleDashboard';

const AppRoutes = ({ user, onLogout }) => {
    const userRole = user?.role;
    const isProductionEngineer = ['Project Engineer', 'Site Engineer', 'Site Supervisor'].includes(userRole);
    const shouldUseAdminLayout = isAdminLayout(userRole) || isProductionEngineer;
    const shouldUseStaffLayout = isStaffLayout(userRole) && !isProductionEngineer;

    return (
        <Routes>
            {/* Admin Layout - for Super Admin, Admin, Manager, and Department Managers */}
            {shouldUseAdminLayout && (
                <Route path="/" element={<Layout user={user} onLogout={onLogout} />}>
                    <Route index element={<RoleDashboard user={user} onLogout={onLogout} />} />
                    <Route path="quotations" element={<Quotations user={user} />} />
                    <Route path="quotations/new" element={<NewQuotation />} />
                    <Route path="quotations/edit/:id" element={<NewQuotation isEdit={true} />} />
                    <Route path="quotations/view/:id" element={<QuotationView />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="purchase-orders" element={<PurchaseOrders />} />
                    <Route path="po-inventory" element={<POInventory />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="staff" element={<Staff />} />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="users" element={<Users />} />
                    <Route path="invoice" element={<Invoice />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projects/:id" element={<Projects />} />
                    <Route path="material-review" element={<MaterialReviewHub user={user} />} />
                    <Route path="approvals" element={<DesignApprovals />} />

                    {/* Production Management Routes (Project Manager) */}
                    <Route path="production-management/dashboard" element={<ProductionDashboard />} />
                    <Route path="production-management/handoff" element={<ProjectHandoff />} />
                    <Route path="production-management/projects" element={<ProductionProjectsList />} />
                    <Route path="production-management/tasks" element={<ProductionTasksBoard user={user} />} />
                    <Route path="production-management/team" element={<ProductionTeamOverview />} />
                    <Route path="production-management/approvals" element={<ProductionApprovals />} />
                    <Route path="production-management/reports" element={<ProductionReports />} />

                    {/* Engineer Routes (Project Engineer only) */}
                    <Route path="engineer/dashboard" element={<EngineerDashboard user={user} />} />
                    <Route path="engineer/projects" element={<EngineerProjects user={user} />} />
                    <Route path="engineer/projects/:id" element={<ProjectDetail user={user} />} />
                    <Route path="engineer/tasks" element={<EngineerTasks user={user} />} />
                    <Route path="engineer/tasks/:id" element={<TaskDetail user={user} />} />
                    <Route path="engineer/reports" element={<EngineerReports />} />
                    <Route path="engineer/leave" element={<LeaveRequest user={user} />} />
                    <Route path="engineer/approvals" element={<EngineerApprovals />} />

                    {/* Site Portal Routes (Site Engineer & Site Supervisor) */}
                    <Route path="site/dashboard" element={<SiteDashboard user={user} />} />
                    <Route path="site/projects" element={<EngineerProjects user={user} />} />
                    <Route path="site/projects/:id" element={<ProjectDetail user={user} />} />
                    <Route path="site/tasks" element={<SiteTasks user={user} />} />
                    <Route path="site/reports" element={<SiteReports user={user} />} />
                    <Route path="site/leave" element={<SiteLeave user={user} />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            )}

            {/* Staff Layout - for Department Staff */}
            {shouldUseStaffLayout && (
                <Route path="/staff" element={<StaffLayout user={user} onLogout={onLogout} />}>
                    <Route index element={<Navigate to="/staff/dashboard" replace />} />
                    <Route path="dashboard" element={<RoleDashboard user={user} onLogout={onLogout} />} />
                    <Route path="tasks" element={<StaffTasks user={user} />} />
                    <Route path="site-visits" element={<SiteVisit user={user} />} />
                    <Route path="clients" element={<StaffClients user={user} />} />
                    <Route path="quotations" element={<StaffQuotations user={user} />} />
                    <Route path="quotations/new" element={<NewQuotation isStaff={true} user={user} />} />
                    <Route path="quotations/edit/:id" element={<NewQuotation isStaff={true} isEdit={true} user={user} />} />
                    <Route path="quotations/view/:id" element={<QuotationView isStaff={true} />} />
                    <Route path="material-review" element={<MaterialReviewHub user={user} />} />
                    <Route path="*" element={<Navigate to="/staff/dashboard" replace />} />
                </Route>
            )}

            {/* Fallback routing */}
            <Route path="*" element={
                isProductionEngineer ? (
                    <Navigate to="/engineer/dashboard" replace />
                ) : shouldUseAdminLayout ? (
                    <Navigate to="/" replace />
                ) : shouldUseStaffLayout ? (
                    <Navigate to="/staff/dashboard" replace />
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <h2>No Dashboard Assigned</h2>
                        <p>User Role: {userRole || 'None'}</p>
                        <button onClick={onLogout}>Logout</button>
                    </div>
                )
            } />
        </Routes>
    );
};

export default AppRoutes;
