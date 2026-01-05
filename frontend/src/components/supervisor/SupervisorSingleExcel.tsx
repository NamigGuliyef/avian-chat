// =============================
// UPDATED SupervisorSingleExcel – Sheet creation with Columns
// =============================
"use client";

import { getAdminColumns } from "@/api/column";
import {
    createExcelSheet,
    getExcelSheets,
    updateExcelSheet,
} from "@/api/supervisors";
import { ISheet, SheetColumnForm } from "@/types/types";
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

// -----------------------------
// Types
// -----------------------------

interface SheetCreateDto {
    name: string;
    description: string;
    columnIds: SheetColumnForm[];
}

const emptyForm: SheetCreateDto = {
    name: "",
    description: "",
    columnIds: [],
};

const SupervisorSingleExcel: React.FC = () => {
    const [sheets, setSheets] = useState<ISheet[]>([]);
    const [columns, setColumns] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [editingSheet, setEditingSheet] = useState<ISheet | null>(null);
    const [sheetForm, setSheetForm] = useState<SheetCreateDto>(emptyForm);

    const { excelId, excelName, projectId } = useParams();
    const navigate = useNavigate();

    // -----------------------------
    // Load sheets + columns
    // -----------------------------
    useEffect(() => {
        if (!excelId) return;
        getExcelSheets(excelId).then(setSheets);
        getAdminColumns().then(setColumns);
    }, [excelId]);

    // -----------------------------
    // Helpers
    // -----------------------------
    // const toggleColumn = (columnId: string) => {
    //     setSheetForm((prev) => {
    //         const exists = prev.columnIds.find((c) => c.columnId === columnId);

    //         if (exists) {
    //             return {
    //                 ...prev,
    //                 columnIds: prev.columnIds.filter((c) => c.columnId !== columnId),
    //             };
    //         }

    //         return {
    //             ...prev,
    //             columnIds: [
    //                 ...prev.columnIds,
    //                 {
    //                     columnId,
    //                     editable: true,
    //                     required: false,
    //                     order: prev.columnIds.length + 1,
    //                 },
    //             ],
    //         };
    //     });
    // };

    // const updateColumnField = (
    //     columnId: string,
    //     field: keyof Omit<SheetColumnForm, "columnId" | "order">,
    //     value: boolean
    // ) => {
    //     setSheetForm((prev) => ({
    //         ...prev,
    //         columnIds: prev.columnIds.map((c) =>
    //             c.columnId === columnId ? { ...c, [field]: value } : c
    //         ),
    //     }));
    // };

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
                                                    {/* <Checkbox checked={!!selected} onCheckedChange={() => toggleColumn(col._id)} /> */}
                                                    <span className="font-medium text-sm">{col.name}</span>
                                                </div>

                                                {selected && (
                                                    <div className="ml-6 mt-2 flex items-center gap-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            {/* <Checkbox checked={selected.editable} onCheckedChange={(v) => updateColumnField(col._id, 'editable', Boolean(v))} /> */}
                                                            <span>Edit</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {/* <Checkbox checked={selected.required} onCheckedChange={(v) => updateColumnField(col._id, 'required', Boolean(v))} /> */}
                                                            <span>Required</span>
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
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingSheet(item); setSheetForm({ name: item.name, description: item.description || '', columnIds: item.columnIds }); setOpen(true); }}>
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
