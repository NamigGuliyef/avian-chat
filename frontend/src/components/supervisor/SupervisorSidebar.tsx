import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Columns,
    FileSpreadsheet,
    LogOut,
    UserIcon
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const menuItems = [
    { id: 'dashboard', icon: UserIcon, label: 'Dashboard' },
    { id: 'projects', icon: FileSpreadsheet, label: 'Layihələrim' },
    { id: 'columns', icon: Columns, label: 'Layihə sütunları' },
    { id: 'reports', icon: BarChart3, label: 'Hesabatlar' },
];

const SupervisorSidebar = () => {
    const { session, logout } = useAuthContext();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');
    const navigate = useNavigate()

    return (
        <div className={cn("bg-card border-r border-border flex flex-col transition-all duration-300", sidebarCollapsed ? "w-16" : "w-64")}>
            <div className="p-4 border-b border-border flex items-center justify-between">
                {!sidebarCollapsed && <div><h1 className="text-xl font-bold text-primary">Supervayzer</h1>
                    <p className="text-xs text-muted-foreground mt-1">{session?.user?.email}</p>
                </div>}
                <Button variant="ghost" size="icon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className={cn(sidebarCollapsed && "mx-auto")}>
                    {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <button key={item.id} onClick={() => {
                        setActiveSection(item.id);
                        navigate(item.id)
                    }}
                        className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors", sidebarCollapsed && "justify-center",
                            activeSection === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
                        title={sidebarCollapsed ? item.label : undefined}>
                        <item.icon className="h-5 w-5 shrink-0" />{!sidebarCollapsed && item.label}
                    </button>
                ))}
            </nav>
            <div className="p-2 border-t border-border">
                <Button variant="ghost" className={cn("w-full gap-3", sidebarCollapsed ? "justify-center px-0" : "justify-start")} onClick={logout}>
                    <LogOut className="h-5 w-5 shrink-0" />{!sidebarCollapsed && "Çıxış"}
                </Button>
            </div>
        </div>
    );
};

export default SupervisorSidebar;
