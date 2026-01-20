import { useAuthContext } from "@/contexts/AuthContext";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import SupervisorSidebar from "./SupervisorSidebar";

const SupervisorOutlet: React.FC = () => {
    const { session, isAuthenticated } = useAuthContext();

    if (!isAuthenticated || session?.user?.role !== 'Supervisor') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex h-screen bg-background">
            <SupervisorSidebar />
            <main className="flex-1 overflow-auto p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default SupervisorOutlet;
