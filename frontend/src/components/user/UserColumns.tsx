"use client";
import {
    updateCell
} from "@/api/supervisors";
import { getColumnsBySheetId } from "@/api/users";
import { SheetColumnForm, SheetRowForm } from "@/types/types";
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, FileText, Search, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { EditableCell } from "../Table/EditableCell";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { formatDate } from "@/lib/utils";


const UserColumns: React.FC = () => {
    const { sheetId, sheetName } = useParams();
    const navigate = useNavigate();

    // States
    const [columns, setColumns] = useState<SheetColumnForm[]>([]);
    const [rows, setRows] = useState<SheetRowForm[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const rowsPerPage = 50;

    useEffect(() => {
        if (sheetId) {
            fetchData();
            setCurrentPage(1);
        }
    }, [sheetId]);

    useEffect(() => {
        if (sheetId) {
            setCurrentPage(1);
            fetchData();
        }
    }, [searchTerm]);

    useEffect(() => {
        if (sheetId) fetchData();
    }, [sheetId, currentPage]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getColumnsBySheetId(sheetId!, currentPage, rowsPerPage, searchTerm);
            setColumns(data.columns);
            setRows(data.rows)
        } catch (e) {
            toast.error("Sütunlar gətirilərkən xəta baş verdi");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCell = useCallback(async (rowIndex: number, key: string, value: any) => {
        if (!sheetId) return;
        try {
            // If Call status is being updated to "successful", auto-fill the date
            if (key.toLowerCase().includes('status') && value === 'successful') {
                const dateColumn = columns.find(col =>
                    col.columnId?.dataKey?.toLowerCase().includes('date')
                );
                if (dateColumn?.columnId?.dataKey) {
                    const now = new Date();
                    const dateStr = now.toLocaleString('az-AZ', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    });
                    // Update both status and date
                    const _d = await updateCell(sheetId, rowIndex, key, value);
                    const _date = await updateCell(sheetId, rowIndex, dateColumn.columnId.dataKey, dateStr);

                    setRows(prev => {
                        return prev.map((r) => {
                            if (r.rowNumber === rowIndex) {
                                return {
                                    ...r,
                                    data: {
                                        ...r.data,
                                        [key]: value,
                                        [dateColumn.columnId.dataKey]: dateStr
                                    }
                                };
                            }
                            return r;
                        })
                    });
                    toast.success(`"${key}" sütununa "${value}" əlavə edildi və tarix avtomatik dolduruldu.`);
                    return;
                }
            }

            // If other status values, clear the date
            if (key.toLowerCase().includes('status') && value !== 'successful') {
                const dateColumn = columns.find(col =>
                    col.columnId?.dataKey?.toLowerCase().includes('date')
                );
                if (dateColumn?.columnId?.dataKey) {
                    const _d = await updateCell(sheetId, rowIndex, key, value);
                    const _date = await updateCell(sheetId, rowIndex, dateColumn.columnId.dataKey, '');

                    setRows(prev => {
                        return prev.map((r) => {
                            if (r.rowNumber === rowIndex) {
                                return {
                                    ...r,
                                    data: {
                                        ...r.data,
                                        [key]: value,
                                        [dateColumn.columnId.dataKey]: ''
                                    }
                                };
                            }
                            return r;
                        })
                    });
                    toast.success(`"${key}" sütununa "${value}" əlavə edildi və tarix təmizləndi.`);
                    return;
                }
            }

            // Default behavior for other columns
            const _d = await updateCell(sheetId, rowIndex, key, value);
            setRows(prev => {
                return prev.map((r) => {
                    if (r.rowNumber === rowIndex) {
                        if (key === 'remindMe') {
                            return { ...r, remindMe: value };
                        }
                        return { ...r, data: { ...r.data, [key]: value } };
                    }
                    return r;
                })
            });
            if (key === 'date') {
                toast.success(`"${key}" sütununa "${formatDate(_d.data[key])}" əlavə edildi.`)
            }

            else if (key === 'remindMe') {
                toast.success(`Bildirişlər səhifəsinə əlavə edildi!`)
            }
            else {
                toast.success(`"${key}" sütununa "${_d.data[key]}" əlavə edildi.`)
            }
        } catch (e) {
            toast.error("Cell yenilənərkən xəta baş verdi");
        }
    }, [sheetId, columns]);

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

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    return (
        <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex flex-col overflow-hidden">
            {/* Header Section */}
            <div className="flex-shrink-0 mb-4">
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

                <div className="mb-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{sheetName}</h1>
                            <p className="text-slate-500 text-xs mt-0.5">Sütun məlumatlarını əlavə və redaktə edin</p>
                        </div>
                    </div>
                    <div className="flex gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded">
                            <span className="font-semibold">{rows.length}</span> Sətir
                        </span>
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded">
                            <span className="font-semibold">{columns.length}</span> Sütun
                        </span>
                    </div>

                    {/* Search Input */}
                    <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cədvəldə axtarış edin..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                            {searchTerm && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border-slate-200 shadow-lg overflow-hidden flex-1 flex flex-col mb-3 min-h-0">
                <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center rounded-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                    <div className="overflow-x-auto overflow-y-auto flex-1 w-full bg-white">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left text-white font-semibold text-sm border-b-2 border-slate-700 min-w-[60px]">
                                        #
                                    </th>
                                    <th className="px-4 py-3 text-left text-white font-semibold text-sm border-b-2 border-slate-700 min-w-[60px]">
                                        Zəng et
                                    </th>
                                    {columns.sort((a, b) => a.order - b.order).map((c) => c.columnId).map((col) => (
                                        <th
                                            key={col?._id}
                                            className="px-4 py-3 text-left text-white font-semibold text-sm border-b-2 border-slate-700 whitespace-nowrap min-w-[150px]"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{col?.name}</span>
                                                <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-200">
                                                    {col?.type || "Text"}
                                                </Badge>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className="border-b border-slate-200 hover:bg-blue-50 transition-colors duration-150 group"
                                    >
                                        <td className="px-4 py-3 text-slate-600 font-medium text-sm bg-slate-50 group-hover:bg-blue-100 min-w-[60px]">
                                            {row.rowNumber}
                                        </td>
                                        <td className="px-4 py-3 text-center border-r border-slate-100 min-w-[60px]">
                                            <input
                                                type="checkbox"
                                                checked={row.remindMe}
                                                onChange={(e) => handleUpdateCell(row.rowNumber, 'remindMe', e.target.checked)}
                                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                            />
                                        </td>
                                        {columns
                                            .sort((a, b) => a.order - b.order)
                                            .map((col) => {
                                                const colDef = col.columnId;
                                                if (!colDef) return null;

                                                return (
                                                    <td
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
                                                    </td>
                                                );
                                            })}
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={columns.length + 1}
                                            className="px-4 py-8 text-center text-slate-500"
                                        >
                                            <p className="font-medium">Heç bir sətir tapılmadı</p>
                                            <p className="text-sm">Excel faylı importlaymaqla başlayın</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Footer Stats & Pagination */}
            <div className="flex-shrink-0 max-h-fit overflow-visible">
                {rows.length > 0 && (
                    <div className="flex items-center justify-center gap-2">
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
                )}
            </div>
        </div >
    );
};

export default UserColumns;
