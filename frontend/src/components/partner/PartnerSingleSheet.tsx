"use client";
import {
    getPartnerColumns, getPartnerRows
} from "@/api/partners";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { SheetColumnForm, SheetRowForm } from "@/types/types";
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { EditableCell } from "../Table/EditableCell";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Card,
    CardContent,
} from "../ui/card";
import { Input } from "../ui/input";

interface MemoizedRowProps {
    row: SheetRowForm;
    columns: SheetColumnForm[];
}

const MemoizedRow: React.FC<MemoizedRowProps> = React.memo(({ row, columns }) => {
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
                                    editable={false} // Always false for partners
                                    onSave={() => { }} // No-op
                                />
                            </div>
                        </td>
                    );
                })}
        </tr>
    );
});

const PartnerSingleSheet: React.FC = () => {
    const { sheetId, sheetName } = useParams();
    const navigate = useNavigate();

    // States
    const [skipRows, setSkipRows] = useState<number>(0);
    const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
    const [isSkipModalOpen, setIsSkipModalOpen] = useState(true);
    const [tempSkipValue, setTempSkipValue] = useState<string>("0");
    const [columns, setColumns] = useState<SheetColumnForm[]>([]);
    const [rows, setRows] = useState<SheetRowForm[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false)
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
            const data = await getPartnerColumns(sheetId!);
            setColumns(data);
        } catch (e) {
            toast.error("Sütunlar gətirilərkən xəta baş verdi");
        }
    };

    const fetchRows = async () => {
        try {
            setLoading(true)
            const data = await getPartnerRows(sheetId!, currentPage, rowsPerPage, skipRows);
            setRows(data.data);
        } catch (e) {
            toast.error("Sətirlər gətirilərkən xəta baş verdi");
        } finally {
            setLoading(false)
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
            </div>

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
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <MemoizedRow
                                        key={row.rowNumber}
                                        row={row}
                                        columns={columns}
                                    />
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={columns.length + 1}
                                            className="px-4 py-8 text-center text-slate-500"
                                        >
                                            <p className="font-medium">Sətir tapılmadı</p>
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
                    if (hasLoadedInitialData) setIsSkipModalOpen(open);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{hasLoadedInitialData ? "Sətirləri Ötür" : "Məlumatları Yüklə"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {hasLoadedInitialData
                                ? "Başlanğıcdan neçə sətir ötürmək istədiyinizi qeyd edin."
                                : "Cədvəli yükləmək üçün sətir ötürmə sayını qeyd edin və ya sıfırdan başlayın."}
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
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setTempSkipValue("0");
                                setSkipRows(0);
                                setHasLoadedInitialData(true);
                                setCurrentPage(1);
                                setIsSkipModalOpen(false);
                            }}
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
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {hasLoadedInitialData ? "Tətbiq et" : "Yüklə"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
};

export default PartnerSingleSheet;
