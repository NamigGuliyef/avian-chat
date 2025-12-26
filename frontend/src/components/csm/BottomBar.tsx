import React, { useState } from 'react';
import { Phone, MessageSquare, Mail, Share2, Check, X, Clock, ChevronUp, ChevronDown, Inbox, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { QueueItem, Ticket as TicketType, UserStatus, TicketChannel } from '@/types/csm';

interface BottomBarProps {
  userStatus: UserStatus;
  queueItems: QueueItem[];
  myTickets: TicketType[];
  onAcceptQueue: (id: string) => void;
  onRejectQueue: (id: string) => void;
  onAcceptTicket: (id: string) => void;
  onRejectTicket: (id: string) => void;
  onOpenTicket: (ticket: TicketType) => void;
}

const channelIcons: Record<TicketChannel, React.ElementType> = {
  call: Phone,
  chat: MessageSquare,
  email: Mail,
  social: Share2,
  sms: MessageSquare,
};

const channelColors: Record<TicketChannel, string> = {
  call: 'text-green-500',
  chat: 'text-blue-500',
  email: 'text-orange-500',
  social: 'text-purple-500',
  sms: 'text-cyan-500',
};

const BottomBar: React.FC<BottomBarProps> = ({
  userStatus,
  queueItems,
  myTickets,
  onAcceptQueue,
  onRejectQueue,
  onAcceptTicket,
  onRejectTicket,
  onOpenTicket,
}) => {
  const [omnichannelExpanded, setOmnichannelExpanded] = useState(false);
  const [ticketsExpanded, setTicketsExpanded] = useState(false);

  const newQueueCount = queueItems.filter(q => q.status === 'waiting').length;
  const callCount = queueItems.filter(q => q.channel === 'call').length;
  const chatCount = queueItems.filter(q => q.channel === 'chat').length;
  const messageCount = queueItems.filter(q => q.channel === 'email' || q.channel === 'social').length;

  const newTickets = myTickets.filter(t => t.status === 'new');
  const openTickets = myTickets.filter(t => t.status === 'open' || t.status === 'pending');

  const formatWaitTime = (minutes: number) => {
    if (minutes < 1) return 'İndicə';
    if (minutes < 60) return `${minutes} dəq`;
    return `${Math.floor(minutes / 60)}s ${minutes % 60}d`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-between px-4 py-2 pointer-events-none">
      <div className={cn(
        "bg-card border border-border rounded-t-lg shadow-lg transition-all duration-300 pointer-events-auto",
        omnichannelExpanded ? "w-96" : "w-auto"
      )}>
        <div
          className="flex items-center justify-between p-3 cursor-pointer border-b border-border"
          onClick={() => setOmnichannelExpanded(!omnichannelExpanded)}
        >
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Omni-channel</span>
            {newQueueCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {newQueueCount}
              </Badge>
            )}
          </div>
          {omnichannelExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Expanded Content */}
        {omnichannelExpanded && (
          <div className="p-3 space-y-3">
            {/* Status Row */}
            <div className="flex items-center gap-2">
              <span className={cn(
                'w-2 h-2 rounded-full',
                userStatus === 'available' ? 'bg-green-500' :
                  userStatus === 'busy' ? 'bg-red-500' :
                    userStatus === 'break' ? 'bg-yellow-500' : 'bg-gray-400'
              )} />
              <span className="text-sm font-medium capitalize">{userStatus}</span>
            </div>

            {/* Counts Row */}
            <div className="flex gap-3 text-xs">
              <span className="text-muted-foreground">New: <strong className="text-foreground">{newQueueCount}</strong></span>
              <span className="text-green-600">Call: <strong>{callCount}</strong></span>
              <span className="text-blue-600">Chat: <strong>{chatCount}</strong></span>
              <span className="text-orange-600">Message: <strong>{messageCount}</strong></span>
            </div>

            {/* Queue Items */}
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {queueItems.filter(q => q.status === 'waiting').map((item) => {
                  const Icon = channelIcons[item.channel];
                  return (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Icon className={cn('h-4 w-4 shrink-0', channelColors[item.channel])} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.customerName}</p>
                          <p className="text-xs text-muted-foreground">{item.customerPhone || item.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatWaitTime(item.waitingTime)}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-green-600 hover:bg-green-100"
                          onClick={() => onAcceptQueue(item.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-600 hover:bg-red-100"
                          onClick={() => onRejectQueue(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {queueItems.filter(q => q.status === 'waiting').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Gözləyən müraciət yoxdur
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* My Tickets Panel - Right */}
      {/* <div className={cn(
        "bg-card border border-border rounded-t-lg shadow-lg transition-all duration-300 pointer-events-auto",
        ticketsExpanded ? "w-96" : "w-auto"
      )}>
        <div 
          className="flex items-center justify-between p-3 cursor-pointer border-b border-border"
          onClick={() => setTicketsExpanded(!ticketsExpanded)}
        >
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">My Tickets</span>
            {newTickets.length > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {newTickets.length}
              </Badge>
            )}
          </div>
          {ticketsExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {ticketsExpanded && (
          <div className="p-3 space-y-3">
            <div className="flex gap-3 text-xs">
              <span className="text-muted-foreground">New: <strong className="text-foreground">{newTickets.length}</strong></span>
              <span className="text-muted-foreground">Open: <strong className="text-foreground">{openTickets.length}</strong></span>
            </div>

            <ScrollArea className="h-48">
              <div className="space-y-2">
                {[...newTickets, ...openTickets].slice(0, 10).map((ticket) => {
                  const Icon = channelIcons[ticket.channel];
                  return (
                    <div 
                      key={ticket.id} 
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                      onClick={() => onOpenTicket(ticket)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Icon className={cn('h-4 w-4 shrink-0', channelColors[ticket.channel])} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {ticket.customerName} • {ticket.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={ticket.status === 'new' ? 'destructive' : 'secondary'} className="text-xs">
                          {ticket.status}
                        </Badge>
                        {ticket.status === 'new' && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-green-600 hover:bg-green-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAcceptTicket(ticket.id);
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-600 hover:bg-red-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRejectTicket(ticket.id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                {newTickets.length === 0 && openTickets.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Ticket yoxdur
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div> */}
    </div>
  );
};

export default BottomBar;
