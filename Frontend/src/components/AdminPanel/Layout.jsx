import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AIChat from './AIChat';
import './css/Layout.css';

const Layout = ({ user, onLogout }) => {
    return (
        <div className="layout-container">
            <Sidebar user={user} onLogout={onLogout} />
            <main className="main-content">
                <Header user={user} />
                <Outlet />
            </main>
            <AIChat />
        </div>
    );
};

export default Layout;
