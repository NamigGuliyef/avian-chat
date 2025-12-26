import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Phone, 
  MessageSquare, 
  Mail, 
  Share2,
  Clock,
  User,
  MoreVertical
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Ticket, TicketChannel, TicketStatus, TicketPriority } from '@/types/csm';

interface OmnichannelProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onStatusChange: (ticketId: string, status: TicketStatus) => void;
}

const channelIcons: Record<TicketChannel, React.ElementType> = {
  call: Phone,
  chat: MessageSquare,
  email: Mail,
  social: Share2,
  sms: MessageSquare,
};

const channelColors: Record<TicketChannel, string> = {
  call: 'text-green-500 bg-green-100',
  chat: 'text-blue-500 bg-blue-100',
  email: 'text-orange-500 bg-orange-100',
  social: 'text-purple-500 bg-purple-100',
  sms: 'text-cyan-500 bg-cyan-100',
};

const statusColors: Record<TicketStatus, string> = {
  new: 'bg-blue-500',
  open: 'bg-green-500',
  pending: 'bg-yellow-500',
  resolved: 'bg-gray-500',
  closed: 'bg-gray-400',
};

const priorityColors: Record<TicketPriority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const Omnichannel: React.FC<OmnichannelProps> = ({
  tickets,
  onTicketClick,
  onStatusChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesChannel = filterChannel === 'all' || ticket.channel === filterChannel;
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;

    return matchesSearch && matchesChannel && matchesStatus && matchesPriority;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Omnichannel</h1>
        <p className="text-muted-foreground">Bütün kanallar üzrə müraciətlər</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Axtarış (ID, müştəri, mövzu)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterChannel} onValueChange={setFilterChannel}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Kanal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Bütün kanallar</SelectItem>
            <SelectItem value="call">Zəng</SelectItem>
            <SelectItem value="chat">Chat</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Bütün statuslar</SelectItem>
            <SelectItem value="new">Yeni</SelectItem>
            <SelectItem value="open">Açıq</SelectItem>
            <SelectItem value="pending">Gözləyir</SelectItem>
            <SelectItem value="resolved">Həll edildi</SelectItem>
            <SelectItem value="closed">Bağlı</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Prioritet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Bütün prioritetlər</SelectItem>
            <SelectItem value="urgent">Təcili</SelectItem>
            <SelectItem value="high">Yüksək</SelectItem>
            <SelectItem value="medium">Orta</SelectItem>
            <SelectItem value="low">Aşağı</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Müştəri</TableHead>
              <TableHead>Mövzu</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[80px]">Kanal</TableHead>
              <TableHead className="w-[100px]">Prioritet</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead className="w-[80px]">Gözləmə</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => {
              const ChannelIcon = channelIcons[ticket.channel];
              return (
                <TableRow 
                  key={ticket.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onTicketClick(ticket)}
                >
                  <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{ticket.customerName}</p>
                        <p className="text-xs text-muted-foreground">{ticket.customerPhone || ticket.customerEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate text-sm">{ticket.subject}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full', statusColors[ticket.status])} />
                      <span className="text-sm capitalize">{ticket.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', channelColors[ticket.channel].split(' ')[1])}>
                      <ChannelIcon className={cn('h-4 w-4', channelColors[ticket.channel].split(' ')[0])} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{ticket.assignedAgentName || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{ticket.waitingTime}d</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(ticket.id, 'open'); }}>
                          Qəbul et
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(ticket.id, 'pending'); }}>
                          Gözləməyə al
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(ticket.id, 'resolved'); }}>
                          Həll edildi
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(ticket.id, 'closed'); }}>
                          Bağla
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredTickets.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Heç bir ticket tapılmadı
          </div>
        )}
      </div>
    </div>
  );
};

export default Omnichannel;
