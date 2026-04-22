import { useMemo } from 'react';

export const useRoleDashboard = (role) => {
    return useMemo(() => {
        if (!role) return 'default';

        const roleLower = role.toLowerCase();

        // Check for specific department managers (not general admin)
        if (roleLower === 'design manager') return 'design_manager';
        if (roleLower === 'design staff') return 'design_staff';
        if (roleLower === 'procurement manager') return 'procurement_manager';
        if (roleLower === 'procurement staff') return 'procurement_staff';
        if (roleLower === 'production manager') return 'production_manager';
        if (roleLower === 'production staff') return 'production_staff';
        if (roleLower === 'accounts manager') return 'accounts_manager';
        if (roleLower === 'accounts staff') return 'accounts_staff';

        // General roles
        if (roleLower === 'super admin' || roleLower === 'admin' || roleLower === 'manager') {
            return 'admin';
        }

        if (roleLower === 'staff') {
            return 'staff';
        }

        return 'default';
    }, [role]);
};

export const getRolePermissions = (role) => {
    const permissions = {
        design_manager: {
            canApproveQuotations: true,
            canAssignTasks: true,
            canManageDesign: true,
            canTagMaterials: true,
            canMoveToProcurement: true,
            canViewBudget: true,
            canManageTeam: true
        },
        design_staff: {
            canCreateQuotations: true,
            canUploadDrawings: true,
            canTagMaterials: true,
            canUpdateTasks: true,
            canViewAssignedProjects: true
        },
        procurement_manager: {
            canCompareVendors: true,
            canApprovePO: true,
            canManageVendors: true,
            canViewBudget: true,
            canMoveToProduction: true,
            canManageTeam: true
        },
        procurement_staff: {
            canCompareVendors: true,
            canCreatePO: true,
            canViewMaterialRequests: true,
            canMarkReceived: true
        },
        production_manager: {
            canAssignTasks: true,
            canManageProduction: true,
            canMonitorChecklist: true,
            canResolveIssues: true,
            canMoveToCompleted: true,
            canManageTeam: true
        },
        production_staff: {
            canUpdateTasks: true,
            canUploadPhotos: true,
            canReportIssues: true,
            canUpdateChecklist: true,
            canViewAssignedTasks: true
        },
        accounts_manager: {
            canCreateInvoices: true,
            canRecordPayments: true,
            canManageExpenses: true,
            canViewFinancials: true,
            canGenerateReports: true,
            canManageTeam: true
        },
        accounts_staff: {
            canRecordPayments: true,
            canAddExpenses: true,
            canViewInvoices: true,
            canGenerateReceipts: true
        },
        admin: {
            canApproveQuotations: true,
            canAssignTasks: true,
            canManageDesign: true,
            canCompareVendors: true,
            canApprovePO: true,
            canManageProduction: true,
            canCreateInvoices: true,
            canRecordPayments: true,
            canViewBudget: true,
            canManageTeam: true,
            canManageUsers: true
        },
        default: {
            canViewAssignedTasks: true,
            canUpdateOwnTasks: true
        }
    };

    return permissions[role] || permissions.default;
};

export const getRoleDepartment = (role) => {
    if (!role) return 'General';
    
    const roleLower = role.toLowerCase();
    
    if (roleLower === 'design manager' || roleLower === 'design staff') return 'Design';
    if (roleLower === 'procurement manager' || roleLower === 'procurement staff') return 'Procurement';
    if (roleLower === 'production manager' || roleLower === 'production staff') return 'Production';
    if (roleLower === 'accounts manager' || roleLower === 'accounts staff') return 'Accounts';
    if (roleLower === 'sales manager' || roleLower === 'sales staff') return 'Sales';
    
    return 'Admin';
};

// Check if user is a department manager (goes to Admin layout)
export const isDepartmentManager = (role) => {
    if (!role) return false;
    const roleLower = role.toLowerCase().replace(/\s+/g, '');
    return (
        roleLower === 'designmanager' ||
        roleLower === 'procurementmanager' ||
        roleLower === 'productionmanager' ||
        roleLower === 'accountsmanager'
    );
};

// Check if user is department staff (goes to Staff layout)
export const isDepartmentStaff = (role) => {
    if (!role) return false;
    const roleLower = role.toLowerCase().replace(/\s+/g, '');
    return (
        roleLower === 'designstaff' ||
        roleLower === 'procurementstaff' ||
        roleLower === 'productionstaff' ||
        roleLower === 'accountsstaff' ||
        roleLower === 'staff'
    );
};

// Check if user is super admin/admin (full access to Admin layout)
export const isSuperAdmin = (role) => {
    if (!role) return false;
    const roleLower = role.toLowerCase();
    return (
        roleLower === 'super admin' ||
        roleLower === 'admin' ||
        roleLower === 'manager'
    );
};

// Combined check for Admin layout access
export const isAdminLayout = (role) => {
    return isSuperAdmin(role) || isDepartmentManager(role);
};

// Check for Staff layout access
export const isStaffLayout = (role) => {
    return isDepartmentStaff(role);
};
