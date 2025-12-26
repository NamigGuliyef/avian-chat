import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mockLeads, mockExcels, mockSheets } from '@/data/mockData';
import { Lead, Excel, Sheet, UserStatus } from '@/types/crm';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  MessageSquare, FileSpreadsheet, Table2, 
  Plus, Camera, User as UserIcon, LogOut, ChevronLeft, ChevronRight,
  ArrowLeft, LayoutGrid, ChevronDown
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AgentLeadTable } from '@/components/user/AgentLeadTable';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusColors: Record<UserStatus, string> = {
  available: 'bg-green-500',
  busy: 'bg-red-500',
  break: 'bg-yellow-500',
  offline: 'bg-gray-400'
};

const statusLabels: Record<UserStatus, string> = {
  available: 'Mövcud',
  busy: 'Məşğul',
  break: 'Fasilə',
  offline: 'Offline'
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const { session, isLoading, logout } = useAuth();
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [userStatus, setUserStatus] = useState<UserStatus>('available');
  const [activeSection, setActiveSection] = useState('chat');
  
  // Navigation state
  const [selectedExcel, setSelectedExcel] = useState<Excel | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);

  // Get excels and sheets assigned to this agent
  const agentExcels = mockExcels.filter(excel => excel.agentIds.includes(session.user?.id || ''));
  const agentSheets = mockSheets.filter(sheet => sheet.agentIds.includes(session.user?.id || ''));

  useEffect(() => {
    if (!isLoading && (!session.isAuthenticated || session.user?.role !== 'agent')) {
      navigate('/user/login');
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session.isAuthenticated || session.user?.role !== 'agent') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/user/login');
  };

  const handleUpdateLead = (leadId: string, field: string, value: string | number) => {
    setLeads((prev) => prev.map((lead) => lead.id === leadId ? { ...lead, [field]: value, updatedAt: new Date().toISOString() } : lead));
    toast({ title: "Yeniləndi", description: `${field} sahəsi uğurla yeniləndi` });
  };

  const handleAddLead = (newLeadData: Partial<Lead>) => {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      phone: newLeadData.phone || '',
      maskedPhone: newLeadData.phone ? newLeadData.phone.replace(/(\d{5})(\d+)(\d{1})/, '$1******$3') : '',
      sheetId: selectedSheet?.id || '',
      assignedUser: session.user?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newLeadData
    } as Lead;
    setLeads(prev => [...prev, newLead]);
  };

  // Get leads for selected sheet
  const sheetLeads = selectedSheet 
    ? leads.filter(lead => lead.sheetId === selectedSheet.id)
    : [];

  // Get sheets for selected excel
  const excelSheets = selectedExcel 
    ? agentSheets.filter(s => s.excelId === selectedExcel.id)
    : [];

  const menuItems = [
    { id: 'leads', icon: Table2, label: 'Lead İdarəetmə' },
    { id: 'chat', icon: MessageSquare, label: 'Live Chat' },
  ];

  // Live Chat is now the main view
  if (activeSection === 'chat') {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Top Header with Profile Navigation */}
        <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">CRM</span>
            </div>
            <span className="font-semibold text-foreground">Live Chat</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Selector */}
            <Select value={userStatus} onValueChange={(v: UserStatus) => setUserStatus(v)}>
              <SelectTrigger className="w-32 h-9">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", statusColors[userStatus])} />
                  <span className="text-sm">{statusLabels[userStatus]}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" />Mövcud</div></SelectItem>
                <SelectItem value="busy"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" />Məşğul</div></SelectItem>
                <SelectItem value="break"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" />Fasilə</div></SelectItem>
                <SelectItem value="offline"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-400" />Offline</div></SelectItem>
              </SelectContent>
            </Select>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {session.user?.name?.charAt(0)}
                    </div>
                    <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card", statusColors[userStatus])} />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Agent</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveSection('leads')} className="gap-3 cursor-pointer">
                  <Table2 className="h-4 w-4" />
                  Lead İdarəetmə
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveSection('chat')} className="gap-3 cursor-pointer bg-accent">
                  <MessageSquare className="h-4 w-4" />
                  Live Chat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-3 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Çıxış
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Live Chat Layout - 4 panels */}
        <div className="flex-1 min-h-0">
          <AdminLayout />
        </div>
      </div>
    );
  }

  // Other sections (Leads, Tickets, Profile) with profile dropdown header
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Header with Profile Navigation */}
      <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {(selectedExcel || selectedSheet) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => selectedSheet ? setSelectedSheet(null) : setSelectedExcel(null)}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </Button>
          )}
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">CRM</span>
          </div>
          <span className="font-semibold text-foreground">
            {selectedSheet ? selectedSheet.name : selectedExcel ? `${selectedExcel.name} - Sheetlər` : menuItems.find(m => m.id === activeSection)?.label}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Status Selector */}
          <Select value={userStatus} onValueChange={(v: UserStatus) => setUserStatus(v)}>
            <SelectTrigger className="w-32 h-9">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", statusColors[userStatus])} />
                <span className="text-sm">{statusLabels[userStatus]}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" />Mövcud</div></SelectItem>
              <SelectItem value="busy"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" />Məşğul</div></SelectItem>
              <SelectItem value="break"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" />Fasilə</div></SelectItem>
              <SelectItem value="offline"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-400" />Offline</div></SelectItem>
            </SelectContent>
          </Select>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {session.user?.name?.charAt(0)}
                  </div>
                  <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card", statusColors[userStatus])} />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Agent</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setActiveSection('leads'); setSelectedExcel(null); setSelectedSheet(null); }} className={cn("gap-3 cursor-pointer", activeSection === 'leads' && "bg-accent")}>
                <Table2 className="h-4 w-4" />
                Lead İdarəetmə
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveSection('chat')} className={cn("gap-3 cursor-pointer", activeSection === 'chat' && "bg-accent")}>
                <MessageSquare className="h-4 w-4" />
                Live Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-3 cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />
                Çıxış
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {/* Lead Management */}
          {activeSection === 'leads' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {!selectedExcel ? (
                <div>
                  <div className="mb-6">
                    <p className="text-muted-foreground">Sizə təyin olunmuş cədvəllər</p>
                  </div>

                  {agentExcels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Table2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">Sizə heç bir Excel təyin olunmayıb</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {agentExcels.map((excel) => {
                        const excelSheetCount = agentSheets.filter(s => s.excelId === excel.id).length;
                        const excelLeadCount = leads.filter(l => agentSheets.filter(s => s.excelId === excel.id).some(s => s.id === l.sheetId)).length;
                        return (
                          <Card 
                            key={excel.id} 
                            className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                            onClick={() => setSelectedExcel(excel)}
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                  <LayoutGrid className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-base truncate">{excel.name}</p>
                                  <p className="text-sm text-muted-foreground mt-0.5 truncate">{excel.description || 'Təsvir yoxdur'}</p>
                                  <div className="flex items-center gap-2 mt-3">
                                    <Badge variant="secondary" className="text-xs">{excelSheetCount} sheet</Badge>
                                    <Badge variant="outline" className="text-xs">{excelLeadCount} lead</Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : !selectedSheet ? (
                <div>
                  <div className="mb-6">
                    <p className="text-muted-foreground">Sheet seçin</p>
                  </div>

                  {excelSheets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">Bu Excel-də sizə təyin olunmuş sheet yoxdur</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {excelSheets.map((sheet) => {
                        const sheetLeadCount = leads.filter(l => l.sheetId === sheet.id).length;
                        return (
                          <Card 
                            key={sheet.id} 
                            className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                            onClick={() => setSelectedSheet(sheet)}
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-base truncate">{sheet.name}</p>
                                  <p className="text-sm text-muted-foreground mt-0.5 truncate">{sheet.description || 'Təsvir yoxdur'}</p>
                                  <div className="flex items-center gap-2 mt-3">
                                    <Badge variant="secondary" className="text-xs">{sheet.columns?.length || 0} sütun</Badge>
                                    <Badge variant="outline" className="text-xs">{sheetLeadCount} lead</Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <p className="text-muted-foreground">{sheetLeads.length} lead tapıldı</p>
                  </div>
                  <AgentLeadTable 
                    leads={sheetLeads} 
                    columns={selectedSheet.columns || []} 
                    onUpdateLead={handleUpdateLead}
                    onAddLead={handleAddLead}
                    currentUserId={session.user?.id}
                  />
                </div>
              )}
            </motion.div>
          )}


          {/* Profile */}
          {activeSection === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <div className="max-w-lg">
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                          {session.user?.name?.charAt(0)}
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                          <Camera className="h-4 w-4" />
                        </button>
                        <div className={cn("absolute top-0 right-0 w-5 h-5 rounded-full border-2 border-card", statusColors[userStatus])} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{session.user?.name}</h3>
                        <p className="text-muted-foreground">{session.user?.email}</p>
                        <Badge variant="secondary" className="mt-2">Agent</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Ad</Label>
                      <Input value={session.user?.name || ''} disabled className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Email</Label>
                      <Input value={session.user?.email || ''} disabled className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Status</Label>
                      <Select value={userStatus} onValueChange={(v: UserStatus) => setUserStatus(v)}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" />Mövcud</div></SelectItem>
                          <SelectItem value="busy"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" />Məşğul</div></SelectItem>
                          <SelectItem value="break"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" />Fasilə</div></SelectItem>
                          <SelectItem value="offline"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-400" />Offline</div></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
