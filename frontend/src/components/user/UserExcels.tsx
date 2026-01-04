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
                        <Card key={item._id} className="cursor-pointer hover:border-primary" onClick={() => { navigate(`/user/sheets/${item._id}/${item.name}`) }}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2 justify-between">
                                    <div className="flex items-center gap-2">
                                        <Table2 className="h-5 w-5 text-primary" />
                                        {item.name}
                                    </div>
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

export default UserExcels;
