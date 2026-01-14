"use client";

import {
  CardHeader,
  CardTitle
} from "../ui/card";

import { getSupervisorProjects } from "@/api/supervisors";
import { IProject } from "@/types/types";
import { Eye, FolderKanban, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";

const SupervisorProjects: React.FC = () => {
  const [supervisorProjects, setSupervisorProjects] = useState<IProject[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getSupervisorProjects("695bdaeff2405115af596e24").then((d) => {
      setSupervisorProjects(d);
    });
  }, []);

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
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Layihələrim</h2>
        <p className="text-sm text-muted-foreground">
          Layihə → Excel → Sheet → Sütunlar
        </p>
      </div>

      {/* Excel Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {cardsArray.map((excel) => (
          <Card
            key={excel.excelId}
            className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20"
          >
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">
                {excel.excelName}
              </p>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold text-primary">
                  {excel.agentsCount}
                </span>
                <span className="text-sm text-muted-foreground">nəfər</span>
              </div>
            </CardContent>
          </Card>
        ))}
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
                  <th className="p-3 text-center text-xs uppercase tracking-wide text-muted-foreground">
                    Agentlər
                  </th>
                </tr>
              </thead>

              <tbody>
                {supervisorProjects.flatMap((project) =>
                  project.excelIds?.flatMap((excel) =>
                    excel.sheetIds?.map((sheet) => {
                      const sheetAgents =
                        sheet.agentIds?.map((a) => ({
                          _id: a.agentId,
                          name: a.name,
                          surname: a.surname,
                        })) || [];

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

                          <td className="p-3 text-sm text-muted-foreground">
                            {sheet.name}
                          </td>

                          <td className="p-3 text-center rounded-r-lg">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 rounded-full"
                                >
                                  <Eye className="h-4 w-4" />
                                  {sheetAgents.length}
                                </Button>
                              </PopoverTrigger>

                              <PopoverContent className="w-72 p-4" align="end">
                                <p className="font-semibold text-sm mb-3">
                                  {sheet.name} — Agentlər
                                </p>

                                <ScrollArea className="h-40">
                                  {sheetAgents.length ? (
                                    <div className="space-y-2">
                                      {sheetAgents.map((agent) => (
                                        <div
                                          key={agent._id}
                                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition"
                                        >
                                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-medium">
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

      {/* Projects Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4">Layihələr</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {supervisorProjects.map((project) => (
            <Card
              key={project._id}
              className="cursor-pointer hover:border-primary transition"
              onClick={() =>
                navigate(`/supervisor/projects/${project._id}/${project.name}`)
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

export default SupervisorProjects;
