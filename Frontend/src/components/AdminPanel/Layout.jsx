import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AIChat from './AIChat';
import './css/Layout.css';

const Layout = ({ user, onLogout }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`layout-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar
                user={user}
                onLogout={onLogout}
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
            />
            <main className="main-content">
                <Header user={user} />
                <Outlet />
            </main>
            <AIChat />
        </div>
    );
};

export default Layout;
