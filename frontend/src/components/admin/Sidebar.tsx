import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  Edit2,
  FolderOpen,
  Inbox,
  Plus,
  Trash2,
  Users,
  X
} from 'lucide-react';
import React, { useState } from 'react';

const Sidebar: React.FC = () => {
  const { currentUser, logout, activeSection, setActiveSection, folders, addFolder, updateFolder, deleteFolder } = useChat();
  const [inboxOpen, setInboxOpen] = useState(true);
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    addFolder(newFolderName.trim());
    setNewFolderName('');
    setIsAdding(false);
  };

  const handleUpdateFolder = (folderId: string) => {
    if (!editName.trim()) return;
    updateFolder(folderId, editName.trim());
    setEditingId(null);
    setEditName('');
  };

  const startEdit = (folder: { id: string; name: string }) => {
    setEditingId(folder.id);
    setEditName(folder.name);
  };

  const handleFolderClick = (folderId: string) => {
    setActiveSection(`folder-${folderId}`);
  };

  return (
    <TooltipProvider>
      <div className="w-56 bg-background border-r border-border flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <svg width="32" height="32" viewBox="0 0 32 32" className="text-primary">
            <path
              fill="currentColor"
              d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 4c5.523 0 10 4.477 10 10 0 2.4-.845 4.6-2.254 6.324L8.676 7.254A9.945 9.945 0 0116 6zm0 20c-5.523 0-10-4.477-10-10 0-2.4.845-4.6 2.254-6.324l15.07 15.07A9.945 9.945 0 0116 26z"
            />
          </svg>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 flex flex-col p-2 gap-1 overflow-y-auto">
          {/* Inbox - simple link to All */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 px-3",
              activeSection === 'inbox'
                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            onClick={() => setActiveSection('inbox')}
          >
            <Inbox className="h-5 w-5" />
            Inbox
          </Button>

          {/* Contacts */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 px-3",
              activeSection === 'contacts' 
                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            onClick={() => setActiveSection('contacts')}
          >
            <Users className="h-5 w-5" />
            Contacts
          </Button>

          {/* Reports */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 px-3",
              activeSection === 'reports' 
                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            onClick={() => setActiveSection('reports')}
          >
            <BarChart3 className="h-5 w-5" />
            Reports
          </Button>

          {/* Chatbots
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 px-3",
              activeSection === 'chatbots' 
                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            onClick={() => setActiveSection('chatbots')}
          >
            <Bot className="h-5 w-5" />
            Chatbots
          </Button> */}

          {/* Folders Section - under Reports */}
          <Collapsible open={foldersOpen} onOpenChange={setFoldersOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-between px-3",
                  activeSection.startsWith('folder-')
                    ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <span className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5" />
                  Folders
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs">({folders.length})</span>
                  {foldersOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1 ml-2">
              {/* Add Folder Button */}
              {!isAdding ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground pl-6"
                  onClick={() => setIsAdding(true)}
                >
                  <Plus className="h-4 w-4" />
                  Yeni papka
                </Button>
              ) : (
                <div className="flex items-center gap-1 px-2">
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Papka adı"
                    className="h-8 text-sm"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleAddFolder}>
                    <Check className="h-4 w-4 text-primary" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsAdding(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Folder List */}
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={cn(
                    "group flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-muted rounded-md ml-2",
                    activeSection === `folder-${folder.id}` && "bg-muted"
                  )}
                  onClick={() => handleFolderClick(folder.id)}
                >
                  {editingId === folder.id ? (
                    <div className="flex items-center gap-1 flex-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') handleUpdateFolder(folder.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleUpdateFolder(folder.id); }}>
                        <Check className="h-3 w-3 text-primary" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{folder.name}</span>
                        <span className="text-xs text-muted-foreground">({folder.conversationIds.length})</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => { e.stopPropagation(); startEdit(folder); }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;
