import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  Mail, 
  Share2,
  Clock,
  User,
  Tag,
  Send,
  Paperclip,
  Image,
  Smile,
  FileText,
  StickyNote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Ticket, TicketMessage, TicketChannel, KBArticle } from '@/types/csm';

interface TicketDetailProps {
  ticket: Ticket;
  messages: TicketMessage[];
  suggestedArticles?: KBArticle[];
  onBack: () => void;
  onSendMessage: (content: string, isNote?: boolean) => void;
  onStatusChange: (status: string) => void;
}

const channelIcons: Record<TicketChannel, React.ElementType> = {
  call: Phone,
  chat: MessageSquare,
  email: Mail,
  social: Share2,
  sms: MessageSquare,
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-500',
  open: 'bg-green-500',
  pending: 'bg-yellow-500',
  resolved: 'bg-gray-500',
  closed: 'bg-gray-400',
};

const TicketDetail: React.FC<TicketDetailProps> = ({
  ticket,
  messages,
  suggestedArticles = [],
  onBack,
  onSendMessage,
  onStatusChange,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isNote, setIsNote] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const ChannelIcon = channelIcons[ticket.channel];

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage, isNote);
      setNewMessage('');
      setIsNote(false);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'messages') return !msg.isNote && msg.sender !== 'system';
    if (activeFilter === 'notes') return msg.isNote;
    if (activeFilter === 'logs') return msg.sender === 'system';
    return true;
  });

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Ticket Info */}
      <div className="w-72 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-3">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h2 className="font-semibold text-lg">{ticket.id}</h2>
          <p className="text-sm text-muted-foreground">{ticket.subject}</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Status */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', statusColors[ticket.status])} />
                <span className="text-sm font-medium capitalize">{ticket.status}</span>
              </div>
            </div>

            {/* Priority */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Prioritet</p>
              <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'secondary'}>
                {ticket.priority}
              </Badge>
            </div>

            {/* Channel */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Kanal</p>
              <div className="flex items-center gap-2">
                <ChannelIcon className="h-4 w-4" />
                <span className="text-sm capitalize">{ticket.channel}</span>
              </div>
            </div>

            {/* SLA */}
            {ticket.slaDeadline && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">SLA Vaxtı</p>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  {formatTime(ticket.slaDeadline)}
                </div>
              </div>
            )}

            <div className="h-px bg-border" />

            {/* Customer Info */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Müştəri</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {ticket.customerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{ticket.customerName}</p>
                  <p className="text-xs text-muted-foreground">{ticket.customerPhone || ticket.customerEmail}</p>
                </div>
              </div>
            </div>

            {/* Agent */}
            {ticket.assignedAgentName && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Təyin edilən agent</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{ticket.assignedAgentName}</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Middle Panel - Timeline */}
      <div className="flex-1 flex flex-col">
        {/* Filter Tabs */}
        <div className="p-4 border-b">
          <Tabs value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList>
              <TabsTrigger value="all">Hamısı</TabsTrigger>
              <TabsTrigger value="messages">Mesajlar</TabsTrigger>
              <TabsTrigger value="notes">Qeydlər</TabsTrigger>
              <TabsTrigger value="logs">Loglar</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.sender === 'customer' ? "justify-start" : "justify-end"
                )}
              >
                {msg.sender === 'customer' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-xs">
                      {ticket.customerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg p-3",
                    msg.sender === 'customer' 
                      ? "bg-muted" 
                      : msg.isNote 
                        ? "bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300"
                        : msg.sender === 'system'
                          ? "bg-muted/50 text-center text-sm text-muted-foreground"
                          : "bg-primary text-primary-foreground"
                  )}
                >
                  {msg.isNote && (
                    <div className="flex items-center gap-1 text-xs text-yellow-700 dark:text-yellow-400 mb-1">
                      <StickyNote className="h-3 w-3" />
                      Daxili qeyd
                    </div>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className={cn(
                    "text-xs mt-1",
                    msg.sender === 'agent' && !msg.isNote ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {msg.senderName} • {formatTime(msg.createdAt)}
                  </p>
                </div>
                {msg.sender === 'agent' && !msg.isNote && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {msg.senderName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant={isNote ? "default" : "outline"}
              size="sm"
              onClick={() => setIsNote(!isNote)}
            >
              <StickyNote className="h-4 w-4 mr-1" />
              {isNote ? "Qeyd yazılır" : "Qeyd"}
            </Button>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isNote ? "Daxili qeyd yazın (müştəri görməyəcək)..." : "Mesaj yazın..."}
                className={cn(
                  "min-h-[80px] pr-24",
                  isNote && "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10"
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="absolute bottom-2 right-2 flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Image className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button onClick={handleSend} className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - KB Suggestions */}
      <div className="w-72 border-l bg-muted/30 p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Təklif olunan məqalələr
        </h3>
        <div className="space-y-2">
          {suggestedArticles.length > 0 ? (
            suggestedArticles.map((article) => (
              <Card key={article.id} className="cursor-pointer hover:bg-muted/50">
                <CardContent className="p-3">
                  <p className="text-sm font-medium">{article.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {article.content}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Uyğun məqalə tapılmadı
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
