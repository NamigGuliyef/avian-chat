"use client";

import { getAdminColumns } from "@/api/column";
import {
    createExcelSheet,
    getExcelSheets,
    getProjectAgents,
    getSupervisorColumns,
    updateExcelSheet,
} from "@/api/supervisors";
import { IAgentRowPermission, ISheet, SheetColumnForm } from "@/types/types";
import { Edit, Plus, Table2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Card, CardContent,
    CardHeader,
    CardTitle
} from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";

// -----------------------------
// Types
// -----------------------------

interface SheetCreateDto {
    name: string;
    description: string;
    columnIds: SheetColumnForm[];
    agentIds: IAgentRowPermission[];
}

const emptyForm: SheetCreateDto = {
    name: "",
    description: "",
    columnIds: [],
    agentIds: []
};



const SupervisorSingleExcel: React.FC = () => {
    const [sheets, setSheets] = useState<ISheet[]>([]);
    const [columns, setColumns] = useState<any[]>([]);
    const [agentIds, setAgentIds] = useState<IAgentRowPermission[]>([]);
    const [open, setOpen] = useState(false);
    const [editingSheet, setEditingSheet] = useState<ISheet | null>(null);
    const [sheetForm, setSheetForm] = useState<SheetCreateDto>(emptyForm);

    const { excelId, excelName, projectId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!excelId) return;
        getExcelSheets(excelId).then(setSheets);
        getAdminColumns().then((d) => {
            getSupervisorColumns(projectId).then((d2) => {
                setColumns(() => [...d, ...d2])
            })
        });
    }, [excelId]);

    useEffect(() => {
        if (!projectId) return;
        getProjectAgents(projectId).then((d) => setAgentIds(d.map((a) => ({
            agentId: a._id,
            name: a.name,
            surname: a.surname,
            startRow: '',
            endRow: ''
        }))));
    }, [projectId]);

    // -----------------------------
    // Helpers
    // -----------------------------
    const toggleColumn = (columnId: any) => {
        setSheetForm((prev) => {
            const exists = prev.columnIds.find((c) => c.columnId === columnId);

            if (exists) {
                return {
                    ...prev,
                    columnIds: prev.columnIds.filter((c) => c.columnId !== columnId),
                };
            }

            return {
                ...prev,
                columnIds: [
                    ...prev.columnIds,
                    {
                        columnId,
                        editable: true,
                        required: false,
                        order: prev.columnIds.length + 1,
                    },
                ],
            };
        });
    };

    const toggleAgent = (agent: IAgentRowPermission) => {
        setSheetForm((prev) => {
            const exists = prev.agentIds.find(a => a.agentId === agent.agentId);

            if (exists) {
                return {
                    ...prev,
                    agentIds: prev.agentIds.filter(a => a.agentId !== agent.agentId),
                };
            }

            return {
                ...prev,
                agentIds: [
                    ...prev.agentIds,
                    {
                        agentId: agent.agentId,
                        name: agent.name,
                        surname: agent.surname,
                        startRow: "",
                        endRow: "",
                    },
                ],
            };
        });
    };
    const updateAgentRow = (
        agentId: string,
        field: "startRow" | "endRow",
        value: string
    ) => {
        if (+(value) <= 0 && value.length > 0) {
            toast("Dəyər 1dən yuxarı olmalıdır!")
            return
        }
        setSheetForm((prev) => ({
            ...prev,
            agentIds: prev.agentIds.map((a) =>
                a.agentId === agentId ? { ...a, [field]: value } : a
            ),
        }));
    };


    const updateColumnField = (
        columnId: any,
        field: keyof Omit<SheetColumnForm, "columnId">,
        value: boolean | number
    ) => {
        if (field === "order" && typeof value === "number" && value <= 0) {
            toast("Sıra 1-dən başlayır!");
            return;
        }
        if (sheetForm.columnIds.map(c => c.order).includes(value as number) && field === "order") {
            toast("Eyni sıranı təyin etmək olmaz!");
            return;
        }
        setSheetForm((prev) => ({
            ...prev,
            columnIds: prev.columnIds.map((c) =>
                c.columnId === columnId ? { ...c, [field]: value } : c
            ),
        }));
    };

    const handleSave = async () => {
        if (!sheetForm.name) return;

        const payload = {
            ...sheetForm,
            excelId,
            projectId,
        };

        if (editingSheet) {
            const updated = await updateExcelSheet(editingSheet._id, payload);
            setSheets((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
        } else {
            const created = await createExcelSheet(payload);
            setSheets((prev) => [...prev, created]);
        }

        setOpen(false);
        setEditingSheet(null);
        setSheetForm(emptyForm);
    };

    // -----------------------------
    // Render
    // -----------------------------
    return (
        <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">← Geri</Button>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{excelName}</h2>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setOpen(true); setEditingSheet(null); setSheetForm(emptyForm); }}>
                            <Plus className="h-4 w-4 mr-2" /> Yeni Sheet
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-xl">
                        <ScrollArea className="max-h-[75vh] pr-4">
                            <div className="space-y-4">
                                <DialogHeader>
                                    <DialogTitle>{editingSheet ? 'Sheet-i Redaktə Et' : 'Yeni Sheet'}</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <div>
                                        <Label>Ad</Label>
                                        <Input value={sheetForm.name} onChange={(e) => setSheetForm({ ...sheetForm, name: e.target.value })} />
                                    </div>

                                    <div>
                                        <Label>Təsvir</Label>
                                        <Input value={sheetForm.description} onChange={(e) => setSheetForm({ ...sheetForm, description: e.target.value })} />
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Sütunlar</Label>
                                        <ScrollArea className="h-64 border rounded-lg p-2">
                                            {columns.map((col) => {
                                                const selected = sheetForm.columnIds.find((c) => c.columnId === col._id);

                                                return (
                                                    <div key={col._id} className="border-b last:border-0 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox checked={!!selected} onCheckedChange={() => toggleColumn(col._id)} />
                                                            <span className="font-medium text-sm">{col.name}</span>
                                                        </div>

                                                        {selected && (
                                                            <div className="ml-6 mt-2 flex items-center gap-4 text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <Checkbox checked={selected.editable} onCheckedChange={(v) => updateColumnField(col._id, 'editable', Boolean(v))} />
                                                                    <span>Edit</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Checkbox checked={selected.required} onCheckedChange={(v) => updateColumnField(col._id, 'required', Boolean(v))} />
                                                                    <span>Required</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 max-w-20">
                                                                    <Input
                                                                        type="text"
                                                                        value={selected.order}
                                                                        onChange={(e) =>
                                                                            updateColumnField(
                                                                                col._id,
                                                                                "order",
                                                                                Number(e.target.value)
                                                                            )
                                                                        }
                                                                    />
                                                                    <span>Sıra</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </ScrollArea>
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">Agentlər</Label>
                                        <ScrollArea className="h-64 border rounded-lg p-2">
                                            {agentIds.map((agent) => {
                                                const selected = sheetForm.agentIds.find(
                                                    (a) => a.agentId === agent.agentId
                                                );

                                                return (
                                                    <div key={agent.agentId} className="border-b last:border-0 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={!!selected}
                                                                onCheckedChange={() => toggleAgent(agent)}
                                                            />
                                                            <span className="font-medium text-sm">
                                                                {agent.name} {agent.surname}
                                                            </span>
                                                        </div>

                                                        {selected && (
                                                            <div className="ml-6 mt-3 grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <Label className="text-xs">Start row</Label>
                                                                    <Input
                                                                        type="text"
                                                                        value={selected.startRow}
                                                                        onChange={(e) =>
                                                                            updateAgentRow(
                                                                                agent.agentId,
                                                                                "startRow",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <Label className="text-xs">End row</Label>
                                                                    <Input
                                                                        type="text"
                                                                        value={selected.endRow}
                                                                        onChange={(e) =>
                                                                            updateAgentRow(
                                                                                agent.agentId,
                                                                                "endRow",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </ScrollArea>
                                    </div>
                                    <Button className="w-full" onClick={handleSave}>Yadda saxla</Button>
                                </div>
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sheets.map((item) => (
                    <Card key={item._id} className="cursor-pointer hover:border-primary" onClick={() => navigate(`/supervisor/sheets/${projectId}/${excelId}/${item._id}/${item.name}`)}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Table2 className="h-5 w-5 text-primary" />
                                    {item.name}
                                </div>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingSheet(item); setSheetForm({ name: item.name, description: item.description || '', columnIds: item.columnIds, agentIds: item.agentIds }); setOpen(true); }}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <Badge variant="outline">{item.columnIds.length} sütun</Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default SupervisorSingleExcel;
