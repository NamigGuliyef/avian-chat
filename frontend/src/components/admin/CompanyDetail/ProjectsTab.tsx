import { addProject, addProjectMember, deleteProject, getProjects, removeProjectMember } from '@/api/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getEnumKeyByValue } from '@/lib/utils';
import { IProject, IUser, ProjectDirection, ProjectName, ProjectType } from '@/types/types';
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
    Plus,
    Trash2
} from 'lucide-react';

import {
    Folder
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';



const initial: Partial<IProject> = {
    name: '',
    projectType: ProjectType.Inbound,
    projectDirection: ProjectDirection.Call,
    projectName: ProjectName.Survey,
    description: ""
}
const ProjectsTab = () => {
    const { companyId } = useParams()
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [userModal, setUserModal] = useState(false);
    const [projectForm, setProjectForm] = useState(initial);
    const [projects, setProjects] = useState<IProject[]>([])
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const navigate = useNavigate()

    useEffect(() => {
        if (companyId) {
            getProjects(companyId).then((d) => {
                setProjects(d)
            })
        }
    }, [companyId])

    const resetProjectForm = () => {
        setProjectForm({ name: '' });
    };


    const handleAddproject = async () => {
        if (!projectForm.name) {
            toast.error('Layihə adını daxil edin');
            return;
        }
        const d = await addProject({
            companyId: companyId,
            ...projectForm,
            name: projectForm.name.toLowerCase().replace(/\s+/g, '-'),
        });
        setProjects((pre) => ([...pre, d]))
        toast.success('Layihə yaradıldı');
        resetProjectForm();
        setIsProjectDialogOpen(false);
    };

    const handleDeleteProject = (projectId: string) => {
        deleteProject(projectId).then(() => {
            setProjects((pre) => pre.filter((pr) => pr._id !== projectId))
            toast.success('Layihə silindi');
        });
    };


    const removeUserFromProject = (projectId, agent: IUser, type: "S" | "A") => {
        const newProjects = projects.map((pr) => {
            if (pr._id === projectId) {
                if (type === "A") {
                    pr.agents = pr.agents.filter((ag) => ag._id !== agent._id)
                } else if (type === "S") {
                    pr.supervisors = pr.supervisors.filter((ag) => ag._id !== agent._id)
                }
            }
            return pr;
        })
        removeProjectMember(projectId, agent._id, type).then(() => {
            setProjects(newProjects)
        })
    }
    const addUserToProject = (projectId, agent, type: "A" | "S") => {
        const newProjects = projects.map((pr) => {
            if (pr._id === projectId) {
                if (type === "A") {
                    pr.agents = [...pr.agents, agent]
                } else if (type === "S") {
                    pr.supervisors = [...pr.supervisors, agent]
                }
            }
            return pr;
        })
        addProjectMember(projectId, agent._id, type).then(() => {
            setProjects(newProjects)
        })
    }

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Layihələr</h3>
                    <p className="text-sm text-muted-foreground">Bu şirkətə bağlı layihələr</p>
                </div>
                <Dialog open={isProjectDialogOpen} onOpenChange={(open) => {
                    setIsProjectDialogOpen(open);
                    if (!open) resetProjectForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Yeni Layihə
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Yeni Layihə</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Layihə adı</Label>
                                <Input
                                    value={projectForm.name}
                                    onChange={(e) => setProjectForm((pre) => ({ ...pre, name: e.target.value }))}
                                    placeholder="instagram, facebook, whatsapp..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Layihə təsviri</Label>
                                <Input
                                    value={projectForm.description}
                                    onChange={(e) => setProjectForm((pre) => ({ ...pre, description: e.target.value }))}
                                    placeholder="Layihə haqqında..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Layihə tipi</Label>
                                <Select value={projectForm.projectType} onValueChange={(v: ProjectType) => setProjectForm((pre) => ({ ...pre, projectType: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Layihə tipi seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ProjectType.Outbound}>Outbound</SelectItem>
                                        <SelectItem value={ProjectType.Inbound}>Inbound</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Layihənin növü</Label>
                                <Select value={projectForm.projectDirection} onValueChange={(v: ProjectDirection) => setProjectForm((pre) => ({ ...pre, projectDirection: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Layihənin növünü seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ProjectDirection.Call}>Call</SelectItem>
                                        <SelectItem value={ProjectDirection.Social}>Sosial şəbəkə</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Layihənin adı</Label>
                                <Select value={projectForm.projectName} onValueChange={(v: ProjectName) => setProjectForm((pre) => ({ ...pre, projectName: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Layihənin adını seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ProjectName.Survey}>Survey</SelectItem>
                                        <SelectItem value={ProjectName.Telesales}>Telesales</SelectItem>
                                        <SelectItem value={ProjectName.Telemarketing}>Tele Marketing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="w-full" onClick={handleAddproject}>
                                Yarat
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-3">
                {projects.map((project) => (
                    <Card onClick={() => navigate("/admin/projects/" + project._id)} key={project._id} className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Folder className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium">{project.name}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        {/* <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <FileSpreadsheet className="h-3.5 w-3.5" />
                                            <span>{project.excelCount} Excel</span>
                                        </div> */}
                                        <Badge variant="outline" className="text-xs">
                                            {getEnumKeyByValue(ProjectType, project.projectType)}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {getEnumKeyByValue(ProjectDirection, project.projectDirection)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="gap-2 text-sm text-muted-foreground">
                                    {project.supervisors?.length} Supervisors
                                </p>
                                <p className="gap-2 text-sm text-muted-foreground">
                                    {project.agents?.length} Agents
                                </p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setProjectToDelete(project._id)
                                    }}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {projects.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Bu şirkətdə heç bir layihə yoxdur</p>
                )}
            </div>
            <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu layihəni silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (projectToDelete) {
                                    handleDeleteProject(projectToDelete);
                                    setProjectToDelete(null);
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
export default ProjectsTab
