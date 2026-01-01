import { useChat } from '@/contexts/ChatContext';
import React, { useState } from 'react';
import ChatbotsManagement from './ChatbotsManagement';
import ChatPanel from './ChatPanel';
import ContactsPage from './ContactsPage';
import ConversationList from './ConversationList';
import ReportsPage from './ReportsPage';
import Sidebar from './Sidebar';
import UsersManagement from './UsersManagement';
import VisitorDetails from './VisitorDetails';

const AdminLayout: React.FC = () => {
  const { activeSection, folders } = useChat();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UsersManagement />;
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
