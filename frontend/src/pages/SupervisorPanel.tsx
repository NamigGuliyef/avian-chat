import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { mockAgentKPIs, mockCrmUsers, mockExcels, mockLeads, mockProjects, mockSheets, mockSupervisorAssignments } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { ColumnConfig, ColumnOption, ColumnType, User as CrmUser, Excel, Project, Sheet, UserStatus } from '@/types/crm';
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  FileSpreadsheet,
  FolderKanban,
  LogOut,
  Plus,
  Table2,
  Trash2,
  User as UserIcon,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

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


const SupervisorPanel: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('agents');

  // Data state
  const [excels, setExcels] = useState<Excel[]>(mockExcels);
  const [sheets, setSheets] = useState<Sheet[]>(mockSheets);

  // Navigation state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedExcel, setSelectedExcel] = useState<Excel | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<CrmUser | null>(null);

  // Dialog state
  const [isExcelDialogOpen, setIsExcelDialogOpen] = useState(false);
  const [isSheetDialogOpen, setIsSheetDialogOpen] = useState(false);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [editingExcel, setEditingExcel] = useState<Excel | null>(null);
  const [editingSheet, setEditingSheet] = useState<Sheet | null>(null);
  const [editingColumn, setEditingColumn] = useState<ColumnConfig | null>(null);

  // Form state
  const [excelForm, setExcelForm] = useState({ name: '', description: '', agentIds: [] as string[] });
  const [sheetForm, setSheetForm] = useState<{ name: string; description: string; agentIds: string[]; agentRowPermissions: { agentId: string; startRow: number; endRow: number }[] }>({
    name: '', description: '', agentIds: [], agentRowPermissions: []
  });
  const [columnForm, setColumnForm] = useState<Partial<ColumnConfig> & { options?: ColumnOption[]; phoneNumbers?: string[] }>({
    name: '', dataKey: '', type: 'text' as ColumnType, visibleToUser: true, editableByUser: true, isRequired: false, options: [], phoneNumbers: []
  });

  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionColor, setNewOptionColor] = useState('#3B82F6');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newTag, setNewTag] = useState('');

  const currentSupervisor = mockCrmUsers.find(u => u.id === 'sup-1');

  if (!currentSupervisor || currentSupervisor.role !== 'supervayzer') {
    return <Navigate to="/login" replace />;
  }

  const assignment = mockSupervisorAssignments.find(a => a.supervisorId === currentSupervisor.id);
  const assignedAgentIds = assignment?.agentIds || [];
  const assignedAgents = mockCrmUsers.filter(u => assignedAgentIds.includes(u.id));
  const supervisorProjects = mockProjects.filter(p => p.supervisorIds.includes(currentSupervisor.id));

  const handleLogout = () => { window.location.href = '/login'; };

  // Excel CRUD
  const handleAddExcel = () => {
    if (!excelForm.name || !selectedProject) { toast.error('Excel adını daxil edin'); return; }
    const newExcel: Excel = {
      id: `excel-${Date.now()}`, projectId: selectedProject.id, name: excelForm.name,
      description: excelForm.description, agentIds: excelForm.agentIds,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    setExcels([...excels, newExcel]);
    setExcelForm({ name: '', description: '', agentIds: [] });
    setIsExcelDialogOpen(false);
    setEditingExcel(null);
    toast.success('Excel yaradıldı');
  };

  const handleUpdateExcel = () => {
    if (!editingExcel || !excelForm.name) { toast.error('Excel adını daxil edin'); return; }
    setExcels(excels.map(e => e.id === editingExcel.id ? { ...e, name: excelForm.name, description: excelForm.description, agentIds: excelForm.agentIds, updatedAt: new Date().toISOString() } : e));
    setExcelForm({ name: '', description: '', agentIds: [] });
    setIsExcelDialogOpen(false);
    setEditingExcel(null);
    toast.success('Excel yeniləndi');
  };

  const startEditExcel = (excel: Excel) => {
    setEditingExcel(excel);
    setExcelForm({ name: excel.name, description: excel.description || '', agentIds: excel.agentIds });
    setIsExcelDialogOpen(true);
  };

  const handleDeleteExcel = (excelId: string) => {
    setExcels(excels.filter(e => e.id !== excelId));
    setSheets(sheets.filter(s => s.excelId !== excelId));
    if (selectedExcel?.id === excelId) setSelectedExcel(null);
    toast.success('Excel silindi');
  };

  // Sheet CRUD
  const handleAddSheet = () => {
    if (!sheetForm.name || !selectedExcel || !selectedProject) { toast.error('Sheet adını daxil edin'); return; }
    const newSheet: Sheet = {
      id: `sheet-${Date.now()}`, excelId: selectedExcel.id, projectId: selectedProject.id, name: sheetForm.name,
      description: sheetForm.description, agentIds: sheetForm.agentIds,
      agentRowPermissions: sheetForm.agentRowPermissions,
      columns: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    setSheets([...sheets, newSheet]);
    setSheetForm({ name: '', description: '', agentIds: [], agentRowPermissions: [] });
    setIsSheetDialogOpen(false);
    setEditingSheet(null);
    toast.success('Sheet yaradıldı');
  };

  const handleUpdateSheet = () => {
    if (!editingSheet || !sheetForm.name) { toast.error('Sheet adını daxil edin'); return; }
    setSheets(sheets.map(s => s.id === editingSheet.id ? {
      ...s, name: sheetForm.name, description: sheetForm.description,
      agentIds: sheetForm.agentIds, agentRowPermissions: sheetForm.agentRowPermissions,
      updatedAt: new Date().toISOString()
    } : s));
    setSheetForm({ name: '', description: '', agentIds: [], agentRowPermissions: [] });
    setIsSheetDialogOpen(false);
    setEditingSheet(null);
    toast.success('Sheet yeniləndi');
  };

  const startEditSheet = (sheet: Sheet) => {
    setEditingSheet(sheet);
    setSheetForm({
      name: sheet.name,
      description: sheet.description || '',
      agentIds: sheet.agentIds,
      agentRowPermissions: sheet.agentRowPermissions || []
    });
    setIsSheetDialogOpen(true);
  };

  const handleDeleteSheet = (sheetId: string) => {
    setSheets(sheets.filter(s => s.id !== sheetId));
    if (selectedSheet?.id === sheetId) setSelectedSheet(null);
    toast.success('Sheet silindi');
  };

  // Column CRUD
  const handleAddColumn = () => {
    if (!columnForm.name || !columnForm.dataKey || !selectedSheet) { toast.error('Sütun məlumatlarını doldurun'); return; }
    const newColumn: ColumnConfig = {
      id: `col-${Date.now()}`, name: columnForm.name, dataKey: columnForm.dataKey,
      type: columnForm.type || 'text', visibleToUser: columnForm.visibleToUser ?? true,
      editableByUser: columnForm.editableByUser ?? true, isRequired: columnForm.isRequired ?? false,
      order: (selectedSheet.columns?.length || 0) + 1, sheetId: selectedSheet.id,
      options: columnForm.type === 'select' ? columnForm.options : undefined,
      phoneNumbers: columnForm.type === 'phone' ? columnForm.phoneNumbers : undefined
    };
    const updatedSheet = { ...selectedSheet, columns: [...(selectedSheet.columns || []), newColumn] };
    setSheets(sheets.map(s => s.id === selectedSheet.id ? updatedSheet : s));
    setSelectedSheet(updatedSheet);
    setColumnForm({ name: '', dataKey: '', type: 'text', visibleToUser: true, editableByUser: true, isRequired: false, options: [], phoneNumbers: [] });
    setIsColumnDialogOpen(false);
    setEditingColumn(null);
    setNewOptionLabel('');
    setNewOptionColor('#3B82F6');
    setNewPhoneNumber('');
    toast.success('Sütun əlavə edildi');
  };

  const handleUpdateColumn = () => {
    if (!editingColumn || !columnForm.name || !selectedSheet) { toast.error('Sütun məlumatlarını doldurun'); return; }
    const updatedColumn: ColumnConfig = {
      ...editingColumn, name: columnForm.name, dataKey: columnForm.dataKey || editingColumn.dataKey,
      type: columnForm.type || editingColumn.type, visibleToUser: columnForm.visibleToUser ?? editingColumn.visibleToUser,
      editableByUser: columnForm.editableByUser ?? editingColumn.editableByUser, isRequired: columnForm.isRequired ?? editingColumn.isRequired,
      options: columnForm.type === 'select' ? columnForm.options : undefined,
      phoneNumbers: columnForm.type === 'phone' ? columnForm.phoneNumbers : undefined
    };
    const updatedColumns = selectedSheet.columns.map(c => c.id === editingColumn.id ? updatedColumn : c);
    const updatedSheet = { ...selectedSheet, columns: updatedColumns };
    setSheets(sheets.map(s => s.id === selectedSheet.id ? updatedSheet : s));
    setSelectedSheet(updatedSheet);
    setColumnForm({ name: '', dataKey: '', type: 'text', visibleToUser: true, editableByUser: true, isRequired: false, options: [], phoneNumbers: [] });
    setIsColumnDialogOpen(false);
    setEditingColumn(null);
    setNewOptionLabel('');
    setNewOptionColor('#3B82F6');
    setNewPhoneNumber('');
    toast.success('Sütun yeniləndi');
  };

  const startEditColumn = (column: ColumnConfig) => {
    setEditingColumn(column);
    setColumnForm({
      name: column.name, dataKey: column.dataKey, type: column.type,
      visibleToUser: column.visibleToUser, editableByUser: column.editableByUser,
      isRequired: column.isRequired, options: column.options || [],
      phoneNumbers: column.phoneNumbers || []
    });
    setIsColumnDialogOpen(true);
  };

  const handleDeleteColumn = (columnId: string) => {
    if (!selectedSheet) return;
    const updatedSheet = { ...selectedSheet, columns: selectedSheet.columns.filter(c => c.id !== columnId) };
    setSheets(sheets.map(s => s.id === selectedSheet.id ? updatedSheet : s));
    setSelectedSheet(updatedSheet);
    toast.success('Sütun silindi');
  };

  const handleAddOption = () => {
    if (!newOptionLabel.trim()) return;
    const newOption: ColumnOption = {
      value: newOptionLabel.toLowerCase().replace(/\s+/g, '_'),
      label: newOptionLabel.trim(),
      color: newOptionColor
    };
    setColumnForm(prev => ({ ...prev, options: [...(prev.options || []), newOption] }));
    setNewOptionLabel('');
    setNewOptionColor('#3B82F6');
  };

  const handleRemoveOption = (index: number) => {
    setColumnForm(prev => ({ ...prev, options: (prev.options || []).filter((_, i) => i !== index) }));
  };

  const handleAddPhoneNumber = () => {
    if (!newPhoneNumber.trim()) return;
    setColumnForm(prev => ({ ...prev, phoneNumbers: [...(prev.phoneNumbers || []), newPhoneNumber.trim()] }));
    setNewPhoneNumber('');
  };

  const handleRemovePhoneNumber = (index: number) => {
    setColumnForm(prev => ({ ...prev, phoneNumbers: (prev.phoneNumbers || []).filter((_, i) => i !== index) }));
  };

  const toggleAgentSheet = (agentId: string) => {
    if (sheetForm.agentIds.includes(agentId)) {
      // Remove agent
      setSheetForm(prev => ({
        ...prev,
        agentIds: prev.agentIds.filter(id => id !== agentId),
        agentRowPermissions: prev.agentRowPermissions.filter(p => p.agentId !== agentId)
      }));
    } else {
      // Add agent with default row permission
      setSheetForm(prev => ({
        ...prev,
        agentIds: [...prev.agentIds, agentId],
        agentRowPermissions: [...prev.agentRowPermissions, { agentId, startRow: 1, endRow: 100 }]
      }));
    }
  };

  const updateAgentRowPermission = (agentId: string, startRow: number, endRow: number) => {
    setSheetForm(prev => ({
      ...prev,
      agentRowPermissions: prev.agentRowPermissions.map(p =>
        p.agentId === agentId ? { ...p, startRow, endRow } : p
      )
    }));
  };

  const toggleAgentExcel = (agentId: string) => {
    setExcelForm(prev => ({ ...prev, agentIds: prev.agentIds.includes(agentId) ? prev.agentIds.filter(id => id !== agentId) : [...prev.agentIds, agentId] }));
  };


  const menuItems = [
    { id: 'agents', icon: UserIcon, label: 'Dashboard' },
    { id: 'sheets', icon: FileSpreadsheet, label: 'Layihələrim' },
  ];

  const getAgentKPI = (agentId: string) => mockAgentKPIs.find(k => k.agentId === agentId);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn("bg-card border-r border-border flex flex-col transition-all duration-300", sidebarCollapsed ? "w-16" : "w-64")}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!sidebarCollapsed && <div><h1 className="text-xl font-bold text-primary">Supervayzer</h1><p className="text-xs text-muted-foreground mt-1">{currentSupervisor.email}</p></div>}
          <Button variant="ghost" size="icon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className={cn(sidebarCollapsed && "mx-auto")}>
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveSection(item.id); setSelectedProject(null); setSelectedExcel(null); setSelectedSheet(null); setSelectedAgent(null); }}
              className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors", sidebarCollapsed && "justify-center",
                activeSection === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
              title={sidebarCollapsed ? item.label : undefined}>
              <item.icon className="h-5 w-5 shrink-0" />{!sidebarCollapsed && item.label}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <Button variant="ghost" className={cn("w-full gap-3", sidebarCollapsed ? "justify-center px-0" : "justify-start")} onClick={handleLogout}>
            <LogOut className="h-5 w-5 shrink-0" />{!sidebarCollapsed && "Çıxış"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Agents Section */}
        {activeSection === 'agents' && !selectedAgent && (
          <div>
            <div className="mb-6"><h2 className="text-2xl font-bold">Mənə tabe olan agentlər</h2><p className="text-sm text-muted-foreground">Agent məlumatları və performansı</p></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assignedAgents.map((agent) => {
                const kpi = getAgentKPI(agent.id);
                return (
                  <Card key={agent.id} className="cursor-pointer hover:border-primary" onClick={() => setSelectedAgent(agent)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg">{agent.name.charAt(0)}</div>
                          <div className={cn("absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background", statusColors[agent.status || 'offline'])} />
                        </div>
                        <div className="flex-1"><p className="font-semibold">{agent.name}</p><p className="text-sm text-muted-foreground">{agent.email}</p></div>
                      </div>
                      {kpi && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-muted rounded"><p className="text-muted-foreground text-xs">Cavablanan</p><p className="font-semibold">{kpi.answeredTickets}</p></div>
                          <div className="p-2 bg-muted rounded"><p className="text-muted-foreground text-xs">SLA %</p><p className="font-semibold">{kpi.slaCompliance}%</p></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Agent Detail */}
        {activeSection === 'agents' && selectedAgent && (
          <div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedAgent(null)} className="mb-4">← Geri</Button>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">{selectedAgent.name.charAt(0)}</div>
                <div className={cn("absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background", statusColors[selectedAgent.status || 'offline'])} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
                <p className="text-muted-foreground">{selectedAgent.email}</p>
                <Badge className="mt-1">{statusLabels[selectedAgent.status || 'offline']}</Badge>
              </div>
            </div>

            {/* KPIs */}
            {(() => {
              const kpi = getAgentKPI(selectedAgent.id);
              if (!kpi) return null;
              return (
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Cavablanan ticket</p><p className="text-2xl font-bold">{kpi.answeredTickets}</p></CardContent></Card>
                  <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Qapadılan ticket</p><p className="text-2xl font-bold">{kpi.closedTickets}</p></CardContent></Card>
                  <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Ort. cavab vaxtı</p><p className="text-2xl font-bold">{kpi.avgHandleTime} dəq</p></CardContent></Card>
                  <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">SLA uyğunluq</p><p className="text-2xl font-bold">{kpi.slaCompliance}%</p></CardContent></Card>
                </div>
              );
            })()}
          </div>
        )}

        {/* Sheets Section - Project Level */}
        {activeSection === 'sheets' && !selectedProject && (
          <div>
            {/* Layihə Statusu Cards */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Layihələrim</h2>
              <p className="text-sm text-muted-foreground">Layihə → Excel → Sheet → Sütunlar</p>
            </div>

            {/* Excel Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 mb-8">
              {supervisorProjects.flatMap(project =>
                excels.filter(e => e.projectId === project.id).map(excel => {
                  const agentCount = excel.agentIds.length;
                  return (
                    <Card key={excel.id} className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">{excel.name}</p>
                        <p className="text-3xl font-bold text-primary">{agentCount} nəfər</p>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Detailed Table */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Layihə Statusu - Detal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-medium text-muted-foreground">Layihə adı</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Excel adı</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Sheet adı</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Agentlər</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supervisorProjects.flatMap(project =>
                        excels.filter(e => e.projectId === project.id).flatMap(excel =>
                          sheets.filter(s => s.excelId === excel.id).map(sheet => {
                            const sheetAgents = assignedAgents.filter(a => sheet.agentIds.includes(a.id));
                            return (
                              <tr key={sheet.id} className="border-b border-border/50 hover:bg-muted/50">
                                <td className="p-3">{project.name}</td>
                                <td className="p-3">{excel.name}</td>
                                <td className="p-3">{sheet.name}</td>
                                <td className="p-3 text-center">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <span className="text-lg">👁️</span>
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Agentlər - {sheet.name}</DialogTitle>
                                      </DialogHeader>
                                      <ScrollArea className="h-64 mt-4">
                                        {sheetAgents.length > 0 ? (
                                          <div className="space-y-2">
                                            {sheetAgents.map(agent => (
                                              <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                  {agent.name.charAt(0)}
                                                </div>
                                                <span className="font-medium">{agent.name}</span>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-center text-muted-foreground py-4">Agent yoxdur</p>
                                        )}
                                      </ScrollArea>
                                    </DialogContent>
                                  </Dialog>
                                </td>
                              </tr>
                            );
                          })
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Project Cards */}
            <h3 className="text-lg font-semibold mb-4">Layihələr</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {supervisorProjects.map((project) => {
                const projectExcels = excels.filter(e => e.projectId === project.id);
                return (
                  <Card key={project.id} className="cursor-pointer hover:border-primary" onClick={() => setSelectedProject(project)}>
                    <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><FolderKanban className="h-5 w-5 text-primary" />{project.name}</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                      <Badge variant="outline">{projectExcels.length} Excel</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Sheets Section - Excel Level */}
        {activeSection === 'sheets' && selectedProject && !selectedExcel && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedProject(null)} className="mb-2">← Geri</Button>
                <h2 className="text-2xl font-bold">{selectedProject.name} - Exceller</h2>
              </div>
              <Dialog open={isExcelDialogOpen} onOpenChange={(open) => { setIsExcelDialogOpen(open); if (!open) { setEditingExcel(null); setExcelForm({ name: '', description: '', agentIds: [] }); } }}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Yeni Excel</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingExcel ? 'Excel-i Redaktə Et' : 'Yeni Excel'}</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div><Label>Excel adı</Label><Input value={excelForm.name} onChange={(e) => setExcelForm({ ...excelForm, name: e.target.value })} /></div>
                    <div><Label>Təsvir</Label><Input value={excelForm.description} onChange={(e) => setExcelForm({ ...excelForm, description: e.target.value })} /></div>
                    <div><Label className="mb-2 block">Agentlər</Label>
                      <ScrollArea className="h-32 border rounded-lg p-2">
                        {assignedAgents.map((agent) => (
                          <div key={agent.id} className="flex items-center gap-2 py-1"><Checkbox checked={excelForm.agentIds.includes(agent.id)} onCheckedChange={() => toggleAgentExcel(agent.id)} /><span className="text-sm">{agent.name}</span></div>
                        ))}
                      </ScrollArea>
                    </div>
                    <Button className="w-full" onClick={editingExcel ? handleUpdateExcel : handleAddExcel}>{editingExcel ? 'Yenilə' : 'Yarat'}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {excels.filter(e => e.projectId === selectedProject.id).map((excel) => {
                const excelSheets = sheets.filter(s => s.excelId === excel.id);
                return (
                  <Card key={excel.id} className="cursor-pointer hover:border-primary" onClick={() => setSelectedExcel(excel)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2"><Table2 className="h-5 w-5 text-primary" /><p className="font-medium">{excel.name}</p></div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); startEditExcel(excel); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteExcel(excel.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{excel.description}</p>
                      <Badge variant="outline">{excelSheets.length} sheet</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Sheets Section - Sheet Level */}
        {activeSection === 'sheets' && selectedExcel && !selectedSheet && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedExcel(null)} className="mb-2">← Geri</Button>
                <h2 className="text-2xl font-bold">{selectedExcel.name} - Sheetlər</h2>
              </div>
              <Dialog open={isSheetDialogOpen} onOpenChange={(open) => { setIsSheetDialogOpen(open); if (!open) { setEditingSheet(null); setSheetForm({ name: '', description: '', agentIds: [], agentRowPermissions: [] }); } }}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Yeni Sheet</Button></DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>{editingSheet ? 'Sheet-i Redaktə Et' : 'Yeni Sheet'}</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div><Label>Sheet adı</Label><Input value={sheetForm.name} onChange={(e) => setSheetForm({ ...sheetForm, name: e.target.value })} /></div>
                    <div><Label>Təsvir</Label><Input value={sheetForm.description} onChange={(e) => setSheetForm({ ...sheetForm, description: e.target.value })} /></div>
                    <div>
                      <Label className="mb-2 block">Agentlər və sətir icazələri</Label>
                      <ScrollArea className="h-48 border rounded-lg p-2">
                        {assignedAgents.map((agent) => {
                          const isSelected = sheetForm.agentIds.includes(agent.id);
                          const permission = sheetForm.agentRowPermissions.find(p => p.agentId === agent.id);
                          return (
                            <div key={agent.id} className="py-2 border-b border-border/50 last:border-0">
                              <div className="flex items-center gap-2">
                                <Checkbox checked={isSelected} onCheckedChange={() => toggleAgentSheet(agent.id)} />
                                <span className="text-sm font-medium">{agent.name}</span>
                              </div>
                              {isSelected && (
                                <div className="mt-2 ml-6 flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground">Sətir aralığı:</span>
                                  <Input
                                    type="number"
                                    value={permission?.startRow || 1}
                                    onChange={(e) => updateAgentRowPermission(agent.id, parseInt(e.target.value) || 1, permission?.endRow || 100)}
                                    className="w-20 h-8"
                                    min={1}
                                  />
                                  <span>-</span>
                                  <Input
                                    type="number"
                                    value={permission?.endRow || 100}
                                    onChange={(e) => updateAgentRowPermission(agent.id, permission?.startRow || 1, parseInt(e.target.value) || 100)}
                                    className="w-20 h-8"
                                    min={1}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </ScrollArea>
                    </div>
                    <Button className="w-full" onClick={editingSheet ? handleUpdateSheet : handleAddSheet}>{editingSheet ? 'Yenilə' : 'Yarat'}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sheets.filter(s => s.excelId === selectedExcel.id).map((sheet) => {
                const sheetLeads = mockLeads.filter(l => l.sheetId === sheet.id);
                return (
                  <Card key={sheet.id} className="cursor-pointer hover:border-primary" onClick={() => setSelectedSheet(sheet)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-primary" /><p className="font-medium">{sheet.name}</p></div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); startEditSheet(sheet); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteSheet(sheet.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{sheet.description}</p>
                      <Badge variant="outline">{sheetLeads.length} data</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Sheets Section - Column Level */}
        {activeSection === 'sheets' && selectedSheet && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSheet(null)} className="mb-2">← Geri</Button>
                <h2 className="text-2xl font-bold">{selectedSheet.name} - Sütunlar</h2>
              </div>
              <Dialog open={isColumnDialogOpen} onOpenChange={(open) => { setIsColumnDialogOpen(open); if (!open) { setEditingColumn(null); setColumnForm({ name: '', dataKey: '', type: 'text', visibleToUser: true, editableByUser: true, isRequired: false, options: [], phoneNumbers: [] }); setNewOptionLabel(''); setNewOptionColor('#3B82F6'); setNewPhoneNumber(''); } }}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Yeni Sütun</Button></DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editingColumn ? 'Sütunu Redaktə Et' : 'Yeni Sütun'}</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div><Label>Sütun adı</Label><Input value={columnForm.name} onChange={(e) => setColumnForm({ ...columnForm, name: e.target.value })} /></div>
                    <div><Label>Data açarı</Label><Input value={columnForm.dataKey} onChange={(e) => setColumnForm({ ...columnForm, dataKey: e.target.value })} /></div>
                    <div><Label>Tip</Label>
                      <Select value={columnForm.type} onValueChange={(v: ColumnType) => setColumnForm({ ...columnForm, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="text">Mətn</SelectItem><SelectItem value="number">Rəqəm</SelectItem><SelectItem value="date">Tarix</SelectItem><SelectItem value="select">Seçim</SelectItem><SelectItem value="phone">Telefon</SelectItem></SelectContent>
                      </Select>
                    </div>

                    {/* Phone type - Number list */}
                    {columnForm.type === 'phone' && (
                      <div>
                        <Label className="mb-2 block">Telefon nömrələri</Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={newPhoneNumber}
                              onChange={(e) => setNewPhoneNumber(e.target.value)}
                              placeholder="+994 XX XXX XX XX"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddPhoneNumber()}
                            />
                            <Button type="button" size="sm" onClick={handleAddPhoneNumber}><Plus className="h-4 w-4" /></Button>
                          </div>
                          <ScrollArea className="h-24 border rounded-lg p-2">
                            {(columnForm.phoneNumbers || []).map((phone, index) => (
                              <div key={index} className="flex items-center justify-between py-1 px-2 bg-muted/50 rounded mb-1">
                                <span className="text-sm font-mono">{phone}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemovePhoneNumber(index)}><X className="h-3 w-3" /></Button>
                              </div>
                            ))}
                            {(columnForm.phoneNumbers || []).length === 0 && (
                              <p className="text-xs text-muted-foreground text-center py-2">Nömrə əlavə edin</p>
                            )}
                          </ScrollArea>
                        </div>
                      </div>
                    )}

                    {/* Select type - Options with color */}
                    {columnForm.type === 'select' && (
                      <div>
                        <Label className="mb-2 block">Seçim variantları</Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={newOptionLabel}
                              onChange={(e) => setNewOptionLabel(e.target.value)}
                              placeholder="Variant adı"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                              className="flex-1"
                            />
                            <input
                              type="color"
                              value={newOptionColor}
                              onChange={(e) => setNewOptionColor(e.target.value)}
                              className="w-10 h-9 rounded border border-input cursor-pointer"
                              title="Rəng seçin"
                            />
                            <Button type="button" size="sm" onClick={handleAddOption}><Plus className="h-4 w-4" /></Button>
                          </div>
                          <ScrollArea className="h-32 border rounded-lg p-2">
                            {(columnForm.options || []).map((opt, index) => (
                              <div key={index} className="flex items-center justify-between py-1.5 px-2 bg-muted/50 rounded mb-1">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: opt.color || '#3B82F6' }}
                                  />
                                  <span className="text-sm">{opt.label}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveOption(index)}><X className="h-3 w-3" /></Button>
                              </div>
                            ))}
                            {(columnForm.options || []).length === 0 && (
                              <p className="text-xs text-muted-foreground text-center py-2">Variant əlavə edin</p>
                            )}
                          </ScrollArea>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between"><Label>Məcburi</Label><Switch checked={columnForm.isRequired} onCheckedChange={(c) => setColumnForm({ ...columnForm, isRequired: c })} /></div>
                    <div className="flex items-center justify-between"><Label>Görünən</Label><Switch checked={columnForm.visibleToUser} onCheckedChange={(c) => setColumnForm({ ...columnForm, visibleToUser: c })} /></div>
                    <div className="flex items-center justify-between"><Label>Redaktə edilə bilən</Label><Switch checked={columnForm.editableByUser} onCheckedChange={(c) => setColumnForm({ ...columnForm, editableByUser: c })} /></div>
                    <Button className="w-full" onClick={editingColumn ? handleUpdateColumn : handleAddColumn}>{editingColumn ? 'Yenilə' : 'Əlavə et'}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              {(selectedSheet.columns || []).map((col) => (
                <Card key={col.id}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium">{col.name}</p>
                      <p className="text-xs text-muted-foreground">{col.dataKey} • {col.type}{col.type === 'select' && col.options && ` (${col.options.length} variant)`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {col.isRequired && <Badge>Məcburi</Badge>}
                      <Badge variant={col.visibleToUser ? "default" : "secondary"}>{col.visibleToUser ? 'Görünür' : 'Gizli'}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => startEditColumn(col)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteColumn(col.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(selectedSheet.columns || []).length === 0 && <div className="text-center py-12 text-muted-foreground">Bu sheet-də sütun yoxdur</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorPanel;
