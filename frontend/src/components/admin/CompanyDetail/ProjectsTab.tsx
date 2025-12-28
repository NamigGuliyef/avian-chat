import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Eye,
    FileSpreadsheet,
    Folder
} from 'lucide-react';


interface Project {
    id: string;
    name: string;
    excelCount: number;
    supervisorCount: number;
    agentCount: number;
    type: 'outbound' | 'inbound';
    kind: 'call' | 'social';
}


const ProjectsTab = ({ companyId }: { companyId: string }) => {

    const mockProjects: Project[] = [
        { id: '1', name: 'Survey Layihəsi', excelCount: 5, supervisorCount: 2, agentCount: 12, type: 'outbound', kind: 'call' },
        { id: '2', name: 'Telesales Kampaniyası', excelCount: 8, supervisorCount: 3, agentCount: 18, type: 'outbound', kind: 'call' },
        { id: '3', name: 'Instagram Dəstək', excelCount: 2, supervisorCount: 1, agentCount: 6, type: 'inbound', kind: 'social' },
        { id: '4', name: 'WhatsApp Xidmət', excelCount: 3, supervisorCount: 2, agentCount: 10, type: 'inbound', kind: 'social' },
    ];


    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Layihələr</h3>
                    <p className="text-sm text-muted-foreground">Bu şirkətə bağlı layihələr</p>
                </div>
            </div>

            <div className="space-y-3">
                {mockProjects.map((project) => (
                    <Card key={project.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Folder className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium">{project.name}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <FileSpreadsheet className="h-3.5 w-3.5" />
                                            <span>{project.excelCount} Excel</span>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {project.type === 'outbound' ? 'Outbound' : 'Inbound'}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {project.kind === 'call' ? 'Call' : 'Sosial'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Eye className="h-4 w-4" />
                                    <span>{project.supervisorCount} Supervayzer</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Eye className="h-4 w-4" />
                                    <span>{project.agentCount} Agent</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {mockProjects.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Bu şirkətdə heç bir layihə yoxdur</p>
                )}
            </div>
        </>
    )
}
export default ProjectsTab
