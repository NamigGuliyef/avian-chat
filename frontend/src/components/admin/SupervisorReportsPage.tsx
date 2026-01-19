import { getSupervisorReports } from '@/api/supervisors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSession } from '@/lib/auth';
import {
  ArrowUpDown,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Hash,
  Search,
  Settings2,
  Type,
  X
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

type ColumnType = 'text' | 'number' | 'date';

interface DynamicColumn {
  id: string;
  name: string;
  type: ColumnType;
  visible: boolean;
}

const SupervisorReportsPage: React.FC = () => {
  // Data state
  const { session } = useSession()
  const [reportData, setReportData] = useState<any[]>([]);
  const [columns, setColumns] = useState<DynamicColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [expandedFilters, setExpandedFilters] = useState<string[]>([]);
  const [filterSearch, setFilterSearch] = useState<Record<string, string>>({});

  // Table states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Column visibility
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);

  // Statistics card settings
  const [statsCards, setStatsCards] = useState<string[]>([]);


  const buildReportQuery = () => {
    const payload = {
      filters,
      dateRange: dateRange.start || dateRange.end ? dateRange : undefined,
      search: searchQuery || undefined,
      sort: sortColumn
        ? { column: sortColumn, direction: sortDirection }
        : undefined,
      pagination: {
        page: currentPage,
        pageSize,
      },
    };

    return encodeURIComponent(JSON.stringify(payload));
  };


  // Fetch report data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const query = buildReportQuery();
      const data = await getSupervisorReports();

      if (!data || data.length === 0) {
        setReportData([]);
        setColumns([]);
        return;
      }

      // Transform nested backend data to flat structure
      const flattenedData = transformBackendData(data);
      setReportData(flattenedData);

      // Auto-detect columns from data
      if (flattenedData.length > 0) {
        const detectedColumns = detectColumns(flattenedData);
        setColumns(detectedColumns);
        // Default expand first 2 filter columns
        setExpandedFilters(detectedColumns.slice(0, 2).map(c => c.id));
      }
    } catch (err: any) {
      console.error('Hesabat yüklənərkən xəta:', err);
      setError('Hesabat məlumatları yüklənə bilmədi');
      setReportData([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Transform nested backend data to flat rows
  const transformBackendData = (data: any[]): any[] => {
    const rows: any[] = [];

    data.forEach(companyItem => {
      const companyName = companyItem.company;
      const projectName = companyItem.supervisorProjects;

      (companyItem.excels || []).forEach((excel: any) => {
        const excelName = excel.excelName;

        (excel.sheets || []).forEach((sheet: any) => {
          const sheetName = sheet.sheetName;

          // Əgər sheet-də row varsa → hər biri ayrıca row olur
          if (sheet.sheetRows && sheet.sheetRows.length > 0) {
            sheet.sheetRows.forEach((row: any) => {
              rows.push({
                company: companyName,
                project: projectName,
                excel: excelName,
                sheetName,

                // dynamic data
                ...row,
              });
            });
          }
          // sheet boşdursa belə meta-data göstərilsin
          else {
            rows.push({
              company: companyName,
              project: projectName,
              excel: excelName,
              sheetName,
            });
          }
        });
      });
    });

    return rows;
  };


  // Detect columns from data
  const detectColumns = (data: any[]): DynamicColumn[] => {
    const columnSet = new Set<string>();
    const columnTypes: Record<string, ColumnType> = {};

    data.forEach(row => {
      Object.keys(row).forEach(key => {
        if (!columnSet.has(key)) {
          columnSet.add(key);
          const value = row[key];
          // Detect column type
          // Phone numbers, email, and text fields should be 'text' type
          if (key.toLowerCase().includes('phone') ||
            key.toLowerCase().includes('telefon') ||
            key.toLowerCase().includes('email') ||
            key.toLowerCase().includes('name') ||
            key.toLowerCase().includes('ad') ||
            key.toLowerCase().includes('soyad')) {
            columnTypes[key] = 'text';
          } else if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
            columnTypes[key] = 'date';
          } else if (!isNaN(Number(value)) && value !== '') {
            columnTypes[key] = 'number';
          } else {
            columnTypes[key] = 'text';
          }
        }
      });
    });

    return Array.from(columnSet).map((id, idx) => ({
      id,
      name: formatColumnName(id),
      type: columnTypes[id] || 'text',
      visible: idx < 8, // Show first 8 columns by default
    }));
  };

  // Format column name
  const formatColumnName = (id: string): string => {
    return id
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Get unique values for filter
  const getUniqueValues = (columnId: string): string[] => {
    const values = new Set<string>();
    reportData.forEach(row => {
      const value = row[columnId];
      if (value !== undefined && value !== null && value !== '') {
        values.add(String(value));
      }
    });
    return Array.from(values).sort();
  };

  // Toggle filter expansion
  const toggleFilterExpansion = (columnId: string) => {
    setExpandedFilters(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  // Toggle filter value
  const toggleFilterValue = (columnId: string, value: string) => {
    console.log('Toggle filter:', columnId, value);
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
    let result = [...reportData];

    // Apply filters
    Object.entries(filters).forEach(([columnId, values]) => {
      if (values.length > 0) {
        result = result.filter(row => {
          const rowValue = String(row[columnId] || '');
          return values.includes(rowValue);
        });
      }
    });

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
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal || '');
        const bStr = String(bVal || '');
        return sortDirection === 'asc'
          ? aStr.localeCompare(bStr, 'az')
          : bStr.localeCompare(aStr, 'az');
      });
    }

    return result;
  }, [reportData, filters, searchQuery, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle sort
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  // Handle export
  const handleExport = () => {
    console.log('Excel ixracı başlayır...');
    alert('Excel faylı hazırlanır...');
  };

  // Calculate statistics for selected columns
  const calculateStatistics = (columnId: string) => {
    const values = filteredData
      .map(row => row[columnId])
      .filter(val => val !== undefined && val !== null && val !== '');

    if (values.length === 0) return { count: 0, total: 0 };

    // Count UNIQUE values (məsələn supervisor 7 dəfə ola bilər amma eyni adamdır = 1)
    const uniqueValues = new Set(values);

    const numbers = values
      .map(v => Number(v))
      .filter(n => !isNaN(n));

    // Unique sum for numbers
    const uniqueNumbers = Array.from(new Set(numbers));

    return {
      count: uniqueValues.size,
      total: uniqueNumbers.reduce((sum, n) => sum + n, 0),
    };
  };

  const visibleColumns = columns.filter(c => c.visible);

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Hesabat yüklənir...</p>
        </div>
      </div>
    );
  }

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
          {visibleColumns.map(column => {
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
          <Button className="w-full mt-2" size="sm" onClick={() => {
            fetchData()
          }}>
            Tarixlər üzrə filtrləri tətbiq et
          </Button>
        </ScrollArea>

        {/* <div className="p-4 border-t border-border">
          <Button className="w-full" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Tətbiq et
          </Button>
        </div> */}
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

            {/* Statistics Column Selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistika
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm mb-3">Statistika Sütunları</h4>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {columns.filter(c => c.type === 'text' || c.type === 'number').map(column => (
                      <div key={column.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`stat-${column.id}`}
                          checked={statsCards.includes(column.id)}
                          onCheckedChange={() =>
                            setStatsCards(prev =>
                              prev.includes(column.id)
                                ? prev.filter(id => id !== column.id)
                                : [...prev, column.id]
                            )
                          }
                        />
                        <label htmlFor={`stat-${column.id}`} className="text-sm cursor-pointer flex-1">
                          {column.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Excel-ə ixrac et
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pb-4 py-4">
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

        {/* Statistics Cards Configuration */}
        {statsCards.length > 0 && (
          <div className="px-6 py-2 border-b border-border">
            <div className="flex items-center gap-2 flex-wrap">
              {statsCards.map(columnId => {
                const column = columns.find(c => c.id === columnId);
                return (
                  <Badge key={columnId} variant="secondary" className="text-xs gap-1.5">
                    <BarChart3 className="h-3 w-3" />
                    {column?.name}
                    <button
                      onClick={() => setStatsCards(prev => prev.filter(id => id !== columnId))}
                      className="ml-1 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {statsCards.length > 0 && (
          <div className="px-6 py-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {statsCards.map(columnId => {
                const stats = calculateStatistics(columnId);
                const column = columns.find(c => c.id === columnId);
                return (
                  <div
                    key={columnId}
                    className="bg-card border border-border rounded p-2 hover:shadow-sm transition-shadow"
                  >
                    <div className="text-xs text-muted-foreground truncate mb-1">{column?.name}</div>
                    <div className="space-y-0.5">
                      <div>
                        <div className="text-xs text-muted-foreground">Sayı</div>
                        <div className="text-lg font-bold text-foreground">
                          {stats.count}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Cəm</div>
                        <div className="text-base font-semibold text-foreground">
                          {typeof stats.total === 'number' ? stats.total.toLocaleString('az-AZ') : '0'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                    {visibleColumns.map(column => {
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

export default SupervisorReportsPage;
