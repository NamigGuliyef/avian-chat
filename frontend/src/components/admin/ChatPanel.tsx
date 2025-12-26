import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  Check, 
  Clock, 
  Send, 
  Paperclip, 
  Smile, 
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useChat } from '@/contexts/ChatContext';
import { format } from 'date-fns';

const ChatPanel: React.FC = () => {
  const { activeConversation, sendMessage, currentUser } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<'reply' | 'note'>('reply');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const handleSend = () => {
    if (!inputValue.trim() || !activeConversation) return;
    sendMessage(activeConversation.id, inputValue, 'agent');
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30 h-full">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No conversation selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a conversation from the list to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-full">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold">Visitor {activeConversation.visitor.visitorId}</h2>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            {currentUser?.name?.charAt(0)}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Check className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Clock className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {/* Date Separator */}
        <div className="flex items-center justify-center">
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {format(activeConversation.createdAt, 'MMMM d')}
          </span>
        </div>

        {/* System Message */}
        <div className="flex items-center justify-center">
          <span className="text-xs text-muted-foreground">
            You replied and auto-assigned to yourself on {format(activeConversation.createdAt, 'dd MMM HH:mm')}
          </span>
        </div>

        {/* Messages */}
        {activeConversation.messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.sender === 'visitor' ? "justify-start" : "justify-end"
            )}
          >
            {message.sender === 'visitor' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm shrink-0">
                V
              </div>
            )}
            
            <div className={cn(
              "max-w-[70%]",
              message.sender === 'visitor' ? "order-1" : "order-0"
            )}>
              <div className={cn(
                "rounded-2xl px-4 py-2",
                message.sender === 'visitor' 
                  ? "bg-secondary text-secondary-foreground rounded-bl-sm" 
                  : "bg-primary text-primary-foreground rounded-br-sm"
              )}>
                <p className="text-sm">{message.content}</p>
              </div>
              <div className={cn(
                "flex items-center gap-2 mt-1 text-xs text-muted-foreground",
                message.sender !== 'visitor' && "justify-end"
              )}>
                <span>{format(message.timestamp, 'HH:mm')}</span>
                <span>• Webchat</span>
              </div>
            </div>

            {message.sender !== 'visitor' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm shrink-0">
                {message.senderName?.charAt(0) || 'A'}
              </div>
            )}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Status Bar */}
      {activeConversation.status === 'closed' && (
        <div className="px-4 py-2 bg-muted/50 text-center text-sm text-muted-foreground">
          Conversation archived by {activeConversation.assignedAgent?.name} on {format(activeConversation.updatedAt, 'dd MMM HH:mm')}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border p-4">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('reply')}
              className={cn(
                "text-sm font-medium pb-1 border-b-2 transition-colors",
                activeTab === 'reply' 
                  ? "text-primary border-primary" 
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              Reply
            </button>
            <button
              onClick={() => setActiveTab('note')}
              className={cn(
                "text-sm font-medium pb-1 border-b-2 transition-colors",
                activeTab === 'note' 
                  ? "text-primary border-primary" 
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              Note
            </button>
          </div>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
            Webchat (Livechat)
          </span>
        </div>

        {/* Input */}
        <div className="relative">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message"
            className="min-h-[80px] resize-none pr-12 border-border focus-visible:ring-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
