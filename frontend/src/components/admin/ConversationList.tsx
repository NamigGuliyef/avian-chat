import React from 'react';
import { Filter, Inbox as InboxIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useChat } from '@/contexts/ChatContext';
import { ConversationStatus } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

type ExtendedStatus = ConversationStatus | 'all' | 'chatbot' | 'spam';

interface ConversationListProps {
  selectedFolderId: string | null;
}

const ConversationList: React.FC<ConversationListProps> = ({ selectedFolderId }) => {
  const { 
    conversations, 
    activeConversation, 
    setActiveConversation,
    statusFilter,
    setStatusFilter,
    folders
  } = useChat();

  // Extended status filter to include chatbot and spam
  const [extendedFilter, setExtendedFilter] = React.useState<ExtendedStatus>(statusFilter);

  const handleStatusChange = (value: string) => {
    const status = value as ExtendedStatus;
    setExtendedFilter(status);
    if (status === 'open' || status === 'closed' || status === 'snoozed') {
      setStatusFilter(status);
    } else {
      setStatusFilter('all');
    }
  };

  const getFilteredConversations = () => {
    let filtered = conversations;

    // Apply folder filter
    if (selectedFolderId) {
      const folder = folders.find(f => f.id === selectedFolderId);
      if (folder) {
        filtered = filtered.filter(c => folder.conversationIds.includes(c.id));
      }
    }

    // Apply extended status filter
    switch (extendedFilter) {
      case 'open':
      case 'closed':
      case 'snoozed':
        filtered = filtered.filter(c => c.status === extendedFilter);
        break;
      case 'chatbot':
        filtered = filtered.filter(c => c.trigger);
        break;
      case 'spam':
        filtered = []; // No spam in mock data
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    return filtered;
  };

  const filteredConversations = getFilteredConversations();

  const getFilterTitle = () => {
    if (selectedFolderId) {
      const folder = folders.find(f => f.id === selectedFolderId);
      return folder?.name || 'Inbox';
    }
    return 'All';
  };

  return (
    <div className="w-80 border-r border-border flex flex-col bg-card h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>≡</span>
            <span>{getFilterTitle()}</span>
            <span className="text-muted-foreground">({filteredConversations.length})</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Filter className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Status Tabs - Text only for Chatbot and Spam */}
      <div className="px-4 py-2 border-b border-border">
        <Tabs value={extendedFilter} onValueChange={handleStatusChange}>
          <TabsList className="grid w-full grid-cols-5 h-8">
            <TabsTrigger value="open" className="text-xs">Open</TabsTrigger>
            <TabsTrigger value="closed" className="text-xs">Closed</TabsTrigger>
            <TabsTrigger value="snoozed" className="text-xs">Snoozed</TabsTrigger>
            <TabsTrigger value="chatbot" className="text-xs">Chatbot</TabsTrigger>
            <TabsTrigger value="spam" className="text-xs">Spam</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <InboxIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-base font-medium mb-2">You don't have any conversation</h3>
            <p className="text-sm text-muted-foreground">Your conversations will appear here.</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConversation(conv)}
              className={cn(
                "inbox-item border-b border-border",
                activeConversation?.id === conv.id && "inbox-item-active"
              )}
            >
              {/* Avatar */}
              <div className="relative">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium",
                  conv.status === 'open' ? "bg-status-online" : "bg-orange-500"
                )}>
                  {conv.visitor.visitorId.charAt(1)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate">
                    Visitor #{conv.visitor.visitorId}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(conv.updatedAt, { addSuffix: false })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {conv.assignedAgent && (
                    <span className="text-xs font-medium text-primary">
                      {conv.assignedAgent.name}:
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.lastMessage?.content || 'Mesaj yoxdur'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
