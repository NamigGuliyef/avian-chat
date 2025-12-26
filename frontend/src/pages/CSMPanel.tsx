import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import TopBar from '@/components/csm/TopBar';
import CSMSidebar from '@/components/csm/CSMSidebar';
import RightPanel from '@/components/csm/RightPanel';
import BottomBar from '@/components/csm/BottomBar';
import Dashboard from '@/components/csm/Dashboard';
import Omnichannel from '@/components/csm/Omnichannel';
import TasksKanban from '@/components/csm/TasksKanban';
import TicketDetail from '@/components/csm/TicketDetail';
import QAResults from '@/components/csm/QAResults';
import { 
  mockCSMUsers, mockTickets, mockTicketMessages, mockTasks, 
  mockDashboardKPIs, mockVisitorInfo, mockTags, mockQueueItems,
  mockQAResults, mockKBArticles 
} from '@/data/csmMockData';
import { Ticket, Task, UserStatus, CSMUser, VisitorInfo, Tag} from '@/types/csm';

const CSMPanel: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<CSMUser>(mockCSMUsers[0]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [tickets, setTickets] = useState(mockTickets);
  const [tasks, setTasks] = useState(mockTasks);
  const [queueItems, setQueueItems] = useState(mockQueueItems);
  const [tags, setTags] = useState(mockTags);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorInfo | undefined>(mockVisitorInfo[0]);

  const handleStatusChange = (status: UserStatus) => {
    setCurrentUser({ ...currentUser, status });
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const handleTicketStatusChange = (ticketId: string, status: string) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: status as any } : t));
  };

  const handleTaskCreate = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
  };

  const handleAcceptQueue = (id: string) => {
    setQueueItems(queueItems.filter(q => q.id !== id));
  };

  const myTickets = tickets.filter(t => t.assignedAgentId === currentUser.id);
  const slaRiskTickets = tickets.filter(t => t.slaDeadline && t.waitingTime > 30);

  const renderContent = () => {
    if (selectedTicket) {
      return (
        <TicketDetail
          ticket={selectedTicket}
          messages={mockTicketMessages.filter(m => m.ticketId === selectedTicket.id)}
          suggestedArticles={mockKBArticles}
          onBack={() => setSelectedTicket(null)}
          onSendMessage={() => {}}
          onStatusChange={(s) => handleTicketStatusChange(selectedTicket.id, s)}
        />
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return (
          <Dashboard
            kpis={mockDashboardKPIs}
            slaRiskTickets={slaRiskTickets}
            teamStatus={mockCSMUsers}
            myQueue={myTickets}
            qaResults={mockQAResults}
            userRole={currentUser.role}
          />
        );
      case 'omnichannel':
      case 'telesales':
        return (
          <Omnichannel
            tickets={tickets}
            onTicketClick={setSelectedTicket}
            onStatusChange={handleTicketStatusChange}
          />
        );
      case 'tasks':
        return (
          <TasksKanban
            tasks={tasks}
            users={mockCSMUsers}
            currentUserId={currentUser.id}
            onTaskCreate={handleTaskCreate}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={(id) => setTasks(tasks.filter(t => t.id !== id))}
          />
        );
      case 'qa':
        return (
          <QAResults
            results={mockQAResults}
            users={mockCSMUsers}
            currentUserId={currentUser.id}
            userRole={currentUser.role}
          />
        );
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{activeSection}</h1>
            <p className="text-muted-foreground">Bu bölmə tezliklə əlavə olunacaq.</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar
        currentUser={currentUser}
        onStatusChange={handleStatusChange}
        onLogout={handleLogout}
        onNavigateHome={() => setActiveSection('dashboard')}
      />
      <div className="flex-1 flex overflow-hidden">
        <CSMSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          userRole={currentUser.role}
        />
        <main className="flex-1 overflow-auto pb-20">
          {renderContent()}
        </main>
        <RightPanel
          currentUser={currentUser}
          selectedVisitor={selectedVisitor}
          availableTags={tags}
          onAddTag={() => {}}
          onCreateTag={(name, color) => setTags([...tags, { id: `tag-${Date.now()}`, name, color, createdBy: currentUser.id, createdAt: new Date().toISOString() }])}
        />
      </div>
      <BottomBar
        userStatus={currentUser.status}
        queueItems={queueItems}
        myTickets={myTickets}
        onAcceptQueue={handleAcceptQueue}
        onRejectQueue={(id) => setQueueItems(queueItems.filter(q => q.id !== id))}
        onAcceptTicket={(id) => handleTicketStatusChange(id, 'open')}
        onRejectTicket={() => {}}
        onOpenTicket={setSelectedTicket}
      />
    </div>
  );
};

export default CSMPanel;
