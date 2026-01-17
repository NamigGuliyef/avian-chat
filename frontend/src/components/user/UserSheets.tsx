"use client";
import {
    CardHeader,
    CardTitle
} from "../ui/card";

import { getSheetsByExcelId, getUserSheets } from "@/api/users";
import { ISheet } from "@/types/types";
import { Table2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";


const UserSheets: React.FC = () => {
    const [sheets, setSheets] = useState<ISheet[]>([])
    const navigate = useNavigate()
    const { excelId, excelName } = useParams()

    useEffect(() => {
        if (excelId) {
            getSheetsByExcelId(excelId).then((d) => {
                setSheets(d)
            })
        }
    }, [excelId])

    return (
        <div className="p-3">
            <div className="mb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">← Geri</Button>
                <p className="text-muted-foreground">"{excelName}" excelin sheet seçin</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sheets.map((item) => {
                    return (
                        <Card
                            key={item._id}
                            onClick={() => navigate(`/user/columns/${item._id}/${item.name}`)}
                            className="
        group cursor-pointer
        transition-all duration-300
        hover:shadow-xl hover:-translate-y-1
        border-muted hover:border-primary/50
        rounded-2xl
        min-h-[220px]
        w-full
    "
                        >
                            <CardHeader className="pb-4 px-6 pt-6">
                                <CardTitle className="text-xl font-semibold flex items-center gap-4">
                                    <div className="
                p-3 rounded-2xl
                bg-primary/10 text-primary
                group-hover:bg-primary group-hover:text-white
                transition-colors
            ">
                                        <Table2 className="h-6 w-6" />
                                    </div>

                                    <span className="line-clamp-1">
                                        {item.name}
                                    </span>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="px-6 pb-6 space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {item.description || "Açıqlama mövcud deyil"}
                                </p>

                                <div className="flex items-center justify-between pt-2">
                                    <Badge variant="secondary" className="text-sm px-3 py-1 w-fit">
                                        🧩 {item.columnIds?.length ?? 0} sütun
                                    </Badge>

                                    <span className="
                text-sm text-primary font-medium
                opacity-0 group-hover:opacity-100
                transition-opacity
            ">
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                    );
                })}
            </div>
        </div >
    );
};

export default UserSheets;
