"use client";
import {
    CardHeader,
    CardTitle
} from "../ui/card";

import { getSupervisorProjects } from "@/api/supervisors";
import { IProject } from "@/types/types";
import { Eye, FolderKanban } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";


const SupervisorProjects: React.FC = () => {
    const [supervisorProjects, setSupervisorProjects] = useState<IProject[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        getSupervisorProjects('69511a96fb49f4fb17d67331').then((d) => {
            console.log('dasssa', d)
            setSupervisorProjects(d)
        })
    }, [])

    const excelCards = supervisorProjects.reduce((acc, project) => {
        project.excelIds?.forEach((excel) => {
            if (!acc[excel._id]) {
                acc[excel._id] = {
                    excelId: excel._id,
                    excelName: excel.name,
                    agentsCount: 0,
                };
            }

            acc[excel._id].agentsCount += excel.agentIds.length;
        });

        return acc;
    }, {} as Record<string, { excelId: string; excelName: string; agentsCount: number }>);

    const cardsArray = Object.values(excelCards);

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Layihələrim</h2>
                <p className="text-sm text-muted-foreground">Layihə → Excel → Sheet → Sütunlar</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 mb-8">
                {cardsArray.map((excel) => {
                    return (
                        <Card key={excel.excelId} className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground mb-1">{excel.excelName}</p>
                                <p className="text-3xl font-bold text-primary">{excel.agentsCount} nəfər</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
            <Card className="mb-6">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Layihə Statusu – Detal</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left p-3 font-medium text-muted-foreground">Layihə adı</th>
                                    <th className="text-left p-3 font-medium text-muted-foreground">Excel adı</th>
                                    <th className="text-left p-3 font-medium text-muted-foreground">Sheet adı</th>
                                    <th className="text-center p-3 font-medium text-muted-foreground">Agentlər</th>
                                </tr>
                            </thead>

                            <tbody>
                                {supervisorProjects.flatMap((project) =>
                                    project.excelIds?.flatMap((excel) =>
                                        project.sheetIds
                                            ?.filter((sheet) => sheet.excelId === excel._id)
                                            .map((sheet) => {
                                                const sheetAgents =
                                                    project.agents?.filter((agent) =>
                                                        sheet.agentIds.includes(agent._id)
                                                    ) || [];

                                                return (
                                                    <tr
                                                        key={sheet._id}
                                                        className="border-b border-border/50 hover:bg-muted/50"
                                                    >
                                                        <td className="p-3">
                                                            {project.name || "Adsız layihə"}
                                                        </td>

                                                        <td className="p-3">{excel.name}</td>

                                                        <td className="p-3">{sheet.name}</td>

                                                        <td className="p-3 text-center">
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <Eye />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent align="end" side="bottom" className="w-64 p-3">
                                                                    <p className="font-medium">"{sheet.name}" agentləri</p>
                                                                    <ScrollArea className="h-32 mt-4">
                                                                        {sheetAgents.length > 0 ? (
                                                                            <div className="space-y-2">
                                                                                {sheetAgents.map((agent) => (
                                                                                    <div
                                                                                        key={agent._id}
                                                                                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                                                                                    >
                                                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                                                            {agent.name.charAt(0)}
                                                                                        </div>
                                                                                        <span className="font-medium">
                                                                                            {agent.name} {agent.surname}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-center text-muted-foreground py-4">
                                                                                Agent yoxdur
                                                                            </p>
                                                                        )}
                                                                    </ScrollArea>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <h2 className="text-xl font-bold mb-4">Layihələr</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {supervisorProjects.map((project) => {
                    return (
                        <Card key={project._id} className="cursor-pointer hover:border-primary" onClick={() => { navigate(`/supervisor/projects/${project._id}/${project.name}`) }}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FolderKanban className="h-5 w-5 text-primary" />
                                    {project.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent><p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                                <Badge variant="outline">{project.excelIds?.length} excel</Badge>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default SupervisorProjects;
