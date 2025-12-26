// Core Types for Live Chat System

export type UserRole = 'admin' | 'supervayzer' | 'agent' | 'partner';

export type ConversationStatus = 'open' | 'closed' | 'snoozed';

export type MessageSender = 'visitor' | 'agent' | 'bot';

export interface Channel {
  id: string;
  name: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  email: string;
  website: string;
  channels: Channel[];
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  channelIds: string[]; // Which channels this user can access
  avatar?: string;
  isOnline: boolean;
  chatbotEnabled?: boolean;
  createdAt: Date;
}

export interface Visitor {
  id: string;
  visitorId: string; // Auto-generated ID like #11698490
  companyId: string;
  metadata?: {
    browser?: string;
    os?: string;
    location?: string;
    referrer?: string;
  };
  createdAt: Date;
  lastSeenAt: Date;
}

export interface Trigger {
  id: string;
  name: string;
  companyId: string;
  keywords?: string[];
  autoReply?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: MessageSender;
  senderId?: string; // visitorId or agentId
  senderName?: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  visitorId: string;
  visitor: Visitor;
  companyId: string;
  channelId: string;
  assignedAgentId?: string;
  assignedAgent?: User;
  triggerId?: string;
  trigger?: Trigger;
  status: ConversationStatus;
  channel: 'webchat' | 'whatsapp' | 'sms' | 'live-chat' | 'instagram' | 'facebook';
  lastMessage?: Message;
  messages: Message[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Quick buttons for chat widget
export interface QuickButton {
  id: string;
  label: string;
  triggerId?: string;
}

// Chat widget configuration
export interface WidgetConfig {
  companyId: string;
  companyName: string;
  headerTitle: string;
  headerSubtitle: string;
  email: string;
  website: string;
  welcomeMessage: string;
  quickButtons: QuickButton[];
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
}

// Folders for organizing conversations
export interface Folder {
  id: string;
  name: string;
  companyId: string;
  conversationIds: string[];
  createdAt: Date;
}

// Chatbot configuration
export interface ChatbotConfig {
  id: string;
  companyId: string;
  isActive: boolean;
  welcomeMessage: string;
  fallbackMessage: string;
  triggers: Trigger[];
  createdAt: Date;
  updatedAt: Date;
}
