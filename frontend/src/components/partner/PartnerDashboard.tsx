import { getPartnerProjects } from "@/api/partners";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PartnerDashboard: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getPartnerProjects();
                setProjects(data);
            } catch (error) {
                console.error("Xəta baş verdi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Xoş gəlmisiniz!</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Layihələrim</CardTitle>
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{projects.length}</div>
                        <p className="text-xs text-muted-foreground">İştirak etdiyiniz layihələr</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6">
                <h3 className="text-xl font-bold mb-4">Aktiv Layihələr</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Card key={project._id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="mb-2">
                                        {project.projectName === "0" ? "Sorğu" : project.projectName === "1" ? "Satış" : "Marketinq"}
                                    </Badge>
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                </div>
                                <CardTitle className="text-lg">
                                    <Link to={`/partner/projects/${project._id}/${project.name}`} className="hover:text-primary">
                                        {project.name}
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2">{project.description || "Təsvir yoxdur"}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PartnerDashboard;
