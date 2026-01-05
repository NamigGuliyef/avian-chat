"use client";
import * as React from "react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table as _Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { ColumnType, IColumn } from "@/types/types";

type RowData = Record<string, any>;

interface Props {
    columns: IColumn[];
    data: RowData[];
    onUpdateCell: (rowIndex: number, key: string, value: any) => void;
    onAddRow?: () => void;
}

const Table: React.FC<Props> = ({
    columns,
    data,
    onUpdateCell,
    onAddRow,
}) => {
    const visibleColumns = React.useMemo(
        () =>
            columns
                .sort((a, b) => a.order - b.order),
        [columns]
    );

    const tableColumns = React.useMemo<ColumnDef<RowData>[]>(
        () =>
            visibleColumns.map(col => ({
                accessorKey: col.dataKey,
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="px-0"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        {col.name}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row, getValue }) => {
                    const value = getValue();

                    if (!col.editableByUser) {
                        return <span className="text-sm">{String(value ?? "")}</span>;
                    }

                    const onChange = (v: any) =>
                        onUpdateCell(row.index, col.dataKey, v);

                    switch (col.type) {
                        case ColumnType.Select:
                            return (
                                <select
                                    className="w-full rounded border px-2 py-1"
                                    value={value as any}
                                    onChange={e => onChange(e.target.value)}
                                >
                                    <option value="">—</option>
                                    {col.options.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            );

                        case ColumnType.Number:
                            return (
                                <Input
                                    type="number"
                                    value={value as any}
                                    onChange={e => onChange(Number(e.target.value))}
                                />
                            );

                        case ColumnType.Date:
                            return (
                                <Input
                                    type="date"
                                    value={value as any}
                                    onChange={e => onChange(e.target.value)}
                                />
                            );

                        default:
                            return (
                                <Input
                                    value={value as any}
                                    onChange={e => onChange(e.target.value)}
                                />
                            );
                    }
                },
            })),
        [visibleColumns, onUpdateCell]
    );

    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div>
            {onAddRow && (
                <div className="flex justify-end mb-3">
                    <Button onClick={onAddRow}>+ Yeni sətir</Button>
                </div>
            )}

            <div className="rounded-md border overflow-hidden">
                <_Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(hg => (
                            <TableRow key={hg.id}>
                                {hg.headers.map(header => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleColumns.length}
                                    className="h-24 text-center"
                                >
                                    Məlumat yoxdur
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </_Table>
            </div>
        </div>
    );
};

export default Table;
