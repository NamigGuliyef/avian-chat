import { addProjectMember, getProjectById, removeProjectMember } from "@/api/company";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import { IProject, IUser, ProjectDirection, ProjectName, ProjectType, Roles } from "@/types/types";
import {
    ArrowLeft,
    Download,
    FileSpreadsheet,
    Filter,
    Search,
    Table2,
    Plus,
    UserPlus,
    Check,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEnumKeyByValue } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { searchUsers } from "@/api/users";


const mockSupervisors = [
    { _id: "1", name: "Ali Supervisor" },
    { _id: "2", name: "Elvin Manager" },
    { _id: "3", name: "Nigar Team Lead" },
];

const SingleProject = () => {
    const [project, setProject] = useState<IProject>({
        supervisors: [] as Partial<IUser>[],
        agents: [] as Partial<IUser>[]
    } as IProject);
    const [supervisors, setSupervisors] = useState<IUser[]>([])
    const [agents, setAgents] = useState<IUser[]>([])
    const [isMemberDialogOpen, setIsMemberDialogOpen] = useState<"A" | "S" | null>(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<IUser[]>([]);
    const debouncedSearch = useDebounce(search, 400);
    const { projectId } = useParams();


    useEffect(() => {
        if (!debouncedSearch || !isMemberDialogOpen) {
            setResults([]);
            return;
        }


        setLoading(true);

        searchUsers({
            query: debouncedSearch.toLowerCase(),
            role: (isMemberDialogOpen === "S" ? Roles.Supervisor : Roles.Agent).toLowerCase()
        })
            .then(setResults)
            .finally(() => setLoading(false));
        setSupervisors(mockSupervisors as any)
    }, [debouncedSearch, isMemberDialogOpen, projectId]);

    const navigate = useNavigate();

    useEffect(() => {
        getProjectById(projectId).then((d) => setProject(d));
    }, [projectId]);

    const handleAddMember = (member: Partial<IUser>, type: "S" | "A") => {
        addProjectMember(projectId, member._id, type).then(() => {
            if (type === "S") {
                setProject((pre) => ({ ...pre, supervisors: [...pre.supervisors, member] as any }))
            } else if (type === "A") {
                setProject((pre) => ({ ...pre, agents: [...pre.agents, member] as any }))
            }
        })
        setIsMemberDialogOpen(null);
    };
    const removeUserFromProject = (projectId, id: string, type: "S" | "A") => {
        removeProjectMember(projectId, id, type).then(() => {
            if (type === "S") {
                setProject((pre) => ({ ...pre, supervisors: pre.supervisors.filter((sp) => sp._id !== id) }))
            } else if (type === "A") {
                setProject((pre) => ({ ...pre, agents: pre.agents.filter((ag) => ag._id !== id) }))
            }
        })
        setIsMemberDialogOpen(null);
    }

    useEffect(() => {
        if (!isMemberDialogOpen) {
            setSearch("");
            setResults([]);
        }
    }, [isMemberDialogOpen]);

    const memberName = isMemberDialogOpen === "S" ? "Supervisor" : "Agent"

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => { navigate(-1) }}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Geri
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">{project.name}</h2>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        <Badge variant="outline" className="text-xs mx-1">
                            {getEnumKeyByValue(ProjectType, project.projectType)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs mx-1">
                            {getEnumKeyByValue(ProjectDirection, project.projectDirection)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs mx-1">
                            {getEnumKeyByValue(ProjectName, project.projectName)}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => { }} disabled={false}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Project Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Project Details
                        <Dialog open={Boolean(isMemberDialogOpen)} onOpenChange={() => setIsMemberDialogOpen(null)}>
                            <div>
                                <Button size="sm" className="mr-2" onClick={() => setIsMemberDialogOpen("S")}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Supervisor
                                </Button>
                                <Button size="sm" onClick={() => setIsMemberDialogOpen("A")}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Agent
                                </Button>
                            </div>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{memberName} əlavə et</DialogTitle>
                                </DialogHeader>
                                <Command>
                                    <CommandInput
                                        placeholder={`${memberName} axtar...`}
                                        value={search}
                                        onValueChange={setSearch}
                                    />
                                    <CommandList>
                                        {loading && (
                                            <CommandEmpty>Yüklənir...</CommandEmpty>
                                        )}

                                        {!loading && results.length === 0 && (
                                            <CommandEmpty>Tapılmadı</CommandEmpty>
                                        )}

                                        <CommandGroup>
                                            {results.map((user) => (
                                                <CommandItem
                                                    key={user._id}
                                                    value={`${user.name} ${user.surname}`}
                                                    onSelect={() => handleAddMember(user, isMemberDialogOpen)}
                                                    className="flex justify-between"
                                                >
                                                    <span>
                                                        {user.name} {user.surname}
                                                    </span>

                                                    {(isMemberDialogOpen === "S"
                                                        ? project.supervisors
                                                        : project.agents
                                                    )?.some(u => u._id === user._id) && <Check />}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>

                                </Command>
                            </DialogContent>
                        </Dialog>
                    </CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="md:col-span-2">
                        <strong>Supervisors:</strong>
                        <div className="flex gap-2 flex-wrap mt-1">
                            {project.supervisors.length ? (
                                project.supervisors.map((s) => (
                                    <Badge key={s._id} variant="secondary">
                                        <p>
                                            {s.name} {s.surname}
                                        </p>
                                        <Button variant="ghost" onClick={() => removeUserFromProject(project._id, s._id, "S")}>
                                            <Trash2 />
                                        </Button>
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-muted-foreground">No supervisors</span>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <strong>Agents:</strong>
                        <div className="flex gap-2 flex-wrap mt-1">
                            {project.agents?.length ? (
                                project.agents.map((a) => (
                                    <Badge key={a._id} variant="outline">
                                        <p>
                                            {a.name} {a.surname}
                                        </p>
                                        <Button variant="ghost" onClick={() => removeUserFromProject(project._id, a._id, "A")}>
                                            <Trash2 />
                                        </Button>
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-muted-foreground">No agents</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Filter:</span>
                        </div>

                        {/* ALL YOUR COMMENTS ARE KEPT BELOW */}
                        {/* <Select value={selectedExcelFilter} onValueChange={(v) => { setSelectedExcelFilter(v); setSelectedSheetFilter(''); setSelectedAgentFilter(''); }}>
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
                        </Select> */}
                        {/* <Select value={selectedSheetFilter} onValueChange={(v) => { setSelectedSheetFilter(v); setSelectedAgentFilter(''); }} disabled={!selectedExcelFilter}>
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
                        </Select> */}
                        {/* {selectedSheetFilter && (
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
                        )} */}
                    </div>
                </CardContent>
            </Card>

            {/* {selectedSheetFilter ? (
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
            )} */}
        </div >
    );
};

export default SingleProject;
