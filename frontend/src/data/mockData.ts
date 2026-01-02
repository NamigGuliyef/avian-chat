import { Company, User, Visitor, Trigger, Conversation, Message, WidgetConfig, Folder, Channel } from '@/types/chat';
import { Lead, OperationLog, User as CrmUser, Stats, Project, Excel, Sheet, SupervisorAssignment, AgentKPI } from '@/types/crm';
import { IProject } from '@/types/types';

// Mock Projects
export const mockProjects: any[] = [
  { _id: 'proj-1', name: 'Azercell', description: 'Azercell CRM layihəsi', },
  { _id: 'proj-2', name: 'Bakcell', description: 'Bakcell satış layihəsi', },
  { _id: 'proj-3', name: 'Nar', description: 'Nar müştəri xidmətləri', },
];

// Mock Excels (Workbooks)
export const mockExcels: Excel[] = [
  { id: 'excel-1', projectId: 'proj-1', name: 'Satış hesabatları', description: 'Aylıq satış hesabatları', agentIds: ['user-1', 'user-2'], createdAt: '2024-01-05', updatedAt: '2024-01-05' },
  { id: 'excel-2', projectId: 'proj-1', name: 'Müştəri datası', description: 'Müştəri əlaqə məlumatları', agentIds: ['user-2'], createdAt: '2024-02-05', updatedAt: '2024-02-05' },
  { id: 'excel-3', projectId: 'proj-2', name: 'VIP siyahı', description: 'VIP müştəri siyahısı', agentIds: ['user-3'], createdAt: '2024-02-10', updatedAt: '2024-02-10' },
];

// Mock Sheets (inside Excels)
export const mockSheets: Sheet[] = [
  {
    id: 'sheet-1', excelId: 'excel-1', projectId: 'proj-1', name: 'Yanvar satışları', description: 'Yanvar ayı satış cədvəli', agentIds: ['user-1', 'user-2'], columns: [
      { id: 'col-1', name: 'Telefon', dataKey: 'phone', type: 'phone', visibleToUser: true, editableByUser: false, order: 1, sheetId: 'sheet-1' },
      { id: 'col-2', name: 'Zəng statusu', dataKey: 'callStatus', type: 'select', options: [{ value: 'successful', label: 'Uğurlu' }, { value: 'unsuccessful', label: 'Uğursuz' }, { value: 'pending', label: 'Gözləmədə' }], visibleToUser: true, editableByUser: true, order: 2, sheetId: 'sheet-1' },
      { id: 'col-3', name: 'Aylıq ödəniş', dataKey: 'monthlyPayment', type: 'number', visibleToUser: true, editableByUser: true, order: 3, sheetId: 'sheet-1' },
      { id: 'col-4', name: 'Tarif', dataKey: 'tariff', type: 'text', visibleToUser: true, editableByUser: true, order: 4, sheetId: 'sheet-1' },
    ], createdAt: '2024-01-05', updatedAt: '2024-01-05'
  },
  {
    id: 'sheet-2', excelId: 'excel-1', projectId: 'proj-1', name: 'Fevral satışları', description: 'Fevral ayı satış cədvəli', agentIds: ['user-2'], columns: [
      { id: 'col-5', name: 'Telefon', dataKey: 'phone', type: 'phone', visibleToUser: true, editableByUser: false, order: 1, sheetId: 'sheet-2' },
      { id: 'col-6', name: 'Müştəri statusu', dataKey: 'customerStatus', type: 'select', options: [{ value: 'ok', label: 'OK' }, { value: 'not_ok', label: 'Uyğun deyil' }, { value: 'interested', label: 'Maraqlanır' }], visibleToUser: true, editableByUser: true, order: 2, sheetId: 'sheet-2' },
    ], createdAt: '2024-02-05', updatedAt: '2024-02-05'
  },
  {
    id: 'sheet-3', excelId: 'excel-2', projectId: 'proj-1', name: 'Əlaqə siyahısı', description: 'Müştəri əlaqə məlumatları', agentIds: ['user-2'], columns: [
      { id: 'col-7', name: 'Telefon', dataKey: 'phone', type: 'phone', visibleToUser: true, editableByUser: false, order: 1, sheetId: 'sheet-3' },
      { id: 'col-8', name: 'Ad', dataKey: 'name', type: 'text', visibleToUser: true, editableByUser: true, order: 2, sheetId: 'sheet-3' },
    ], createdAt: '2024-02-10', updatedAt: '2024-02-10'
  },
  {
    id: 'sheet-4', excelId: 'excel-3', projectId: 'proj-2', name: 'VIP müştərilər', description: 'VIP müştəri siyahısı', agentIds: ['user-3'], columns: [
      { id: 'col-9', name: 'Telefon', dataKey: 'phone', type: 'phone', visibleToUser: true, editableByUser: false, order: 1, sheetId: 'sheet-4' },
      { id: 'col-10', name: 'Bonus', dataKey: 'bonus', type: 'text', visibleToUser: true, editableByUser: true, order: 2, sheetId: 'sheet-4' },
    ], createdAt: '2024-02-10', updatedAt: '2024-02-10'
  },
];

// Mock Supervisor Assignments
export const mockSupervisorAssignments: SupervisorAssignment[] = [
  { id: 'assign-1', supervisorId: 'sup-1', agentIds: ['user-1', 'user-2', 'user-3'], createdAt: '2024-01-01' },
  { id: 'assign-2', supervisorId: 'sup-2', agentIds: ['user-4', 'user-5'], createdAt: '2024-01-15' },
];

// Mock Leads for CRM
export const mockLeads: Lead[] = [
  { id: 'lead-1', phone: '+994554567897', maskedPhone: '99455******7', callStatus: 'successful', callDate: '2024-01-15', customerStatus: 'ok', reason: 'İstifadəçi razıdır', monthlyPayment: 45, tariff: 'Premium', bonus: '10 GB', cost: 25, assignedUser: 'user-1', sheetId: 'sheet-1', createdAt: '2024-01-15T10:00:00', updatedAt: '2024-01-15T10:30:00' },
  { id: 'lead-2', phone: '+994504567893', maskedPhone: '99450******3', callStatus: 'unsuccessful', callDate: '2024-01-14', customerStatus: 'not_ok', reason: 'Cavab vermədi', monthlyPayment: 0, tariff: 'Basic', bonus: 'Yoxdur', cost: 15, assignedUser: 'user-1', sheetId: 'sheet-1', createdAt: '2024-01-14T09:00:00', updatedAt: '2024-01-14T09:15:00' },
  { id: 'lead-3', phone: '+994701234567', maskedPhone: '99470******7', callStatus: 'pending', callDate: '2024-01-16', customerStatus: 'pending', reason: 'Gözləmədə', monthlyPayment: 30, tariff: 'Standard', bonus: '5 GB', cost: 20, assignedUser: 'user-2', sheetId: 'sheet-1', createdAt: '2024-01-16T11:00:00', updatedAt: '2024-01-16T11:00:00' },
  { id: 'lead-4', phone: '+994509876543', maskedPhone: '99450******3', callStatus: 'callback', callDate: '2024-01-17', customerStatus: 'interested', reason: 'Yenidən zəng istəyir', monthlyPayment: 50, tariff: 'Premium Plus', bonus: '15 GB', cost: 35, assignedUser: 'user-2', sheetId: 'sheet-2', createdAt: '2024-01-17T14:00:00', updatedAt: '2024-01-17T14:30:00' },
  { id: 'lead-5', phone: '+994557654321', maskedPhone: '99455******1', callStatus: 'successful', callDate: '2024-01-18', customerStatus: 'ok', reason: 'Müqavilə imzalandı', monthlyPayment: 60, tariff: 'Business', bonus: '20 GB', cost: 40, assignedUser: 'user-3', sheetId: 'sheet-4', createdAt: '2024-01-18T09:00:00', updatedAt: '2024-01-18T09:45:00' },
  { id: 'lead-6', phone: '+994518765432', maskedPhone: '99451******2', callStatus: 'no_answer', callDate: '2024-01-19', customerStatus: 'pending', reason: 'Cavab yoxdur', monthlyPayment: 0, tariff: 'Basic', bonus: 'Yoxdur', cost: 10, assignedUser: 'user-1', sheetId: 'sheet-1', createdAt: '2024-01-19T10:00:00', updatedAt: '2024-01-19T10:00:00' },
  { id: 'lead-7', phone: '+994703456789', maskedPhone: '99470******9', callStatus: 'successful', callDate: '2024-01-20', customerStatus: 'ok', reason: 'Qoşuldu', monthlyPayment: 45, tariff: 'Standard Plus', bonus: '8 GB', cost: 28, assignedUser: 'user-4', sheetId: 'sheet-4', createdAt: '2024-01-20T15:00:00', updatedAt: '2024-01-20T15:30:00' },
  { id: 'lead-8', phone: '+994552345678', maskedPhone: '99455******8', callStatus: 'pending', callDate: '2024-01-21', customerStatus: 'interested', reason: 'Maraqlanır', monthlyPayment: 55, tariff: 'Premium', bonus: '12 GB', cost: 32, assignedUser: 'user-5', sheetId: 'sheet-4', createdAt: '2024-01-21T11:00:00', updatedAt: '2024-01-21T11:00:00' },
];

// Mock CRM Users
export const mockCrmUsers: CrmUser[] = [
  { id: 'admin-1', name: 'Admin', email: 'admin@culture.gov.az', password: 'demo123', role: 'admin', companyId: 'company-1', isActive: true, status: 'available', createdAt: '2024-01-01' },
  { id: 'sup-1', name: 'Kamran Həsənov', email: 'kamran@culture.gov.az', password: 'demo123', role: 'supervayzer', companyId: 'company-1', isActive: true, status: 'available', createdAt: '2024-01-05' },
  { id: 'sup-2', name: 'Nərmin Əliyeva', email: 'narmin@culture.gov.az', password: 'demo123', role: 'supervayzer', companyId: 'company-1', isActive: true, status: 'busy', createdAt: '2024-01-10' },
  { id: 'user-1', name: 'Fərid Məmmədov', email: 'farid@culture.gov.az', password: 'demo123', role: 'agent', companyId: 'company-1', supervisorId: 'sup-1', isActive: true, status: 'available', activeChats: 3, activeCalls: 1, createdAt: '2024-01-15' },
  { id: 'user-2', name: 'Aynur Qasımova', email: 'aynur@culture.gov.az', password: 'demo123', role: 'agent', companyId: 'company-1', supervisorId: 'sup-1', isActive: true, status: 'busy', activeChats: 5, activeCalls: 0, createdAt: '2024-01-16' },
  { id: 'user-3', name: 'Tural İbrahimov', email: 'tural@culture.gov.az', password: 'demo123', role: 'agent', companyId: 'company-1', supervisorId: 'sup-1', isActive: true, status: 'break', activeChats: 0, activeCalls: 0, createdAt: '2024-01-17' },
  { id: 'user-4', name: 'Səbinə Həsənova', email: 'sabina@culture.gov.az', password: 'demo123', role: 'agent', companyId: 'company-2', supervisorId: 'sup-2', isActive: true, status: 'available', activeChats: 2, activeCalls: 1, createdAt: '2024-01-18' },
  { id: 'user-5', name: 'Rəşad Əhmədov', email: 'rashad@culture.gov.az', password: 'demo123', role: 'agent', companyId: 'company-2', supervisorId: 'sup-2', isActive: true, status: 'offline', activeChats: 0, activeCalls: 0, createdAt: '2024-01-19' },
  { id: 'partner-1', name: 'Şirkət A Partner', email: 'partner@partnerA.az', password: 'demo123', role: 'partner', companyId: 'company-1', isActive: true, status: 'available', createdAt: '2024-02-01' },
];


// Mock Agent KPIs
export const mockAgentKPIs: AgentKPI[] = [
  { agentId: 'user-1', answeredTickets: 45, closedTickets: 38, avgHandleTime: 12, slaCompliance: 92 },
  { agentId: 'user-2', answeredTickets: 52, closedTickets: 48, avgHandleTime: 10, slaCompliance: 95 },
  { agentId: 'user-3', answeredTickets: 30, closedTickets: 25, avgHandleTime: 15, slaCompliance: 85 },
];

// Mock Operation Logs
export const mockOperationLogs: OperationLog[] = [
  { id: 'log-1', userId: 'user-1', userName: 'Fərid Məmmədov', operation: 'UPDATE', field: 'callStatus', oldValue: 'pending', newValue: 'successful', timestamp: '2024-12-15 10:30:00' },
  { id: 'log-2', userId: 'user-2', userName: 'Aynur Qasımova', operation: 'UPDATE', field: 'customerStatus', oldValue: 'pending', newValue: 'ok', timestamp: '2024-12-15 11:00:00' },
  { id: 'log-3', userId: 'user-3', userName: 'Tural İbrahimov', operation: 'CREATE', field: 'lead', oldValue: '', newValue: 'lead-5', timestamp: '2024-12-15 12:00:00' },
  { id: 'log-4', userId: 'sup-1', userName: 'Kamran Həsənov', operation: 'UPDATE', field: 'sheetAccess', oldValue: '', newValue: 'user-3 added', timestamp: '2024-12-15 13:00:00' },
];

// Mock Stats
export const mockStats: Stats = { totalCalls: 256, successfulCalls: 142, okCustomers: 98, totalCost: 4520 };

// Mock Companies
export const mockCompanies: Company[] = [
  { id: 'company-1', name: 'Mədəniyyət Nazirliyi', domain: 'culture.gov.az', email: 'info@culture.gov.az', website: 'https://culture.gov.az', channels: [{ id: 'ch-1', name: 'live-chat', companyId: 'company-1', isActive: true, createdAt: new Date() }, { id: 'ch-1a', name: 'instagram', companyId: 'company-1', isActive: true, createdAt: new Date() }], createdAt: new Date('2024-01-01') },
  { id: 'company-2', name: 'Təhsil Nazirliyi', domain: 'edu.gov.az', email: 'info@edu.gov.az', website: 'https://edu.gov.az', channels: [{ id: 'ch-2', name: 'live-chat', companyId: 'company-2', isActive: true, createdAt: new Date() }], createdAt: new Date('2024-02-01') },
  { id: 'company-3', name: 'Səhiyyə Nazirliyi', domain: 'health.gov.az', email: 'info@health.gov.az', website: 'https://health.gov.az', channels: [{ id: 'ch-3', name: 'live-chat', companyId: 'company-3', isActive: true, createdAt: new Date() }, { id: 'ch-3a', name: 'facebook', companyId: 'company-3', isActive: false, createdAt: new Date() }], createdAt: new Date('2024-03-01') },
  { id: 'company-4', name: 'Nəqliyyat Nazirliyi', domain: 'transport.gov.az', email: 'info@transport.gov.az', website: 'https://transport.gov.az', channels: [{ id: 'ch-4', name: 'live-chat', companyId: 'company-4', isActive: true, createdAt: new Date() }], createdAt: new Date('2024-04-01') },
  { id: 'company-5', name: 'Maliyyə Nazirliyi', domain: 'maliyye.gov.az', email: 'info@maliyye.gov.az', website: 'https://maliyye.gov.az', channels: [{ id: 'ch-5', name: 'live-chat', companyId: 'company-5', isActive: true, createdAt: new Date() }, { id: 'ch-5a', name: 'whatsapp', companyId: 'company-5', isActive: true, createdAt: new Date() }], createdAt: new Date('2024-05-01') },
  { id: 'company-6', name: 'Əmək Nazirliyi', domain: 'labour.gov.az', email: 'info@labour.gov.az', website: 'https://labour.gov.az', channels: [{ id: 'ch-6', name: 'live-chat', companyId: 'company-6', isActive: true, createdAt: new Date() }], createdAt: new Date('2024-06-01') },
];

// Mock Users
export const mockUsers: User[] = [
  { id: 'user-1', email: 'admin@culture.gov.az', name: 'Admin User', role: 'admin', companyId: 'company-1', channelIds: ['ch-1', 'ch-1a'], isOnline: true, createdAt: new Date('2024-01-01') },
  { id: 'user-2', email: 'fatima@culture.gov.az', name: 'Fatima Həsənova', role: 'agent', companyId: 'company-1', channelIds: ['ch-1'], isOnline: true, createdAt: new Date('2024-01-15') },
  { id: 'user-3', email: 'elvin@culture.gov.az', name: 'Elvin Məmmədov', role: 'agent', companyId: 'company-1', channelIds: ['ch-1', 'ch-1a'], isOnline: false, createdAt: new Date('2024-02-01') },
  { id: 'user-4', email: 'leyla@edu.gov.az', name: 'Leyla Əliyeva', role: 'supervayzer', companyId: 'company-2', channelIds: ['ch-2'], isOnline: true, createdAt: new Date('2024-02-10') },
  { id: 'user-5', email: 'murad@edu.gov.az', name: 'Murad Quliyev', role: 'agent', companyId: 'company-2', channelIds: ['ch-2'], isOnline: false, createdAt: new Date('2024-02-15') },
  { id: 'user-6', email: 'gunel@health.gov.az', name: 'Günəl İsmayılova', role: 'agent', companyId: 'company-3', channelIds: ['ch-3'], isOnline: true, createdAt: new Date('2024-03-01') },
  { id: 'user-7', email: 'samir@health.gov.az', name: 'Samir Rəhimov', role: 'agent', companyId: 'company-3', channelIds: ['ch-3', 'ch-3a'], isOnline: true, createdAt: new Date('2024-03-10') },
  { id: 'user-8', email: 'nigar@transport.gov.az', name: 'Nigar Babayeva', role: 'agent', companyId: 'company-4', channelIds: ['ch-4'], isOnline: false, createdAt: new Date('2024-04-01') },
];

// Mock Triggers
export const mockTriggers: Trigger[] = [
  { id: 'trigger-1', name: 'Mədəni tədbirlər', companyId: 'company-1', isActive: true, createdAt: new Date() },
  { id: 'trigger-2', name: 'Bilet satışı', companyId: 'company-1', isActive: true, createdAt: new Date() },
  { id: 'trigger-3', name: 'Operatorla əlaqə', companyId: 'company-1', isActive: true, createdAt: new Date() },
  { id: 'trigger-4', name: 'Şikayət', companyId: 'company-1', isActive: true, createdAt: new Date() },
  { id: 'trigger-5', name: 'Məlumat almaq', companyId: 'company-2', isActive: true, createdAt: new Date() },
];

// Mock Visitors
export const mockVisitors: Visitor[] = [
  { id: 'visitor-1', visitorId: '#11698490', companyId: 'company-1', metadata: { browser: 'Chrome', os: 'Windows', location: 'Bakı, AZ' }, createdAt: new Date('2024-12-12T15:48:00'), lastSeenAt: new Date('2024-12-12T15:51:00') },
  { id: 'visitor-2', visitorId: '#11698491', companyId: 'company-1', metadata: { browser: 'Safari', os: 'macOS', location: 'Gəncə, AZ' }, createdAt: new Date('2024-12-12T16:00:00'), lastSeenAt: new Date('2024-12-12T16:15:00') },
  { id: 'visitor-3', visitorId: '#11698492', companyId: 'company-2', metadata: { browser: 'Firefox', os: 'Linux', location: 'Sumqayıt, AZ' }, createdAt: new Date('2024-12-13T10:00:00'), lastSeenAt: new Date('2024-12-13T10:30:00') },
  { id: 'visitor-4', visitorId: '#11698493', companyId: 'company-1', metadata: { browser: 'Edge', os: 'Windows', location: 'Bakı, AZ' }, createdAt: new Date('2024-12-13T11:00:00'), lastSeenAt: new Date('2024-12-13T11:20:00') },
  { id: 'visitor-5', visitorId: '#11698494', companyId: 'company-3', metadata: { browser: 'Chrome', os: 'Android', location: 'Mingəçevir, AZ' }, createdAt: new Date('2024-12-14T09:00:00'), lastSeenAt: new Date('2024-12-14T09:45:00') },
  { id: 'visitor-6', visitorId: '#11698495', companyId: 'company-1', metadata: { browser: 'Chrome', os: 'iOS', location: 'Şəki, AZ' }, createdAt: new Date('2024-12-14T14:00:00'), lastSeenAt: new Date('2024-12-14T14:30:00') },
];

// Mock Messages
export const mockMessages: Message[] = [
  { id: 'msg-1', conversationId: 'conv-1', content: 'Salam, mədəni tədbirlər haqqında məlumat almaq istəyirəm.', sender: 'visitor', senderId: 'visitor-1', timestamp: new Date('2024-12-12T15:48:00'), isRead: true },
  { id: 'msg-2', conversationId: 'conv-1', content: 'Salam! Sizə necə kömək edə bilərəm?', sender: 'agent', senderId: 'user-2', senderName: 'Fatima Həsənova', timestamp: new Date('2024-12-12T15:49:00'), isRead: true },
  { id: 'msg-3', conversationId: 'conv-2', content: 'Bilet almaq istəyirəm', sender: 'visitor', senderId: 'visitor-2', timestamp: new Date('2024-12-12T16:00:00'), isRead: true },
  { id: 'msg-4', conversationId: 'conv-3', content: 'Təhsil haqqında sual var', sender: 'visitor', senderId: 'visitor-3', timestamp: new Date('2024-12-13T10:00:00'), isRead: false },
  { id: 'msg-5', conversationId: 'conv-4', content: 'Şikayətim var', sender: 'visitor', senderId: 'visitor-4', timestamp: new Date('2024-12-13T11:00:00'), isRead: true },
  { id: 'msg-6', conversationId: 'conv-5', content: 'Səhiyyə xidmətləri haqqında', sender: 'visitor', senderId: 'visitor-5', timestamp: new Date('2024-12-14T09:00:00'), isRead: false },
  { id: 'msg-7', conversationId: 'conv-6', content: 'Salam, kömək lazımdır', sender: 'visitor', senderId: 'visitor-6', timestamp: new Date('2024-12-14T14:00:00'), isRead: false },
];

// Mock Conversations
export const mockConversations: Conversation[] = [
  { id: 'conv-1', visitorId: 'visitor-1', visitor: mockVisitors[0], companyId: 'company-1', channelId: 'ch-1', assignedAgentId: 'user-2', assignedAgent: mockUsers[1], triggerId: 'trigger-1', trigger: mockTriggers[0], status: 'open', channel: 'webchat', messages: [mockMessages[0], mockMessages[1]], lastMessage: mockMessages[1], tags: ['VIP'], createdAt: new Date('2024-12-12T15:48:00'), updatedAt: new Date('2024-12-12T15:50:00') },
  { id: 'conv-2', visitorId: 'visitor-2', visitor: mockVisitors[1], companyId: 'company-1', channelId: 'ch-1', assignedAgentId: 'user-3', assignedAgent: mockUsers[2], triggerId: 'trigger-2', trigger: mockTriggers[1], status: 'open', channel: 'webchat', messages: [mockMessages[2]], lastMessage: mockMessages[2], tags: [], createdAt: new Date('2024-12-12T16:00:00'), updatedAt: new Date('2024-12-12T16:00:00') },
  { id: 'conv-3', visitorId: 'visitor-3', visitor: mockVisitors[2], companyId: 'company-2', channelId: 'ch-2', triggerId: 'trigger-5', trigger: mockTriggers[4], status: 'open', channel: 'webchat', messages: [mockMessages[3]], lastMessage: mockMessages[3], tags: [], createdAt: new Date('2024-12-13T10:00:00'), updatedAt: new Date('2024-12-13T10:00:00') },
  { id: 'conv-4', visitorId: 'visitor-4', visitor: mockVisitors[3], companyId: 'company-1', channelId: 'ch-1a', triggerId: 'trigger-4', trigger: mockTriggers[3], status: 'closed', channel: 'instagram', messages: [mockMessages[4]], lastMessage: mockMessages[4], tags: ['Şikayət'], createdAt: new Date('2024-12-13T11:00:00'), updatedAt: new Date('2024-12-13T11:30:00') },
  { id: 'conv-5', visitorId: 'visitor-5', visitor: mockVisitors[4], companyId: 'company-3', channelId: 'ch-3', status: 'snoozed', channel: 'webchat', messages: [mockMessages[5]], lastMessage: mockMessages[5], tags: [], createdAt: new Date('2024-12-14T09:00:00'), updatedAt: new Date('2024-12-14T09:00:00') },
  { id: 'conv-6', visitorId: 'visitor-6', visitor: mockVisitors[5], companyId: 'company-1', channelId: 'ch-1', assignedAgentId: 'user-2', assignedAgent: mockUsers[1], triggerId: 'trigger-3', trigger: mockTriggers[2], status: 'open', channel: 'webchat', messages: [mockMessages[6]], lastMessage: mockMessages[6], tags: [], createdAt: new Date('2024-12-14T14:00:00'), updatedAt: new Date('2024-12-14T14:00:00') },
];

// Mock Folders
export const mockFolders: Folder[] = [
  { id: 'folder-1', name: 'VIP müştərilər', companyId: 'company-1', conversationIds: ['conv-1'], createdAt: new Date('2024-01-01') },
  { id: 'folder-2', name: 'Şikayətlər', companyId: 'company-1', conversationIds: ['conv-4'], createdAt: new Date('2024-01-15') },
  { id: 'folder-3', name: 'Gözləmədə', companyId: 'company-1', conversationIds: [], createdAt: new Date('2024-02-01') },
];

// Helper function to generate visitor ID
export const generateVisitorId = () => `#${Math.floor(10000000 + Math.random() * 90000000)}`;

// Widget Configuration
export const defaultWidgetConfig: WidgetConfig = {
  companyId: 'company-1', companyName: 'Dəstək mərkəzi', headerTitle: 'Dəstək mərkəzi', headerSubtitle: 'Recently active',
  email: 'info@culture.gov.az', website: 'https://culture.gov.az/az', welcomeMessage: 'Zəhmət olmasa, sizi maraqlandıran bölməni seçin 👇',
  quickButtons: mockTriggers.filter(t => t.companyId === 'company-1').map(t => ({ id: t.id, label: t.name, triggerId: t.id })),
  primaryColor: '#3B82F6', position: 'bottom-right'
};
