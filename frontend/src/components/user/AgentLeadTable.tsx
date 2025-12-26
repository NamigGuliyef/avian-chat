import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Download } from 'lucide-react';
import { Lead, ColumnConfig } from '@/types/crm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface AgentLeadTableProps {
  leads: Lead[];
  columns: ColumnConfig[];
  onUpdateLead: (leadId: string, field: string, value: string | number) => void;
  onAddLead?: (lead: Partial<Lead>) => void;
  currentUserId?: string;
}

export function AgentLeadTable({ leads, columns, onUpdateLead, onAddLead, currentUserId }: AgentLeadTableProps) {
  const [datePopoverOpen, setDatePopoverOpen] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  
  const visibleColumns = columns.filter(col => col.visibleToUser).sort((a, b) => a.order - b.order);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'dd.MM.yyyy');
    } catch {
      return dateStr;
    }
  };

  const startEdit = (leadId: string, columnKey: string, currentValue: any) => {
    setEditingCell(`${leadId}-${columnKey}`);
    setEditValue(String(currentValue || ''));
  };

  const saveEdit = (leadId: string, columnKey: string) => {
    onUpdateLead(leadId, columnKey, editValue);
    setEditingCell(null);
    setEditValue('');
  };

  const handleAddRow = () => {
    if (!onAddLead) return;
    // Check required fields
    const missingRequired = visibleColumns
      .filter(col => col.isRequired)
      .find(col => !newRowData[col.dataKey]);
    
    if (missingRequired) {
      toast.error(`${missingRequired.name} sahəsi məcburidir`);
      return;
    }

    onAddLead({ ...newRowData, assignedUser: currentUserId });
    setNewRowData({});
    setIsAddingRow(false);
    toast.success('Sətir əlavə edildi');
  };

  const handleExportExcel = () => {
    const headers = visibleColumns.map(c => c.name).join(',');
    const rows = leads.map(lead => 
      visibleColumns.map(col => (lead as any)[col.dataKey] || '').join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Excel olaraq yükləndi');
  };

  const getOptionColor = (column: ColumnConfig, value: string) => {
    const option = column.options?.find(o => o.value === value);
    return option?.color || '#6B7280';
  };

  const renderCell = (lead: Lead, column: ColumnConfig) => {
    const value = (lead as any)[column.dataKey] || '';
    const cellId = `${lead.id}-${column.dataKey}`;
    const isEditing = editingCell === cellId;
    const isEditable = column.editableByUser && lead.assignedUser === currentUserId;

    // Phone column - always read-only masked
    if (column.type === 'phone') {
      return (
        <span className="text-primary font-medium">
          {lead.maskedPhone || value}
        </span>
      );
    }

    // Select type - dropdown with colored options
    if (column.type === 'select' && column.options && column.options.length > 0) {
      const currentOption = column.options.find(o => o.value === value);
      return (
        <Select
          value={String(value)}
          onValueChange={(newValue) => onUpdateLead(lead.id, column.dataKey, newValue)}
          disabled={!isEditable}
        >
          <SelectTrigger 
            className="border-0 rounded-full px-3 py-1 h-auto w-auto min-w-[100px] focus:ring-0 shadow-none text-sm font-medium text-white"
            style={{ backgroundColor: getOptionColor(column, String(value)) }}
          >
            <SelectValue placeholder="Seçin" />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            <ScrollArea className="max-h-48">
              {column.options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: opt.color || '#6B7280' }}
                    />
                    {opt.label}
                  </div>
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      );
    }

    // Date column with calendar picker
    if (column.type === 'date') {
      const isOpen = datePopoverOpen === cellId;
      return (
        <Popover open={isOpen} onOpenChange={(open) => setDatePopoverOpen(open ? cellId : null)}>
          <PopoverTrigger asChild disabled={!isEditable}>
            <button className={cn(
              "flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg",
              isEditable ? "text-foreground hover:bg-muted cursor-pointer" : "text-muted-foreground cursor-default"
            )}>
              <CalendarIcon className="w-4 h-4" />
              {value ? formatDate(String(value)) : 'Tarix seçin'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-background border shadow-lg z-50" align="start">
            <Calendar
              mode="single"
              selected={value ? new Date(String(value)) : undefined}
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

    // Number column
    if (column.type === 'number') {
      if (isEditing && isEditable) {
        return (
          <Input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => saveEdit(lead.id, column.dataKey)}
            onKeyDown={(e) => e.key === 'Enter' && saveEdit(lead.id, column.dataKey)}
            className="h-8 w-24"
            autoFocus
          />
        );
      }
      return (
        <span 
          className={cn("font-semibold text-foreground", isEditable && "cursor-pointer hover:text-primary")}
          onClick={() => isEditable && startEdit(lead.id, column.dataKey, value)}
        >
          {value}
        </span>
      );
    }

    // Text column (default)
    if (isEditing && isEditable) {
      return (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => saveEdit(lead.id, column.dataKey)}
          onKeyDown={(e) => e.key === 'Enter' && saveEdit(lead.id, column.dataKey)}
          className="h-8 w-full max-w-[200px]"
          autoFocus
        />
      );
    }
    
    return (
      <span 
        className={cn("text-sm", isEditable && "cursor-pointer hover:text-primary")}
        onClick={() => isEditable && startEdit(lead.id, column.dataKey, value)}
      >
        {value || '-'}
      </span>
    );
  };

  if (visibleColumns.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <p className="text-muted-foreground">Bu cədvəl üçün sütun təyin olunmayıb</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onAddLead && (
            <Button size="sm" onClick={() => setIsAddingRow(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Yeni sətir
            </Button>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-2">
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">
                  #
                </th>
                {visibleColumns.map(col => (
                  <th key={col.id} className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    {col.name}
                    {col.isRequired && <span className="text-destructive ml-1">*</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {/* Add new row */}
              {isAddingRow && (
                <tr className="bg-primary/5">
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <Button size="sm" variant="ghost" onClick={() => setIsAddingRow(false)}>×</Button>
                  </td>
                  {visibleColumns.map(col => (
                    <td key={col.id} className="px-4 py-3">
                      {col.type === 'select' && col.options ? (
                        <Select value={newRowData[col.dataKey] || ''} onValueChange={(v) => setNewRowData({...newRowData, [col.dataKey]: v})}>
                          <SelectTrigger className="h-8 w-full"><SelectValue placeholder="Seçin" /></SelectTrigger>
                          <SelectContent>
                            {col.options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          type={col.type === 'number' ? 'number' : 'text'}
                          value={newRowData[col.dataKey] || ''} 
                          onChange={(e) => setNewRowData({...newRowData, [col.dataKey]: e.target.value})}
                          className="h-8"
                          placeholder={col.name}
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-2">
                    <Button size="sm" onClick={handleAddRow}>Əlavə et</Button>
                  </td>
                </tr>
              )}
              {leads.length === 0 && !isAddingRow ? (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className="px-4 py-12 text-center text-muted-foreground">
                    Bu cədvəldə heç bir lead yoxdur
                  </td>
                </tr>
              ) : (
                leads.map((lead, index) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 text-sm text-muted-foreground font-medium">
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
    </div>
  );
}
