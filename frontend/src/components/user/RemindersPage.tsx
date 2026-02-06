"use client";
import { getReminders } from "@/api/users";
import { updateCell } from "@/api/supervisors";
import { SheetRowForm, SheetColumnForm } from "@/types/types";
import { Bell, RefreshCw, ArrowLeft, Phone } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { EditableCell } from "../Table/EditableCell";

interface RemindersBySheet {
    sheetId: string;
    sheetName: string;
    columns: SheetColumnForm[];
    rows: SheetRowForm[];
}

const RemindersPage: React.FC = () => {
    const navigate = useNavigate();
    const [reminders, setReminders] = useState<RemindersBySheet[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchReminders = async () => {
        try {
            setLoading(true);
            const data = await getReminders();
            setReminders(data);
        } catch (e) {
            toast.error("Xatırlatmalar gətirilərkən xəta baş verdi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    const handleUpdateCell = useCallback(async (sheetId: string, rowIndex: number, key: string, value: any) => {
        try {
            await updateCell(sheetId, rowIndex, key, value);

            setReminders(prev => prev.map(sheet => {
                if (sheet.sheetId === sheetId) {
                    return {
                        ...sheet,
                        rows: sheet.rows.map(row => {
                            if (row.rowNumber === rowIndex) {
                                if (key === 'remindMe') {
                                    return { ...row, remindMe: value };
                                }
                                return { ...row, data: { ...row.data, [key]: value } };
                            }
                            return row;
                        }).filter(row => key !== 'remindMe' || value === true) // If unchecking remindMe, remove from list
                    };
                }
                return sheet;
            }).filter(sheet => sheet.rows.length > 0));

            toast.success("Məlumat yeniləndi");
        } catch (e) {
            toast.error("Xəta baş verdi");
        }
    }, []);

    return (
        <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex flex-col overflow-hidden w-full">
            <div className="flex-shrink-0 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Geri
                    </Button>
                    <Button variant="outline" size="sm" onClick={fetchReminders} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Yenilə
                    </Button>
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Bildirişlər</h1>
                        <p className="text-slate-500 text-xs mt-0.5">Xatırlatma qeyd etdiyiniz sətirlər</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pb-4 pr-1">
                {loading && reminders.length === 0 && (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {reminders.length === 0 && !loading && (
                    <Card className="border-dashed border-2 bg-transparent">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-slate-500">
                            <Bell className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-medium text-lg">Heç bir xatırlatma tapılmadı</p>
                            <p className="text-sm">Sətirlərdə 'Zəng et' xanasını işaretləyərək bura əlavə edə bilərsiniz</p>
                        </CardContent>
                    </Card>
                )}

                {reminders.map((sheet) => (
                    <div key={sheet.sheetId} className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-blue-600 hover:bg-blue-700">{sheet.sheetName}</Badge>
                            <span className="text-xs text-slate-500">{sheet.rows.length} sətir</span>
                        </div>
                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                            <CardContent className="p-0 overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead className="bg-slate-900">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-white text-xs font-semibold border-b border-slate-700 min-w-[50px]">#</th>
                                            <th className="px-4 py-2 text-left text-white text-xs font-semibold border-b border-slate-700 min-w-[60px]">Status</th>
                                            {sheet.columns.sort((a, b) => a.order - b.order).map(c => (
                                                <th key={c.columnId._id} className="px-4 py-2 text-left text-white text-xs font-semibold border-b border-slate-700 whitespace-nowrap min-w-[120px]">
                                                    {c.columnId.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sheet.rows.map((row) => (
                                            <tr key={row.rowNumber} className="border-b border-slate-100 hover:bg-blue-50 transition-colors">
                                                <td className="px-4 py-2 text-slate-400 text-xs bg-slate-50">{row.rowNumber}</td>
                                                <td className="px-4 py-2 text-center border-r border-slate-100 min-w-[60px]">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={row.remindMe}
                                                            onChange={(e) => handleUpdateCell(sheet.sheetId, row.rowNumber, 'remindMe', e.target.checked)}
                                                            className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded cursor-pointer"
                                                            title="Siyahıdan çıxar"
                                                        />
                                                    </div>
                                                </td>
                                                {sheet.columns.sort((a, b) => a.order - b.order).map(col => (
                                                    <td key={col.columnId._id} className="px-4 py-2 text-slate-700 text-xs border-r border-slate-50 min-w-[120px]">
                                                        <div className="max-h-20 overflow-auto">
                                                            <EditableCell
                                                                colDef={col.columnId}
                                                                value={row.data[col.columnId.dataKey]}
                                                                editable={col.editable}
                                                                onSave={(val) => handleUpdateCell(sheet.sheetId, row.rowNumber, col.columnId.dataKey, val)}
                                                            />
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RemindersPage;
