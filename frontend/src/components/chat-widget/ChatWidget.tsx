import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, MoreHorizontal, Send, Smile, Globe, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { defaultWidgetConfig } from '@/data/mockData';
import { Message } from '@/types/chat';

interface ChatWidgetProps {
  onSendMessage?: (message: string, triggerId?: string) => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ onSendMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const config = defaultWidgetConfig;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickButtonClick = (buttonLabel: string, triggerId?: string) => {
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: 'widget-conv',
      content: buttonLabel,
      sender: 'visitor',
      timestamp: new Date(),
      isRead: false,
    };
    setMessages(prev => [...prev, userMessage]);
    setHasStarted(true);
    
    // Simulate agent acknowledgment
    setTimeout(() => {
      const botMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        conversationId: 'widget-conv',
        content: `"${buttonLabel}" bölməsi üzrə sorğunuz qeydə alındı. Operator qısa zamanda sizinlə əlaqə saxlayacaq.`,
        sender: 'bot',
        timestamp: new Date(),
        isRead: false,
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
    
    onSendMessage?.(buttonLabel, triggerId);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: 'widget-conv',
      content: inputValue,
      sender: 'visitor',
      timestamp: new Date(),
      isRead: false,
    };
    setMessages(prev => [...prev, userMessage]);
    setHasStarted(true);
    setInputValue('');
    
    onSendMessage?.(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-widget-container">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[380px] bg-card rounded-2xl shadow-widget overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-primary px-4 py-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-lg">🏛️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-base">{config.headerTitle}</h3>
                  <p className="text-sm text-primary-foreground/80 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    {config.headerSubtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-secondary/50 px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 text-sm text-foreground mb-1">
              <Mail className="h-4 w-4 text-primary" />
              <span>E-poçt: {config.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-primary" />
              <span>Sayt: </span>
              <a href={config.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {config.website}
              </a>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[350px] overflow-y-auto p-4 space-y-4 scrollbar-thin bg-background">
            {/* Welcome Message */}
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <span className="text-sm">🤖</span>
              </div>
              <div className="chat-bubble-bot">
                <p className="text-sm">{config.welcomeMessage}</p>
              </div>
            </div>

            {/* Quick Buttons */}
            {!hasStarted && (
              <div className="flex flex-wrap gap-2 justify-end">
                {config.quickButtons.map((button) => (
                  <button
                    key={button.id}
                    onClick={() => handleQuickButtonClick(button.label, button.triggerId)}
                    className="quick-button text-sm"
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  message.sender === 'visitor' ? "justify-end" : "justify-start"
                )}
              >
                {message.sender !== 'visitor' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-sm">{message.sender === 'bot' ? '🤖' : '👤'}</span>
                  </div>
                )}
                <div className={message.sender === 'visitor' ? 'chat-bubble-user' : 'chat-bubble-agent'}>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your message"
                className="flex-1 border-border focus-visible:ring-primary"
              />
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                size="icon" 
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">Powered by LiveChat</p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-widget-button",
          "flex items-center justify-center transition-all duration-300",
          "hover:scale-105 active:scale-95",
          isOpen && "rotate-90"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
