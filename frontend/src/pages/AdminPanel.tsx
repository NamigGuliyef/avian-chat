import ChatbotsManagement from '@/components/admin/ChatbotsManagement';
import CompanyDetail from '@/components/admin/CompanyDetail';
import CompanyManagement from '@/components/admin/CompanyManagement';
import LeadManagement from '@/components/admin/LeadManagement';
import { OperationLogs } from '@/components/admin/OperationLogs';
import ReportsPage from '@/components/admin/ReportsPage';
import SupervisorManagement from '@/components/admin/SupervisorManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';
import { mockCrmUsers, mockOperationLogs } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Company } from '@/types/chat';
import { User as CrmUser } from '@/types/crm';
import { ICompany } from '@/types/types';
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
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const {
    isAuthenticated,
    currentUser,
    logout
  } = useChat();

  const [activeSection, setActiveSection] = useState('companies');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<ICompany | null>(null);

  // CRM State
  const [crmUsers, setCrmUsers] = useState<CrmUser[]>(mockCrmUsers);
  const [operationLogs] = useState(mockOperationLogs);


  if (!isAuthenticated || currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleCrmUsersChange = (newUsers: CrmUser[]) => setCrmUsers(newUsers);

  const menuItems = [
    { id: 'companies', icon: Building2, label: 'Şirkətlər' },
    { id: 'chatbots', icon: Bot, label: 'Chatbot-lar' },
    { id: 'divider1', icon: null, label: '', divider: true },
    { id: 'lead-management', icon: FolderKanban, label: 'Lead İdarəetmə' },
    { id: 'supervisors', icon: UserCog, label: 'Supervayzerlər' },
    { id: 'crm-users', icon: Users, label: 'CRM User-lər' },
    { id: 'divider2', icon: null, label: '', divider: true },
    { id: 'reports', icon: BarChart3, label: 'Hesabatlar' },
    { id: 'logs', icon: FileText, label: 'Log-lar' },
  ];

  const renderSidebar = () => (
    <div className={cn(
      "bg-card border-r border-border flex flex-col transition-all duration-300",
      sidebarCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!sidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
            <p className="text-xs text-muted-foreground mt-1 truncate">{currentUser?.email}</p>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className={cn(sidebarCollapsed && "mx-auto")}>
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.divider) return <div key={item.id} className="h-px bg-border my-3" />;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setSelectedCompany(null); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                sidebarCollapsed && "justify-center",
                activeSection === item.id && !selectedCompany
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
              {!sidebarCollapsed && item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-2 border-t border-border">
        <Button variant="ghost" className={cn("w-full gap-3", sidebarCollapsed ? "justify-center px-0" : "justify-start")} onClick={logout} title={sidebarCollapsed ? "Çıxış" : undefined}>
          <LogOut className="h-5 w-5 shrink-0" />
          {!sidebarCollapsed && "Çıxış"}
        </Button>
      </div>
    </div>
  );

  if (selectedCompany) {
    return (
      <div className="flex h-screen bg-background">
        {renderSidebar()}
        <div className="flex-1 overflow-auto p-6">
          <CompanyDetail company={selectedCompany} onBack={() => setSelectedCompany(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {renderSidebar()}
      <div className="flex-1 overflow-auto p-6">
        {activeSection === 'companies' && (<CompanyManagement setSelectedCompany={setSelectedCompany} />)}
        {activeSection === 'chatbots' && <ChatbotsManagement />}
        {activeSection === 'lead-management' && <LeadManagement />}
        {activeSection === 'supervisors' && <SupervisorManagement />}
        {activeSection === 'crm-users' && <div><div className="mb-6"><h2 className="text-2xl font-bold">CRM User-lər</h2><p className="text-sm text-muted-foreground">CRM sistemi üçün istifadəçi idarəetməsi</p></div><UserManagement users={crmUsers} onUsersChange={handleCrmUsersChange} /></div>}
        {activeSection === 'reports' && (<ReportsPage />)}
        {activeSection === 'logs' && <div><div className="mb-6"><h2 className="text-2xl font-bold">Log-lar</h2></div><OperationLogs logs={operationLogs} users={crmUsers} /></div>}
      </div>
    </div>
  );
};

export default AdminPanel;
