import {
    mockExcels,
    mockSheets
} from "@/data/mockData";
import { Excel, Sheet } from "@/types/crm";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SupervisorSidebar from "./SupervisorSidebar";

export const SupervisorContext = React.createContext<any>(null);

const SupervisorOutlet: React.FC = () => {
    // if (!currentSupervisor || currentSupervisor.role !== "supervayzer") {
    //     return <Navigate to="/login" replace />;
    // }
    const [excels, setExcels] = useState<Excel[]>(mockExcels);
    const [sheets, setSheets] = useState<Sheet[]>(mockSheets);

    return (
        <SupervisorContext.Provider
            value={{
                // currentSupervisor,
                excels,
                setExcels,
                sheets,
                setSheets,
            }}
        >
            <div className="flex h-screen bg-background">
                <SupervisorSidebar />

                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </SupervisorContext.Provider>
    );
};

export default SupervisorOutlet;
