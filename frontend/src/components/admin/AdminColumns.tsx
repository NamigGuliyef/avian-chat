'use client';

import { createAdminColumn, deleteAdminColumn, getAdminColumns, IAdminColumn, updateAdminColumn } from '@/api/column';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnType } from '@/types/types';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const initialColumn: Partial<IAdminColumn> = {
    name: '',
    dataKey: '',
    type: ColumnType.Text,
    options: []
};

const AdminColumns = () => {
    const [columns, setColumns] = useState<IAdminColumn[]>([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Partial<IAdminColumn>>(initialColumn);

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

    // const handleDelete = async (id: string) => {
    //     await deleteAdminColumn(id);
    //     setColumns((prev) => prev.filter((c) => c._id !== id));
    //     toast.success('Column silindi');
    // };

    const startEdit = (column: IAdminColumn) => {
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

                            <Button className="w-full" onClick={handleSave}>
                                {editing._id ? 'Yenilə' : 'Yarat'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
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

export default AdminColumns;
