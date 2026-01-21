"use client";
import {
    CardHeader,
    CardTitle
} from "../ui/card";

import { IExcel } from "@/types/types";
import { Check, Edit, Plus, Table2, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { createExcel, getProjectAgents, getProjectExcels, updateExcel } from "@/api/supervisors";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { ColumnType, ISheetColumn } from "@/types/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";



const initialProjectColumn: Partial<ISheetColumn> = {
    name: "",
    dataKey: "",
    type: ColumnType.Text,
    options: [],
};


const SupervisorSingleProject: React.FC = () => {
    const [isProjectColumnOpen, setIsProjectColumnOpen] = useState(false);
    const [projectColumn, setProjectColumn] =
        useState<Partial<ISheetColumn>>(initialProjectColumn);

    const [optionValue, setOptionValue] = useState({ label: "", value: "" });
    const [excels, setExcels] = useState<IExcel[]>([])
    const [isExcelDialogId, setIsExcelDialogId] = useState("")
    const [excelForm, setExcelForm] = useState<{
        name: string;
        description: string;
        agentIds: string[];
    }>({
        name: "",
        description: "",
        agentIds: [],
    });
    const [editingExcel, setEditingExcel] = useState<IExcel | null>(null);
    const [projectAgents, setProjectAgents] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    const { projectId, projectName } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (projectId) {
            getProjectExcels(projectId).then((d) => {
                setExcels(d)
            })
            getProjectAgents(projectId).then((d) => {
                setProjectAgents(d)
            })
        }
    }, [projectId])

    const toggleAgentExcel = (agentId: string) => {
        setExcelForm((prev) => ({
            ...prev,
            agentIds: prev.agentIds.includes(agentId)
                ? prev.agentIds.filter((id) => id !== agentId)
                : [...prev.agentIds, agentId],
        }));
    };

    const selectedAgents = React.useMemo(
        () =>
            projectAgents.filter(agent =>
                excelForm.agentIds.includes(agent._id)
            ),
        [projectAgents, excelForm.agentIds]
    );

    const filteredAgents = projectAgents.filter((agent) =>
        `${agent.name} ${agent.surname}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );
    const handleUpdateExcel = () => {
        const excelId = editingExcel?._id;
        const data: any = excelForm;
        if (excelId) {
            updateExcel(excelId, data).then((d) => {
                setExcels((pre) => pre.map((item) => {
                    if (item._id === excelId) {
                        return { ...item, ...d }
                    }
                    return item
                }))
            })
        }
        else {
            data.projectId = projectId
            createExcel(data).then((d) => {
                setExcels((pre) => ([...pre, d]))
            })
        }
        setIsExcelDialogId('')
    }

    const handleCreateProjectColumn = async () => {
        if (!projectColumn.name || !projectColumn.dataKey) return;

        // await createProjectColumn({
        //     ...projectColumn,
        //     projectId
        // });

        setIsProjectColumnOpen(false);
        setProjectColumn(initialProjectColumn);
    };


    return (
        <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">← Geri</Button>
            <div className="mb-6  flex items-center justify-between">
                <h2 className="text-2xl font-bold">{projectName}</h2>
                <Dialog open={isProjectColumnOpen} onOpenChange={setIsProjectColumnOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Project üçün xüsusi sütun</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <Label>Column adı</Label>
                                <Input
                                    value={projectColumn.name}
                                    onChange={(e) =>
                                        setProjectColumn({ ...projectColumn, name: e.target.value })
                                    }
                                />
                            </div>

                            {/* dataKey */}
                            <div>
                                <Label>dataKey</Label>
                                <Input
                                    placeholder="məs: customerPhone"
                                    value={projectColumn.dataKey}
                                    onChange={(e) =>
                                        setProjectColumn({ ...projectColumn, dataKey: e.target.value })
                                    }
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={projectColumn.type}
                                    onValueChange={(v) =>
                                        setProjectColumn({ ...projectColumn, type: v as ColumnType })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(ColumnType).map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Select Options */}
                            {projectColumn.type === ColumnType.Select && (
                                <div>
                                    <Label className="mb-2 block">Options</Label>

                                    {(projectColumn.options || []).map((opt, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between mb-2"
                                        >
                                            <div className="text-sm">
                                                <b>{opt.label}</b> — {opt.value}
                                            </div>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() =>
                                                    setProjectColumn({
                                                        ...projectColumn,
                                                        options: (projectColumn.options || []).filter(
                                                            (_, i) => i !== idx
                                                        ),
                                                    })
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}

                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Label"
                                            value={optionValue.label}
                                            onChange={(e) =>
                                                setOptionValue({ ...optionValue, label: e.target.value })
                                            }
                                        />
                                        <Input
                                            placeholder="Value"
                                            value={optionValue.value}
                                            onChange={(e) =>
                                                setOptionValue({ ...optionValue, value: e.target.value })
                                            }
                                        />
                                    </div>

                                    <Button
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => {
                                            if (!optionValue.label || !optionValue.value) return;

                                            setProjectColumn({
                                                ...projectColumn,
                                                options: [
                                                    ...(projectColumn.options || []),
                                                    optionValue,
                                                ],
                                            });

                                            setOptionValue({ label: "", value: "" });
                                        }}
                                    >
                                        Option əlavə et
                                    </Button>
                                </div>
                            )}

                            {/* Save */}
                            <Button className="w-full" onClick={handleCreateProjectColumn}>
                                Yarat
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={Boolean(isExcelDialogId)}
                    onOpenChange={(open) => {
                        if (!open) {
                            setIsExcelDialogId("");
                            setEditingExcel(null);
                            setExcelForm({ name: "", description: "", agentIds: [] });
                            setSearch("");
                        }
                    }}
                >
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setProjectColumn(initialProjectColumn);
                                setIsProjectColumnOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Xüsusi sütun
                        </Button>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => {
                                    setIsExcelDialogId("new");
                                    setEditingExcel(null);
                                    setExcelForm({ name: "", description: "", agentIds: [] });
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Yeni Excel
                            </Button>
                        </DialogTrigger>
                    </div>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editingExcel ? 'Excel-i Redaktə Et' : 'Yeni Excel'}</DialogTitle></DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="mb-1"><Label>Excel adı</Label><Input value={excelForm.name} onChange={(e) => setExcelForm({ ...excelForm, name: e.target.value })} /></div>
                            <div className="mb-1"><Label>Təsvir</Label><Input value={excelForm.description} onChange={(e) => setExcelForm({ ...excelForm, description: e.target.value })} /></div>
                            <div>
                                <Label className="mb-2 block">Agentlər</Label>
                                <Command className="border rounded-lg">
                                    <CommandInput
                                        placeholder="Agent axtar..."
                                        value={search}
                                        onValueChange={setSearch}
                                    />

                                    <CommandList className="max-h-48">
                                        {filteredAgents.length === 0 && (
                                            <CommandEmpty>Tapılmadı</CommandEmpty>
                                        )}

                                        <CommandGroup>
                                            {filteredAgents.map((agent) => {
                                                const isSelected = excelForm.agentIds.includes(agent._id);

                                                return (
                                                    <CommandItem
                                                        key={agent._id}
                                                        value={`${agent.name} ${agent.surname}`}
                                                        onSelect={() => toggleAgentExcel(agent._id)}
                                                        className="flex justify-between"
                                                    >
                                                        <span>
                                                            {agent.name} {agent.surname}
                                                        </span>

                                                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>

                                {selectedAgents.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {selectedAgents.map((agent) => (
                                            <Badge
                                                key={agent._id}
                                                variant="secondary"
                                                className="cursor-pointer"
                                                onClick={() => toggleAgentExcel(agent._id)}
                                            >
                                                {agent.name} {agent.surname} ✕
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button className="w-full" onClick={handleUpdateExcel}>{editingExcel ? 'Yenilə' : 'Yarat'}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {excels.map((item) => {
                    return (
                        <Card key={item._id} className="cursor-pointer hover:border-primary" onClick={() => { navigate(`/supervisor/excels/${item.projectId}/${item._id}/${item.name}`) }}>
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

                                            setIsExcelDialogId(item._id);
                                            setEditingExcel(item);

                                            setExcelForm({
                                                name: item.name,
                                                description: item.description || "",
                                                agentIds: item.agentIds[0]._id ? item.agentIds?.map(a => a._id) : item.agentIds as any ?? [],
                                            });

                                            setSearch("");
                                        }}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent><p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                                <Badge variant="outline">{item.sheetIds?.length} sheet</Badge>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div >
    );
};

export default SupervisorSingleProject;
