import { addCompany, deleteCompany, getCompanies, getUsers, updateCompany } from '@/api/admin';
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
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const initialCompany: Partial<ICompany> = {
    name: '',
    domain: ''
}
const AdminCompanies = () => {
    const [companies, setCompanies] = useState<ICompany[]>([])
    const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Partial<ICompany>>(initialCompany);
    const navigate = useNavigate();

    useEffect(() => {
        getCompanies().then((d) => setCompanies(d))
    }, [])

    const resetCompanyForm = () => {
        setEditingCompany(initialCompany);
    };

    const handleAddCompany = () => {
        if (!editingCompany.name) {
            toast.error('Şirkət adını daxil edin');
            return;
        }
        addCompany(editingCompany).then((c) => {
            setCompanies((pre) => ([...pre, c]))
        })
        toast.success('Şirkət yaradıldı (default live-chat kanalı ilə)');
        resetCompanyForm();
        setIsCompanyDialogOpen(false);
    };

    const handleUpdateCompany = async () => {
        if (!editingCompany) return;
        await updateCompany(editingCompany).then(() => {
            setCompanies((pre) => pre.map((comp) => {
                if (comp._id === editingCompany._id) {
                    return { ...comp, ...editingCompany }
                }
                return comp;
            }))
            setEditingCompany(initialCompany)
        })
        toast.success('Şirkət yeniləndi');
        resetCompanyForm();
        setIsCompanyDialogOpen(false);
    };

    const handleDeleteCompany = (companyId) => {
        deleteCompany(companyId).then(() => {
            setCompanies((pre) => pre.filter((cm) => cm._id !== companyId))
        });
        toast.success('Şirkət silindi');
    };


    const startEditCompany = (company: ICompany) => {
        setEditingCompany(company)
        setIsCompanyDialogOpen(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Şirkətlər</h2>
                <Dialog open={isCompanyDialogOpen} onOpenChange={(open) => { setIsCompanyDialogOpen(open); if (!open) resetCompanyForm(); }}>
                    <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Yeni Şirkət</Button></DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>{editingCompany._id ? 'Şirkəti Redaktə Et' : 'Yeni Şirkət'}</DialogTitle></DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div><Label>Şirkət adı</Label><Input value={editingCompany.name} onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })} placeholder="Şirkət adı" /></div>
                            <div><Label>Domain</Label><Input value={editingCompany.domain} onChange={(e) => setEditingCompany({ ...editingCompany, domain: e.target.value })} placeholder="example.com" /></div>
                            <Button className="w-full" onClick={editingCompany._id ? handleUpdateCompany : handleAddCompany}>{editingCompany._id ? 'Yenilə' : 'Yarat'}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="space-y-3">
                {companies.map((_company) => {
                    return (
                        <Card key={_company._id} className="hover:bg-muted/30 transition-colors">
                            <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => navigate(`/admin/companies/${_company._id}`)}>
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Building2 className="h-6 w-6" /></div>
                                    <div><p className="font-semibold text-lg">{_company.name}</p><p className="text-sm text-muted-foreground">{_company.domain || 'Domain yoxdur'}</p></div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* <Popover>
                                        <PopoverTrigger asChild><Button variant="ghost" size="sm" className="gap-2 text-muted-foreground"><Eye className="h-4 w-4" />{_company.agents?.length}</Button></PopoverTrigger>
                                        <PopoverContent className="w-64 p-0" align="end">
                                            <div className="p-3 border-b"><p className="font-medium text-sm">Agentlər</p></div>
                                            <ScrollArea className="max-h-48">{_company.agents?.length > 0 ? <div className="p-2 space-y-1">{_company.agents.map((agent) => (<div key={agent._id} className="flex items-center gap-2 p-2 rounded hover:bg-muted"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">{agent.name.charAt(0)}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{agent.name}</p><p className="text-xs text-muted-foreground truncate">{agent.email}</p></div></div>))}</div> : <div className="p-4 text-center text-sm text-muted-foreground">Agent yoxdur</div>}</ScrollArea>
                                        </PopoverContent>
                                    </Popover> */}
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
export default AdminCompanies
