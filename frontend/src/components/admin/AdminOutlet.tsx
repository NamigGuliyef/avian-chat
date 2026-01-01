import { motion } from 'framer-motion';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useChat } from '@/contexts/ChatContext';
import React, { useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

const AdminOutlet: React.FC = () => {
    const { isAuthenticated, currentUser, logout } = useChat();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    if (!isAuthenticated || currentUser?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex h-screen bg-background">
            <AdminSidebar
                activeSection={location.pathname}
                sidebarCollapsed={sidebarCollapsed}
                currentUserEmail={currentUser.email}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                onSelect={(path) => navigate(path)}
                onLogout={logout}
            />

            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 overflow-auto p-6 space-y-4"
            >

                <Outlet />
            </motion.div>
        </div>
    );
};

export default AdminOutlet;
