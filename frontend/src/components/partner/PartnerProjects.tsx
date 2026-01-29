"use client";

import {
    CardHeader,
    CardTitle
} from "../ui/card";

import { getPartnerProjects } from "@/api/partners";
import { IProject } from "@/types/types";
import { FolderKanban } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

const PartnerProjects: React.FC = () => {
    const [partnerProjects, setPartnerProjects] = useState<IProject[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        getPartnerProjects().then((d) => {
            setPartnerProjects(d);
        });
    }, []);

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold">Layihələrim</h2>
                <p className="text-sm text-muted-foreground">
                    Layihə → Excel → Sheet → Sütunlar
                </p>
            </div>

            {/* Detail Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Layihə Statusu – Detal</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead className="bg-muted/40">
                                <tr>
                                    <th className="p-3 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        Layihə
                                    </th>
                                    <th className="p-3 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        Excel
                                    </th>
                                    <th className="p-3 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        Sheet
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {partnerProjects.flatMap((project) =>
                                    project.excelIds?.flatMap((excel) =>
                                        excel.sheetIds?.map((sheet) => {
                                            return (
                                                <tr
                                                    key={sheet._id}
                                                    className="bg-background rounded-lg shadow-sm hover:shadow-md transition"
                                                >
                                                    <td className="p-3 font-medium rounded-l-lg">
                                                        <div className="flex items-center gap-2">
                                                            <FolderKanban className="h-4 w-4 text-primary" />
                                                            {project.name}
                                                        </div>
                                                    </td>

                                                    <td className="p-3">
                                                        <Badge variant="secondary">{excel.name}</Badge>
                                                    </td>

                                                    <td className="p-3 text-sm text-muted-foreground rounded-r-lg">
                                                        {sheet.name}
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

            {/* Projects Grid */}
            <div>
                <h2 className="text-xl font-bold mb-4">Layihələr</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {partnerProjects.map((project) => (
                        <Card
                            key={project._id}
                            className="cursor-pointer hover:border-primary transition"
                            onClick={() =>
                                navigate(`/partner/projects/${project._id}/${project.name}`)
                            }
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FolderKanban className="h-5 w-5 text-primary" />
                                    {project.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {project.description}
                                </p>
                                <Badge variant="outline">
                                    {project.excelIds?.length} excel
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PartnerProjects;
