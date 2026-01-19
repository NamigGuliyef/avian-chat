"use client";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Card,
    CardContent,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import {
    getColumns, getRows, addRow, updateCell, deleteRow, importFromExcel
} from "@/api/supervisors";
import { SheetColumnForm, SheetRowForm } from "@/types/types";
import { EditableCell } from "../Table/EditableCell";


const UserColumns: React.FC = () => {
    const { sheetId, sheetName } = useParams();
    const navigate = useNavigate();

    const [columns, setColumns] = useState<SheetColumnForm[]>([]);
    const [rows, setRows] = useState<SheetRowForm[]>([]);

    useEffect(() => {
        if (sheetId) fetchColumns();
        if (sheetId) fetchRows();
    }, [sheetId]);

    const fetchColumns = async () => {
        try {
            const data = await getColumns(sheetId!);
            setColumns(data);
        } catch (e) {
            toast.error("Sütunlar gətirilərkən xəta baş verdi");
        }
    };

    const fetchRows = async () => {
        try {
            const data = await getRows(sheetId!, 1, 100);
            setRows(data);
        } catch (e) {
            toast.error("Sətirlər gətirilərkən xəta baş verdi");
        }
    };

    const handleUpdateCell = async (rowIndex: number, key: string, value: any) => {
        if (!sheetId) return;
        try {
            await updateCell(sheetId, rowIndex, key, value);
            setRows(prev => {
                return prev.map((r) => {
                    if (r.rowNumber === rowIndex) return { ...r, data: { ...r.data, [key]: value } };
                    return r;
                })
            });
        } catch (e) {
            toast.error("Cell yenilənərkən xəta baş verdi");
        }
    };

    return (
        <div className="w-full px-10">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">← Geri</Button>
            <h2 className="text-2xl font-bold mb-6">{sheetName}</h2>

            <ScrollArea className="border rounded-lg p-2">
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr>
                            <th className="border p-1">#</th>
                            {columns.sort((a, b) => a.order - b.order).map((c) => c.columnId).map(col => <th key={col?._id} className="border p-1">{col?.name}</th>)}
                            {/* <th className="border p-1">Əməliyyatlar</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b hover:bg-muted/40">
                                <td className="border px-1 py-0">
                                    {row.rowNumber}
                                </td>
                                {columns
                                    .sort((a, b) => a.order - b.order)
                                    .map((col) => {
                                        const colDef = col.columnId;
                                        if (!colDef) return null;

                                        return (
                                            <td key={colDef._id} className="border px-1 py-0">
                                                <EditableCell
                                                    colDef={colDef}
                                                    value={row.data[colDef.dataKey]}
                                                    editable={col.editable}
                                                    onSave={(val) =>
                                                        handleUpdateCell(row.rowNumber, colDef.dataKey, val)
                                                    }
                                                />
                                            </td>
                                        );
                                    })}
                            </tr>
                        ))}
                    </tbody>

                </table>
            </ScrollArea>
        </div>
    );
};

export default UserColumns;
