import { addCompany, deleteCompany, getCompanies, getUsers, updateCompany } from '@/api/company';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChat } from '@/contexts/ChatContext';
import { mockCrmUsers, mockStats } from '@/data/mockData';
import { User as CrmUser } from '@/types/crm';
import { ICompany, IUser, ProjectDirection, ProjectName, ProjectType, Roles } from '@/types/types';
import {
    Building2,
    Edit,
    Eye,
    Plus,
    Search,
    Trash2,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const initialCompany: ICompany = {
    _id: '',
    name: '',
    domain: '',
    projectType: ProjectType.Inbound,
    projectDirection: ProjectDirection.Call,
    projectName: ProjectName.Survey,
    supervisors: [],
    agents: [],
    channels: []
}
const CompanyManagement = ({ setSelectedCompany }: any) => {
    const [companies, setCompanies] = useState<ICompany[]>([])
    const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<ICompany>(initialCompany);
    const [selectedSupervisors, setSelectedSupervisors] = useState<string[]>([])
    const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([])
    const [supervisors, setSupervisors] = useState<IUser[]>([])
    const [agents, setAgents] = useState<IUser[]>([])

    useEffect(() => {
        getCompanies().then((d) => setCompanies(d))
        getUsers('').then((_us) => {
            const _s = _us.filter((u) => u.role === Roles.Supervisor)
            const _u = _us.filter((u) => u.role === Roles.Agent)
            setSupervisors(_s)
            setAgents(_u)
        })
    }, [])

    const resetCompanyForm = () => {
        setEditingCompany(initialCompany);
    };

    const handleAddCompany = () => {
        if (!editingCompany.name) {
            toast.error('Şirkət adını daxil edin');
            return;
        }
        addCompany(editingCompany);
        toast.success('Şirkət yaradıldı (default live-chat kanalı ilə)');
        resetCompanyForm();
        setIsCompanyDialogOpen(false);
    };

    const handleUpdateCompany = () => {
        if (!editingCompany) return;
        updateCompany(editingCompany);
        toast.success('Şirkət yeniləndi');
        resetCompanyForm();
        setIsCompanyDialogOpen(false);
    };

    const handleDeleteCompany = (companyId) => {
        deleteCompany(companyId);
        toast.success('Şirkət silindi');
    };


    const startEditCompany = (company: ICompany) => {
        // setEditingCompany(company as any);
        setEditingCompany(company)
        setIsCompanyDialogOpen(true);
        setSelectedSupervisors(company.supervisors.map((sup) => sup._id))
        setSelectedAgentIds(company.agents.map((ag) => ag._id))
    };

    const toggleSupervisor = (supId: string) => {
        setSelectedSupervisors((prev) => prev.includes(supId)
            ? prev.filter(id => id !== supId)
            : [...prev, supId])
    };

    const toggleUser = (agentId: string) => {
        setSelectedAgentIds((prev) => prev.includes(agentId)
            ? prev.filter(id => id !== agentId)
            : [...prev, agentId])
    };

    const company = companies.find((comp) => comp._id === editingCompany._id)

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Şirkətlər</h2>
                <Dialog open={isCompanyDialogOpen} onOpenChange={(open) => { setIsCompanyDialogOpen(open); if (!open) resetCompanyForm(); }}>
                    <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Yeni Şirkət</Button></DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>{editingCompany ? 'Şirkəti Redaktə Et' : 'Yeni Şirkət'}</DialogTitle></DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div><Label>Şirkət adı</Label><Input value={editingCompany.name} onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })} placeholder="Şirkət adı" /></div>
                            <div><Label>Domain</Label><Input value={editingCompany.domain} onChange={(e) => setEditingCompany({ ...editingCompany, domain: e.target.value })} placeholder="example.com" /></div>

                            <div className="space-y-2">
                                <Label>Layihə tipi</Label>
                                <Select value={String(editingCompany.projectType)} onValueChange={(v: ProjectType) => setEditingCompany({ ...editingCompany, projectType: v })}>
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
                                <Select value={String(editingCompany.projectDirection)} onValueChange={(v: ProjectDirection) => setEditingCompany({ ...editingCompany, projectDirection: v })}>
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
                                <Select value={String(editingCompany.projectName)} onValueChange={(v: ProjectName) => setEditingCompany({ ...editingCompany, projectName: v })}>
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

                            <div className="space-y-2">
                                <Label>Supervayzer seçin</Label>
                                <div className="relative mb-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Supervayzer axtar..."
                                        onChange={(e) => { }}
                                        className="pl-9"
                                    />
                                </div>
                                <ScrollArea className="h-32 border rounded-lg p-2">
                                    {supervisors.map((sup) => (
                                        <div key={sup._id} className="flex items-center gap-2 py-1.5 px-1 hover:bg-muted rounded">
                                            <Checkbox
                                                id={`sup-${sup._id}`}
                                                checked={selectedSupervisors.includes(sup._id)}
                                                onCheckedChange={() => toggleSupervisor(sup._id)}
                                            />
                                            <label htmlFor={`sup-${sup._id}`} className="text-sm cursor-pointer flex-1">{sup.name}</label>
                                            <span className="text-xs text-muted-foreground">{sup.email}</span>
                                        </div>
                                    ))}
                                    {supervisors.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Supervayzer tapılmadı</p>}
                                </ScrollArea>
                                {editingCompany.supervisors.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {editingCompany.supervisors.map(_s => {
                                            const sup = company.supervisors.find(s => s._id === _s._id);
                                            return sup ? (
                                                <Badge key={sup._id} variant="secondary" className="gap-1">
                                                    {sup.name}
                                                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleSupervisor(sup._id)} />
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* <div className="space-y-2">
                                <Label>İstifadəçilər seçin (çoxlu seçim)</Label>
                                <div className="relative mb-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Agent axtar..."
                                        value={editingCompany.userSearch}
                                        onChange={(e) => setEditingCompany({ ...editingCompany, userSearch: e.target.value })}
                                        className="pl-9"
                                    />
                                </div>
                                <ScrollArea className="h-32 border rounded-lg p-2">
                                    {company && company.agents.map((agent) => (
                                        <div key={agent._id} className="flex items-center gap-2 py-1.5 px-1 hover:bg-muted rounded">
                                            <Checkbox
                                                id={`agent-${agent._id}`}
                                                checked={editingCompany.agentIds.includes(agent._id)}
                                                onCheckedChange={() => toggleUser(agent._id)}
                                            />
                                            <label htmlFor={`agent-${agent._id}`} className="text-sm cursor-pointer flex-1">{agent.name}</label>
                                            <span className="text-xs text-muted-foreground">{agent.email}</span>
                                        </div>
                                    ))}
                                    {company && company.agents.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Agent tapılmadı</p>}
                                </ScrollArea>
                                {editingCompany.agentIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {editingCompany.agentIds.map(id => {
                                            const agent = company && company.agents.find(a => a._id === id);
                                            return agent ? (
                                                <Badge key={id} variant="secondary" className="gap-1">
                                                    {agent.name}
                                                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleUser(id)} />
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div> */}

                            <Button className="w-full" onClick={editingCompany ? handleUpdateCompany : handleAddCompany}>{editingCompany ? 'Yenilə' : 'Yarat'}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="space-y-3">
                {companies.map((_company) => {
                    return (
                        <Card key={_company._id} className="hover:bg-muted/30 transition-colors">
                            <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => setSelectedCompany(_company)}>
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Building2 className="h-6 w-6" /></div>
                                    <div><p className="font-semibold text-lg">{_company.name}</p><p className="text-sm text-muted-foreground">{_company.domain || 'Domain yoxdur'}</p></div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Popover>
                                        <PopoverTrigger asChild><Button variant="ghost" size="sm" className="gap-2 text-muted-foreground"><Eye className="h-4 w-4" />{_company.agents.length}</Button></PopoverTrigger>
                                        <PopoverContent className="w-64 p-0" align="end">
                                            <div className="p-3 border-b"><p className="font-medium text-sm">Agentlər</p></div>
                                            <ScrollArea className="max-h-48">{_company.agents.length > 0 ? <div className="p-2 space-y-1">{_company.agents.map((agent) => (<div key={agent._id} className="flex items-center gap-2 p-2 rounded hover:bg-muted"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">{agent.name.charAt(0)}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{agent.name}</p><p className="text-xs text-muted-foreground truncate">{agent.email}</p></div></div>))}</div> : <div className="p-4 text-center text-sm text-muted-foreground">Agent yoxdur</div>}</ScrollArea>
                                        </PopoverContent>
                                    </Popover>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); startEditCompany(_company); }}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteCompany(_company._id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div >
    )
}
export default CompanyManagement
