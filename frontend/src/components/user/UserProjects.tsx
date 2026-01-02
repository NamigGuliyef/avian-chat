// UserProjects.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { mockLeads, mockExcels, mockSheets } from "@/data/mockData";
import { Lead, Excel, Sheet } from "@/types/crm";
import { useAuth } from "@/hooks/useAuth";
import { AgentLeadTable } from "@/components/user/AgentLeadTable";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LayoutGrid, FileSpreadsheet } from "lucide-react";

export default function UserProjects() {
    const navigate = useNavigate();
    const { session, isLoading } = useAuth();

    const [leads, setLeads] = useState<Lead[]>(mockLeads);
    const [selectedExcel, setSelectedExcel] = useState<Excel | null>(null);
    const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);

    useEffect(() => {
        if (!isLoading && (!session.isAuthenticated || session.user?.role !== "agent")) {
            navigate("/user/login");
        }
    }, [isLoading, session, navigate]);

    const agentExcels = mockExcels.filter(e => e.agentIds.includes(session.user?.id || ""));
    const agentSheets = mockSheets.filter(s => s.agentIds.includes(session.user?.id || ""));

    const sheetLeads = selectedSheet
        ? leads.filter(l => l.sheetId === selectedSheet.id)
        : [];

    return (
        <div className="p-6">
            {(selectedExcel || selectedSheet) && (
                <button
                    className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
                    onClick={() => selectedSheet ? setSelectedSheet(null) : setSelectedExcel(null)}
                >
                    <ArrowLeft className="h-4 w-4" /> Geri
                </button>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {!selectedExcel ? (
                    <div className="grid md:grid-cols-3 gap-4">
                        {agentExcels.map(excel => (
                            <Card key={excel.id} onClick={() => setSelectedExcel(excel)} className="cursor-pointer hover:shadow-md">
                                <CardContent className="p-4 flex gap-4">
                                    <LayoutGrid />
                                    <div>
                                        <p className="font-semibold">{excel.name}</p>
                                        <Badge variant="secondary">
                                            {agentSheets.filter(s => s.excelId === excel.id).length} sheet
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : !selectedSheet ? (
                    <div className="grid md:grid-cols-3 gap-4">
                        {agentSheets
                            .filter(s => s.excelId === selectedExcel.id)
                            .map(sheet => (
                                <Card key={sheet.id} onClick={() => setSelectedSheet(sheet)} className="cursor-pointer">
                                    <CardContent className="p-4 flex gap-4">
                                        <FileSpreadsheet />
                                        <div>
                                            <p className="font-semibold">{sheet.name}</p>
                                            <Badge variant="outline">
                                                {leads.filter(l => l.sheetId === sheet.id).length} lead
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                ) : (
                    <AgentLeadTable
                        leads={sheetLeads}
                        columns={selectedSheet.columns || []}
                        currentUserId={session.user?.id} onUpdateLead={function (leadId: string, field: string, value: string | number): void {
                            throw new Error("Function not implemented.");
                        }} />
                )}
            </motion.div>
        </div>
    );
}
