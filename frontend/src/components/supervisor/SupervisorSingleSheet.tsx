"use client";
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
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import { Upload, ArrowLeft, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, Trash2 } from "lucide-react";
import { formatDate } from '@/lib/utils';



interface MemoizedRowProps {
    row: SheetRowForm;
    columns: SheetColumnForm[];
    onUpdateCell: (rowIndex: number, key: string, value: any) => void;
    onDeleteRow: (rowIndex: number) => void;
}

const MemoizedRow: React.FC<MemoizedRowProps> = React.memo(({ row, columns, onUpdateCell, onDeleteRow }) => {
    return (
        <tr className="border-b border-slate-200 hover:bg-blue-50 transition-colors duration-150 group">
            <td className="px-4 py-3 text-slate-600 font-medium text-sm bg-slate-50 group-hover:bg-blue-100 min-w-[60px]">
                {row.rowNumber}
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
                                    onSave={(val) => onUpdateCell(row.rowNumber, colDef.dataKey, val)}
                                />
                            </div>
                        </td>
                    );
                })}
            <td className="px-4 py-3 text-right group-hover:bg-blue-100">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteRow(row.rowNumber)}
                    className="text-destructive hover:text-destructive hover:bg-red-50"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </td>
        </tr>
    );
});

const SupervisorSingleSheet: React.FC = () => {
    const { excelId, sheetId, sheetName } = useParams();
    const navigate = useNavigate();

    // States
    const [skipRows, setSkipRows] = useState<number>(0);
    const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
    const [isSkipModalOpen, setIsSkipModalOpen] = useState(true);
    const [tempSkipValue, setTempSkipValue] = useState<string>("0");
    const [columns, setColumns] = useState<SheetColumnForm[]>([]);
    const [rows, setRows] = useState<SheetRowForm[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const [showImport, setShowImport] = useState(false);
    const [loading, setLoading] = useState(false)
    const [rowToDelete, setRowToDelete] = useState<number | null>(null);
    const rowsPerPage = 50;

    // ---------------- Fetch Columns & Rows ----------------
    useEffect(() => {
        if (sheetId) {
            fetchColumns();
            setCurrentPage(1);
        }
    }, [sheetId]);

    useEffect(() => {
        if (sheetId && hasLoadedInitialData) {
            fetchRows()
        };
    }, [sheetId, currentPage, skipRows, hasLoadedInitialData]);



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
            setLoading(true)
            const data = await getRows(sheetId!, currentPage, rowsPerPage, skipRows);
            setRows(data);
            // Total sətir sayısını estimasyon ilə hesabla
            // Əgər API tam sayı qaytarırsa, bunu update edin
            if (data.length > 0 && data.length < rowsPerPage) {
                setTotalRows((currentPage - 1) * rowsPerPage + data.length);
            } else if (data.length === rowsPerPage) {
                setTotalRows((currentPage * rowsPerPage) + 1); // More than this page
            }
        } catch (e) {
            toast.error("Sətirlər gətirilərkən xəta baş verdi");
        } finally {
            setLoading(false)
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

    const handleUpdateCell = useCallback(async (rowIndex: number, key: string, value: any) => {
        if (!sheetId) return;
        try {
            const _d = await updateCell(sheetId, rowIndex, key, value);
            setRows(prev => {
                return prev.map((r) => {
                    if (r.rowNumber === rowIndex) return { ...r, data: { ...r.data, [key]: value } };
                    return r;
                })
            });
            if (key === 'date') {
                toast.success(`"${key}" sütununa "${formatDate(_d.data[key])}" əlavə edildi.`)
            } else {
                toast.success(`"${key}" sütununa "${_d.data[key]}" əlavə edildi.`)
            }
        } catch (e) {
            toast.error("Cell yenilənərkən xəta baş verdi");
        }
    }, [sheetId]);


    const handleDeleteRow = useCallback(async (rowIndex: number) => {
        if (!sheetId) return;
        try {
            await deleteRow(sheetId, rowIndex);
            setRows(prev => prev.filter((row) => row.rowNumber !== rowIndex));
        } catch (e) {
            toast.error("Sətir silinərkən xəta baş verdi");
        }
    }, [sheetId]);

    // ---------------- Import Excel ----------------
    const handleImportExcel = async () => {
        if (!sheetId || !file) return;
        try {
            await importFromExcel(sheetId, file);
            toast.success("Excel uğurla import olundu");
            fetchRows();
            setFile(null);
        } catch (e) {
            toast.error("Excel import zamanı xəta baş verdi");
        }
    };

    const handleRefresh = () => {
        fetchColumns();
        fetchRows();
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

            <div className="mb-6 flex gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSkipModalOpen(true)}
                    className="bg-white hover:bg-blue-50 border-slate-300"
                >
                    <RefreshCw className="w-4 h-4 mr-2" /> Sətirləri Ötür (Skip: {skipRows})
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImport(!showImport)}
                    className="bg-white hover:bg-slate-50 border-slate-300"
                >
                    <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${showImport ? 'rotate-180' : ''}`} />
                    Excel import Et
                </Button>
            </div>

            {
                showImport && (
                    <Card className="mb-6 border-slate-200 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex gap-3 items-end">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                                        Excel Faylı Seç
                                    </label>
                                    <Input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        accept=".xlsx,.xls,.csv"
                                        className="border-slate-300 focus:border-blue-500"
                                    />
                                </div>
                                <Button
                                    onClick={handleImportExcel}
                                    disabled={!file}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Upload className="w-4 h-4 mr-2" /> Import Et
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )
            }

            {/* Table Section with Full Scrolling */}
            <Card className="border-slate-200 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)] bg-white">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left text-white font-semibold text-sm border-b-2 border-slate-700 min-w-[60px]">
                                        #
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
                                    <th className="px-4 py-3 text-right text-white font-semibold text-sm border-b-2 border-slate-700 min-w-[80px]">
                                        Əməliyyatlar
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <MemoizedRow
                                        key={row.rowNumber}
                                        row={row}
                                        columns={columns}
                                        onUpdateCell={handleUpdateCell}
                                        onDeleteRow={setRowToDelete}
                                    />
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={columns.length + 2}
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

            <AlertDialog
                open={isSkipModalOpen}
                onOpenChange={(open) => {
                    // Prevent closing without loading data first
                    if (hasLoadedInitialData) setIsSkipModalOpen(open);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{hasLoadedInitialData ? "Sətirləri Ötür" : "Məlumatları Yüklə"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {hasLoadedInitialData
                                ? "Başlanğıcdan neçə sətir ötürmək istədiyinizi qeyd edin (məsələn: 10000)."
                                : "Cədvəli yükləmək üçün sətir ötürmə sayını qeyd edin və ya sıfırdan başlayın."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Input
                            type="number"
                            placeholder="Ötürüləcək sətir sayı"
                            value={tempSkipValue}
                            onChange={(e) => setTempSkipValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = Number(tempSkipValue) || 0;
                                    setSkipRows(val);
                                    setHasLoadedInitialData(true);
                                    setCurrentPage(1);
                                    setIsSkipModalOpen(false);
                                }
                            }}
                        />
                    </div>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        {hasLoadedInitialData && (
                            <AlertDialogCancel onClick={() => setTempSkipValue(skipRows.toString())}>Ləğv et</AlertDialogCancel>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => {
                                setTempSkipValue("0");
                                setSkipRows(0);
                                setHasLoadedInitialData(true);
                                setCurrentPage(1);
                                setIsSkipModalOpen(false);
                            }}
                            className="w-full sm:w-auto"
                        >
                            Sıfırdan başla
                        </Button>
                        <AlertDialogAction
                            onClick={() => {
                                const val = Number(tempSkipValue) || 0;
                                setSkipRows(val);
                                setHasLoadedInitialData(true);
                                setCurrentPage(1);
                                setIsSkipModalOpen(false);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                        >
                            {hasLoadedInitialData ? "Tətbiq et" : "Yüklə"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={rowToDelete !== null} onOpenChange={(open) => !open && setRowToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu sətiri silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (rowToDelete !== null) {
                                    handleDeleteRow(rowToDelete);
                                    setRowToDelete(null);
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
};

export default SupervisorSingleSheet;
