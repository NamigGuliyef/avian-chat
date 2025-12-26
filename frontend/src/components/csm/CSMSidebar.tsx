import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardCheck, 
  ListTodo, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Phone,
  Users,
  Settings,
  BarChart3,
  Workflow
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserRole } from '@/types/csm';

interface MenuItem {
  id: string;
  icon: React.ElementType;
  label: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['agent', 'supervisor', 'admin'] },
  { id: 'omnichannel', icon: Inbox, label: 'Omnichannel', roles: ['agent', 'supervisor', 'admin'] },
  { id: 'telesales', icon: Phone, label: 'Telesales', roles: ['agent', 'supervisor', 'admin'] },
  { id: 'knowledge', icon: BookOpen, label: 'Knowledge Base', roles: ['agent', 'supervisor', 'admin'] },
  { id: 'qa', icon: ClipboardCheck, label: 'QA Results', roles: ['agent', 'supervisor', 'admin'] },
  { id: 'tasks', icon: ListTodo, label: 'Tasks', roles: ['agent', 'supervisor', 'admin'] },
  { id: 'meetings', icon: Calendar, label: 'Meetings', roles: ['agent', 'supervisor', 'admin'] },
];

const supervisorItems: MenuItem[] = [
  { id: 'agents', icon: Users, label: 'Agentlər', roles: ['supervisor', 'admin'] },
  { id: 'reports', icon: BarChart3, label: 'Reports', roles: ['supervisor', 'admin'] },
  { id: 'workflow', icon: Workflow, label: 'Workflow', roles: ['supervisor', 'admin'] },
  { id: 'settings', icon: Settings, label: 'Parametrlər', roles: ['admin'] },
];

interface CSMSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: UserRole;
}

const CSMSidebar: React.FC<CSMSidebarProps> = ({
  activeSection,
  onSectionChange,
  userRole,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));
  const filteredSupervisorItems = supervisorItems.filter(item => item.roles.includes(userRole));

  return (
    <TooltipProvider>
      <aside 
        className={cn(
          "bg-sidebar-background border-r border-sidebar-border flex flex-col transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[280px]"
        )}
      >
        {/* Collapse Toggle */}
        <div className="p-3 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {filteredMenuItems.map((item) => (
            <Tooltip key={item.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    activeSection === item.id 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    collapsed && "justify-center px-0"
                  )}
                  onClick={() => onSectionChange(item.id)}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}

          {/* Supervisor/Admin Section */}
          {filteredSupervisorItems.length > 0 && (
            <>
              <div className="h-px bg-sidebar-border my-4" />
              {!collapsed && (
                <p className="text-xs text-sidebar-foreground/50 uppercase tracking-wider px-3 mb-2">
                  İdarəetmə
                </p>
              )}
              {filteredSupervisorItems.map((item) => (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-10",
                        activeSection === item.id 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                        collapsed && "justify-center px-0"
                      )}
                      onClick={() => onSectionChange(item.id)}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </>
          )}
        </nav>
      </aside>
    </TooltipProvider>
  );
};

export default CSMSidebar;
