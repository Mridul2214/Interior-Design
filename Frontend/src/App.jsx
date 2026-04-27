import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/AdminPanel/Layout';
import Dashboard from './components/AdminPanel/Dashboard';
import Quotations from './components/AdminPanel/Quotations';
import NewQuotation from './components/AdminPanel/NewQuotation';
import Inventory from './components/AdminPanel/Inventory';
import PurchaseOrders from './components/AdminPanel/PurchaseOrders';
import POInventory from './components/AdminPanel/POInventory';
import Clients from './components/AdminPanel/Clients';
import Staff from './components/AdminPanel/Staff';
import Tasks from './components/AdminPanel/Tasks';
import Reports from './components/AdminPanel/Reports';
import Settings from './components/AdminPanel/Settings';
import Users from './components/AdminPanel/Users';
import Invoice from './components/AdminPanel/Invoice';
import QuotationView from './components/AdminPanel/QuotationView';
import Projects from './components/AdminPanel/Projects';
import Login from './components/Login';

import ProductionDashboard from './components/Production/Manager/Dashboard';
import ProductionProjectsList from './components/Production/Manager/ProjectsList';
// import ProductionProjectDetail from './components/Production/Manager/ProjectDetail';
import ProductionTasksBoard from './components/Production/Manager/TasksBoard';
import ProductionTeamOverview from './components/Production/Manager/TeamOverview';
import ProductionApprovals from './components/Production/Manager/Approvals';

import EngineerDashboard from './components/Production/Engineer/EngineerDashboard';
import EngineerTasks from './components/Production/Engineer/EngineerTasks';
import EngineerProjects from './components/Production/Engineer/EngineerProjects';
import ProjectDetail from './components/Production/Engineer/ProjectDetail';
import TaskDetail from './components/Production/Engineer/TaskDetail';
import LeaveRequest from './components/Production/Engineer/LeaveRequest';

import SiteDashboard from './components/Production/Site/SiteDashboard';
import SiteTasks from './components/Production/Site/SiteTasks';
import SiteReports from './components/Production/Site/SiteReports';
import SiteLeave from './components/Production/Site/SiteLeave';

import StaffLayout from './components/StaffPanel/StaffLayout';
import StaffDashboard from './components/StaffPanel/StaffDashboard';
import SiteVisit from './components/StaffPanel/SiteVisit';
import StaffTasks from './components/StaffPanel/StaffTasks';
import StaffClients from './components/StaffPanel/StaffClients';
import StaffQuotations from './components/StaffPanel/StaffQuotations';

import RoleDashboard from './components/common/RoleDashboard';
import MaterialReviewHub from './components/Designing/Manager/MaterialReviewHub';
import { isAdminLayout, isStaffLayout, useRoleDashboard } from './hooks/useRoleDashboard';

import Lenis from 'lenis';
import { ToastProvider } from './context/ToastContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /* 
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);
    */

    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser) {
          setIsAuthenticated(true);
          setUser(parsedUser);
        }
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);

    return () => {
      // if (lenis) lenis.destroy();
      // cancelAnimationFrame(rafId);
    };
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#667eea'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const userRole = user?.role;
  // Project Engineers, Site Engineers, and Site Supervisors use the Admin Layout (with Engineer sidebar)
  const isProductionEngineer = ['Project Engineer', 'Site Engineer', 'Site Supervisor'].includes(userRole);
  const shouldUseAdminLayout = isAdminLayout(userRole) || isProductionEngineer;
  const shouldUseStaffLayout = isStaffLayout(userRole) && !isProductionEngineer;

  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Admin Layout - for Super Admin, Admin, Manager, and Department Managers */}
          {shouldUseAdminLayout && (
            <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
              <Route index element={<RoleDashboard user={user} onLogout={handleLogout} />} />
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

              {/* Production Management Routes (Project Manager) */}
              <Route path="production-management/dashboard" element={<ProductionDashboard />} />
              <Route path="production-management/projects" element={<ProductionProjectsList />} />
              {/* <Route path="production-management/projects/:id" element={<ProductionProjectDetail />} /> */}
              <Route path="production-management/tasks" element={<ProductionTasksBoard user={user} />} />
              <Route path="production-management/team" element={<ProductionTeamOverview />} />
              <Route path="production-management/approvals" element={<ProductionApprovals />} />

              {/* Engineer Routes (Project Engineer only) */}
              <Route path="engineer/dashboard" element={<EngineerDashboard user={user} />} />
              <Route path="engineer/projects" element={<EngineerProjects user={user} />} />
              <Route path="engineer/projects/:id" element={<ProjectDetail user={user} />} />
              <Route path="engineer/tasks" element={<EngineerTasks user={user} />} />
              <Route path="engineer/tasks/:id" element={<TaskDetail user={user} />} />
              <Route path="engineer/leave" element={<LeaveRequest user={user} />} />

              {/* Site Portal Routes (Site Engineer & Site Supervisor) */}
              <Route path="site/dashboard" element={<SiteDashboard user={user} />} />
              <Route path="site/tasks" element={<SiteTasks user={user} />} />
              <Route path="site/reports" element={<SiteReports user={user} />} />
              <Route path="site/leave" element={<SiteLeave user={user} />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          )}

          {/* Staff Layout - for Department Staff */}
          {shouldUseStaffLayout && (
            <Route path="/staff" element={<StaffLayout user={user} onLogout={handleLogout} />}>
              <Route index element={<Navigate to="/staff/dashboard" replace />} />
              <Route path="dashboard" element={<RoleDashboard user={user} onLogout={handleLogout} />} />
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

          {/* Fallback routing - Redirect unknown paths to appropriate dashboard */}
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
                <button onClick={handleLogout}>Logout</button>
              </div>
            )
          } />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
