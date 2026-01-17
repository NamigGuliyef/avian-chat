"use client";
import {
    CardHeader,
    CardTitle
} from "../ui/card";

import { getUserExcels } from "@/api/users";
import { IExcel } from "@/types/types";
import { Table2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";


const UserExcels: React.FC = () => {
    const [excels, setExcels] = useState<IExcel[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        getUserExcels().then((d) => {
            setExcels(d)
        })
    }, [])

    return (
        <div className="p-3">
            <div className="mb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">← Geri</Button>
                <p className="text-muted-foreground">Sizə təyin olunmuş cədvəllər</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {excels.map((item) => {
                    return (
                        <Card
                            key={item._id}
                            onClick={() => navigate(`/user/sheets/${item._id}/${item.name}`)}
                            className="
        group cursor-pointer
        transition-all duration-300
        hover:shadow-xl hover:-translate-y-1
        border-muted hover:border-primary/50
        rounded-2xl
        min-h-[180px]
    "
                        >
                            <CardHeader className="pb-4 px-5 pt-5">
                                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="
                    p-3 rounded-2xl
                    bg-primary/10 text-primary
                    group-hover:bg-primary group-hover:text-white
                    transition-colors
                ">
                                            <Table2 className="h-5 w-5" />
                                        </div>
                                        <span className="line-clamp-1">{item.name}</span>
                                    </div>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="px-5 pb-5 space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {item.description || "Açıqlama mövcud deyil"}
                                </p>

                                <div className="flex items-center justify-between pt-2">
                                    <Badge variant="secondary" className="text-sm px-3 py-1">
                                        📄 {item.sheetIds?.length ?? 0} sheet
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

export default UserExcels;
