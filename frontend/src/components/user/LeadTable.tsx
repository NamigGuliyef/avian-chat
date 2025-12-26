import { useState } from 'react';
import { format, parse } from 'date-fns';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { Lead, ColumnConfig } from '@/types/crm';
import { StatusChip } from './StatusChip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface LeadTableProps {
  leads: Lead[];
  columns: ColumnConfig[];
  onUpdateLead: (leadId: string, field: string, value: string | number) => void;
}

export function LeadTable({ leads, columns, onUpdateLead }: LeadTableProps) {
  const [datePopoverOpen, setDatePopoverOpen] = useState<string | null>(null);
  
  const visibleColumns = columns.filter(col => col.visibleToUser).sort((a, b) => a.order - b.order);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'dd.MM.yyyy');
    } catch {
      return dateStr;
    }
  };

  const renderCell = (lead: Lead, column: ColumnConfig) => {
    const value = lead[column.dataKey as keyof Lead];

    // Phone column
    if (column.dataKey === 'phone') {
      return (
        <span className="text-blue-500 font-medium">
          {lead.maskedPhone}
        </span>
      );
    }

    // Call Status - dropdown with colored chip
    if (column.dataKey === 'callStatus') {
      return (
        <Select
          value={value as string}
          onValueChange={(newValue) => onUpdateLead(lead.id, 'callStatus', newValue)}
        >
          <SelectTrigger className="border-0 bg-transparent p-0 h-auto w-auto focus:ring-0 shadow-none">
            <StatusChip status={value as any} type="call" showDropdown />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            {column.options?.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Customer Status - badge with dropdown
    if (column.dataKey === 'customerStatus') {
      return (
        <Select
          value={value as string}
          onValueChange={(newValue) => onUpdateLead(lead.id, 'customerStatus', newValue)}
        >
          <SelectTrigger className="border-0 bg-transparent p-0 h-auto w-auto focus:ring-0 shadow-none">
            <StatusChip status={value as any} type="customer" showDropdown />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            {column.options?.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Date column with calendar picker
    if (column.type === 'date') {
      const isOpen = datePopoverOpen === `${lead.id}-${column.dataKey}`;
      return (
        <Popover open={isOpen} onOpenChange={(open) => setDatePopoverOpen(open ? `${lead.id}-${column.dataKey}` : null)}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <CalendarIcon className="w-4 h-4" />
              {formatDate(value as string)}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
            <Calendar
              mode="single"
              selected={value ? new Date(value as string) : undefined}
              onSelect={(date) => {
                if (date) {
                  onUpdateLead(lead.id, column.dataKey, format(date, 'yyyy-MM-dd'));
                  setDatePopoverOpen(null);
                }
              }}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      );
    }

    // Monthly Payment
    if (column.dataKey === 'monthlyPayment') {
      return <span className="font-medium">{value} AZN</span>;
    }

    // Cost
    if (column.dataKey === 'cost') {
      return <span>{value} AZN</span>;
    }

    // Tariff dropdown
    if (column.dataKey === 'tariff' && column.type === 'select') {
      return (
        <Select
          value={value as string}
          onValueChange={(newValue) => onUpdateLead(lead.id, 'tariff', newValue)}
        >
          <SelectTrigger className="border-0 bg-gray-100 rounded px-3 py-1 h-auto w-auto focus:ring-0 shadow-none text-sm">
            <span className="flex items-center gap-1">
              {value}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </span>
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            {column.options?.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Bonus dropdown
    if (column.dataKey === 'bonus' && column.type === 'select') {
      return (
        <Select
          value={value as string}
          onValueChange={(newValue) => onUpdateLead(lead.id, 'bonus', newValue)}
        >
          <SelectTrigger className="border-0 bg-gray-100 rounded px-3 py-1 h-auto w-auto focus:ring-0 shadow-none text-sm">
            <span className="flex items-center gap-1">
              {value}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </span>
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            {column.options?.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Default text
    return <span className="text-sm">{value}</span>;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                #
              </th>
              {visibleColumns.map(col => (
                <th key={col.id} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="px-4 py-12 text-center text-gray-500">
                  Heç bir lead tapılmadı
                </td>
              </tr>
            ) : (
              leads.map((lead, index) => (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  {visibleColumns.map(col => (
                    <td key={col.id} className="px-4 py-3">
                      {renderCell(lead, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
