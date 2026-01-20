import { getReport } from '@/api/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import ExcelJS from 'exceljs';
import {
  ArrowUpDown,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  FileText,
  Filter,
  Hash,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
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

const ReportsPage: React.FC = () => {
  // Data state
  const [reportData, setReportData] = useState<any[]>([]);
  const [columns, setColumns] = useState<DynamicColumn[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [pageSize] = useState(15);

  // Column visibility
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);

  // Statistics card settings
  const [statsCards, setStatsCards] = useState<string[]>([]);

  // Filter panel visibility
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);


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
      const query = buildReportQuery();
      const data = await getReport(query);

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
      toast({ title: 'Hesabat məlumatları yüklənə bilmədi' });
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

    data.forEach((companyItem: any) => {
      if (!companyItem) return;

      const companyName = companyItem.company || '';
      const projects = companyItem.project || [];
      const sheets = companyItem.sheets || [];

      // Process sheets with their rows
      sheets.forEach((sheet: any) => {
        const sheetName = sheet.sheetName || '';
        const sheetRows = sheet.sheetRows || [];

        // Get excel name if available
        const excelName = companyItem.excel || '';

        // Get first project name (can be enhanced if needed)
        const projectName = projects.length > 0 ? projects[0].name || '' : '';
        const supervisors = projects.length > 0 && projects[0].supervisors
          ? projects[0].supervisors.map((s: any) => `${s.name} ${s.surname}`).join(', ')
          : '';

        // Create a row for each sheet row
        sheetRows.forEach((rowData: any) => {
          const flatRow: any = {
            company: companyName,
            project: projectName,
            supervisor: supervisors,
            excel: excelName,
            sheetName: sheetName,
          };

          // Add all dynamic fields from sheet row
          if (typeof rowData === 'object' && rowData !== null) {
            Object.keys(rowData).forEach(key => {
              const value = rowData[key];
              flatRow[key] = value !== null && value !== undefined ? String(value) : '';
            });
          }

          rows.push(flatRow);
        });
      });

      // If no sheets, still add company info
      if (sheets.length === 0 && projects.length > 0) {
        rows.push({
          company: companyName,
          project: projects[0].name || '',
          supervisor: projects[0].supervisors ? projects[0].supervisors.map((s: any) => `${s.name} ${s.surname}`).join(', ') : '',
          excel: companyItem.excel || '',
          sheetName: '',
        });
      }
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
  const handleExport = async () => {
    try {
      if (filteredData.length === 0) {
        toast({
          title: "Xəbərdarlıq",
          description: "Ixrac etmək üçün ən azı bir sətir olmalıdır",
          variant: "destructive",
        });
        return;
      }

      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Hesabat');

      // Add header row
      worksheet.columns = visibleColumns.map(col => ({
        header: col.name,
        key: col.id,
        width: Math.max(15, col.name.length + 5),
      }));

      // Style header row
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
        cell.alignment = { horizontal: 'centerContinuous', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      });

      // Add data rows
      filteredData.forEach((row) => {
        const rowData: Record<string, any> = {};
        visibleColumns.forEach(col => {
          rowData[col.id] = row[col.id] || '';
        });
        worksheet.addRow(rowData);
      });

      // Style data rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header
        row.eachCell((cell) => {
          cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          };
        });
        // Alternate row colors
        if (rowNumber % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          });
        }
      });

      // Generate filename with timestamp
      const timestamp = new Date().toLocaleString('az-AZ').replace(/[/:]/g, '-');
      const filename = `Hesabat_${timestamp}.xlsx`;

      // Export to buffer
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Uğurlu",
        description: `Excel faylı hazırlandı: ${filename}`,
      });
    } catch (error) {
      console.error('Excel ixracı zamanı xəta:', error);
      toast({
        title: "Xəta",
        description: "Excel ixracı zamanı xəta baş verdi",
        variant: "destructive",
      });
    }
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
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Hesabat yüklənir...</p>
          <p className="text-slate-400 text-sm mt-1">Zəhmət olmasa gözləyin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Filter Panel */}
      <div className={`${isFilterPanelOpen ? 'w-80' : 'w-0'} border-r border-slate-200 bg-white shadow-lg flex flex-col transition-all duration-300 overflow-hidden`}>
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-white" />
              <h2 className="text-lg font-bold text-white">Filtrlər</h2>
            </div>
            {Object.values(filters).flat().length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-400 hover:text-red-300 text-xs">
                <RotateCcw className="h-3 w-3 mr-1" />
                Sıfırla
              </Button>
            )}
          </div>

          {/* Active filters count */}
          {Object.values(filters).flat().length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(filters).map(([colId, values]) =>
                values.map(val => (
                  <Badge key={`${colId}-${val}`} className="text-xs gap-1 bg-blue-500 hover:bg-blue-600 text-white">
                    {val}
                    <X
                      className="h-3 w-3 cursor-pointer hover:opacity-70"
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
              <div key={column.id} className="mb-5 pb-4 border-b border-slate-200 last:border-0">
                <button
                  onClick={() => toggleFilterExpansion(column.id)}
                  className="flex items-center justify-between w-full text-sm font-semibold mb-3 text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-blue-600" />
                    {column.name}
                    {(filters[column.id]?.length || 0) > 0 && (
                      <Badge className="text-xs ml-1 bg-blue-100 text-blue-700">
                        {filters[column.id].length}
                      </Badge>
                    )}
                  </span>
                  {expandedFilters.includes(column.id) ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                {expandedFilters.includes(column.id) && (
                  <div className="ml-2">
                    <Input
                      placeholder="Axtar..."
                      value={searchValue}
                      onChange={(e) => setFilterSearch(prev => ({ ...prev, [column.id]: e.target.value }))}
                      className="h-8 text-xs mb-2 border-slate-300 focus:border-blue-500 rounded-lg"
                    />
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {filteredValues.map(value => (
                        <div key={value} className="flex items-center gap-2">
                          <Checkbox
                            id={`${column.id}-${value}`}
                            checked={(filters[column.id] || []).includes(value)}
                            onCheckedChange={() => toggleFilterValue(column.id, value)}
                            className="rounded"
                          />
                          <label
                            htmlFor={`${column.id}-${value}`}
                            className="text-xs cursor-pointer truncate text-slate-700 hover:text-slate-900"
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
          <div className="mb-4 pb-4 border-b border-slate-200">
            <button
              onClick={() => toggleFilterExpansion('date')}
              className="flex items-center justify-between w-full text-sm font-semibold mb-3 text-slate-900 hover:text-blue-600 transition-colors"
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-600" />
                Tarix Aralığı
              </span>
              {expandedFilters.includes('date') ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>
            {expandedFilters.includes('date') && (
              <div className="space-y-2 ml-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Başlanğıc</label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="h-8 text-sm border-slate-300 focus:border-blue-500 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Son</label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="h-8 text-sm border-slate-300 focus:border-blue-500 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
          <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold" size="sm" onClick={() => {
            fetchData()
          }}>
            ✓ Filtrlər Tətbiq Et
          </Button>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-20 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            >
              {isFilterPanelOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </Button>
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Hesabatlar</h1>
              <p className="text-sm text-slate-500">{filteredData.length} nəticə</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Column Picker */}
            <Popover open={isColumnPickerOpen} onOpenChange={setIsColumnPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-300 hover:border-blue-400 hover:bg-blue-50">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Sütunlar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 bg-white border-slate-200 max-h-96 overflow-y-auto" align="end">
                <div className="space-y-2">
                  <h4 className="font-bold text-sm mb-3 text-slate-900">Sütun Görünüşü</h4>
                  {columns.map(column => (
                    <div key={column.id} className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded">
                      <Checkbox
                        id={`col-${column.id}`}
                        checked={column.visible}
                        onCheckedChange={() => toggleColumnVisibility(column.id)}
                      />
                      <label htmlFor={`col-${column.id}`} className="text-sm cursor-pointer flex-1 text-slate-700">
                        {column.name}
                      </label>
                      {column.type === 'number' && <Hash className="h-3 w-3 text-blue-600" />}
                      {column.type === 'date' && <CalendarDays className="h-3 w-3 text-green-600" />}
                      {column.type === 'text' && <Type className="h-3 w-3 text-slate-600" />}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Statistics Column Selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-300 hover:border-blue-400 hover:bg-blue-50">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistika
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 bg-white border-slate-200 max-h-96 overflow-y-auto" align="end">
                <div className="space-y-2">
                  <h4 className="font-bold text-sm mb-3 text-slate-900">Statistika Sütunları</h4>
                  <div className="space-y-1">
                    {columns.filter(c => c.type === 'text' || c.type === 'number').map(column => (
                      <div key={column.id} className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded">
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
                        <label htmlFor={`stat-${column.id}`} className="text-sm cursor-pointer flex-1 text-slate-700">
                          {column.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="sm" onClick={handleExport} className="border-slate-300 hover:border-green-400 hover:bg-green-50">
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-4 bg-white border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Axtarış..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-slate-300 focus:border-blue-500 rounded-lg"
            />
          </div>
        </div>

        {/* Statistics Cards Configuration */}
        {statsCards.length > 0 && (
          <div className="px-6 py-3 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2 flex-wrap">
              {statsCards.map(columnId => {
                const column = columns.find(c => c.id === columnId);
                return (
                  <Badge key={columnId} className="text-xs gap-1.5 bg-blue-100 text-blue-800">
                    <BarChart3 className="h-3 w-3" />
                    {column?.name}
                    <button
                      onClick={() => setStatsCards(prev => prev.filter(id => id !== columnId))}
                      className="ml-1 hover:opacity-70"
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
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {statsCards.map(columnId => {
                const stats = calculateStatistics(columnId);
                const column = columns.find(c => c.id === columnId);
                return (
                  <div
                    key={columnId}
                    className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="text-xs font-semibold text-slate-600 truncate mb-2">{column?.name}</div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Sayı</div>
                        <div className="text-xl font-bold text-blue-600">
                          {stats.count}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Cəm</div>
                        <div className="text-base font-semibold text-slate-900">
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
        <div className="flex-1 px-6 pb-6 pt-4 overflow-auto">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-lg bg-white">
            <Table>
              <TableHeader className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 z-10">
                <TableRow>
                  {visibleColumns.map(column => (
                    <TableHead
                      key={column.id}
                      className="cursor-pointer hover:bg-slate-700 transition-colors whitespace-nowrap text-white font-bold"
                      onClick={() => handleSort(column.id)}
                    >
                      <div className="flex items-center gap-2">
                        {column.name}
                        <ArrowUpDown className="h-3 w-3 text-slate-300" />
                        {sortColumn === column.id && (
                          <span className="text-xs text-blue-300">
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
                  <TableRow key={idx} className="hover:bg-blue-50 transition-colors border-b border-slate-100">
                    {visibleColumns.map(column => {
                      const cellValue = row[column.id];
                      return (
                        <TableCell key={column.id} className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
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
                    <TableCell colSpan={visibleColumns.length} className="text-center py-12 text-slate-500">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium">Heç bir nəticə tapılmadı</p>
                      <p className="text-xs mt-1">Filtrlərə uyğun məlumat yoxdur</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm font-medium text-slate-700">
              Cəmi <span className="text-blue-600">{filteredData.length}</span> nəticədən <span className="text-blue-600">{(currentPage - 1) * pageSize + 1}</span>-<span className="text-blue-600">{Math.min(currentPage * pageSize, filteredData.length)}</span> göstərilir
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-slate-300 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold text-slate-700 min-w-max">
                Səhifə <span className="text-blue-600">{currentPage}</span> / <span className="text-blue-600">{totalPages || 1}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="border-slate-300 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
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
