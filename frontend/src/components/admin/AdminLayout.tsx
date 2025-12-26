import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ConversationList from './ConversationList';
import ChatPanel from './ChatPanel';
import VisitorDetails from './VisitorDetails';
import UsersManagement from './UsersManagement';
import CompaniesManagement from './CompaniesManagement';
import ContactsPage from './ContactsPage';
import ReportsPage from './ReportsPage';
import ChatbotsManagement from './ChatbotsManagement';
import { useChat } from '@/contexts/ChatContext';

const AdminLayout: React.FC = () => {
  const { activeSection, folders } = useChat();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UsersManagement />;
      case 'companies':
        return <CompaniesManagement />;
      case 'contacts':
        return <ContactsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'chatbots':
        return <ChatbotsManagement />;
      case 'inbox':
      default:
        return (
          <>
            <ConversationList selectedFolderId={selectedFolderId} />
            <ChatPanel />
            <VisitorDetails />
          </>
        );
    }
  };

  // Handle folder section clicks
  React.useEffect(() => {
    if (activeSection.startsWith('folder-')) {
      const folderId = activeSection.replace('folder-', '');
      setSelectedFolderId(folderId);
    } else if (activeSection === 'inbox') {
      setSelectedFolderId(null);
    }
  }, [activeSection]);

  return (
    <div className="h-full min-h-0 flex bg-background">
      <Sidebar />
      {renderContent()}
    </div>
  );
};

export default AdminLayout;
