"use client";
import {
    CardHeader,
    CardTitle
} from "../ui/card";

import { getPartnerExcels } from "@/api/partners";
import { IExcel } from "@/types/types";
import { Table2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";


const PartnerSingleProject: React.FC = () => {
    const [excels, setExcels] = useState<IExcel[]>([])
    const { projectId, projectName } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (projectId) {
            getPartnerExcels(projectId).then((d) => {
                setExcels(d)
            })
        }
    }, [projectId])

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
                        <p className="text-slate-500">Excel fayllarını görüntüləyin</p>
                    </div>
                </div>
            </div>

            {/* Excels Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {excels.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <Table2 className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">Bu layihədə Excel faylı yoxdur</p>
                    </div>
                ) : (
                    excels.map((item) => {
                        return (
                            <Card
                                key={item._id}
                                className="cursor-pointer hover:shadow-xl hover:border-blue-400 transition-all duration-300 bg-white hover:bg-slate-50"
                                onClick={() => { navigate(`/partner/excels/${item.projectId}/${item._id}/${item.name}`) }}
                            >
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Table2 className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <span className="font-semibold text-slate-900">{item.name}</span>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-slate-600 line-clamp-2">{item.description || "Təsvir yoxdur"}</p>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                            📋 {item.sheetIds?.length || 0} sheet
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

export default PartnerSingleProject;
