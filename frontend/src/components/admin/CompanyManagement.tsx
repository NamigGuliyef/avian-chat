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
import { Company } from '@/types/chat';
import { User as CrmUser } from '@/types/crm';
import {
    Building2,
    Edit,
    Eye,
    Plus,
    Search,
    Trash2,
    X
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
const CompanyManagement = ({ setSelectedCompany }: any) => {
    const {
        users,
        companies,
        addCompany,
        updateCompany,
        deleteCompany,
    } = useChat();
    const [crmUsers, setCrmUsers] = useState<CrmUser[]>(mockCrmUsers);
    const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<string | null>(null);
    const [stats] = useState(mockStats);


    const [companyForm, setCompanyForm] = useState({
        name: '',
        domain: '',
        projectType: '' as '' | 'outbound' | 'inbound',
        projectKind: '' as '' | 'call' | 'social',
        projectName: '' as '' | 'survey' | 'telesales' | 'telemarketing',
        supervisorIds: [] as string[],
        userIds: [] as string[],
        supervisorSearch: '',
        userSearch: ''
    });

    const resetCompanyForm = () => {
        setCompanyForm({
            name: '',
            domain: '',
            projectType: '',
            projectKind: '',
            projectName: '',
            supervisorIds: [],
            userIds: [],
            supervisorSearch: '',
            userSearch: ''
        });
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
        // setCompanyForm(company as any);
        setCompanyForm({
            name: '',
            domain: '',
            projectType: '',
            projectKind: '',
            projectName: '',
            supervisorIds: [],
            userIds: [],
            supervisorSearch: '',
            userSearch: ''
        })
        setEditingCompany(company.id);
        setIsCompanyDialogOpen(true);
    };

    const getCompanyAgents = (companyId: string) => users.filter(u => u.companyId === companyId);

    const supervisors = crmUsers.filter(u => u.role === 'supervayzer');
    const agents = crmUsers.filter(u => u.role === 'agent');


    const filteredSupervisors = supervisors.filter(s =>
        s.name.toLowerCase().includes(companyForm.supervisorSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(companyForm.supervisorSearch.toLowerCase())
    );

    const filteredAgents = agents.filter(a =>
        a.name.toLowerCase().includes(companyForm.userSearch.toLowerCase()) ||
        a.email.toLowerCase().includes(companyForm.userSearch.toLowerCase())
    );

    const toggleSupervisor = (supId: string) => {
        setCompanyForm(prev => ({
            ...prev,
            supervisorIds: prev.supervisorIds.includes(supId)
                ? prev.supervisorIds.filter(id => id !== supId)
                : [...prev.supervisorIds, supId]
        }));
    };

    const toggleUser = (userId: string) => {
        setCompanyForm(prev => ({
            ...prev,
            userIds: prev.userIds.includes(userId)
                ? prev.userIds.filter(id => id !== userId)
                : [...prev.userIds, userId]
        }));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Şirkətlər</h2>
                <Dialog open={isCompanyDialogOpen} onOpenChange={(open) => { setIsCompanyDialogOpen(open); if (!open) resetCompanyForm(); }}>
                    <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Yeni Şirkət</Button></DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>{editingCompany ? 'Şirkəti Redaktə Et' : 'Yeni Şirkət'}</DialogTitle></DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div><Label>Şirkət adı</Label><Input value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} placeholder="Şirkət adı" /></div>
                            <div><Label>Domain</Label><Input value={companyForm.domain} onChange={(e) => setCompanyForm({ ...companyForm, domain: e.target.value })} placeholder="example.com" /></div>

                            <div className="space-y-2">
                                <Label>Layihə tipi</Label>
                                <Select value={companyForm.projectType} onValueChange={(v: 'outbound' | 'inbound') => setCompanyForm({ ...companyForm, projectType: v })}>
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
                                <Select value={companyForm.projectKind} onValueChange={(v: 'call' | 'social') => setCompanyForm({ ...companyForm, projectKind: v })}>
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
                                <Select value={companyForm.projectName} onValueChange={(v: 'survey' | 'telesales' | 'telemarketing') => setCompanyForm({ ...companyForm, projectName: v })}>
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
                                        value={companyForm.supervisorSearch}
                                        onChange={(e) => setCompanyForm({ ...companyForm, supervisorSearch: e.target.value })}
                                        className="pl-9"
                                    />
                                </div>
                                <ScrollArea className="h-32 border rounded-lg p-2">
                                    {filteredSupervisors.map((sup) => (
                                        <div key={sup.id} className="flex items-center gap-2 py-1.5 px-1 hover:bg-muted rounded">
                                            <Checkbox
                                                id={`sup-${sup.id}`}
                                                checked={companyForm.supervisorIds.includes(sup.id)}
                                                onCheckedChange={() => toggleSupervisor(sup.id)}
                                            />
                                            <label htmlFor={`sup-${sup.id}`} className="text-sm cursor-pointer flex-1">{sup.name}</label>
                                            <span className="text-xs text-muted-foreground">{sup.email}</span>
                                        </div>
                                    ))}
                                    {filteredSupervisors.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Supervayzer tapılmadı</p>}
                                </ScrollArea>
                                {companyForm.supervisorIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {companyForm.supervisorIds.map(id => {
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
                                        value={companyForm.userSearch}
                                        onChange={(e) => setCompanyForm({ ...companyForm, userSearch: e.target.value })}
                                        className="pl-9"
                                    />
                                </div>
                                <ScrollArea className="h-32 border rounded-lg p-2">
                                    {filteredAgents.map((agent) => (
                                        <div key={agent.id} className="flex items-center gap-2 py-1.5 px-1 hover:bg-muted rounded">
                                            <Checkbox
                                                id={`agent-${agent.id}`}
                                                checked={companyForm.userIds.includes(agent.id)}
                                                onCheckedChange={() => toggleUser(agent.id)}
                                            />
                                            <label htmlFor={`agent-${agent.id}`} className="text-sm cursor-pointer flex-1">{agent.name}</label>
                                            <span className="text-xs text-muted-foreground">{agent.email}</span>
                                        </div>
                                    ))}
                                    {filteredAgents.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Agent tapılmadı</p>}
                                </ScrollArea>
                                {companyForm.userIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {companyForm.userIds.map(id => {
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
    )
}
export default CompanyManagement
