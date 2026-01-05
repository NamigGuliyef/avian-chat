"use client";
import {
    CardHeader,
    CardTitle
} from "../ui/card";
import { createExcelSheet, getExcelSheets, updateExcelSheet } from "@/api/supervisors";
import { IAgentRowPermission, ISheet } from "@/types/types";
import { Edit, Plus, Table2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";


interface SheetCreateDto {
    name: string;
    description: string;
    agentIds: string[];
    agentRowPermissions: IAgentRowPermission[];
}
const emptyForm: SheetCreateDto = {
    name: "",
    description: "",
    agentIds: [],
    agentRowPermissions: [],
};

const SupervisorSingleExcel: React.FC = () => {
    const [sheets, setSheets] = useState<ISheet[]>([])
    const [isSheetDialogId, setIsSheetDialogId] = useState("")
    const [sheetForm, setSheetForm] = useState<SheetCreateDto>(emptyForm);
    const [editingSheet, setEditingSheet] = useState<ISheet | null>(null);
    const [projectAgents, setProjectAgents] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const { excelId, excelName, projectId } = useParams()
    const navigate = useNavigate()


    useEffect(() => {
        if (excelId) {
            getExcelSheets(excelId).then((d) => {
                setSheets(d)
                setProjectAgents(d[0].agentIds)
            })
        }
    }, [excelId])

    const toggleAgentSheet = (agentId: string) => {
        setSheetForm((prev) => {
            const exists = prev.agentIds.includes(agentId);

            return {
                ...prev,
                agentIds: exists
                    ? prev.agentIds.filter((id) => id !== agentId)
                    : [...prev.agentIds, agentId],

                agentRowPermissions: exists
                    ? prev.agentRowPermissions.filter(p => p.agentId !== agentId)
                    : [...prev.agentRowPermissions, {
                        agentId,
                        startRow: 1,
                        endRow: 100,
                    }],
            };
        });
    };


    const updateAgentRowPermission = (
        agentId: string,
        startRow?: number,
        endRow?: number
    ) => {
        setSheetForm((prev) => ({
            ...prev,
            agentRowPermissions: prev.agentRowPermissions.map((perm) => {
                if (perm.agentId !== agentId) return perm;

                const newStart = startRow ?? perm.startRow;
                const newEnd = endRow ?? perm.endRow;
                return {
                    ...perm,
                    startRow: newStart,
                    endRow: newEnd,
                };
            }),
        }));
    };

    const filteredAgents = React.useMemo(() => {
        if (!search.trim()) return projectAgents;

        const q = search.toLowerCase();

        return projectAgents.filter((agent) =>
            `${agent.name} ${agent.surname}`
                .toLowerCase()
                .includes(q)
        );
    }, [projectAgents, search]);

    const handleUpdateSheet = () => {
        const payload: SheetCreateDto = {
            ...sheetForm,
            agentRowPermissions: sheetForm.agentIds.map((agentId) => {
                const permission = sheetForm.agentRowPermissions.find(
                    (p) => p.agentId === agentId
                );

                return (
                    permission || {
                        agentId,
                        startRow: 1,
                        endRow: 100,
                    }
                );
            }),
        };
        const sheetId = editingSheet?._id;
        if (sheetId) {
            updateExcelSheet(sheetId, payload).then((d) => {
                setSheets((prev) =>
                    prev.map((item) =>
                        item._id === excelId ? { ...item, ...d } : item
                    )
                );
            });
        } else {
            createExcelSheet({ ...payload, excelId, projectId }).then((d) => {
                setSheets((prev) => [...prev, d]);
            });
        }

        setIsSheetDialogId("");
    };


    return (
        <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">← Geri</Button>
            <div className="mb-6  flex items-center justify-between">
                <h2 className="text-2xl font-bold">{excelName}</h2>

                <Dialog
                    open={Boolean(isSheetDialogId)}
                    onOpenChange={(open) => {
                        if (!open) {
                            setIsSheetDialogId("");
                            setEditingSheet(null);
                            setSheetForm(emptyForm);
                            setSearch("");
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => {
                                setIsSheetDialogId("new");
                                setEditingSheet(null);
                                setSheetForm(emptyForm);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Yeni Sheet
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editingSheet ? 'Sheet-i Redaktə Et' : 'Yeni Sheet'}</DialogTitle></DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="mb-1"><Label>Sheet adı</Label><Input value={sheetForm.name} onChange={(e) => setSheetForm({ ...sheetForm, name: e.target.value })} /></div>
                            <div className="mb-1"><Label>Təsvir</Label><Input value={sheetForm.description} onChange={(e) => setSheetForm({ ...sheetForm, description: e.target.value })} /></div>
                            <div>
                                <Label className="mb-2 block">Agentlər və sətir icazələri</Label>
                                <ScrollArea className="h-48 border rounded-lg p-2">
                                    {filteredAgents.map((agent) => {
                                        const isSelected = sheetForm.agentIds.includes(agent._id);
                                        const permission = sheetForm.agentRowPermissions.find(p => p.agentId === agent._id);
                                        return (
                                            <div key={agent._id} className="py-2 border-b border-border/50 last:border-0">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox checked={isSelected} onCheckedChange={() => toggleAgentSheet(agent._id)} />
                                                    <span className="text-sm font-medium">{agent.name} {agent.surname}</span>
                                                </div>
                                                {isSelected && (
                                                    <div className="mt-2 ml-6 flex items-center gap-2 text-sm">
                                                        <span className="text-muted-foreground">Sətir aralığı:</span>
                                                        <Input
                                                            type="number"
                                                            value={permission?.startRow}
                                                            onChange={(e) => updateAgentRowPermission(agent._id, parseInt(e.target.value), undefined)}
                                                            className="w-20 h-8"
                                                            min={1}
                                                        />
                                                        <span>-</span>
                                                        <Input
                                                            type="number"
                                                            value={permission?.endRow}
                                                            onChange={(e) => updateAgentRowPermission(agent._id, undefined, parseInt(e.target.value))}
                                                            className="w-20 h-8"
                                                            min={1}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </ScrollArea>
                            </div>
                            <Button className="w-full" onClick={handleUpdateSheet}>{editingSheet ? 'Yenilə' : 'Yarat'}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sheets.map((item) => {
                    return (
                        <Card key={item._id} className="cursor-pointer hover:border-primary" onClick={() => { navigate(`/supervisor/sheets/${projectId}/${excelId}/${item._id}/${item.name}`) }}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2 justify-between">
                                    <div className="flex items-center gap-2">
                                        <Table2 className="h-5 w-5 text-primary" />
                                        {item.name}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            setIsSheetDialogId(item._id);
                                            setEditingSheet(item);

                                            setSheetForm({
                                                name: item.name,
                                                description: item.description || "",
                                                agentIds: item.agentIds || [],
                                                agentRowPermissions:
                                                    item.agentRowPermissions?.length
                                                        ? item.agentRowPermissions
                                                        : (item.agentIds || []).map((id: string) => ({
                                                            agentId: id,
                                                            startRow: 1,
                                                            endRow: 100,
                                                        })),
                                            });
                                            setSearch("");
                                        }}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent><p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                                <Badge variant="outline">{item.columnIds.length} sütun</Badge>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default SupervisorSingleExcel;
