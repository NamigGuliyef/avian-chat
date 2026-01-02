import { useChat } from '@/contexts/ChatContext';
import React, { useState } from 'react';
import ChatbotsManagement from '../admin/ChatbotsManagement';
import ChatPanel from '../admin/ChatPanel';
import ContactsPage from '../admin/ContactsPage';
import ConversationList from '../admin/ConversationList';
import ReportsPage from '../admin/ReportsPage';
import VisitorDetails from '../admin/VisitorDetails';
import UserSidebar from './UserSidebar';

const UserDashboard: React.FC = () => {
  const { activeSection } = useChat();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const renderContent = () => {
    switch (activeSection) {
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

  React.useEffect(() => {
    if (activeSection.startsWith('folder-')) {
      const folderId = activeSection.replace('folder-', '');
      setSelectedFolderId(folderId);
    } else if (activeSection === 'inbox') {
      setSelectedFolderId(null);
    }
  }, [activeSection]);

  return (
    <>
      <UserSidebar />
      {renderContent()}
    </>
  );
};

export default UserDashboard;
