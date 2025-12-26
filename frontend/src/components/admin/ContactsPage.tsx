import React, { useState } from 'react';
import { Search, Filter, LayoutGrid, MoreHorizontal, MessageSquare, Phone, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useChat } from '@/contexts/ChatContext';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const ContactsPage: React.FC = () => {
  const { conversations } = useChat();
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique visitors from conversations
  const visitors = conversations.map(c => ({
    ...c.visitor,
    conversation: c,
    channel: c.channel,
  }));

  const filteredVisitors = visitors.filter(v => 
    v.visitorId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold">Contacts</h1>
        <Button className="bg-primary hover:bg-primary/90">
          New contact
        </Button>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
          <span className="text-sm font-medium">All contacts</span>
          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
            {visitors.length}
          </span>
        </div>
        
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="pl-9"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Fields
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-muted/50 sticky top-0">
            <tr className="border-b border-border">
              <th className="w-12 px-4 py-3">
                <Checkbox />
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Fullname</span>
                </div>
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Channels</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Tag</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Phone</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">First seen</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisitors.map((visitor, index) => (
              <tr key={visitor.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Checkbox />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
                      index % 2 === 0 ? "bg-status-online" : "bg-orange-500"
                    )}>
                      {visitor.visitorId.charAt(0)}
                    </div>
                    <span className="font-medium">Visitor #{visitor.visitorId}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Visitor #{visitor.visitorId.slice(0, 8)}...</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">—</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">—</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">—</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDistanceToNow(visitor.createdAt, { addSuffix: true })}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDistanceToNow(visitor.lastSeenAt, { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredVisitors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No contacts found</h3>
            <p className="text-sm text-muted-foreground">Your contacts will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;
