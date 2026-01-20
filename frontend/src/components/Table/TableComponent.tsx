import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

interface TableComponentProps {
    columns: any[];
    data: any[];
    sortColumn: string | null;
    sortDirection: 'asc' | 'desc';
    handleSort: (columnId: string) => void;
    visibleColumns: any[];
    pageSize: number;
    currentPage: number;
}

const TableComponent: React.FC<TableComponentProps> = ({
    columns,
    data,
    sortColumn,
    sortDirection,
    handleSort,
    visibleColumns,
    pageSize,
    currentPage,
}) => {
    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader className="sticky top-0 bg-muted z-10">
                    <TableRow>
                        {visibleColumns.map((column) => (
                            <TableHead
                                key={column.id}
                                className="cursor-pointer hover:bg-muted/80 transition-colors whitespace-nowrap"
                                onClick={() => handleSort(column.id)}
                            >
                                <div className="flex items-center gap-1">
                                    {column.name}
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                    {sortColumn === column.id && (
                                        <span className="text-xs text-primary">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/50">
                            {visibleColumns.map((column) => {
                                const cellValue = row[column.id];
                                return (
                                    <TableCell key={column.id} className="whitespace-nowrap px-3 py-2">
                                        {column.type === 'number' && cellValue !== undefined && cellValue !== null
                                            ? (Number(cellValue) as number).toLocaleString()
                                            : cellValue ?? '-'}
                                        {column.id === 'salesAmount' && cellValue ? ' ₼' : ''}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-muted-foreground">
                                Heç bir nəticə tapılmadı
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default TableComponent;
