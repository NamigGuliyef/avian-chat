'use client';

import {
    createSupervisorColumn,
    getSupervisorColumns,
    getSupervisorProjects,
    updateSupervisorColumn,
} from '@/api/supervisors';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnType, ISheetColumn } from '@/types/types';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const initialColumn: Partial<ISheetColumn> = {
    name: '',
    dataKey: '',
    projectId: '',
    type: ColumnType.Text,
    options: []
};

const SupervisorProjectColumns = () => {
    const [projectId, setProjectId] = useState("")
    const [projects, setProjects] = useState([])
    const [columns, setColumns] = useState<ISheetColumn[]>([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Partial<ISheetColumn>>(initialColumn);
    const [optionValue, setOptionValue] = useState({ value: '', label: '' });

    useEffect(() => {
        getSupervisorProjects().then((d) => setProjects(d.map(({ _id, name }) => ({ _id, name }))))
    }, [])

    useEffect(() => {
        if (projectId) {
            getSupervisorColumns(projectId).then(setColumns);
            setEditing((pre) => ({ ...pre, projectId }))
        }
    }, [projectId]);

    const resetForm = () => setEditing({ ...initialColumn, projectId });

    const handleSave = async () => {
        if (!editing.name || !editing.dataKey) {
            toast.error('Name və dataKey mütləqdir');
            return;
        }

        if (editing._id) {
            const updated = await updateSupervisorColumn(editing._id, editing);
            setColumns((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
            toast.success('Column yeniləndi');
        } else {
            if (editing.type !== ColumnType.Select) {
                delete editing.options;
            }
            const created = await createSupervisorColumn(editing);
            setColumns((prev) => [...prev, created]);
            toast.success('Column yaradıldı');
        }

        resetForm();
        setOpen(false);
    };

    // const handleDelete = async (id: string) => {
    //     await deleteAdminColumn(id);
    //     setColumns((prev) => prev.filter((c) => c._id !== id));
    //     toast.success('Column silindi');
    // };

    const startEdit = (column: ISheetColumn) => {
        setEditing(column);
        setOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Columns</h2>
                <Dialog open={open} onOpenChange={(v) => {
                    if (!projectId) {
                        toast.error("İlk öncə layihə seçin!")
                        return;
                    }
                    setOpen(v);
                    if (!v) {
                        resetForm();
                    }
                }}>
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
                                        <div className="h-48 w-full overflow-y-auto overflow-x-hidden border rounded p-2 mb-2">
                                            {(editing.options || []).map((opt, idx) => (
                                                <div key={idx} className="flex gap-2 mb-2 items-center w-full min-w-0">
                                                    <div className="flex-1 flex gap-2 min-w-0">
                                                        <span className="font-medium">Label:</span>
                                                        <span className="break-words break-all whitespace-normal">{opt.label}</span>
                                                    </div>
                                                    <div className="flex-1 flex gap-2 min-w-0">
                                                        <span className="font-medium">Value:</span>
                                                        <span className="break-words break-all whitespace-normal">{opt.value}</span>
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
                                        </div>
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
            <div>
                <Label>Sütunlar üzrə dəyişiklik etmək üçün layihə seçin:</Label>

                <Select
                    value={projectId}
                    onValueChange={(v) => {
                        setProjectId(v)
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Seçin..." />
                    </SelectTrigger>

                    <SelectContent>
                        {projects.map((t) => (
                            <SelectItem key={t._id} value={t._id}>
                                {t.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-3">
                {columns.map((col) => (
                    <Card key={col._id}>
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <p className="font-semibold">{col.name}</p>
                                <p className="text-sm text-muted-foreground">{col.dataKey} • {col.type}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="icon" variant="ghost" onClick={() => startEdit(col)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                {/* <Button size="icon" variant="ghost" onClick={() => handleDelete(col._id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button> */}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default SupervisorProjectColumns;
