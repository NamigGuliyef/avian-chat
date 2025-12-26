import React, { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Navigate } from 'react-router-dom';
import { 
  Building2, 
  Bot, 
  BarChart3, 
  FileText, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Users,
  Eye,
  ChevronLeft,
  ChevronRight,
  UserCog,
  FolderKanban,
  MessageSquare,
  PhoneCall
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { mockLeads, mockOperationLogs, mockStats, mockCrmUsers } from '@/data/mockData';
import { OperationLogs } from '@/components/admin/OperationLogs';
import { ReportsView } from '@/components/admin/ReportsView';
import { UserManagement } from '@/components/admin/UserManagement';
import CompanyDetail from '@/components/admin/CompanyDetail';
import SupervisorManagement from '@/components/admin/SupervisorManagement';
import LeadManagement from '@/components/admin/LeadManagement';
import ChatbotsManagement from '@/components/admin/ChatbotsManagement';
import { User as CrmUser, Lead } from '@/types/crm';
import { Company } from '@/types/chat';

const AdminPanel: React.FC = () => {
  const { 
    isAuthenticated, 
    currentUser, 
    logout,
    users,
    companies,
    addCompany,
    updateCompany,
    deleteCompany,
    conversations
  } = useChat();

  const [activeSection, setActiveSection] = useState('companies');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // CRM State
  const [crmUsers, setCrmUsers] = useState<CrmUser[]>(mockCrmUsers);
  const [operationLogs] = useState(mockOperationLogs);
  const [stats] = useState(mockStats);

  const [companyForm, setCompanyForm] = useState({ name: '', domain: '' });

  if (!isAuthenticated || currentUser?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const resetCompanyForm = () => {
    setCompanyForm({ name: '', domain: '' });
    setEditingCompany(null);
  };

  const handleAddCompany = () => {
    if (!companyForm.name) {
      toast.error('Şirkət adını daxil edin');
      return;
    }
    addCompany({ name: companyForm.name, domain: companyForm.domain, email: '', website: '' });
    toast.success('Şirkət yaradıldı (default live-chat kanalı ilə)');
    resetCompanyForm();
    setIsCompanyDialogOpen(false);
  };

  const handleUpdateCompany = () => {
    if (!editingCompany) return;
    updateCompany(editingCompany, { name: companyForm.name, domain: companyForm.domain });
    toast.success('Şirkət yeniləndi');
    resetCompanyForm();
    setIsCompanyDialogOpen(false);
  };

  const startEditCompany = (company: Company) => {
    setCompanyForm({ name: company.name, domain: company.domain || '' });
    setEditingCompany(company.id);
    setIsCompanyDialogOpen(true);
  };

  const handleCrmUsersChange = (newUsers: CrmUser[]) => setCrmUsers(newUsers);
  const getCompanyAgents = (companyId: string) => users.filter(u => u.companyId === companyId);

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
        {activeSection === 'companies' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Şirkətlər</h2>
              <Dialog open={isCompanyDialogOpen} onOpenChange={(open) => { setIsCompanyDialogOpen(open); if (!open) resetCompanyForm(); }}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Yeni Şirkət</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingCompany ? 'Şirkəti Redaktə Et' : 'Yeni Şirkət'}</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div><Label>Şirkət adı</Label><Input value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} placeholder="Şirkət adı" /></div>
                    <div><Label>Domain</Label><Input value={companyForm.domain} onChange={(e) => setCompanyForm({ ...companyForm, domain: e.target.value })} placeholder="example.com" /></div>
                    <Button className="w-full" onClick={editingCompany ? handleUpdateCompany : handleAddCompany}>{editingCompany ? 'Yenilə' : 'Yarat'}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-3">
              {companies.map((company) => {
                const agents = getCompanyAgents(company.id);
                return (
                  <Card key={company.id} className="hover:bg-muted/30 transition-colors">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => setSelectedCompany(company)}>
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Building2 className="h-6 w-6" /></div>
                        <div><p className="font-semibold text-lg">{company.name}</p><p className="text-sm text-muted-foreground">{company.domain || 'Domain yoxdur'}</p></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Popover>
                          <PopoverTrigger asChild><Button variant="ghost" size="sm" className="gap-2 text-muted-foreground"><Eye className="h-4 w-4" />{agents.length}</Button></PopoverTrigger>
                          <PopoverContent className="w-64 p-0" align="end">
                            <div className="p-3 border-b"><p className="font-medium text-sm">Agentlər</p></div>
                            <ScrollArea className="max-h-48">{agents.length > 0 ? <div className="p-2 space-y-1">{agents.map((agent) => (<div key={agent.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">{agent.name.charAt(0)}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{agent.name}</p><p className="text-xs text-muted-foreground truncate">{agent.email}</p></div></div>))}</div> : <div className="p-4 text-center text-sm text-muted-foreground">Agent yoxdur</div>}</ScrollArea>
                          </PopoverContent>
                        </Popover>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); startEditCompany(company); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteCompany(company.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
        {activeSection === 'chatbots' && <ChatbotsManagement />}
        {activeSection === 'lead-management' && <LeadManagement />}
        {activeSection === 'supervisors' && <SupervisorManagement />}
        {activeSection === 'crm-users' && <div><div className="mb-6"><h2 className="text-2xl font-bold">CRM User-lər</h2><p className="text-sm text-muted-foreground">CRM sistemi üçün istifadəçi idarəetməsi</p></div><UserManagement users={crmUsers} onUsersChange={handleCrmUsersChange} /></div>}
        {activeSection === 'reports' && <div><div className="mb-6"><h2 className="text-2xl font-bold">Hesabatlar</h2></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"><Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Ümumi Söhbətlər</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{conversations.length}</p></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Açıq Söhbətlər</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{conversations.filter(c => c.status === 'open').length}</p></CardContent></Card></div><ReportsView stats={stats} /></div>}
        {activeSection === 'logs' && <div><div className="mb-6"><h2 className="text-2xl font-bold">Log-lar</h2></div><OperationLogs logs={operationLogs} users={crmUsers} /></div>}
      </div>
    </div>
  );
};

export default AdminPanel;
