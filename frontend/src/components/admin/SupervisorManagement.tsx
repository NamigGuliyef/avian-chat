import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { mockCrmUsers, mockSupervisorAssignments, mockCompanies } from '@/data/mockData';
import { User as CrmUser, SupervisorAssignment } from '@/types/crm';

const SupervisorManagement: React.FC = () => {
  const [users, setUsers] = useState<CrmUser[]>(mockCrmUsers);
  const [assignments, setAssignments] = useState<SupervisorAssignment[]>(mockSupervisorAssignments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<CrmUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyId: '',
    agentIds: [] as string[]
  });

  const supervisors = users.filter(u => u.role === 'supervayzer');
  const agents = users.filter(u => u.role === 'agent');

  const filteredSupervisors = selectedCompany === 'all' 
    ? supervisors 
    : supervisors.filter(s => s.companyId === selectedCompany);

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', companyId: '', agentIds: [] });
    setEditingSupervisor(null);
  };

  const handleAddSupervisor = () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Bütün xanaları doldurun');
      return;
    }

    const newSupervisor: CrmUser = {
      id: `sup-${Date.now()}`,
      name: form.name,
      email: form.email,
      password: form.password,
      role: 'supervayzer',
      companyId: form.companyId,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setUsers([...users, newSupervisor]);

    // Create assignment for this supervisor
    if (form.agentIds.length > 0) {
      const newAssignment: SupervisorAssignment = {
        id: `assign-${Date.now()}`,
        supervisorId: newSupervisor.id,
        agentIds: form.agentIds,
        createdAt: new Date().toISOString()
      };
      setAssignments([...assignments, newAssignment]);
    }

    resetForm();
    setIsDialogOpen(false);
    toast.success('Supervayzer yaradıldı');
  };

  const handleUpdateSupervisor = () => {
    if (!editingSupervisor) return;

    setUsers(users.map(u => 
      u.id === editingSupervisor.id 
        ? { ...u, name: form.name, email: form.email, companyId: form.companyId }
        : u
    ));

    // Update assignment
    const existingAssignment = assignments.find(a => a.supervisorId === editingSupervisor.id);
    if (existingAssignment) {
      setAssignments(assignments.map(a => 
        a.supervisorId === editingSupervisor.id 
          ? { ...a, agentIds: form.agentIds }
          : a
      ));
    } else if (form.agentIds.length > 0) {
      const newAssignment: SupervisorAssignment = {
        id: `assign-${Date.now()}`,
        supervisorId: editingSupervisor.id,
        agentIds: form.agentIds,
        createdAt: new Date().toISOString()
      };
      setAssignments([...assignments, newAssignment]);
    }

    resetForm();
    setIsDialogOpen(false);
    toast.success('Supervayzer yeniləndi');
  };

  const handleDeleteSupervisor = (supId: string) => {
    setUsers(users.filter(u => u.id !== supId));
    setAssignments(assignments.filter(a => a.supervisorId !== supId));
    toast.success('Supervayzer silindi');
  };

  const startEdit = (supervisor: CrmUser) => {
    const assignment = assignments.find(a => a.supervisorId === supervisor.id);
    setForm({
      name: supervisor.name,
      email: supervisor.email,
      password: '',
      companyId: supervisor.companyId || '',
      agentIds: assignment?.agentIds || []
    });
    setEditingSupervisor(supervisor);
    setIsDialogOpen(true);
  };

  const toggleAgent = (agentId: string) => {
    setForm(prev => ({
      ...prev,
      agentIds: prev.agentIds.includes(agentId)
        ? prev.agentIds.filter(id => id !== agentId)
        : [...prev.agentIds, agentId]
    }));
  };

  const getAssignedAgents = (supervisorId: string) => {
    const assignment = assignments.find(a => a.supervisorId === supervisorId);
    if (!assignment) return [];
    return agents.filter(a => assignment.agentIds.includes(a.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Supervayzerlər</h2>
          <p className="text-sm text-muted-foreground">Supervayzer yaradın və onlara agent təyin edin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSupervisor ? 'Supervayzeri Redaktə Et' : 'Yeni Supervayzer'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Ad</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Supervayzer adı"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              {!editingSupervisor && (
                <div>
                  <Label>Şifrə</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Şifrə"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              <div>
                <Label>Şirkət</Label>
                <Select value={form.companyId} onValueChange={(v) => setForm({ ...form, companyId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Şirkət seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Tabe olan agentlər</Label>
                <p className="text-xs text-muted-foreground mb-2">Bu supervayzerin idarə edəcəyi agentləri seçin</p>
                <ScrollArea className="h-40 border rounded-lg p-2">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center gap-2 py-1.5 px-1 hover:bg-muted rounded">
                      <Checkbox
                        id={`agent-${agent.id}`}
                        checked={form.agentIds.includes(agent.id)}
                        onCheckedChange={() => toggleAgent(agent.id)}
                      />
                      <label htmlFor={`agent-${agent.id}`} className="text-sm cursor-pointer flex-1">
                        {agent.name}
                      </label>
                      <span className="text-xs text-muted-foreground">{agent.email}</span>
                    </div>
                  ))}
                  {agents.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Agent yoxdur</p>
                  )}
                </ScrollArea>
              </div>
              <Button className="w-full" onClick={editingSupervisor ? handleUpdateSupervisor : handleAddSupervisor}>
                {editingSupervisor ? 'Yenilə' : 'Yarat'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Şirkətə görə filter:</Label>
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Bütün şirkətlər</SelectItem>
            {mockCompanies.map((company) => (
              <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Supervisors List */}
      <div className="space-y-3">
        {filteredSupervisors.map((supervisor) => {
          const assignedAgents = getAssignedAgents(supervisor.id);
          const company = mockCompanies.find(c => c.id === supervisor.companyId);

          return (
            <Card key={supervisor.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                    {supervisor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{supervisor.name}</p>
                    <p className="text-sm text-muted-foreground">{supervisor.email}</p>
                    {company && (
                      <Badge variant="outline" className="mt-1">{company.name}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Assigned Agents Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Users className="h-4 w-4" />
                        {assignedAgents.length} agent
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="end">
                      <div className="p-3 border-b border-border">
                        <p className="font-medium text-sm">Tabe olan agentlər</p>
                      </div>
                      <ScrollArea className="h-48">
                        {assignedAgents.length > 0 ? (
                          <div className="p-2 space-y-1">
                            {assignedAgents.map((agent) => (
                              <div key={agent.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                  {agent.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{agent.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{agent.email}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Agent təyin olunmayıb
                          </div>
                        )}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>

                  {!supervisor.isActive && (
                    <Badge variant="secondary">Deaktiv</Badge>
                  )}

                  <Button variant="ghost" size="icon" onClick={() => startEdit(supervisor)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteSupervisor(supervisor.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredSupervisors.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Supervayzer yoxdur
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorManagement;