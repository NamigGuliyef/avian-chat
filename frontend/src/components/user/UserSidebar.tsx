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
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  Edit2,
  FolderOpen,
  Inbox,
  Plus,
  Trash2,
  Users,
  X
} from 'lucide-react';
import React, { useState } from 'react';

const UserSidebar: React.FC = () => {
  const { currentUser, logout, activeSection, setActiveSection, folders, addFolder, updateFolder, deleteFolder } = useChat();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
      <div
        className={cn(
          'bg-background border-r border-border flex flex-col transition-all duration-300 h-full',
          sidebarCollapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <svg width="32" height="32" viewBox="0 0 32 32" className="text-primary">
                <path
                  fill="currentColor"
                  d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 4c5.523 0 10 4.477 10 10 0 2.4-.845 4.6-2.254 6.324L8.676 7.254A9.945 9.945 0 0116 6zm0 20c-5.523 0-10-4.477-10-10 0-2.4.845-4.6 2.254-6.324l15.07 15.07A9.945 9.945 0 0116 26z"
                />
              </svg>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className={cn(sidebarCollapsed && 'mx-auto')}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 flex flex-col p-2 gap-1 overflow-y-auto">
          <Button
            variant="ghost"
            className={cn(
              'w-full flex items-center justify-start gap-3 px-3',
              sidebarCollapsed && 'justify-center',
              activeSection === 'inbox'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            onClick={() => setActiveSection('inbox')}
            title={sidebarCollapsed ? 'Inbox' : undefined}
          >
            <Inbox className="h-5 w-5" />
            {!sidebarCollapsed && 'Inbox'}
          </Button>
          <Button
            variant="ghost"
            className={cn(
              'w-full flex items-center justify-start gap-3 px-3',
              sidebarCollapsed && 'justify-center',
              activeSection === 'contacts'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            onClick={() => setActiveSection('contacts')}
            title={sidebarCollapsed ? 'Contacts' : undefined}
          >
            <Users className="h-5 w-5" />
            {!sidebarCollapsed && 'Contacts'}
          </Button>

          {/* Reports */}
          <Button
            variant="ghost"
            className={cn(
              'w-full flex items-center justify-start gap-3 px-3',
              sidebarCollapsed && 'justify-center',
              activeSection === 'reports'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            onClick={() => setActiveSection('reports')}
            title={sidebarCollapsed ? 'Reports' : undefined}
          >
            <BarChart3 className="h-5 w-5" />
            {!sidebarCollapsed && 'Reports'}
          </Button>

          {/* Folders Section */}
          <Collapsible open={foldersOpen} onOpenChange={setFoldersOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full flex justify-between items-center px-3',
                  sidebarCollapsed && 'justify-center',
                  activeSection.startsWith('folder-')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                title={sidebarCollapsed ? 'Folders' : undefined}
              >
                {!sidebarCollapsed && (
                  <span className="flex items-center gap-3">
                    <FolderOpen className="h-5 w-5" />
                    Folders
                  </span>
                )}
                {!sidebarCollapsed ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs">({folders.length})</span>
                    {foldersOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                ) : (
                  <FolderOpen className="h-5 w-5" />
                )}
              </Button>
            </CollapsibleTrigger>
            {!sidebarCollapsed && (
              <CollapsibleContent className="space-y-1 mt-1 ml-2">
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
                      'group flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-muted rounded-md ml-2',
                      activeSection === `folder-${folder.id}` && 'bg-muted'
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
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateFolder(folder.id);
                          }}
                        >
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
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(folder);
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFolder(folder.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            )}
          </Collapsible>
        </nav>
      </div>
    </TooltipProvider>
  );
};

export default UserSidebar;
