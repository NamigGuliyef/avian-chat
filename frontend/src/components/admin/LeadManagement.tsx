import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  FolderKanban,
  Eye,
  Users,
  ArrowLeft,
  FileSpreadsheet,
  Table2,
  Filter,
  Download,
  Upload,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { mockProjects, mockCrmUsers, mockExcels, mockSheets, mockLeads, mockCompanies } from '@/data/mockData';
import { Project, Excel, Sheet, Lead, ColumnConfig } from '@/types/crm';
import { ICompany, IProject, ProjectDirection, ProjectName, ProjectType } from '@/types/types';
import { getCompanies } from '@/api/company';

const LeadManagement: React.FC = () => {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [excels] = useState<Excel[]>(mockExcels);
  const [sheets] = useState<Sheet[]>(mockSheets);
  const [leads] = useState<Lead[]>(mockLeads);
  const [companies, setCompanies] = useState<ICompany[]>([])


  // View state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedExcelFilter, setSelectedExcelFilter] = useState<string>('');
  const [selectedSheetFilter, setSelectedSheetFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Dialogs
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject>({} as IProject);

  // Forms
  const [projectForm, setProjectForm] = useState({ companyId: '', description: '' });

  useEffect(() => {
    getCompanies().then((d) => setCompanies(d))
  }, [])

  // Project CRUD
  const handleAddProject = () => {
    if (!projectForm.companyId) {
      toast.error('Şirkət seçin');
      return;
    }
    const selectedCompany = companies.find(c => c._id === projectForm.companyId);
    const newProject: Partial<IProject> = {
      _id: `proj-${Date.now()}`,
      name: selectedCompany?.name || '',
      description: projectForm.description,
    };
    setProjects([...projects, newProject]);
    setProjectForm({ companyId: '', description: '' });
    setIsProjectDialogOpen(false);
    toast.success('Layihə yaradıldı');
  };

  const handleUpdateProject = () => {
    if (!editingProject) return;
    const selectedCompany = companies.find(c => c._id === projectForm.companyId);
    setProjects(projects.map(p =>
      p.id === editingProject._id
        ? { ...p, name: selectedCompany?.name || p.name, description: projectForm.description, supervisorIds: projectForm.supervisorIds, updatedAt: new Date().toISOString() }
        : p
    ));
    setEditingProject(null);
    setProjectForm({ companyId: '', description: '', supervisorIds: [] });
    setIsProjectDialogOpen(false);
    toast.success('Layihə yeniləndi');
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    toast.success('Layihə silindi');
  };

  const startEditProject = (project: IProject) => {
    const company = companies.find(c => c.name === project.name);
    setProjectForm({ companyId: company?._id || '', description: project.description || '', supervisorIds: project.supervisorIds });
    setEditingProject(project);
    setIsProjectDialogOpen(true);
  };

  const toggleSupervisor = (supId: string) => {
    setProjectForm(prev => ({
      ...prev,
      supervisorIds: prev.supervisorIds.includes(supId)
        ? prev.supervisorIds.filter(id => id !== supId)
        : [...prev.supervisorIds, supId]
    }));
  };

  // Get project data
  const getProjectExcels = (projectId: string) => excels.filter(e => e.projectId === projectId);
  const getExcelSheets = (excelId: string) => sheets.filter(s => s.excelId === excelId);
  const getSheetLeads = (sheetId: string) => leads.filter(l => l.sheetId === sheetId);
  const getSheetColumns = (sheetId: string) => sheets.find(s => s.id === sheetId)?.columns || [];

  // Export to Excel
  const handleExportExcel = () => {
    if (!selectedSheetFilter) {
      toast.error('Əvvəlcə sheet seçin');
      return;
    }
    const sheetLeads = getSheetLeads(selectedSheetFilter);
    const columns = getSheetColumns(selectedSheetFilter);

    // Create CSV content
    const headers = columns.map(c => c.name).join(',');
    const rows = sheetLeads.map(lead =>
      columns.map(col => (lead as any)[col.dataKey] || '').join(',')
    ).join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${sheets.find(s => s.id === selectedSheetFilter)?.name || 'data'}.csv`;
    link.click();
    toast.success('Excel olaraq yükləndi');
  };

  // Get agents for current project
  const getProjectAgents = () => {
    if (!selectedProject) return [];
    const projectExcels = getProjectExcels(selectedProject.id);
    const allAgentIds = new Set<string>();
    projectExcels.forEach(excel => excel.agentIds.forEach(id => allAgentIds.add(id)));
    return mockCrmUsers.filter(u => u.role === 'agent' && allAgentIds.has(u.id));
  };

  // Filter leads
  const filteredLeads = selectedSheetFilter
    ? getSheetLeads(selectedSheetFilter).filter(lead => {
      const matchesSearch = searchTerm ? lead.phone.includes(searchTerm) || lead.maskedPhone.includes(searchTerm) : true;
      const matchesAgent = selectedAgentFilter ? lead.assignedUser === selectedAgentFilter : true;
      return matchesSearch && matchesAgent;
    })
    : [];

  // Project Detail View
  if (selectedProject) {
    const projectExcels = getProjectExcels(selectedProject.id);
    const availableSheets = selectedExcelFilter
      ? getExcelSheets(selectedExcelFilter)
      : projectExcels.flatMap(e => getExcelSheets(e.id));
    const columns = selectedSheetFilter ? getSheetColumns(selectedSheetFilter) : [];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedProject(null); setSelectedExcelFilter(''); setSelectedSheetFilter(''); setSelectedAgentFilter(''); }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
              <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={!selectedSheetFilter}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              <Select value={selectedExcelFilter} onValueChange={(v) => { setSelectedExcelFilter(v); setSelectedSheetFilter(''); setSelectedAgentFilter(''); }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Excel seçin" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="max-h-48">
                    {projectExcels.map(excel => (
                      <SelectItem key={excel.id} value={excel.id}>{excel.name}</SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              <Select value={selectedSheetFilter} onValueChange={(v) => { setSelectedSheetFilter(v); setSelectedAgentFilter(''); }} disabled={!selectedExcelFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sheet seçin" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="max-h-48">
                    {availableSheets.map(sheet => (
                      <SelectItem key={sheet.id} value={sheet.id}>{sheet.name}</SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              {selectedSheetFilter && (
                <>
                  <Select value={selectedAgentFilter} onValueChange={(v) => setSelectedAgentFilter(v === '__all__' ? '' : v)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Agent seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Bütün agentlər</SelectItem>
                      <ScrollArea className="max-h-48">
                        {getProjectAgents().map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 ml-auto">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Axtarış..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-48"
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        {selectedSheetFilter ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Table2 className="h-5 w-5 text-primary" />
                {sheets.find(s => s.id === selectedSheetFilter)?.name} - Data
                <Badge variant="secondary" className="ml-2">{filteredLeads.length} sətir</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground text-sm">#</th>
                      {columns.filter(c => c.visibleToUser).map(col => (
                        <th key={col.id} className="text-left p-3 font-medium text-muted-foreground text-sm whitespace-nowrap">
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length + 1} className="text-center py-12 text-muted-foreground">
                          Bu sheet-də data yoxdur
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead, index) => (
                        <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="p-3 text-sm text-muted-foreground">{index + 1}</td>
                          {columns.filter(c => c.visibleToUser).map(col => (
                            <td key={col.id} className="p-3 text-sm">
                              {col.type === 'phone' ? (
                                <span className="text-primary font-medium">{lead.maskedPhone || (lead as any)[col.dataKey]}</span>
                              ) : col.type === 'select' && col.options ? (
                                <Badge variant="outline">
                                  {col.options.find(o => o.value === (lead as any)[col.dataKey])?.label || (lead as any)[col.dataKey]}
                                </Badge>
                              ) : (
                                (lead as any)[col.dataKey] || '-'
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Excel və Sheet seçin</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lead İdarəetmə</h2>
          <p className="text-sm text-muted-foreground">Layihələri idarə edin</p>
        </div>
        <Dialog open={isProjectDialogOpen} onOpenChange={(open) => {
          setIsProjectDialogOpen(open);
          if (!open) { setEditingProject(null); setProjectForm({ companyId: '', description: '', supervisorIds: [] }); }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProject(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Layihə
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Layihəni Redaktə Et' : 'Yeni Layihə'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Şirkət seçin</Label>
                <Select value={projectForm.companyId} onValueChange={(v) => setProjectForm({ ...projectForm, companyId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Şirkət seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="max-h-48">
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Təsvir</Label>
                <Input
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Layihə haqqında qısa məlumat"
                />
              </div>
              <div className="space-y-2">
                <Label>Layihə tipi</Label>
                <Select value={String(editingProject.projectType)} onValueChange={(v: ProjectType) => setEditingProject({ ...editingProject, projectType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Layihə tipi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(ProjectType.Outbound)}>Outbound</SelectItem>
                    <SelectItem value={String(ProjectType.Inbound)}>Inbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Layihənin növü</Label>
                <Select value={String(editingProject.projectDirection)} onValueChange={(v: ProjectDirection) => setEditingProject({ ...editingProject, projectDirection: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Layihənin növünü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(ProjectDirection.Call)}>Call</SelectItem>
                    <SelectItem value={String(ProjectDirection.Social)}>Sosial şəbəkə</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Layihənin adı</Label>
                <Select value={String(editingProject.projectName)} onValueChange={(v: ProjectName) => setEditingProject({ ...editingProject, projectName: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Layihənin adını seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(ProjectName.Survey)}>Survey</SelectItem>
                    <SelectItem value={String(ProjectName.Telesales)}>Telesales</SelectItem>
                    <SelectItem value={String(ProjectName.Telemarketing)}>Tele Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={editingProject ? handleUpdateProject : handleAddProject}>
                {editingProject ? 'Yenilə' : 'Yarat'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const projectExcels = getProjectExcels(project.id);
          const totalLeads = projectExcels.flatMap(e => getExcelSheets(e.id)).flatMap(s => getSheetLeads(s.id)).length;

          return (
            <Card key={project.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedProject(project)}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => startEditProject(project)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProject(project.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{projectExcels.length} Excel</Badge>
                  <Badge variant="secondary">{totalLeads} lead</Badge>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2" onClick={(e) => e.stopPropagation()}>
                        <Eye className="h-4 w-4" />
                        <Users className="h-4 w-4" />
                        {projectSupervisors.length}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="start">
                      <div className="p-3 border-b border-border">
                        <p className="font-medium text-sm">Supervayzerlər</p>
                      </div>
                      <ScrollArea className="max-h-48">
                        {projectSupervisors.length > 0 ? (
                          <div className="p-2 space-y-1">
                            {projectSupervisors.map((sup) => (
                              <div key={sup.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                  {sup.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{sup.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{sup.email}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Supervayzer təyin olunmayıb
                          </div>
                        )}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {projects.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Heç bir layihə yoxdur. Yeni layihə yaradın.
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadManagement;
