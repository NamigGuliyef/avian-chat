// CSM System Types

// User Roles
export type UserRole = 'agent' | 'supervisor' | 'admin';
export type UserStatus = 'available' | 'busy' | 'break' | 'offline';

// Ticket Types
export type TicketStatus = 'new' | 'open' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketChannel = 'call' | 'chat' | 'email' | 'social' | 'sms';

export interface CSMUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;
  onlineDuration?: number; // minutes
  activeTickets: number;
  capacityPercent: number;
  createdAt: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  slaDeadline?: string;
  waitingTime: number; // minutes
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  content: string;
  sender: 'customer' | 'agent' | 'system';
  senderName: string;
  attachments?: string[];
  isNote?: boolean; // Internal note - only visible to agents
  createdAt: string;
}

// QA Types
export interface QAResult {
  id: string;
  agentId: string;
  agentName: string;
  ticketId: string;
  callScore: number;
  writingScore: number;
  overallScore: number;
  feedback: string;
  evaluatedBy: string;
  createdAt: string;
}

// Task Types
export type TaskStatus = 'new' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  assignedToName: string;
  dueDate?: string;
  attachments?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard KPIs
export interface DashboardKPIs {
  slaCompliance: number;
  avgHandleTime: number; // minutes
  firstContactResolution: number;
  totalTickets: number;
  callCount: number;
  chatCount: number;
  targetCompletion: number;
}

// Visitor/Customer Info
export interface VisitorInfo {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  location?: string;
  facebookProfile?: string;
  instagramProfile?: string;
  whatsapp?: string;
  tags: string[];
  createdAt: string;
}

// Tags
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdBy: string;
  createdAt: string;
}

// Omnichannel Queue Item
export interface QueueItem {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  channel: TicketChannel;
  subject?: string;
  waitingTime: number;
  status: 'waiting' | 'accepted' | 'rejected';
  assignedTo?: string;
  createdAt: string;
}

// Knowledge Base
export interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Meeting
export interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  createdBy: string;
  createdAt: string;
}

// Script for Telesales
export interface SalesScript {
  id: string;
  title: string;
  steps: ScriptStep[];
  createdBy: string;
  createdAt: string;
}

export interface ScriptStep {
  id: string;
  order: number;
  title: string;
  content: string;
  isCompleted?: boolean;
}

// Workflow Rule
export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}
