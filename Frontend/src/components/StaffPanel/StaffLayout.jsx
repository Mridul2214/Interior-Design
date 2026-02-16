import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import StaffSidebar from './StaffSidebar';
import './css/StaffLayout.css';

const StaffLayout = ({ user, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="staff-layout">
            <StaffSidebar
                user={user}
                onLogout={onLogout}
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            <main className="staff-main-content">
                <div className="content-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StaffLayout;
