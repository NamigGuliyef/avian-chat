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
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
import { SheetColumnForm, SheetRowForm } from "@/types/types";
import { EditableCell } from "../Table/EditableCell";
import { Upload, ArrowLeft, RefreshCcw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Trash2, Filter, Search, X, PanelLeftClose, PanelLeftOpen, RotateCcw, Type } from "lucide-react";
import { formatDate } from '@/lib/utils';
import { getColumns, getRows, addRow, updateCell, deleteRow, importFromExcel, getFilterOptions } from "@/api/supervisors";
import { Checkbox } from "../ui/checkbox";



interface MemoizedRowProps {
    row: SheetRowForm;
    columns: SheetColumnForm[];
    onUpdateCell: (rowIndex: number, key: string, value: any) => void;
    onDeleteRow: (rowIndex: number) => void;
}

const MemoizedRow: React.FC<MemoizedRowProps> = React.memo(({ row, columns, onUpdateCell, onDeleteRow }) => {
    const columnCells = useMemo(() => {
        return columns.map((col) => {
            const colDef = col.columnId;
            if (!colDef) return null;

            return (
                <td
                    key={colDef._id}
                    className="px-4 py-3 text-slate-700 text-sm border-r border-slate-100 hover:bg-blue-100 min-w-[150px]"
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
        });
    }, [row, columns, onUpdateCell]);

    return (
        <tr className="border-b border-slate-200 hover:bg-blue-50 group">
            <td className="px-4 py-3 text-slate-600 font-medium text-sm bg-slate-50 group-hover:bg-blue-100 min-w-[60px]">
                {row.rowNumber}
            </td>
            {columnCells}
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
}, (prevProps, nextProps) => {
    return (
        prevProps.row === nextProps.row &&
        prevProps.columns === nextProps.columns &&
        prevProps.onUpdateCell === nextProps.onUpdateCell &&
        prevProps.onDeleteRow === nextProps.onDeleteRow
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
    const [isImporting, setIsImporting] = useState(false);
    const [rowToDelete, setRowToDelete] = useState<number | null>(null);
    const rowsPerPage = 50;

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Record<string, string[]>>({});
    const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({});
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [expandedFilters, setExpandedFilters] = useState<string[]>([]);
    const [filterSearch, setFilterSearch] = useState<Record<string, string>>({});

    const [searchInput, setSearchInput] = useState('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const sortedColumns = useMemo(() => {
        return [...columns].sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [columns]);

    // cleanup pending transitions on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const displayTotal = useMemo(() => {
        if (totalRows && totalRows > 0) return totalRows;
        return (currentPage - 1) * rowsPerPage + rows.length;
    }, [totalRows, currentPage, rows.length]);

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
    }, [sheetId, currentPage, skipRows, hasLoadedInitialData, searchQuery, filters]);

    useEffect(() => {
        if (sheetId) {
            fetchFilterOptions();
        }
    }, [sheetId]);

    const fetchFilterOptions = async () => {
        try {
            const data = await getFilterOptions(sheetId!);
            setFilterOptions(data);
        } catch (e) {
            console.error("Filtr seçimlərini gətirərkən xəta:", e);
        }
    };



    const fetchColumns = useCallback(async () => {
        try {
            const data = await getColumns(sheetId!);
            setColumns(data);
        } catch (e) {
            toast.error("Sütunlar gətirilərkən xəta baş verdi");
        }
    }, [sheetId]);

    const fetchRows = useCallback(async () => {
        try {
            setLoading(true)
            const res = await getRows(sheetId!, currentPage, rowsPerPage, skipRows, searchQuery, filters);
            // support both legacy array response and new { data, total }
            if (Array.isArray(res)) {
                setRows(res);
                if (res.length > 0 && res.length < rowsPerPage) {
                    setTotalRows((currentPage - 1) * rowsPerPage + res.length);
                } else if (res.length === rowsPerPage) {
                    setTotalRows((currentPage * rowsPerPage) + 1); // estimate
                }
            } else {
                const { data, total } = res as any;
                setRows(data || []);
                if (typeof total === 'number') {
                    setTotalRows(total);
                } else {
                    setTotalRows((currentPage - 1) * rowsPerPage + (data?.length || 0));
                }
            }
        } catch (e) {
            toast.error("Sətirlər gətirilərkən xəta baş verdi");
        } finally {
            setLoading(false)
        }
    }, [sheetId, currentPage, rowsPerPage, skipRows, searchQuery, filters]);

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
            // If Call status is being updated to "successful", auto-fill the date
            if (key.toLowerCase().includes('status') && value === 'Successful') {
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
            if (key.toLowerCase().includes('status') && value !== 'Successful') {
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
    }, [sheetId, columns]);


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
            setIsImporting(true);
            console.log("Excel import başladı:", file.name);
            const importResult = await importFromExcel(sheetId, file);
            console.log("Excel import nəticəsi:", importResult);

            // Wait for rows to load
            try {
                await fetchRows();
            } catch (fetchError) {
                console.error("Sətirlər yükləmə xətası:", fetchError);
                toast.error("Excel import olundu amma sətirlər yükləmə zamanı xəta baş verdi");
                setIsImporting(false);
                return;
            }

            const { inserted, skipped } = importResult as any;
            toast.success(`Excel import olundu: ${inserted} yeni sətir əlavə edildi, ${skipped} dublikat sətir keçildi.`);
            setFile(null);
            setShowImport(false);
        } catch (e) {
            console.error("Excel import xətası:", e);
            const errorMsg = (e as any)?.response?.data?.message || (e as any)?.message || "Bilinməyən xəta";
            toast.error(`Excel import zamanı xəta baş verdi: ${errorMsg}`);
        } finally {
            setIsImporting(false);
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

    const toggleFilterExpansion = (columnId: string) => {
        setExpandedFilters(prev =>
            prev.includes(columnId)
                ? prev.filter(id => id !== columnId)
                : [...prev, columnId]
        );
    };

    const toggleFilterValue = (columnId: string, value: string) => {
        setFilters(prev => {
            const current = prev[columnId] || [];
            const newValues = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];

            const newFilters = { ...prev };
            if (newValues.length === 0) {
                delete newFilters[columnId];
            } else {
                newFilters[columnId] = newValues;
            }
            return newFilters;
        });
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({});
        setSearchQuery('');
        setCurrentPage(1);
    };

    return (
        <div className="flex bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
            <>
                {/* Filter Panel */}
                <div className={`${isFilterPanelOpen ? 'w-80' : 'w-0'} border-r border-slate-200 bg-white shadow-lg flex flex-col transition-all duration-300 overflow-hidden shrink-0`}>
                    <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-white" />
                                <h2 className="text-lg font-bold text-white">Filtrlər</h2>
                            </div>
                            {Object.values(filters).flat().length > 0 && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-400 hover:text-red-300 text-xs">
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Sıfırla
                                </Button>
                            )}
                        </div>
                        {Object.values(filters).flat().length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {Object.entries(filters).map(([colId, values]) =>
                                    values.map(val => (
                                        <Badge key={`${colId}-${val}`} variant="secondary" className="text-xs gap-1">
                                            {val}
                                            <X className="h-3 w-3 cursor-pointer hover:opacity-70" onClick={() => toggleFilterValue(colId, val)} />
                                        </Badge>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        {columns.map(col => {
                            const columnId = col.columnId?.dataKey;
                            const columnName = col.columnId?.name;
                            if (!columnId || ['phone', 'number', '№', 'No'].includes(columnId.toLowerCase())) return null;

                            const uniqueValues = filterOptions[columnId] || [];
                            const searchValue = filterSearch[columnId] || '';
                            const filteredValues = Array.from(new Set(uniqueValues.filter(v =>
                                String(v).toLowerCase().includes(searchValue.toLowerCase())
                            ).map(v => {
                                // If it's a date-like column, format it to DD/MM/YYYY
                                if (columnId.toLowerCase().includes('date')) {
                                    const d = new Date(v as string);
                                    if (!isNaN(d.getTime())) {
                                        const dd = String(d.getDate()).padStart(2, '0');
                                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                                        const yyyy = d.getFullYear();
                                        return `${dd}/${mm}/${yyyy}`;
                                    }
                                }
                                return v;
                            })));

                            return (
                                <div key={columnId} className="mb-5 pb-4 border-b border-slate-200 last:border-0">
                                    <button
                                        onClick={() => toggleFilterExpansion(columnId)}
                                        className="flex items-center justify-between w-full text-sm font-semibold mb-3 text-slate-900 hover:text-blue-600 transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Type className="h-4 w-4 text-blue-600" />
                                            {columnName}
                                            {(filters[columnId]?.length || 0) > 0 && (
                                                <Badge className="text-xs ml-1 bg-blue-100 text-blue-700">
                                                    {filters[columnId].length}
                                                </Badge>
                                            )}
                                        </span>
                                        {expandedFilters.includes(columnId) ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                    </button>
                                    {expandedFilters.includes(columnId) && (
                                        <div className="ml-2">
                                            <Input
                                                placeholder="Axtar..."
                                                value={searchValue}
                                                onChange={(e) => setFilterSearch(prev => ({ ...prev, [columnId]: e.target.value }))}
                                                className="h-8 text-xs mb-2"
                                            />
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {filteredValues.map(value => (
                                                    <div key={value} className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={`${columnId}-${value}`}
                                                            checked={(filters[columnId] || []).includes(value)}
                                                            onCheckedChange={() => toggleFilterValue(columnId, value)}
                                                        />
                                                        <label htmlFor={`${columnId}-${value}`} className="text-xs cursor-pointer truncate text-slate-700">
                                                            {value}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </ScrollArea>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    {/* Header */}
                    <div className="h-20 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white shadow-sm">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                                className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            >
                                {isFilterPanelOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="hover:bg-slate-200 transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Geri
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{sheetName}</h1>
                                <p className="text-xs text-slate-500">Cəmi {displayTotal} sətir | {columns.length} sütun</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleRefresh} className="hover:bg-blue-50">
                                <RefreshCcw className="w-4 h-4 mr-2" /> Yenilə
                            </Button>
                        </div>
                    </div>

                    {/* Search & Actions Bar */}
                    <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Axtarış (Nömrə, Sətir və s.)..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setSearchQuery(searchInput);
                                        setCurrentPage(1);
                                    }
                                }}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsSkipModalOpen(true)}
                                className="bg-white hover:bg-blue-50"
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" /> Skip: {skipRows}
                            </Button>
                            {hasLoadedInitialData && (
                                <Button
                                    onClick={() => {
                                        const totalAfterSkip = Math.max(0, totalRows - skipRows);
                                        const lastPage = Math.max(1, Math.ceil(totalAfterSkip / rowsPerPage));
                                        setCurrentPage(lastPage);
                                        setIsSkipModalOpen(false);
                                    }}
                                    className="bg-slate-600 hover:bg-slate-700 w-full"
                                >
                                    Son sətirə Get
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowImport(!showImport)}
                                className="bg-white hover:bg-slate-50"
                            >
                                <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${showImport ? 'rotate-180' : ''}`} />
                                Excel Import
                            </Button>
                        </div>
                    </div>

                    {
                        showImport && (
                            <Card className="m-6 mb-0 border-slate-200 shadow-sm">
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
                                            disabled={!file || isImporting}
                                            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isImporting ? (
                                                <>
                                                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Yüklənir...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4 mr-2" /> Import Et
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    }

                    {/* Table Section */}
                    <Card className="flex-1 m-6 border-slate-200 shadow-lg overflow-hidden flex flex-col min-h-0">
                        <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                            <div className="flex-1 overflow-x-auto overflow-y-auto bg-white">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-white font-semibold text-sm border-b-2 border-slate-700 min-w-[60px]">
                                                #
                                            </th>
                                            {sortedColumns.map((c) => (
                                                <th
                                                    key={c.columnId?._id}
                                                    className="px-4 py-3 text-left text-white font-semibold text-sm border-b-2 border-slate-700 whitespace-nowrap min-w-[150px]"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>{c.columnId?.name}</span>
                                                        <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-200">
                                                            {c.columnId?.type || "Text"}
                                                        </Badge>
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="px-4 py-3 text-right text-white font-semibold text-sm border-b-2 border-slate-700 min-w-[80px]">
                                                Əməliyyat
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {!loading && rows.map((row) => (
                                            <MemoizedRow
                                                key={`${row.sheetId}-${row.rowNumber}`}
                                                row={row}
                                                columns={sortedColumns}
                                                onUpdateCell={handleUpdateCell}
                                                onDeleteRow={(rn) => setRowToDelete(rn)}
                                            />
                                        ))}
                                        {loading && (
                                            <tr>
                                                <td colSpan={sortedColumns.length + 2} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                                        <p className="text-sm font-medium text-slate-500">Məlumatlar yüklənir...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {!loading && rows.length === 0 && (
                                            <tr>
                                                <td colSpan={columns.length + 2} className="py-20 text-center text-slate-500">
                                                    <p className="font-medium text-lg">Heç bir sətir tapılmadı</p>
                                                    <p className="text-sm">Filtrləri sıfırlayın və ya Excel import edin</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination footer inside Card */}
                            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                                <div className="text-sm text-slate-500">
                                    Göstərilir: <span className="font-semibold text-slate-700">{(currentPage - 1) * rowsPerPage + 1} - {(currentPage - 1) * rowsPerPage + rows.length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        className="bg-white"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Əvvəlki
                                    </Button>
                                    <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-md text-sm font-bold text-blue-600">
                                        {currentPage}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNextPage}
                                        disabled={rows.length < rowsPerPage}
                                        className="bg-white"
                                    >
                                        Növbəti <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Existing Modals */}
                <AlertDialog
                    open={isSkipModalOpen}
                    onOpenChange={(open) => {
                        if (hasLoadedInitialData) setIsSkipModalOpen(open);
                    }}
                >
                    <AlertDialogContent className="max-w-2xl w-[90vw]">
                        <AlertDialogHeader>
                            <AlertDialogTitle>{hasLoadedInitialData ? "Sətirləri Ötür" : "Məlumatları Yüklə"}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {hasLoadedInitialData
                                    ? "Başlanğıcdan neçə sətir ötürmək istədiyinizi qeyd edin."
                                    : "Cədvəli yükləmək üçün sətir ötürmə sayını qeyd edin."}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                            <Input
                                type="number"
                                placeholder="Ötürüləcək sətir sayı"
                                value={tempSkipValue}
                                onChange={(e) => setTempSkipValue(e.target.value)}
                            />
                        </div>
                        <AlertDialogFooter className="flex flex-col gap-2">
                            <AlertDialogCancel onClick={() => setIsSkipModalOpen(false)} className="w-full bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border-red-200">
                                Ləğv et
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    const val = Number(tempSkipValue) || 0;
                                    setSkipRows(val);
                                    setHasLoadedInitialData(true);
                                    setCurrentPage(1);
                                    setIsSkipModalOpen(false);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 w-full"
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
                                Bu sətiri silmək istədiyinizə əminsiniz?
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
            </>
        </div>
    );
};

export default SupervisorSingleSheet;
