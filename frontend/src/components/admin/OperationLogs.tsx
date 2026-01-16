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
import { CalendarIcon, Filter, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

/* =======================
   OPERATION UI MAPPING
======================= */
const OPERATION_MAP: Record<
  string,
  { label: string; className: string }
> = {
  POST: {
    label: 'Yaradılma',
    className: 'bg-success/10 text-success',
  },
  PATCH: {
    label: 'Düzəliş',
    className: 'bg-warning/10 text-warning',
  },
  PUT: {
    label: 'Düzəliş',
    className: 'bg-warning/10 text-warning',
  },
  DELETE: {
    label: 'Silinmə',
    className: 'bg-destructive/10 text-destructive',
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* HEADER */}
      <div>
        <h3 className="text-lg font-semibold">Əməliyyat Logları</h3>
        <p className="text-sm text-muted-foreground">
          İstifadəçi əməliyyatlarını izləyin
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border">
        <Filter className="w-4 h-4 text-muted-foreground" />

        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Axtar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 h-9"
          />
        </div>

        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-48 h-9">
            <SelectValue placeholder="User seç" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Bütün user-lər</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} {user.surname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 gap-2">
              <CalendarIcon className="w-4 h-4" />
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

        {(selectedUser !== 'all' || selectedDate || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser('all');
              setSelectedDate(undefined);
              setSearchQuery('');
            }}
          >
            Filtri təmizlə
          </Button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs uppercase">
                Əməliyyat
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase">Sahə</th>
              <th className="px-4 py-3 text-left text-xs uppercase">
                Yeni dəyər
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase">
                Tarix / Saat
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  Heç bir log tapılmadı
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, index) => {
                const operation =
                  OPERATION_MAP[log.method?.toUpperCase()] ?? {
                    label: log.method,
                    className: 'bg-muted text-muted-foreground',
                  };

                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {log.userName} {log.userSurname}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded font-medium ${operation.className}`}
                      >
                        {operation.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {log.field}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-success">
                      {log.newValue}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
