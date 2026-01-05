// components/admin/AdminSidebar.tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    BarChart3,
    Bot,
    Building2,
    ChevronLeft,
    ChevronRight,
    FileText,
    FolderKanban,
    LogOut,
    UserCog,
    Users,
    Columns
} from 'lucide-react';

type MenuItem = {
    id: string;
    label?: string;
    icon?: any;
    divider?: boolean;
};

type Props = {
    activeSection: string;
    sidebarCollapsed: boolean;
    currentUserEmail?: string;
    onToggleCollapse: () => void;
    onSelect: (id: string) => void;
    onLogout: () => void;
};

const menuItems = [
    { id: '/admin/companies', icon: Building2, label: 'Şirkətlər' },
    { id: '/admin/chatbots', icon: Bot, label: 'Chatbot-lar' },
    { divider: true },
    { id: '/admin/columns', icon: Columns, label: 'Sütunlar' },
    // { id: '/admin/supervisors', icon: UserCog, label: 'Supervayzerlər' },
    { id: '/admin/users', icon: Users, label: 'Userlər' },
    { divider: true },
    { id: '/admin/reports', icon: BarChart3, label: 'Hesabatlar' },
    { id: '/admin/logs', icon: FileText, label: 'Log-lar' },
];

const AdminSidebar: React.FC<Props> = ({
    activeSection,
    sidebarCollapsed,
    currentUserEmail,
    onToggleCollapse,
    onSelect,
    onLogout
}) => {
    return (
        <div
            className={cn(
                'bg-card border-r border-border flex flex-col transition-all duration-300',
                sidebarCollapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                            {currentUserEmail}
                        </p>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className={cn(sidebarCollapsed && 'mx-auto')}
                >
                    {sidebarCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    if (item.divider) {
                        return (
                            <div key={item.id} className="h-px bg-border my-3" />
                        );
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                                sidebarCollapsed && 'justify-center',
                                activeSection === item.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                            title={sidebarCollapsed ? item.label : undefined}
                        >
                            {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                            {!sidebarCollapsed && item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-2 border-t border-border">
                <Button
                    variant="ghost"
                    className={cn(
                        'w-full gap-3',
                        sidebarCollapsed ? 'justify-center px-0' : 'justify-start'
                    )}
                    onClick={onLogout}
                    title={sidebarCollapsed ? 'Çıxış' : undefined}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!sidebarCollapsed && 'Çıxış'}
                </Button>
            </div>
        </div>
    );
};

export default AdminSidebar;
