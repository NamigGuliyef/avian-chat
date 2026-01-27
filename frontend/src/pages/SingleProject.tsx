import { addProjectMember, getProjectById, removeProjectMember } from "@/api/admin";
import { searchUsers } from "@/api/users";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { getEnumKeyByValue } from "@/lib/utils";
import { IProject, IUser, ProjectDirection, ProjectName, ProjectType, Roles } from "@/types/types";
import {
    ArrowLeft,
    Check,
    Trash2,
    UserPlus
} from 'lucide-react';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const SingleProject = () => {
    const [project, setProject] = useState<IProject>({
        supervisors: [] as Partial<IUser>[],
        agents: [] as Partial<IUser>[]
    } as IProject);
    // const [isUserChannelDialog, setIsUserChannelDialog] = useState(['', ''])
    // const [selectedChannels, setSelectedChannels] = useState([])
    const [isMemberDialogOpen, setIsMemberDialogOpen] = useState<"A" | "S" | null>(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<IUser[]>([]);
    const [memberToRemove, setMemberToRemove] = useState<{ id: string, type: "S" | "A" } | null>(null);
    // const [channels, setChannels] = useState<IChannel[]>([]);
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
            role: (isMemberDialogOpen === "S" ? Roles.Supervisor : Roles.Agent)
        })
            .then(setResults)
            .finally(() => setLoading(false));
    }, [debouncedSearch, isMemberDialogOpen, projectId]);

    const navigate = useNavigate();

    useEffect(() => {
        getProjectById(projectId).then((d) => {
            // getChannels(d.companyId).then((c) => {
            //     setChannels(c)
            // })
            setProject(d)
        });
    }, [projectId]);

    const handleAddMember = (member: Partial<IUser>, type: "S" | "A") => {
        let isExist = null;
        if (type === "S") {
            isExist = project.supervisors.find((s) => s._id === member._id)
        } else if (type === "A") {
            isExist = project.agents.find((a) => a._id === member._id)
        }
        if (isExist) {
            toast({
                title: "Xəta",
                description: "Əməkdaş artıq əlavə edilib",
                variant: "destructive",
            });
            return;
        }
        addProjectMember(projectId, member._id, type).then(() => {
            if (type === "S") {
                setProject((pre) => ({ ...pre, supervisors: [...pre.supervisors, member] as any }))
            } else if (type === "A") {
                setProject((pre) => ({ ...pre, agents: [...pre.agents, member] as any }))
            }
        })
        setIsMemberDialogOpen(null);
    };
    const removeUserFromProject = (projectId: string, id: string, type: "S" | "A") => {
        removeProjectMember(projectId, id, type).then(() => {
            if (type === "S") {
                setProject((pre) => ({ ...pre, supervisors: pre.supervisors.filter((sp) => sp._id !== id) }))
            } else if (type === "A") {
                setProject((pre) => ({ ...pre, agents: pre.agents.filter((ag) => ag._id !== id) }))
            }
            toast({
                title: "Uğurlu",
                description: "Üzv layihədən çıxarıldı",
            });
        })
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
                        <strong className="text-base">Supervisors:</strong>
                        <div className="flex gap-2 flex-wrap mt-1">
                            {project.supervisors.length ? (
                                project.supervisors.map((s) => (
                                    <Card key={s._id} style={{ minWidth: 300 }}>
                                        <CardContent className="flex items-center justify-between p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{s.name}</p>
                                                    <p className="text-sm text-muted-foreground">{s.email}</p>
                                                </div>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setMemberToRemove({ id: s._id, type: "S" })}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <span className="text-muted-foreground">No supervisors</span>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <strong className="text-base">Agents:</strong>
                        <div className="flex gap-2 flex-wrap mt-1">
                            {project.agents?.length ? (
                                project.agents.map((a) => (
                                    <Card key={a._id} style={{ minWidth: 300 }}>
                                        <CardContent className="flex items-center justify-between p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                    {a.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{a.name}</p>
                                                    <p className="text-sm text-muted-foreground">{a.email}</p>
                                                    {/* <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        {(a.channelIds).map((ch) => <Badge key={ch._id} variant="outline" className="text-xs">
                                                            {ch.name}
                                                        </Badge>
                                                        )}
                                                    </div> */}
                                                </div>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setMemberToRemove({ id: a._id, type: "A" })}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <span className="text-muted-foreground">No agents</span>
                            )}
                        </div>
                    </div>
                </CardContent >
            </Card >


            <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu üzvü layihədən çıxarmaq istədiyinizə əminsiniz?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (memberToRemove && projectId) {
                                    removeUserFromProject(projectId, memberToRemove.id, memberToRemove.type);
                                    setMemberToRemove(null);
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Çıxar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
};

export default SingleProject;
