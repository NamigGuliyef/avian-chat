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
                        <Card key={item._id} className="cursor-pointer hover:border-primary" onClick={() => { navigate(`/user/columns/${item._id}/${item.name}`) }}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2 justify-between">
                                    <div className="flex items-center gap-2">
                                        <Table2 className="h-5 w-5 text-primary" />
                                        {item.name}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent><p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                                <Badge variant="outline">{item.columnIds.length} sütun</Badge>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div >
    );
};

export default UserSheets;
