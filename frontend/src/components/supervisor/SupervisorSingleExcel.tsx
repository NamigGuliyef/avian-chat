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
import { Edit, Plus, Table2, X } from "lucide-react";
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
                        ranges: [{ startRow: '', endRow: '' }],
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

    const addAgentRange = (agentId: string) => {
        setSheetForm((prev) => ({
            ...prev,
            agentIds: prev.agentIds.map((a) =>
                a.agentId === agentId 
                    ? { 
                        ...a, 
                        ranges: [...a.ranges, { startRow: '', endRow: '' }]
                      }
                    : a
            ),
        }));
    };

    const removeAgentRange = (agentId: string, rangeIndex: number) => {
        setSheetForm((prev) => ({
            ...prev,
            agentIds: prev.agentIds.map((a) =>
                a.agentId === agentId 
                    ? { 
                        ...a, 
                        ranges: a.ranges?.filter((_, i) => i !== rangeIndex) || []
                      }
                    : a
            ),
        }));
    };

    const updateAgentRangeField = (
        agentId: string,
        rangeIndex: number,
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
                a.agentId === agentId 
                    ? {
                        ...a,
                        ranges: a.ranges?.map((r, i) => 
                            i === rangeIndex ? { ...r, [field]: value } : r
                        ) || []
                      }
                    : a
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            {/* Header Section */}
            <div className="mb-8">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(-1)} 
                    className="mb-4 hover:bg-slate-200 transition-colors"
                >
                    ← Geri
                </Button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">{excelName}</h1>
                        <p className="text-slate-500">Sheet-lərinizi idarə edin və redaktə edin</p>
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                onClick={() => { setOpen(true); setEditingSheet(null); setSheetForm(emptyForm); }}
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                            >
                                <Plus className="h-5 w-5 mr-2" /> Yeni Sheet
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-2xl">
                            <ScrollArea className="max-h-[80vh] pr-4">
                                <div className="space-y-6">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl">
                                            {editingSheet ? ' Sheet-i Redaktə Et' : ' Yeni Sheet Yaradın'}
                                        </DialogTitle>
                                    </DialogHeader>

                                    <div className="space-y-5">
                                        {/* Name Input */}
                                        <div className="space-y-2">
                                            <Label className="text-base font-semibold">Sheet Adı</Label>
                                            <Input 
                                                placeholder="Məsələn: Müşteri Sifariş Formu" 
                                                value={sheetForm.name} 
                                                onChange={(e) => setSheetForm({ ...sheetForm, name: e.target.value })}
                                                className="text-base h-10"
                                            />
                                        </div>

                                        {/* Description Input */}
                                        <div className="space-y-2">
                                            <Label className="text-base font-semibold">Təsvir</Label>
                                            <Input 
                                                placeholder="Bu sheet haqqında məlumat..." 
                                                value={sheetForm.description} 
                                                onChange={(e) => setSheetForm({ ...sheetForm, description: e.target.value })}
                                                className="text-base h-10"
                                            />
                                        </div>

                                        {/* Columns Section */}
                                        <div className="space-y-3">
                                            <Label className="text-base font-semibold flex items-center gap-2">
                                                 Sütunları Seçin
                                                <Badge variant="secondary">{sheetForm.columnIds.length}</Badge>
                                            </Label>
                                            <ScrollArea className="h-72 border-2 border-slate-200 rounded-lg bg-white p-3">
                                                <div className="space-y-1">
                                                    {columns.map((col) => {
                                                        const selected = sheetForm.columnIds.find((c) => c.columnId === col._id);

                                                        return (
                                                            <div key={col._id} className="border-b border-slate-100 last:border-0 py-3 hover:bg-slate-50 rounded px-2 transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <Checkbox 
                                                                        checked={!!selected} 
                                                                        onCheckedChange={() => toggleColumn(col._id)}
                                                                        className="h-5 w-5"
                                                                    />
                                                                    <span className="font-medium text-sm text-slate-700">{col.name}</span>
                                                                    <Badge variant="outline" className="ml-auto text-xs">{col.type}</Badge>
                                                                </div>

                                                                {selected && (
                                                                    <div className="ml-8 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                                        <div className="grid grid-cols-3 gap-3 text-sm">
                                                                            <div className="flex items-center gap-2">
                                                                                <Checkbox 
                                                                                    checked={selected.editable} 
                                                                                    onCheckedChange={(v) => updateColumnField(col._id, 'editable', Boolean(v))}
                                                                                    className="h-4 w-4"
                                                                                />
                                                                                <span className="font-medium">Redaktə edilə bilər</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Checkbox 
                                                                                    checked={selected.required} 
                                                                                    onCheckedChange={(v) => updateColumnField(col._id, 'required', Boolean(v))}
                                                                                    className="h-4 w-4"
                                                                                />
                                                                                <span className="font-medium">Tələb olunur</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    value={selected.order}
                                                                                    onChange={(e) =>
                                                                                        updateColumnField(
                                                                                            col._id,
                                                                                            "order",
                                                                                            Number(e.target.value)
                                                                                        )
                                                                                    }
                                                                                    className="h-8 text-xs"
                                                                                />
                                                                                <span className="font-medium text-xs whitespace-nowrap">Sıra</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </ScrollArea>
                                        </div>

                                        {/* Agents Section */}
                                        <div className="space-y-3">
                                            <Label className="text-base font-semibold flex items-center gap-2">
                                                 Agentləri Təyin Edin
                                                <Badge variant="secondary">{sheetForm.agentIds.length}</Badge>
                                            </Label>
                                            <ScrollArea className="h-72 border-2 border-slate-200 rounded-lg bg-white p-3">
                                                <div className="space-y-1">
                                                    {agentIds.map((agent) => {
                                                        const selected = sheetForm.agentIds.find(
                                                            (a) => a.agentId === agent.agentId
                                                        );

                                                        return (
                                                            <div key={agent.agentId} className="border-b border-slate-100 last:border-0 py-3 hover:bg-slate-50 rounded px-2 transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <Checkbox
                                                                        checked={!!selected}
                                                                        onCheckedChange={() => toggleAgent(agent)}
                                                                        className="h-5 w-5"
                                                                    />
                                                                    <span className="font-medium text-sm text-slate-700">
                                                                        {agent.name} {agent.surname}
                                                                    </span>
                                                                </div>

                                                                {selected && (
                                                                    <div className="ml-8 mt-3 space-y-3">
                                                                        {/* Ranges */}
                                                                        {(selected.ranges || []).map((range, rangeIndex) => (
                                                                            <div key={rangeIndex} className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                                                <div className="flex items-center justify-between mb-3">
                                                                                    <span className="text-xs font-bold text-slate-700">Aralıq {rangeIndex + 1}</span>
                                                                                    {selected.ranges.length > 1 && (
                                                                                        <Button
                                                                                            type="button"
                                                                                            size="icon"
                                                                                            variant="ghost"
                                                                                            className="h-6 w-6 hover:bg-red-100 hover:text-red-600"
                                                                                            onClick={() => removeAgentRange(agent.agentId, rangeIndex)}
                                                                                        >
                                                                                            <X className="h-4 w-4" />
                                                                                        </Button>
                                                                                    )}
                                                                                </div>
                                                                                <div className="grid grid-cols-2 gap-3">
                                                                                    <div>
                                                                                        <Label className="text-xs font-semibold text-slate-700">Başlama Sətri</Label>
                                                                                        <Input
                                                                                            type="number"
                                                                                            min="1"
                                                                                            placeholder="1"
                                                                                            value={range.startRow}
                                                                                            onChange={(e) =>
                                                                                                updateAgentRangeField(
                                                                                                    agent.agentId,
                                                                                                    rangeIndex,
                                                                                                    "startRow",
                                                                                                    e.target.value
                                                                                                )
                                                                                            }
                                                                                            className="h-9 text-sm mt-1"
                                                                                        />
                                                                                    </div>

                                                                                    <div>
                                                                                        <Label className="text-xs font-semibold text-slate-700">Bitirmə Sətri</Label>
                                                                                        <Input
                                                                                            type="number"
                                                                                            min="1"
                                                                                            placeholder="50"
                                                                                            value={range.endRow}
                                                                                            onChange={(e) =>
                                                                                                updateAgentRangeField(
                                                                                                    agent.agentId,
                                                                                                    rangeIndex,
                                                                                                    "endRow",
                                                                                                    e.target.value
                                                                                                )
                                                                                            }
                                                                                            className="h-9 text-sm mt-1"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="w-full bg-white hover:bg-slate-100"
                                                                            onClick={() => addAgentRange(agent.agentId)}
                                                                        >
                                                                            <Plus className="h-4 w-4 mr-1" /> Yeni Aralıq Əlavə Et
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </ScrollArea>
                                        </div>

                                        {/* Save Button */}
                                        <Button 
                                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base" 
                                            onClick={handleSave}
                                        >
                                             Yadda saxla
                                        </Button>
                                    </div>
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Sheets Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sheets.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <Table2 className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">Sheet yoxdur. Başlamaq üçün "Yeni Sheet" düyməsini klikləyin</p>
                    </div>
                ) : (
                    sheets.map((item) => (
                        <Card 
                            key={item._id} 
                            className="cursor-pointer hover:shadow-xl hover:border-blue-400 transition-all duration-300 bg-white hover:bg-slate-50"
                            onClick={() => navigate(`/supervisor/sheets/${projectId}/${excelId}/${item._id}/${item.name}`)}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Table2 className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <span className="font-semibold text-slate-900">{item.name}</span>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setEditingSheet(item); 
                                            setSheetForm({ 
                                                name: item.name, 
                                                description: item.description || '', 
                                                columnIds: item.columnIds, 
                                                agentIds: item.agentIds
                                            }); 
                                            setOpen(true); 
                                        }}
                                        className="hover:bg-slate-200"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-slate-600 line-clamp-2">{item.description || "Təsvir yoxdur"}</p>
                                <div className="flex gap-2 flex-wrap">
                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                        📋 {item.columnIds.length} sütun
                                    </Badge>
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                        👥 {item.agentIds.length} agent
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default SupervisorSingleExcel;
