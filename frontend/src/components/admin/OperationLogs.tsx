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
import { OperationLog, User } from '@/types/crm';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { CalendarIcon, Filter, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OperationLogsProps {
  logs: OperationLog[];
  users: User[];
}

export function OperationLogs() {
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState([])
  // const logs = []

  useEffect(() => {
    getAllLogs().then(setLogs)
  }, [])
  const users = []
  const filteredLogs = logs.filter((log) => {
    const matchesUser = selectedUser === 'all' || log.userId === selectedUser;
    const matchesDate =
      !selectedDate ||
      log.timestamp.startsWith(format(selectedDate, 'yyyy-MM-dd'));
    const matchesSearch =
      !searchQuery ||
      log.operation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.oldValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.newValue.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesUser && matchesDate && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Əməliyyat Logları</h3>
          <p className="text-sm text-muted-foreground">
            İstifadəçi əməliyyatlarını izləyin
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filtrlər:</span>
        </div>

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
          <SelectContent className="bg-popover border border-border shadow-lg z-50">
            <SelectItem value="all">Bütün user-lər</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 gap-2">
              <CalendarIcon className="w-4 h-4" />
              {selectedDate ? format(selectedDate, 'dd.MM.yyyy') : 'Tarix seç'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover border border-border shadow-lg z-50" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              className="pointer-events-auto"
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
            className="text-muted-foreground"
          >
            Filtri təmizlə
          </Button>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Əməliyyat
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sahə
              </th>
              {/* <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Köhnə dəyər
              </th> */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Yeni dəyər
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tarix / Saat
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Heç bir log tapılmadı
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{log.userName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
                      {log.method}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {log.field}
                    </code>
                  </td>
                  {/* <td className="px-4 py-3 text-sm text-destructive">
                    {log.oldValue}
                  </td> */}
                  <td className="px-4 py-3 text-sm text-success">
                    {log.newValue}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
