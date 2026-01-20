"use client";
import {
    updateCell
} from "@/api/supervisors";
import { getColumnsBySheetId } from "@/api/users";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SheetColumnForm, SheetRowForm } from "@/types/types";
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { EditableCell } from "../Table/EditableCell";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";


const UserColumns: React.FC = () => {
    const { sheetId, sheetName } = useParams();
    const navigate = useNavigate();

    // States
    const [columns, setColumns] = useState<SheetColumnForm[]>([]);
    const [rows, setRows] = useState<SheetRowForm[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false)
    const rowsPerPage = 100;

    useEffect(() => {
        if (sheetId) {
            fetchData();
            setCurrentPage(1);
        }
    }, [sheetId]);

    useEffect(() => {
        if (sheetId) fetchData();
    }, [sheetId, currentPage]);

    const fetchData = async () => {
        try {
            const data = await getColumnsBySheetId(sheetId!);
            setColumns(data.columns);
            setRows(data.rows)
        } catch (e) {
            toast.error("Sütunlar gətirilərkən xəta baş verdi");
        }
    };

    const handleUpdateCell = async (rowIndex: number, key: string, value: any) => {
        if (!sheetId) return;
        try {
            const _d = await updateCell(sheetId, rowIndex, key, value);
            setRows(prev => {
                return prev.map((r) => {
                    if (r.rowNumber === rowIndex) return { ...r, data: { ...r.data, [key]: value } };
                    return r;
                })
            });
            toast.success(`"${key}" sütununa "${_d.data[key]}" əlavə edildi.`)
        } catch (e) {
            toast.error("Cell yenilənərkən xəta baş verdi");
        }
    };

    const handleRefresh = () => {
        fetchData();
        toast.success("Vərilənlər yeniləndi");
    };

    const handleNextPage = () => {
        if (rows.length === rowsPerPage) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="hover:bg-slate-200 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Geri
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="hover:bg-blue-50 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Yenilə
                    </Button>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">{sheetName}</h1>
                <p className="text-slate-600">Cəmi {rows.length} sətir | {columns.length} sütun</p>
            </div>

            <div className="flex-1 px-6 pb-6 pt-4 overflow-auto">
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-lg bg-white">
                    <Table>
                        <TableHeader className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 z-10">
                            <TableRow>
                                <TableHead className="cursor-pointer hover:bg-slate-700 transition-colors whitespace-nowrap text-white font-bold">
                                    #
                                </TableHead>
                                {columns.sort((a, b) => a.order - b.order).map((c) => c.columnId).map((col) => (
                                    <TableHead
                                        key={col?._id}
                                        className="px-4 py-3 text-left text-white font-semibold text-sm border-b-2 border-slate-700 whitespace-nowrap min-w-[150px]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{col?.name}</span>
                                            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-200">
                                                {col?.type || "Text"}
                                            </Badge>
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    className="hover:bg-blue-50 transition-colors border-b border-slate-100"
                                >
                                    <TableCell className="px-4 py-3 text-slate-600 font-medium text-sm bg-slate-50 group-hover:bg-blue-100 min-w-[60px]">
                                        {row.rowNumber}
                                    </TableCell>
                                    {columns
                                        .sort((a, b) => a.order - b.order)
                                        .map((col) => {
                                            const colDef = col.columnId;
                                            if (!colDef) return null;

                                            return (
                                                <TableCell
                                                    key={colDef._id}
                                                    className="px-4 py-3 text-slate-700 text-sm border-r border-slate-100 hover:bg-blue-100 transition-colors min-w-[150px]"
                                                >
                                                    <div className="max-h-20 overflow-auto">
                                                        <EditableCell
                                                            colDef={colDef}
                                                            value={row.data[colDef.dataKey]}
                                                            editable={col.editable}
                                                            onSave={(val) =>
                                                                handleUpdateCell(row.rowNumber, colDef.dataKey, val)
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            );
                                        })}
                                </TableRow>
                            ))}
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length + 1}
                                        className="px-4 py-8 text-center text-slate-500"
                                    >
                                        <p className="font-medium">Heç bir sətir tapılmadı</p>
                                        <p className="text-sm">Excel faylı importlaymaqla başlayın</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            {/* Footer Stats */}
            {
                rows.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                            <p className="text-slate-600 text-sm font-medium">Cari Səhifə</p>
                            <p className="text-2xl font-bold text-blue-600">{currentPage}</p>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                            <p className="text-slate-600 text-sm font-medium">Bu Səhifədə</p>
                            <p className="text-2xl font-bold text-green-600">{rows.length}</p>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                            <p className="text-slate-600 text-sm font-medium">Sütunlar</p>
                            <p className="text-2xl font-bold text-purple-600">{columns.length}</p>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                            <p className="text-slate-600 text-sm font-medium">Son Yeniləmə</p>
                            <p className="text-sm font-semibold text-slate-900">{new Date().toLocaleTimeString("az-AZ")}</p>
                        </div>
                    </div>
                )
            }

            {/* Pagination Controls */}
            {
                rows.length > 0 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Əvvəlki
                        </Button>

                        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
                            <span className="text-sm font-semibold text-slate-700">
                                Səhifə <span className="text-blue-600">{currentPage}</span>
                            </span>
                            {rows.length === rowsPerPage && (
                                <span className="text-xs text-slate-500">
                                    ({(currentPage - 1) * rowsPerPage + 1}-{currentPage * rowsPerPage})
                                </span>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={rows.length < rowsPerPage}
                            className="hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sonraki <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                )
            }
        </div >
    );
};

export default UserColumns;
