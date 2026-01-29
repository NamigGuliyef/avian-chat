import { getAllLogs } from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import { OperationLog } from '@/types/crm';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { CalendarIcon, Filter, Search, RotateCcw, LogsIcon, ArrowUpRight, ArrowDownRight, Edit2, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

/* =======================
   OPERATION UI MAPPING
======================= */
const OPERATION_MAP: Record<
  string,
  { label: string; className: string; icon: any }
> = {
  POST: {
    label: 'Yaradılma',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    icon: <ArrowUpRight className="w-4 h-4" />,
  },
  PATCH: {
    label: 'Düzəliş',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
    icon: <Edit2 className="w-4 h-4" />,
  },
  PUT: {
    label: 'Düzəliş',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
    icon: <Edit2 className="w-4 h-4" />,
  },
  DELETE: {
    label: 'Silinmə',
    className: 'bg-red-50 text-red-700 border border-red-200',
    icon: <Trash2 className="w-4 h-4" />,
  },
};

export function OperationLogs() {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getAllLogs().then(setLogs);
  }, []);

  /* =======================
     USERS FROM LOGS
  ======================= */
  const users = useMemo(() => {
    return Array.from(
      new Map(
        logs.map((log) => [
          log.userId,
          { id: log.userId, name: log.userName, surname: log.userSurname },
        ])
      ).values()
    );
  }, [logs]);

  /* =======================
     FILTERED LOGS
  ======================= */
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesUser =
        selectedUser === 'all' || log.userId === selectedUser;

      const matchesDate =
        !selectedDate ||
        format(new Date(log.createdAt), 'yyyy-MM-dd') ===
        format(selectedDate, 'yyyy-MM-dd');

      const matchesSearch =
        !searchQuery ||
        log.operation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.field?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(log.oldValue ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(log.newValue ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesUser && matchesDate && matchesSearch;
    });
  }, [logs, selectedUser, selectedDate, searchQuery]);


  const onCopy = (val) => {
    navigator.clipboard.writeText(val)
    toast("Kopyalandı")
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 space-y-6"
    >
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
            <LogsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Əməliyyat Logları</h1>
            <p className="text-slate-600 text-sm">İstifadəçi əməliyyatlarını izləyin və monitoring edin</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2">Cəmi: <span className="font-semibold text-slate-700">{filteredLogs.length} log</span></p>
      </div>

      {/* FILTERS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-slate-900">Filtrlər</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Axtar</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input
                placeholder="Sahə, dəyər..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 border-slate-200 focus:border-blue-500 rounded-lg"
              />
            </div>
          </div>

          {/* User Select */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">İstifadəçi</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="h-10 border-slate-200 rounded-lg hover:border-blue-400">
                <SelectValue placeholder="User seç" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem value="all">📊 Bütün user-lər</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    👤 {user.name} {user.surname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Select */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Tarix</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-10 justify-start border-slate-200 rounded-lg hover:border-blue-400">
                  <CalendarIcon className="w-4 h-4 mr-2 text-blue-600" />
                  {selectedDate
                    ? format(selectedDate, 'dd.MM.yyyy')
                    : 'Tarix seç'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Clear Filters */}
          {(selectedUser !== 'all' || selectedDate || searchQuery) && (
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 rounded-lg transition-colors"
                onClick={() => {
                  setSelectedUser('all');
                  setSelectedDate(undefined);
                  setSearchQuery('');
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Filtri Təmizlə
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Əməliyyat</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Sahə</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Yeni Dəyər</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tarix / Saat</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <LogsIcon className="w-12 h-12 text-slate-300 mb-4" />
                      <p className="text-slate-600 font-medium">Heç bir log tapılmadı</p>
                      <p className="text-slate-400 text-sm mt-1">Filtrlərə uyğun əməliyyat yoxdur</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  const operation =
                    OPERATION_MAP[log.method?.toUpperCase()] ?? {
                      label: log.method,
                      className: 'bg-slate-100 text-slate-700 border border-slate-200',
                      icon: null,
                    };

                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-blue-50 transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900 group-hover:text-blue-600">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {log.userName} {log.userSurname}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 w-fit ${operation.className}`}>
                          {operation.icon}
                          {operation.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-slate-100 text-slate-900 px-3 py-1.5 rounded-lg font-mono group-hover:bg-blue-100">
                          {log.field || '-'}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-slate-700 max-w-xs truncate block">
                          {log.newValue ? (
                            <span onClick={() => onCopy(log.newValue)} className="text-emerald-700 font-medium">{String(log.newValue).substring(0, 50)}{String(log.newValue).length > 50 ? '...' : ''}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600">{formatDate(log.createdAt)}</span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats */}
        {filteredLogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between"
          >
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{filteredLogs.length}</span> log tapıldı
            </p>
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-slate-600">Yaradılma: {filteredLogs.filter(l => l.method === 'POST').length}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-slate-600">Düzəliş: {filteredLogs.filter(l => ['PATCH', 'PUT'].includes(l.method)).length}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-slate-600">Silinmə: {filteredLogs.filter(l => l.method === 'DELETE').length}</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
