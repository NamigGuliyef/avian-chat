import { useAuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
    ChevronLeft,
    ChevronRight,
    FolderKanban,
    LayoutDashboard,
    LogOut
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const PartnerSidebar: React.FC = () => {
    const { logout, session } = useAuthContext();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            path: "/partner/dashboard",
        },
        // {
        //     title: "Layihələr",
        //     icon: FolderKanban,
        //     path: "/partner/projects",
        // },
        {
            title: "Hesabatlar",
            icon: FolderKanban,
            path: "/partner/reports",
        }
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside
            className={cn(
                "relative flex flex-col border-r bg-white transition-all duration-300",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex h-16 items-center justify-between px-6">
                {!isCollapsed && (
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Avian Partner
                    </span>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-500"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 space-y-2 p-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all group",
                            isActive(item.path)
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                        )}
                    >
                        <item.icon size={20} className={cn(
                            isActive(item.path) ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                        )} />
                        {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t">
                <div className={cn("flex items-center gap-3 mb-4", isCollapsed && "justify-center")}>
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                        {session.user?.name?.[0].toUpperCase()}
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{session.user?.name} {session.user?.surname}</p>
                            <p className="text-xs text-slate-500 truncate">{session.user?.role}</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={logout}
                    className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all",
                        isCollapsed && "justify-center"
                    )}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span>Çıxış</span>}
                </button>
            </div>
        </aside>
    );
};

export default PartnerSidebar;
