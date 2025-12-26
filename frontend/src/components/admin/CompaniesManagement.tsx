import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Building2, Search, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from '@/contexts/ChatContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { mockCrmUsers } from '@/data/mockData';

const CompaniesManagement: React.FC = () => {
  const { companies, addCompany, updateCompany, deleteCompany } = useChat();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    projectType: '' as '' | 'outbound' | 'inbound',
    projectKind: '' as '' | 'call' | 'social',
    projectName: '' as '' | 'survey' | 'telesales' | 'telemarketing',
    supervisorIds: [] as string[],
    userIds: [] as string[],
  });

  const [supervisorSearch, setSupervisorSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const supervisors = mockCrmUsers.filter(u => u.role === 'supervayzer');
  const agents = mockCrmUsers.filter(u => u.role === 'agent');

  const filteredSupervisors = supervisors.filter(s => 
    s.name.toLowerCase().includes(supervisorSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(supervisorSearch.toLowerCase())
  );

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: '', domain: '', projectType: '', projectKind: '', projectName: '', supervisorIds: [], userIds: [] });
    setSupervisorSearch('');
    setUserSearch('');
  };

  const handleAddCompany = () => {
    if (!formData.name || !formData.domain) return;
    
    addCompany({
      name: formData.name,
      domain: formData.domain,
      email: '',
      website: '',
    });
    resetForm();
    setIsAddOpen(false);
  };

  const handleUpdateCompany = (companyId: string) => {
    updateCompany(companyId, {
      name: formData.name,
      domain: formData.domain,
    });
    setEditingCompany(null);
    resetForm();
  };

  const startEdit = (company: typeof companies[0]) => {
    setFormData({
      name: company.name,
      domain: company.domain,
      projectType: '',
      projectKind: '',
      projectName: '',
      supervisorIds: [],
      userIds: [],
    });
    setEditingCompany(company.id);
  };

  const toggleSupervisor = (supId: string) => {
    setFormData(prev => ({
      ...prev,
      supervisorIds: prev.supervisorIds.includes(supId)
        ? prev.supervisorIds.filter(id => id !== supId)
        : [...prev.supervisorIds, supId]
    }));
  };

  const toggleUser = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter(id => id !== userId)
        : [...prev.userIds, userId]
    }));
  };

  return (
    <div className="flex-1 p-6 bg-background overflow-auto">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Şirkətlər</h1>
          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                Yeni şirkət
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni şirkət əlavə et</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Şirkət adı *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Şirkət adı daxil edin"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Şirkət domain *</Label>
                  <Input
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Layihə tipi</Label>
                  <Select value={formData.projectType} onValueChange={(v: 'outbound' | 'inbound') => setFormData({ ...formData, projectType: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Layihə tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outbound">Outbound</SelectItem>
                      <SelectItem value="inbound">Inbound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Layihənin növü</Label>
                  <Select value={formData.projectKind} onValueChange={(v: 'call' | 'social') => setFormData({ ...formData, projectKind: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Layihənin növünü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="social">Sosial şəbəkə</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Layihənin adı</Label>
                  <Select value={formData.projectName} onValueChange={(v: 'survey' | 'telesales' | 'telemarketing') => setFormData({ ...formData, projectName: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Layihənin adını seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="survey">Survey</SelectItem>
                      <SelectItem value="telesales">Telesales</SelectItem>
                      <SelectItem value="telemarketing">Tele Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Supervayzer seçin</Label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Supervayzer axtar..."
                      value={supervisorSearch}
                      onChange={(e) => setSupervisorSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <ScrollArea className="h-32 border rounded-lg p-2">
                    {filteredSupervisors.map((sup) => (
                      <div key={sup.id} className="flex items-center gap-2 py-1.5 px-1 hover:bg-muted rounded">
                        <Checkbox
                          id={`sup-${sup.id}`}
                          checked={formData.supervisorIds.includes(sup.id)}
                          onCheckedChange={() => toggleSupervisor(sup.id)}
                        />
                        <label htmlFor={`sup-${sup.id}`} className="text-sm cursor-pointer flex-1">{sup.name}</label>
                        <span className="text-xs text-muted-foreground">{sup.email}</span>
                      </div>
                    ))}
                    {filteredSupervisors.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Supervayzer tapılmadı</p>}
                  </ScrollArea>
                  {formData.supervisorIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.supervisorIds.map(id => {
                        const sup = supervisors.find(s => s.id === id);
                        return sup ? (
                          <Badge key={id} variant="secondary" className="gap-1">
                            {sup.name}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => toggleSupervisor(id)} />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>İstifadəçilər seçin (çoxlu seçim)</Label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Agent axtar..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <ScrollArea className="h-32 border rounded-lg p-2">
                    {filteredAgents.map((agent) => (
                      <div key={agent.id} className="flex items-center gap-2 py-1.5 px-1 hover:bg-muted rounded">
                        <Checkbox
                          id={`agent-${agent.id}`}
                          checked={formData.userIds.includes(agent.id)}
                          onCheckedChange={() => toggleUser(agent.id)}
                        />
                        <label htmlFor={`agent-${agent.id}`} className="text-sm cursor-pointer flex-1">{agent.name}</label>
                        <span className="text-xs text-muted-foreground">{agent.email}</span>
                      </div>
                    ))}
                    {filteredAgents.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Agent tapılmadı</p>}
                  </ScrollArea>
                  {formData.userIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.userIds.map(id => {
                        const agent = agents.find(a => a.id === id);
                        return agent ? (
                          <Badge key={id} variant="secondary" className="gap-1">
                            {agent.name}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => toggleUser(id)} />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <Button onClick={handleAddCompany} className="w-full">
                  Əlavə et
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{company.name}</p>
                  <p className="text-sm text-muted-foreground">{company.domain}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={editingCompany === company.id} onOpenChange={(open) => !open && setEditingCompany(null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => startEdit(company)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Şirkəti redaktə et</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Şirkət adı</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Domen</Label>
                        <Input
                          value={formData.domain}
                          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        />
                      </div>
                      <Button onClick={() => handleUpdateCompany(company.id)} className="w-full">
                        Yadda saxla
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" onClick={() => deleteCompany(company.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompaniesManagement;
