import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Conversation, Message, User, Visitor, ConversationStatus, Company, Folder, Trigger, Channel } from '@/types/chat';
import { mockConversations, mockUsers, generateVisitorId, mockTriggers, mockCompanies, mockFolders } from '@/data/mockData';

interface ChatContextType {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Conversations
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conv: Conversation | null) => void;
  
  // Messages
  sendMessage: (conversationId: string, content: string, sender: 'agent' | 'visitor') => void;
  receiveWidgetMessage: (content: string, triggerId?: string) => void;
  
  // Visitor actions
  startConversation: (triggerId?: string) => Conversation;
  
  // Admin actions
  updateConversationStatus: (convId: string, status: ConversationStatus) => void;
  
  // User Management
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  
  // Company Management
  companies: Company[];
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'channels'>) => void;
  updateCompany: (companyId: string, updates: Partial<Company>) => void;
  deleteCompany: (companyId: string) => void;
  
  // Channel Management
  addChannel: (companyId: string, channel: Omit<Channel, 'id' | 'createdAt' | 'companyId'>) => void;
  updateChannel: (companyId: string, channelId: string, updates: Partial<Channel>) => void;
  deleteChannel: (companyId: string, channelId: string) => void;
  
  // Folder Management
  folders: Folder[];
  addFolder: (name: string) => void;
  updateFolder: (folderId: string, name: string) => void;
  deleteFolder: (folderId: string) => void;
  addConversationToFolder: (conversationId: string, folderId: string) => void;
  
  // Triggers
  triggers: Trigger[];
  
  // Filters
  statusFilter: ConversationStatus | 'all';
  setStatusFilter: (status: ConversationStatus | 'all') => void;
  
  // Active section
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | 'all'>('all');
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [folders, setFolders] = useState<Folder[]>(mockFolders);
  const [triggers] = useState<Trigger[]>(mockTriggers);
  const [activeSection, setActiveSection] = useState('inbox');

  const isAuthenticated = currentUser !== null;

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.email === email);
    if (user && password === 'demo123') {
      setCurrentUser(user);
      localStorage.setItem('chat-user', JSON.stringify(user));
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('chat-user');
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('chat-user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('chat-user');
      }
    }
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string, sender: 'agent' | 'visitor') => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      content,
      sender,
      senderId: sender === 'agent' ? currentUser?.id : undefined,
      senderName: sender === 'agent' ? currentUser?.name : undefined,
      timestamp: new Date(),
      isRead: false,
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const updated = {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: newMessage,
          updatedAt: new Date(),
        };
        if (activeConversation?.id === conversationId) {
          setActiveConversation(updated);
        }
        return updated;
      }
      return conv;
    }));
  }, [currentUser, activeConversation]);

  // Receive message from widget - creates new conversation or adds to existing
  const receiveWidgetMessage = useCallback((content: string, triggerId?: string) => {
    const visitorId = generateVisitorId();
    const visitor: Visitor = {
      id: `visitor-${Date.now()}`,
      visitorId,
      companyId: currentUser?.companyId || 'company-1',
      createdAt: new Date(),
      lastSeenAt: new Date(),
    };

    const trigger = triggerId ? triggers.find(t => t.id === triggerId) : undefined;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: `conv-${Date.now()}`,
      content,
      sender: 'visitor',
      senderId: visitor.id,
      timestamp: new Date(),
      isRead: false,
    };

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      visitorId: visitor.id,
      visitor,
      companyId: currentUser?.companyId || 'company-1',
      channelId: 'live-chat',
      triggerId,
      trigger,
      status: 'open',
      channel: 'webchat',
      messages: [newMessage],
      lastMessage: newMessage,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations(prev => [newConversation, ...prev]);
  }, [currentUser, triggers]);

  const startConversation = useCallback((triggerId?: string): Conversation => {
    const visitorId = generateVisitorId();
    const visitor: Visitor = {
      id: `visitor-${Date.now()}`,
      visitorId,
      companyId: 'company-1',
      createdAt: new Date(),
      lastSeenAt: new Date(),
    };

    const trigger = triggerId ? triggers.find(t => t.id === triggerId) : undefined;

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      visitorId: visitor.id,
      visitor,
      companyId: 'company-1',
      channelId: 'live-chat',
      triggerId,
      trigger,
      status: 'open',
      channel: 'webchat',
      messages: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations(prev => [newConversation, ...prev]);
    return newConversation;
  }, [triggers]);

  const updateConversationStatus = useCallback((convId: string, status: ConversationStatus) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === convId) {
        const updated = { ...conv, status, updatedAt: new Date() };
        if (activeConversation?.id === convId) {
          setActiveConversation(updated);
        }
        return updated;
      }
      return conv;
    }));
  }, [activeConversation]);

  // User Management
  const addUser = useCallback((userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date(),
    };
    setUsers(prev => [...prev, newUser]);
  }, []);

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  }, []);

  // Company Management with auto-created default channel
  const addCompany = useCallback((companyData: Omit<Company, 'id' | 'createdAt' | 'channels'>) => {
    const companyId = `company-${Date.now()}`;
    const defaultChannel: Channel = {
      id: `channel-${Date.now()}`,
      name: 'live-chat',
      companyId,
      isActive: true,
      createdAt: new Date(),
    };
    const newCompany: Company = {
      ...companyData,
      id: companyId,
      channels: [defaultChannel],
      createdAt: new Date(),
    };
    setCompanies(prev => [...prev, newCompany]);
  }, []);

  const updateCompany = useCallback((companyId: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(company => 
      company.id === companyId ? { ...company, ...updates } : company
    ));
  }, []);

  const deleteCompany = useCallback((companyId: string) => {
    setCompanies(prev => prev.filter(company => company.id !== companyId));
  }, []);

  // Channel Management
  const addChannel = useCallback((companyId: string, channelData: Omit<Channel, 'id' | 'createdAt' | 'companyId'>) => {
    const newChannel: Channel = {
      ...channelData,
      id: `channel-${Date.now()}`,
      companyId,
      createdAt: new Date(),
    };
    setCompanies(prev => prev.map(company => 
      company.id === companyId 
        ? { ...company, channels: [...(company.channels || []), newChannel] } 
        : company
    ));
  }, []);

  const updateChannel = useCallback((companyId: string, channelId: string, updates: Partial<Channel>) => {
    setCompanies(prev => prev.map(company => 
      company.id === companyId 
        ? { 
            ...company, 
            channels: (company.channels || []).map(ch => 
              ch.id === channelId ? { ...ch, ...updates } : ch
            )
          } 
        : company
    ));
  }, []);

  const deleteChannel = useCallback((companyId: string, channelId: string) => {
    setCompanies(prev => prev.map(company => 
      company.id === companyId 
        ? { ...company, channels: (company.channels || []).filter(ch => ch.id !== channelId) } 
        : company
    ));
  }, []);

  // Folder Management
  const addFolder = useCallback((name: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      companyId: currentUser?.companyId || 'company-1',
      conversationIds: [],
      createdAt: new Date(),
    };
    setFolders(prev => [...prev, newFolder]);
  }, [currentUser]);

  const updateFolder = useCallback((folderId: string, name: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId ? { ...folder, name } : folder
    ));
  }, []);

  const deleteFolder = useCallback((folderId: string) => {
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
  }, []);

  const addConversationToFolder = useCallback((conversationId: string, folderId: string) => {
    setFolders(prev => prev.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          conversationIds: [...new Set([...folder.conversationIds, conversationId])],
        };
      }
      return folder;
    }));
  }, []);

  return (
    <ChatContext.Provider value={{
      currentUser,
      isAuthenticated,
      login,
      logout,
      conversations,
      activeConversation,
      setActiveConversation,
      sendMessage,
      receiveWidgetMessage,
      startConversation,
      updateConversationStatus,
      users,
      addUser,
      updateUser,
      deleteUser,
      companies,
      addCompany,
      updateCompany,
      deleteCompany,
      addChannel,
      updateChannel,
      deleteChannel,
      folders,
      addFolder,
      updateFolder,
      deleteFolder,
      addConversationToFolder,
      triggers,
      statusFilter,
      setStatusFilter,
      activeSection,
      setActiveSection,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
