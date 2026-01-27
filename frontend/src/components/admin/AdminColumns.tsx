'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { createAdminColumn, deleteAdminColumn, getAdminColumns, updateAdminColumn } from '@/api/column';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnType, ISheetColumn } from '@/types/types';
import { Edit, Plus, Trash2, GripVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Reorder } from 'framer-motion';

const initialColumn: Partial<ISheetColumn> = {
    name: '',
    dataKey: '',
    type: ColumnType.Text,
    options: []
};

const AdminColumns = () => {
    const [columns, setColumns] = useState<ISheetColumn[]>([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Partial<ISheetColumn>>(initialColumn);
    const [optionValue, setOptionValue] = useState({ value: '', label: '' });
    const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        getAdminColumns().then(setColumns);
    }, []);

    const resetForm = () => setEditing(initialColumn);

    const handleSave = async () => {
        if (!editing.name || !editing.dataKey) {
            toast.error('Name və dataKey mütləqdir');
            return;
        }

        if (editing._id) {
            const updated = await updateAdminColumn(editing._id, editing);
            setColumns((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
            toast.success('Column yeniləndi');
        } else {
            const created = await createAdminColumn(editing);
            setColumns((prev) => [...prev, created]);
            toast.success('Column yaradıldı');
        }

        resetForm();
        setOpen(false);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteAdminColumn(id);
            setColumns((prev) => prev.filter((c) => c._id !== id));
            toast.success('Column silindi');
        } catch (error) {
            toast.error('Column silinərkən xəta baş verdi');
        }
    };

    const handleReorder = async (newOrder: ISheetColumn[]) => {
        setColumns(newOrder);
        // Update order in backend
        try {
            setTimeout(async () => {
                await Promise.all(newOrder.map((col, index) =>
                    updateAdminColumn(col._id, { ...col, order: index })
                ));
            }, 1000);
            // toast.success('Sıralama yeniləndi');
        } catch (error) {
            toast.error('Sıralama yadda saxlanılarkən xəta baş verdi');
        }
    };

    const startEdit = (column: ISheetColumn) => {
        setEditing(column);
        setOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Columns</h2>
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" />Yeni Column</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editing._id ? 'Column Redaktə Et' : 'Yeni Column'}</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label>Ad</Label>
                                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                            </div>

                            <div>
                                <Label>dataKey</Label>
                                <Input value={editing.dataKey} onChange={(e) => setEditing({ ...editing, dataKey: e.target.value })} />
                            </div>

                            <div>
                                <Label>Type</Label>
                                <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as ColumnType })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.values(ColumnType).map((t) => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {
                                editing.type === ColumnType.Select && (
                                    <div>
                                        <Label>Options (vergül ilə ayrılmış)</Label>
                                        {(editing.options || []).map((opt, idx) => (
                                            <div key={idx} className="flex gap-2 mb-2 items-center">
                                                <div className="flex-1 flex gap-2">
                                                    <span className="font-medium">Label:</span>
                                                    <span>{opt.label}</span>
                                                </div>
                                                <div className="flex-1 flex gap-2">
                                                    <span className="font-medium">Value:</span>
                                                    <span>{opt.value}</span>
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setEditing({
                                                            ...editing,
                                                            options: (editing.options || []).filter((_, i) => i !== idx)
                                                        });
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                        <div className="flex gap-2 mb-2">
                                            <Input
                                                value={optionValue.label}
                                                onChange={(e) => setOptionValue({ ...optionValue, label: e.target.value })}
                                                placeholder='label əlavə et'
                                            />
                                            <Input
                                                value={optionValue.value}
                                                onChange={(e) => setOptionValue({ ...optionValue, value: e.target.value })}
                                                placeholder='value əlavə et'
                                            />
                                        </div>
                                        <Button
                                            onClick={() => {
                                                if (!optionValue.label || !optionValue.value) return;
                                                setEditing({
                                                    ...editing,
                                                    options: [
                                                        ...(editing.options || []),
                                                        { label: optionValue.label, value: optionValue.value }
                                                    ]
                                                });
                                                setOptionValue({ value: '', label: '' });
                                            }}
                                        >əlavə et</Button>
                                    </div>
                                )
                            }
                            <div>

                            </div>

                            <Button className="w-full" onClick={handleSave}>
                                {editing._id ? 'Yenilə' : 'Yarat'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Reorder.Group axis="y" values={columns} onReorder={handleReorder} className="space-y-3">
                {columns.map((col) => (
                    <Reorder.Item key={col._id} value={col}>
                        <Card className="cursor-default">
                            <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="cursor-grab active:cursor-grabbing text-slate-400">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{col.name}</p>
                                        <p className="text-sm text-muted-foreground">{col.dataKey} • {col.type}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => startEdit(col)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => setColumnToDelete(col._id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            <AlertDialog open={!!columnToDelete} onOpenChange={(open) => !open && setColumnToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu column-u silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (columnToDelete) {
                                    handleDelete(columnToDelete);
                                    setColumnToDelete(null);
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminColumns;
