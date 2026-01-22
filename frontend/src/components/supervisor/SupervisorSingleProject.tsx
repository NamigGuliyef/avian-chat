"use client";
import {
    CardHeader,
    CardTitle
} from "../ui/card";

import { createExcel, getProjectAgents, getProjectExcels, updateExcel } from "@/api/supervisors";
import { IExcel } from "@/types/types";
import { Check, Edit, Plus, Table2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";


const SupervisorSingleProject: React.FC = () => {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            {/* Header Section */}
            <div className="mb-8">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(-1)} 
                    className="mb-4 hover:bg-slate-200 transition-colors"
                >
                    ← Geri
                </Button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">{projectName}</h1>
                        <p className="text-slate-500">Excel fayllarınızı idarə edin və müştəriləri təyin edin</p>
                    </div>

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
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => {
                                    setIsExcelDialogId("new");
                                    setEditingExcel(null);
                                    setExcelForm({ name: "", description: "", agentIds: [] });
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Yeni Excel
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-2xl">
                            <div className="space-y-6">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl">
                                        {editingExcel ? ' Excel-i Redaktə Et' : 'Yeni Excel Yaradın'}
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-5">
                                    {/* Name Input */}
                                    <div className="space-y-2">
                                        <Label className="text-base font-semibold">Excel Adı</Label>
                                        <Input 
                                            placeholder="Məsələn: Müşteri Sifarişləri" 
                                            value={excelForm.name} 
                                            onChange={(e) => setExcelForm({ ...excelForm, name: e.target.value })}
                                            className="text-base h-10"
                                        />
                                    </div>

                                    {/* Description Input */}
                                    <div className="space-y-2">
                                        <Label className="text-base font-semibold">Təsvir</Label>
                                        <Input 
                                            placeholder="Bu Excel haqqında məlumat..." 
                                            value={excelForm.description} 
                                            onChange={(e) => setExcelForm({ ...excelForm, description: e.target.value })}
                                            className="text-base h-10"
                                        />
                                    </div>

                                    {/* Agents Section */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold flex items-center gap-2">
                                             Agentləri Seçin
                                            <Badge variant="secondary">{excelForm.agentIds.length}</Badge>
                                        </Label>
                                        
                                        <Command className="border-2 border-slate-200 rounded-lg bg-white">
                                            <CommandInput
                                                placeholder="Agent adı ilə axtarın..."
                                                value={search}
                                                onValueChange={setSearch}
                                                className="text-base h-10"
                                            />

                                            <CommandList className="max-h-64">
                                                {filteredAgents.length === 0 && (
                                                    <CommandEmpty className="py-6 text-center text-slate-500">
                                                        Heç bir agent tapılmadı
                                                    </CommandEmpty>
                                                )}

                                                <CommandGroup>
                                                    {filteredAgents.map((agent) => {
                                                        const isSelected = excelForm.agentIds.includes(agent._id);

                                                        return (
                                                            <CommandItem
                                                                key={agent._id}
                                                                value={`${agent.name} ${agent.surname}`}
                                                                onSelect={() => toggleAgentExcel(agent._id)}
                                                                className="flex justify-between py-2 px-3 hover:bg-slate-100 cursor-pointer transition-colors"
                                                            >
                                                                <span className="font-medium text-slate-700">
                                                                    {agent.name} {agent.surname}
                                                                </span>

                                                                {isSelected && (
                                                                    <Check className="h-5 w-5 text-green-600 font-bold" />
                                                                )}
                                                            </CommandItem>
                                                        );
                                                    })}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>

                                        {selectedAgents.length > 0 && (
                                            <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                                <p className="text-sm font-semibold text-slate-700 mb-2">Seçilmiş Agentlər:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedAgents.map((agent) => (
                                                        <Badge
                                                            key={agent._id}
                                                            className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer text-sm py-1 px-3"
                                                            onClick={() => toggleAgentExcel(agent._id)}
                                                        >
                                                            {agent.name} {agent.surname} ✕
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Save Button */}
                                    <Button 
                                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base" 
                                        onClick={handleUpdateExcel}
                                    >
                                         {editingExcel ? 'Yenilə' : 'Yarat'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Excels Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {excels.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <Table2 className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">Excel yoxdur. Başlamaq üçün "Yeni Excel" düyməsini klikləyin</p>
                    </div>
                ) : (
                    excels.map((item) => {
                        return (
                            <Card 
                                key={item._id} 
                                className="cursor-pointer hover:shadow-xl hover:border-blue-400 transition-all duration-300 bg-white hover:bg-slate-50"
                                onClick={() => { navigate(`/supervisor/excels/${item.projectId}/${item._id}/${item.name}`) }}
                            >
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Table2 className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <span className="font-semibold text-slate-900">{item.name}</span>
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
                                            className="hover:bg-slate-200"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-slate-600 line-clamp-2">{item.description || "Təsvir yoxdur"}</p>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                            📋 {item.sheetIds?.length || 0} sheet
                                        </Badge>
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                            👥 {item.agentIds?.length || 0} agent
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default SupervisorSingleProject;
