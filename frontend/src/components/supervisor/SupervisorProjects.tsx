"use client";
import {
    FileSpreadsheet,
    FolderKanban,
    Plus,
    Table2
} from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import {
    mockCrmUsers,
    mockProjects,
    mockSupervisorAssignments
} from "@/data/mockData";

import {
    ColumnConfig,
    Excel,
    Project,
    Sheet
} from "@/types/crm";

import { SupervisorContext } from "./SupervisorOutlet";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { getSupervisorProjects } from "@/api/supervisors";
import { IProject } from "@/types/types";

/* ---------------------------------- */

const SupervisorProjects: React.FC = () => {
    const { currentSupervisor, excels, setExcels, sheets, setSheets } =
        useContext(SupervisorContext);

    const [supervisorProjects, setSupervisorProjects] = useState<IProject[]>([])
    /* navigation state */
    const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
    const [selectedExcel, setSelectedExcel] = useState<Excel | null>(null);
    const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);

    /* dialog state */
    const [excelDialog, setExcelDialog] = useState(false);
    const [sheetDialog, setSheetDialog] = useState(false);
    const [columnDialog, setColumnDialog] = useState(false);

    /* edit state */
    const [editingExcel, setEditingExcel] = useState<Excel | null>(null);
    const [editingSheet, setEditingSheet] = useState<Sheet | null>(null);
    const [editingColumn, setEditingColumn] = useState<ColumnConfig | null>(null);

    /* forms */
    const [excelForm, setExcelForm] = useState({
        name: "",
        description: "",
        agentIds: [] as string[],
    });

    useEffect(() => {
        getSupervisorProjects('69511a96fb49f4fb17d67331').then((d) => {
            console.log('dasssa', d)
            setSupervisorProjects(d)
        })
    }, [])

    const [sheetForm, setSheetForm] = useState({
        name: "",
        description: "",
        agentIds: [] as string[],
        agentRowPermissions: [] as any[],
    });

    const [columnForm, setColumnForm] = useState<Partial<ColumnConfig>>({
        name: "",
        dataKey: "",
        type: "text",
        visibleToUser: true,
        editableByUser: true,
        isRequired: false,
        options: [],
        phoneNumbers: [],
    });

    const saveExcel = () => {
        if (!excelForm.name || !selectedProject) return;

        if (editingExcel) {
            setExcels(
                excels.map(e =>
                    e.id === editingExcel.id ? { ...e, ...excelForm } : e
                )
            );
            toast.success("Excel yeniləndi");
        } else {
            setExcels([
                ...excels,
                {
                    id: `excel-${Date.now()}`,
                    projectId: selectedProject._id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    ...excelForm,
                } as Excel,
            ]);
            toast.success("Excel yaradıldı");
        }

        setExcelDialog(false);
        setEditingExcel(null);
        setExcelForm({ name: "", description: "", agentIds: [] });
    };

    /* ---------------------------------- */
    /* Sheet CRUD */

    const saveSheet = () => {
        if (!sheetForm.name || !selectedExcel) return;

        if (editingSheet) {
            setSheets(
                sheets.map(s =>
                    s.id === editingSheet.id ? { ...s, ...sheetForm } : s
                )
            );
            toast.success("Sheet yeniləndi");
        } else {
            setSheets([
                ...sheets,
                {
                    id: `sheet-${Date.now()}`,
                    excelId: selectedExcel.id,
                    projectId: selectedExcel.projectId,
                    columns: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    ...sheetForm,
                } as Sheet,
            ]);
            toast.success("Sheet yaradıldı");
        }

        setSheetDialog(false);
        setEditingSheet(null);
        setSheetForm({
            name: "",
            description: "",
            agentIds: [],
            agentRowPermissions: [],
        });
    };

    /* ---------------------------------- */
    /* Column CRUD */

    const saveColumn = () => {
        if (!columnForm.name || !selectedSheet) return;

        const column: ColumnConfig = {
            id: editingColumn?.id || `col-${Date.now()}`,
            sheetId: selectedSheet.id,
            order: selectedSheet.columns.length + 1,
            ...(columnForm as ColumnConfig),
        };

        const updatedSheet = {
            ...selectedSheet,
            columns: editingColumn
                ? selectedSheet.columns.map(c =>
                    c.id === editingColumn.id ? column : c
                )
                : [...selectedSheet.columns, column],
        };

        setSheets(
            sheets.map(s => (s.id === selectedSheet.id ? updatedSheet : s))
        );
        setSelectedSheet(updatedSheet);

        setColumnDialog(false);
        setEditingColumn(null);
        setColumnForm({
            name: "",
            dataKey: "",
            type: "text",
            visibleToUser: true,
            editableByUser: true,
            isRequired: false,
            options: [],
        });

        toast.success(editingColumn ? "Sütun yeniləndi" : "Sütun əlavə edildi");
    };

    /* ---------------------------------- */
    /* UI */

    return (
        <div>
            {/* PROJECT LIST */}
            {!selectedProject && (
                <>
                    <h2 className="text-2xl font-bold mb-6">Layihələrim</h2>

                    <div className="grid gap-4 md:grid-cols-3">
                        {supervisorProjects.map(project => (
                            <Card
                                key={project._id}
                                className="cursor-pointer hover:border-primary"
                                onClick={() => setSelectedProject(project)}
                            >
                                <CardHeader>
                                    <CardTitle className="flex gap-2 items-center">
                                        <FolderKanban className="h-5 w-5" />
                                        {project.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {project.description}
                                    </p>
                                    <Badge variant="outline">{project.excelIds?.length} Excel</Badge>
                                </CardContent>

                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* EXCEL LEVEL */}
            {selectedProject && !selectedExcel && (
                <>
                    <Button variant="ghost" onClick={() => setSelectedProject(null)}>
                        ← Geri
                    </Button>

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">
                            {selectedProject.name} — Exceller
                        </h2>

                        <Dialog open={excelDialog} onOpenChange={setExcelDialog}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" /> Yeni Excel
                                </Button>
                            </DialogTrigger>

                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Excel</DialogTitle>
                                </DialogHeader>

                                <Input
                                    placeholder="Ad"
                                    value={excelForm.name}
                                    onChange={e =>
                                        setExcelForm({ ...excelForm, name: e.target.value })
                                    }
                                />

                                <Button onClick={saveExcel}>Yadda saxla</Button>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {excels
                            .filter(e => e.projectId === selectedProject._id)
                            .map(excel => (
                                <Card
                                    key={excel.id}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedExcel(excel)}
                                >
                                    <CardContent className="p-4 flex justify-between">
                                        <span>{excel.name}</span>
                                        <Table2 />
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                </>
            )}

            {/* SHEET LEVEL */}
            {selectedExcel && !selectedSheet && (
                <>
                    <Button variant="ghost" onClick={() => setSelectedExcel(null)}>
                        ← Geri
                    </Button>

                    <h2 className="text-xl font-bold mb-4">{selectedExcel.name}</h2>

                    <div className="grid gap-4 md:grid-cols-3">
                        {sheets
                            .filter(s => s.excelId === selectedExcel.id)
                            .map(sheet => (
                                <Card
                                    key={sheet.id}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedSheet(sheet)}
                                >
                                    <CardContent className="p-4 flex justify-between">
                                        <span>{sheet.name}</span>
                                        <FileSpreadsheet />
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                </>
            )}

            {/* COLUMN LEVEL */}
            {selectedSheet && (
                <>
                    <Button variant="ghost" onClick={() => setSelectedSheet(null)}>
                        ← Geri
                    </Button>

                    <h2 className="text-xl font-bold mb-4">{selectedSheet.name}</h2>

                    <Button onClick={() => setColumnDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Yeni sütun
                    </Button>

                    <div className="space-y-2 mt-4">
                        {selectedSheet.columns.map(col => (
                            <Card key={col.id}>
                                <CardContent className="flex justify-between p-3">
                                    <span>{col.name}</span>
                                    <Badge>{col.type}</Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SupervisorProjects;
