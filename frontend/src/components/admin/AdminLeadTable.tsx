import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { CalendarIcon, Search, Filter, Eye } from 'lucide-react';
import { Lead, ColumnConfig, User } from '@/types/crm';
import { StatusChip } from '@/components/user/StatusChip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface AdminLeadTableProps {
  leads: Lead[];
  columns: ColumnConfig[];
  users: User[];
}

export function AdminLeadTable({ leads, columns, users }: AdminLeadTableProps) {
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const filteredLeads = leads.filter((lead) => {
    const matchesUser = selectedUser === 'all' || lead.assignedUser === selectedUser;
    const matchesStatus = selectedStatus === 'all' || lead.callStatus === selectedStatus;
    const matchesDate =
      !selectedDate ||
      lead.callDate === format(selectedDate, 'yyyy-MM-dd');

    return matchesUser && matchesStatus && matchesDate;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Lead İzləmə</h3>
          <p className="text-sm text-muted-foreground">
            Bütün lead-ləri izləyin (yalnız oxuma rejimi)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filtrlər:</span>
        </div>

        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-48 h-9">
            <SelectValue placeholder="User seç" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-lg z-50">
            <SelectItem value="all">Bütün user-lər</SelectItem>
            {users
              .filter((u) => u.role === 'agent')
              .map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48 h-9">
            <SelectValue placeholder="Status seç" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-lg z-50">
            <SelectItem value="all">Bütün statuslar</SelectItem>
            <SelectItem value="successful">Uğurlu</SelectItem>
            <SelectItem value="unsuccessful">Uğursuz</SelectItem>
            <SelectItem value="pending">Gözləyir</SelectItem>
            <SelectItem value="callback">Geri zəng</SelectItem>
            <SelectItem value="no_answer">Cavab yoxdur</SelectItem>
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

        {(selectedUser !== 'all' || selectedStatus !== 'all' || selectedDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser('all');
              setSelectedStatus('all');
              setSelectedDate(undefined);
            }}
            className="text-muted-foreground"
          >
            Filtri təmizlə
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="w-4 h-4" />
          Yalnız oxuma rejimi
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Zəng statusu
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Müştəri statusu
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Zəng tarixi
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Təyin olunan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Xərc
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Heç bir lead tapılmadı
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, index) => {
                  const assignedUser = users.find((u) => u.id === lead.assignedUser);
                  return (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {lead.maskedPhone}
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip status={lead.callStatus} type="call" />
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip status={lead.customerStatus} type="customer" />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {lead.callDate}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {assignedUser?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {lead.cost} AZN
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
