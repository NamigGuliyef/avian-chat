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

const SupervisorSingleSheet: React.FC = () => {
    const { excelId, sheetId, sheetName } = useParams();
    const navigate = useNavigate();

    // States
    const [columns, setColumns] = useState<SheetColumnForm[]>([]);
    const [rows, setRows] = useState<SheetRowForm[]>([]);
    const [file, setFile] = useState<File | null>(null);

    // ---------------- Fetch Columns & Rows ----------------
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

    // ---------------- Row Actions ----------------
    const handleAddRow = async () => {
        // if (!sheetId) return;
        // const emptyRow: Record<string, any> = {};
        // columns.forEach(col => emptyRow[col.dataKey] = "");
        // try {
        //     const row = await addRow(sheetId, emptyRow);
        //     setRows(prev => [...prev, row]);
        // } catch (e) {
        //     toast.error("Sətir əlavə edilərkən xəta baş verdi");
        // }
    };

    const handleUpdateCell = async (rowIndex: number, key: string, value: any) => {
        if (!sheetId) return;
        try {
            await updateCell(sheetId, rowIndex, key, value);
            setRows(prev => {
                const updated = [...prev];
                updated[rowIndex][key] = value;
                return updated;
            });
        } catch (e) {
            toast.error("Cell yenilənərkən xəta baş verdi");
        }
    };

    const handleDeleteRow = async (rowIndex: number) => {
        if (!sheetId) return;
        try {
            await deleteRow(sheetId, rowIndex);
            setRows(prev => prev.filter((_, i) => i !== rowIndex));
        } catch (e) {
            toast.error("Sətir silinərkən xəta baş verdi");
        }
    };

    // ---------------- Import Excel ----------------
    const handleImportExcel = async () => {
        if (!sheetId || !file) return;
        try {
            await importFromExcel(sheetId, file);
            toast.success("Excel import olundu");
            fetchRows();
            setFile(null);
        } catch (e) {
            toast.error("Excel import zamanı xəta baş verdi");
        }
    };

    return (
        <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">← Geri</Button>
            <h2 className="text-2xl font-bold mb-6">{sheetName}</h2>

            {/* Import Excel & Add Row */}
            <div className="flex gap-2 items-center mb-6">
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <Button onClick={handleImportExcel}>Import Excel</Button>
                <Button onClick={handleAddRow}>Yeni Sətir</Button>
            </div>

            {/* Rows Table */}
            <ScrollArea className="border rounded-lg p-2">
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr>
                            {columns.sort((a, b) => b.order - a.order).map((c) => c.columnId).map(col => <th key={col._id} className="border p-1">{col.name}</th>)}
                            {/* <th className="border p-1">Əməliyyatlar</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b">
                                {Object.values(row.data).map((val: string) => {
                                    return (
                                        <td key={val} className="border p-1">
                                            <Input
                                                value={val}
                                                onChange={(e) => handleUpdateCell(rowIndex, val, e.target.value)}
                                                className="w-full"
                                            />
                                        </td>
                                    )
                                })}

                                <td className="border p-1">
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteRow(rowIndex)}>
                                        Sil
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </ScrollArea>
        </div>
    );
};

export default SupervisorSingleSheet;
