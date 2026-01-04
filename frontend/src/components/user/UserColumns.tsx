import * as React from "react"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
    type VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { getColumnsBySheetId } from "@/api/users"
import { ColumnType, IColumn } from "@/types/types"


type RowData = Record<string, any>

const UserColumns = () => {
    const { sheetId, sheetName } = useParams()
    const navigate = useNavigate()

    const [columns, setColumns] = useState<IColumn[]>([])
    const [data, setData] = useState<RowData[]>([])

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    useEffect(() => {
        if (sheetId) {
            getColumnsBySheetId(sheetId).then(setColumns)
        }
    }, [sheetId])

    const visibleColumns = useMemo(
        () =>
            columns
                .filter(c => c.visibleToUser)
                .sort((a, b) => a.order - b.order),
        [columns]
    )

    const updateCell = (rowIndex: number, key: string, value: any) => {
        setData(old =>
            old.map((row, i) =>
                i === rowIndex ? { ...row, [key]: value } : row
            )
        )
    }

    const tableColumns = useMemo<ColumnDef<RowData>[]>(() =>
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
                const value = getValue()

                if (!col.editableByUser) {
                    return <span className="text-sm">{String(value as any)}</span>
                }

                const onChange = (v: any) =>
                    updateCell(row.index, col.dataKey, v)

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
                        )

                    case ColumnType.Number:
                        return (
                            <Input
                                type="number"
                                value={value as any}
                                onChange={e => onChange(Number(e.target.value))}
                            />
                        )

                    case ColumnType.Date:
                        return (
                            <Input
                                type="date"
                                value={value as any}
                                onChange={e => onChange(e.target.value)}
                            />
                        )

                    default:
                        return (
                            <Input
                                value={value as any}
                                onChange={e => onChange(e.target.value)}
                            />
                        )
                }
            },
        })),
        [visibleColumns]
    )

    const table = useReactTable({
        data,
        columns: tableColumns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    const addRow = () => {
        const row: RowData = {}
        visibleColumns.forEach(c => (row[c.dataKey] = ""))
        setData(prev => [...prev, row])
    }

    return (
        <div className="flex-1 p-4">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        ← Geri
                    </Button>
                    <p className="text-muted-foreground">"{sheetName}" məlumatları</p>
                </div>
                <Button onClick={addRow}>+ Yeni sətir</Button>
            </div>

            {/* Controls */}
            <div className="flex items-center py-3">
                <Input
                    placeholder="Axtar..."
                    value={(table.getState().globalFilter as string) ?? ""}
                    onChange={e => table.setGlobalFilter(e.target.value)}
                    className="max-w-sm"
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter(c => c.getCanHide())
                            .map(column => (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    checked={column.getIsVisible()}
                                    onCheckedChange={value =>
                                        column.toggleVisibility(!!value)
                                    }
                                >
                                    {column.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-hidden">
                <Table>
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
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end gap-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}

export default UserColumns
