import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuthContext } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

const AdminOutlet: React.FC = () => {
    const { isAuthenticated, session, logout } = useAuthContext();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    if (!isAuthenticated || session?.user?.role !== 'Admin') {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="flex h-screen bg-background">
            <AdminSidebar
                activeSection={location.pathname}
                sidebarCollapsed={sidebarCollapsed}
                currentUserEmail={session?.user?.email}
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
