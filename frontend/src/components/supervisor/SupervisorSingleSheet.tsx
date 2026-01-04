"use client";
import {
    CardHeader,
    CardTitle
} from "../ui/card";

import { addColumnToExcel, getSheetColumns, updateSheetColumn } from "@/api/supervisors";
import { IColumn } from "@/types/types";
import { Edit, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { X } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";

type ColumnType = "text" | "number" | "date" | "select" | "phone";

interface IColumnOption {
    label: string;
    color?: string;
}

interface IColumnForm {
    name: string;
    dataKey: string;
    type: ColumnType;
    visibleToUser: boolean;
    editableByUser: boolean;
    isRequired: boolean;
    options: IColumnOption[];
    phoneNumbers: string[];
}

const emptyColumn: Partial<any> = {
    name: "",
    dataKey: "",
    type: "text",
    visibleToUser: true,
    editableByUser: true,
    isRequired: false,
    order: 0,
    options: [],
    phoneNumbers: [],
};

const SupervisorSingleSheet: React.FC = () => {
    const [columns, setColumns] = useState<IColumn[]>([]);
    const { excelId, sheetId, sheetName, projectId } = useParams()
    const navigate = useNavigate()
    const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState<any | null>(null);

    const [columnForm, setColumnForm] = useState<any>(emptyColumn);
    const [newOptionLabel, setNewOptionLabel] = useState("");
    const [newPhoneNumber, setNewPhoneNumber] = useState("");


    useEffect(() => {
        if (sheetId) {
            getSheetColumns(sheetId).then(setColumns);
        }
    }, [sheetId]);

    const handleAddOption = () => {
        if (!newOptionLabel.trim()) return;

        setColumnForm((prev) => ({
            ...prev,
            options: [...prev.options, { label: newOptionLabel }],
        }));

        setNewOptionLabel("");
    };

    const handleRemoveOption = (index: number) => {
        setColumnForm((prev) => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index),
        }));
    };

    const handleAddPhoneNumber = () => {
        if (!newPhoneNumber.trim()) return;

        setColumnForm((prev) => ({
            ...prev,
            phoneNumbers: [...prev.phoneNumbers, newPhoneNumber],
        }));

        setNewPhoneNumber("");
    };

    const handleRemovePhoneNumber = (index: number) => {
        const colId = editingColumn._id
        const phoneNumber = columnForm.phoneNumbers[index]
        if (columns.find((col) => col._id === colId).phoneNumbers.includes(phoneNumber)) {
            toast("Bazaya əlavə edilmiş telefon nömrəsi silinə bilməz!")
        } else {
            setColumnForm((prev) => ({
                ...prev,
                phoneNumbers: prev.phoneNumbers.filter((_, i) => i !== index),
            }));
        }
    };

    const handleAddColumn = async () => {
        const _d = await addColumnToExcel(sheetId, columnForm._id, {
            ...columnForm,
            sheetId,
        });
        setColumns((pre) => ([...pre, _d]))

        setIsColumnDialogOpen(false);
    };

    const handleUpdateColumn = async () => {
        delete columnForm.sheetId
        delete columnForm.createdAt
        delete columnForm.updatedAt
        delete columnForm._id
        const _d = await updateSheetColumn(editingColumn._id, {
            ...columnForm,
        });
        setColumns((pre) => pre.map((col) => {
            if (col._id === editingColumn._id) {
                return { ...col, ..._d }
            }
            return col
        }))
        setColumnForm(emptyColumn)
        setIsColumnDialogOpen(false);
    };

    return (
        <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">← Geri</Button>
            <div className="mb-6  flex items-center justify-between">
                <h2 className="text-2xl font-bold">{sheetName}</h2>

                <Dialog open={isColumnDialogOpen} onOpenChange={(open) => { setIsColumnDialogOpen(open); if (!open) { setEditingColumn(null); setColumnForm({ name: '', dataKey: '', type: 'text', visibleToUser: true, editableByUser: true, isRequired: false, options: [], phoneNumbers: [] }); setNewOptionLabel(''); setNewPhoneNumber(''); } }}>
                    <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Yeni Sütun</Button></DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>{editingColumn ? 'Sütunu Redaktə Et' : 'Yeni Sütun'}</DialogTitle></DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div><Label>Sütun adı</Label><Input value={columnForm.name} onChange={(e) => setColumnForm({ ...columnForm, name: e.target.value })} /></div>
                            <div><Label>Data açarı</Label><Input value={columnForm.dataKey} onChange={(e) => setColumnForm({ ...columnForm, dataKey: e.target.value })} /></div>
                            <div><Label>Tip</Label>
                                <Select value={columnForm.type} onValueChange={(v: ColumnType) => setColumnForm({ ...columnForm, type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="text">Mətn</SelectItem><SelectItem value="number">Rəqəm</SelectItem><SelectItem value="date">Tarix</SelectItem><SelectItem value="select">Seçim</SelectItem><SelectItem value="phone">Telefon</SelectItem></SelectContent>
                                </Select>
                            </div>

                            {/* Phone type - Number list */}
                            {columnForm.type === 'phone' && (
                                <div>
                                    <Label className="mb-2 block">Telefon nömrələri</Label>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <Input
                                                value={newPhoneNumber}
                                                onChange={(e) => setNewPhoneNumber(e.target.value)}
                                                placeholder="+994 XX XXX XX XX"
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddPhoneNumber()}
                                            />
                                            <Button type="button" size="sm" onClick={handleAddPhoneNumber}><Plus className="h-4 w-4" /></Button>
                                        </div>
                                        <ScrollArea className="h-24 border rounded-lg p-2">
                                            {(columnForm.phoneNumbers || []).map((phone, index) => (
                                                <div key={index} className="flex items-center justify-between py-1 px-2 bg-muted/50 rounded mb-1">
                                                    <span className="text-sm font-mono">{phone}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemovePhoneNumber(index)}><X className="h-3 w-3" /></Button>
                                                </div>
                                            ))}
                                            {(columnForm.phoneNumbers || []).length === 0 && (
                                                <p className="text-xs text-muted-foreground text-center py-2">Nömrə əlavə edin</p>
                                            )}
                                        </ScrollArea>
                                    </div>
                                </div>
                            )}

                            {/* Select type - Options with color */}
                            {columnForm.type === 'select' && (
                                <div>
                                    <Label className="mb-2 block">Seçim variantları</Label>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <Input
                                                value={newOptionLabel}
                                                onChange={(e) => setNewOptionLabel(e.target.value)}
                                                placeholder="Variant adı"
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                                                className="flex-1"
                                            />
                                            <Button type="button" size="sm" onClick={handleAddOption}><Plus className="h-4 w-4" /></Button>
                                        </div>
                                        <ScrollArea className="h-32 border rounded-lg p-2">
                                            {(columnForm.options || []).map((opt, index) => (
                                                <div key={index} className="flex items-center justify-between py-1.5 px-2 bg-muted/50 rounded mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-4 h-4 rounded-full border"
                                                            style={{ backgroundColor: opt.color || '#3B82F6' }}
                                                        />
                                                        <span className="text-sm">{opt.label}</span>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveOption(index)}><X className="h-3 w-3" /></Button>
                                                </div>
                                            ))}
                                            {(columnForm.options || []).length === 0 && (
                                                <p className="text-xs text-muted-foreground text-center py-2">Variant əlavə edin</p>
                                            )}
                                        </ScrollArea>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between"><Label>Məcburi</Label><Switch checked={columnForm.isRequired} onCheckedChange={(c) => setColumnForm({ ...columnForm, isRequired: c })} /></div>
                            <div className="flex items-center justify-between"><Label>Görünən</Label><Switch checked={columnForm.visibleToUser} onCheckedChange={(c) => setColumnForm({ ...columnForm, visibleToUser: c })} /></div>
                            <div className="flex items-center justify-between"><Label>Redaktə edilə bilən</Label><Switch checked={columnForm.editableByUser} onCheckedChange={(c) => setColumnForm({ ...columnForm, editableByUser: c })} /></div>
                            <Button className="w-full" onClick={editingColumn ? handleUpdateColumn : handleAddColumn}>{editingColumn ? 'Yenilə' : 'Əlavə et'}</Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
            {/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"> */}
            <div className="space-y-2">
                {columns.map((col) => (
                    <Card key={col._id}>
                        <CardContent className="flex items-center justify-between p-3">
                            <div>
                                <p className="font-medium">{col.name}</p>
                                <p className="text-xs text-muted-foreground">{col.dataKey} • {col.type}{col.type === 'select' && col.options && ` (${col.options.length} variant)`}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {col.isRequired && <Badge>Məcburi</Badge>}
                                <Badge variant={col.visibleToUser ? "default" : "secondary"}>{col.visibleToUser ? 'Görünür' : 'Gizli'}</Badge>
                                <Button variant="ghost" size="icon" onClick={() => {
                                    setEditingColumn(col);
                                    setColumnForm(col);
                                    setIsColumnDialogOpen(true);
                                }}><Edit className="h-4 w-4" /></Button>
                                {/* <Button variant="ghost" size="icon" onClick={() => handleDeleteColumn(col.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button> */}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default SupervisorSingleSheet;
