import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  Calendar, 
  Download, 
  Search, 
  ChevronDown, 
  ChevronUp,
  X,
  Plus,
  Eye,
  EyeOff,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Hash,
  Type,
  CalendarDays,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Dynamic column types
type ColumnType = 'text' | 'number' | 'date';

interface DynamicColumn {
  id: string;
  name: string;
  type: ColumnType;
  visible: boolean;
}

interface StatCard {
  id: string;
  columnId: string;
  operation: 'count' | 'sum' | 'avg';
  label: string;
}

// Mock Excel data simulating dynamic columns
const mockExcelColumns: DynamicColumn[] = [
  { id: 'company', name: 'Şirkət', type: 'text', visible: true },
  { id: 'project', name: 'Layihə', type: 'text', visible: true },
  { id: 'date', name: 'Tarix', type: 'date', visible: true },
  { id: 'callReason', name: 'Zəng səbəbi', type: 'text', visible: true },
  { id: 'salesStatus', name: 'Satış statusu', type: 'text', visible: true },
  { id: 'operator', name: 'Operator', type: 'text', visible: true },
  { id: 'callCount', name: 'Zəng sayı', type: 'number', visible: true },
  { id: 'salesAmount', name: 'Satış məbləği', type: 'number', visible: true },
  { id: 'duration', name: 'Müddət (dəq)', type: 'number', visible: true },
  { id: 'customerName', name: 'Müştəri adı', type: 'text', visible: true },
  { id: 'phone', name: 'Telefon', type: 'text', visible: false },
  { id: 'city', name: 'Şəhər', type: 'text', visible: false },
  { id: 'notes', name: 'Qeydlər', type: 'text', visible: false },
];

// Mock data rows
const mockData = [
  { company: 'ABC Corp', project: 'Survey', date: '2024-01-15', callReason: 'Anket', salesStatus: 'Uğurlu', operator: 'Anar Məmmədov', callCount: 45, salesAmount: 2500, duration: 120, customerName: 'Rəşad İsmayılov', phone: '+994501234567', city: 'Bakı', notes: 'İlk əlaqə' },
  { company: 'XYZ Ltd', project: 'Telesales', date: '2024-01-15', callReason: 'Satış', salesStatus: 'Gözləmədə', operator: 'Leyla Həsənova', callCount: 32, salesAmount: 1800, duration: 95, customerName: 'Səid Quliyev', phone: '+994551234567', city: 'Gəncə', notes: 'Geri zəng' },
  { company: 'ABC Corp', project: 'Survey', date: '2024-01-16', callReason: 'Anket', salesStatus: 'Uğurlu', operator: 'Anar Məmmədov', callCount: 38, salesAmount: 3200, duration: 145, customerName: 'Nigar Əliyeva', phone: '+994701234567', city: 'Bakı', notes: '' },
  { company: 'DEF Inc', project: 'Telemarketing', date: '2024-01-16', callReason: 'Reklam', salesStatus: 'Rədd', operator: 'Orxan Hüseynov', callCount: 28, salesAmount: 0, duration: 65, customerName: 'Kamran Vəliyev', phone: '+994771234567', city: 'Sumqayıt', notes: 'Maraqlanmadı' },
  { company: 'XYZ Ltd', project: 'Telesales', date: '2024-01-17', callReason: 'Satış', salesStatus: 'Uğurlu', operator: 'Leyla Həsənova', callCount: 51, salesAmount: 4500, duration: 180, customerName: 'Elçin Nəsirli', phone: '+994601234567', city: 'Bakı', notes: 'VIP müştəri' },
  { company: 'ABC Corp', project: 'Survey', date: '2024-01-17', callReason: 'Anket', salesStatus: 'Gözləmədə', operator: 'Günel Rəhimova', callCount: 22, salesAmount: 800, duration: 55, customerName: 'Fərid Məmmədov', phone: '+994501234568', city: 'Şəki', notes: '' },
  { company: 'DEF Inc', project: 'Telemarketing', date: '2024-01-18', callReason: 'Reklam', salesStatus: 'Uğurlu', operator: 'Orxan Hüseynov', callCount: 35, salesAmount: 2100, duration: 110, customerName: 'Aysel Əhmədova', phone: '+994551234568', city: 'Bakı', notes: 'Yeni müştəri' },
  { company: 'XYZ Ltd', project: 'Survey', date: '2024-01-18', callReason: 'Anket', salesStatus: 'Uğurlu', operator: 'Anar Məmmədov', callCount: 42, salesAmount: 2800, duration: 130, customerName: 'Rauf Qəhrəmanov', phone: '+994701234568', city: 'Gəncə', notes: '' },
];

const ReportsPage: React.FC = () => {
  // Dynamic columns state
  const [columns, setColumns] = useState<DynamicColumn[]>(mockExcelColumns);
  
  // Filter states
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['company', 'project']);
  const [filterSearch, setFilterSearch] = useState<Record<string, string>>({});
  
  // Table states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  
  // Column visibility
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
  
  // Stat cards state
  const [statCards, setStatCards] = useState<StatCard[]>([
    { id: '1', columnId: 'callCount', operation: 'sum', label: 'Ümumi zəng sayı' },
    { id: '2', columnId: 'salesAmount', operation: 'sum', label: 'Ümumi satış məbləği' },
    { id: '3', columnId: 'duration', operation: 'avg', label: 'Orta müddət' },
  ]);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [newCardColumn, setNewCardColumn] = useState('');
  const [newCardOperation, setNewCardOperation] = useState<'count' | 'sum' | 'avg'>('count');

  // Get unique values for text columns (for filters)
  const getUniqueValues = (columnId: string) => {
    const values = new Set<string>();
    mockData.forEach(row => {
      const value = row[columnId as keyof typeof row];
      if (value !== undefined && value !== null && value !== '') {
        values.add(String(value));
      }
    });
    return Array.from(values);
  };

  // Toggle filter expansion
  const toggleFilterExpansion = (columnId: string) => {
    setExpandedFilters(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  // Toggle filter value selection
  const toggleFilterValue = (columnId: string, value: string) => {
    setFilters(prev => {
      const current = prev[columnId] || [];
      return {
        ...prev,
        [columnId]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setDateRange({ start: '', end: '' });
    setSearchQuery('');
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...mockData];

    // Apply text/select filters
    Object.entries(filters).forEach(([columnId, values]) => {
      if (values.length > 0) {
        result = result.filter(row => {
          const rowValue = String(row[columnId as keyof typeof row] || '');
          return values.includes(rowValue);
        });
      }
    });

    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      result = result.filter(row => {
        const rowDate = row.date;
        if (dateRange.start && rowDate < dateRange.start) return false;
        if (dateRange.end && rowDate > dateRange.end) return false;
        return true;
      });
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(query)
        )
      );
    }

    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn as keyof typeof a];
        const bVal = b[sortColumn as keyof typeof b];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal || '');
        const bStr = String(bVal || '');
        return sortDirection === 'asc' 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [filters, dateRange, searchQuery, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Calculate stat card values
  const calculateStatValue = (columnId: string, operation: 'count' | 'sum' | 'avg') => {
    const values = filteredData.map(row => {
      const val = row[columnId as keyof typeof row];
      return typeof val === 'number' ? val : 0;
    });

    if (operation === 'count') {
      return filteredData.length;
    } else if (operation === 'sum') {
      return values.reduce((acc, val) => acc + val, 0);
    } else if (operation === 'avg') {
      const sum = values.reduce((acc, val) => acc + val, 0);
      return values.length > 0 ? Math.round(sum / values.length) : 0;
    }
    return 0;
  };

  // Add new stat card
  const handleAddStatCard = () => {
    if (!newCardColumn) return;
    
    const column = columns.find(c => c.id === newCardColumn);
    const operationLabels = { count: 'Say', sum: 'Cəm', avg: 'Orta' };
    
    setStatCards(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        columnId: newCardColumn,
        operation: newCardOperation,
        label: `${column?.name} (${operationLabels[newCardOperation]})`
      }
    ]);
    
    setNewCardColumn('');
    setNewCardOperation('count');
    setIsAddCardOpen(false);
  };

  // Remove stat card
  const removeStatCard = (cardId: string) => {
    setStatCards(prev => prev.filter(c => c.id !== cardId));
  };

  // Handle sort
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  // Export to Excel (mock)
  const handleExport = () => {
    const visibleColumns = columns.filter(c => c.visible);
    console.log('Exporting data:', {
      columns: visibleColumns.map(c => c.name),
      rows: filteredData.length,
      filters: Object.keys(filters).length
    });
    alert('Excel faylı hazırlanır...');
  };

  const visibleColumns = columns.filter(c => c.visible);
  const textColumns = columns.filter(c => c.type === 'text');
  const numberColumns = columns.filter(c => c.type === 'number');

  return (
    <div className="flex-1 flex bg-background min-h-screen">
      {/* Filter Panel */}
      <div className="w-72 border-r border-border bg-muted/30 flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Filtrlər</h2>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
              <X className="h-3 w-3 mr-1" />
              Təmizlə
            </Button>
          </div>
          
          {/* Active filters count */}
          {Object.values(filters).flat().length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {Object.entries(filters).map(([colId, values]) =>
                values.map(val => (
                  <Badge key={`${colId}-${val}`} variant="secondary" className="text-xs gap-1">
                    {val}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleFilterValue(colId, val)} 
                    />
                  </Badge>
                ))
              )}
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 p-4">
          {/* Date Range Filter */}
          <div className="mb-4">
            <button
              onClick={() => toggleFilterExpansion('date')}
              className="flex items-center justify-between w-full text-sm font-medium mb-2"
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Tarix
              </span>
              {expandedFilters.includes('date') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedFilters.includes('date') && (
              <div className="space-y-2 ml-6">
                <div>
                  <label className="text-xs text-muted-foreground">Başlanğıc</label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Son</label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Text Filters */}
          {textColumns.map(column => {
            const uniqueValues = getUniqueValues(column.id);
            const searchValue = filterSearch[column.id] || '';
            const filteredValues = uniqueValues.filter(v => 
              v.toLowerCase().includes(searchValue.toLowerCase())
            );
            
            return (
              <div key={column.id} className="mb-4">
                <button
                  onClick={() => toggleFilterExpansion(column.id)}
                  className="flex items-center justify-between w-full text-sm font-medium mb-2"
                >
                  <span className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    {column.name}
                    {(filters[column.id]?.length || 0) > 0 && (
                      <Badge variant="secondary" className="text-xs ml-1">
                        {filters[column.id].length}
                      </Badge>
                    )}
                  </span>
                  {expandedFilters.includes(column.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {expandedFilters.includes(column.id) && (
                  <div className="ml-6">
                    <Input
                      placeholder="Axtar..."
                      value={searchValue}
                      onChange={(e) => setFilterSearch(prev => ({ ...prev, [column.id]: e.target.value }))}
                      className="h-7 text-xs mb-2"
                    />
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {filteredValues.map(value => (
                        <div key={value} className="flex items-center gap-2">
                          <Checkbox
                            id={`${column.id}-${value}`}
                            checked={(filters[column.id] || []).includes(value)}
                            onCheckedChange={() => toggleFilterValue(column.id, value)}
                          />
                          <label 
                            htmlFor={`${column.id}-${value}`} 
                            className="text-xs cursor-pointer truncate"
                          >
                            {value}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <Button className="w-full" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Tətbiq et
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0">
          <h1 className="text-lg font-semibold">Hesabatlar</h1>
          <div className="flex items-center gap-2">
            {/* Column Picker */}
            <Popover open={isColumnPickerOpen} onOpenChange={setIsColumnPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Sütunlar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm mb-3">Sütun görünüşü</h4>
                  {columns.map(column => (
                    <div key={column.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`col-${column.id}`}
                        checked={column.visible}
                        onCheckedChange={() => toggleColumnVisibility(column.id)}
                      />
                      <label htmlFor={`col-${column.id}`} className="text-sm cursor-pointer flex-1">
                        {column.name}
                      </label>
                      {column.type === 'number' && <Hash className="h-3 w-3 text-muted-foreground" />}
                      {column.type === 'date' && <CalendarDays className="h-3 w-3 text-muted-foreground" />}
                      {column.type === 'text' && <Type className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Excel-ə ixrac et
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-6 pb-0">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-medium">Statistik kartlar</h3>
            <Popover open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="start">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Yeni kart əlavə et</h4>
                  <div>
                    <label className="text-xs text-muted-foreground">Sütun</label>
                    <Select value={newCardColumn} onValueChange={setNewCardColumn}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Sütun seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {numberColumns.map(col => (
                          <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Əməliyyat</label>
                    <Select value={newCardOperation} onValueChange={(v: 'count' | 'sum' | 'avg') => setNewCardOperation(v)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="count">Say (COUNT)</SelectItem>
                        <SelectItem value="sum">Cəm (SUM)</SelectItem>
                        <SelectItem value="avg">Orta (AVG)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" className="w-full" onClick={handleAddStatCard}>
                    Əlavə et
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map(card => (
              <Card key={card.id} className="relative group">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeStatCard(card.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculateStatValue(card.columnId, card.operation).toLocaleString()}
                    {card.operation === 'avg' && card.columnId === 'duration' && ' dəq'}
                    {card.columnId === 'salesAmount' && ' ₼'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Axtarış..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 px-6 pb-6 overflow-auto">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="sticky top-0 bg-muted z-10">
                <TableRow>
                  {visibleColumns.map(column => (
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
                {paginatedData.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/50">
                    {visibleColumns.map(column => (
                      <TableCell key={column.id} className="whitespace-nowrap">
                        {column.type === 'number' 
                          ? (row[column.id as keyof typeof row] as number).toLocaleString()
                          : row[column.id as keyof typeof row]
                        }
                        {column.id === 'salesAmount' && ' ₼'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-muted-foreground">
                      Heç bir nəticə tapılmadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              {filteredData.length} nəticədən {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredData.length)} göstərilir
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Səhifə {currentPage} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;