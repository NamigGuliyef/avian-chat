import React, { useState } from 'react';
import { Plus, FolderOpen, Edit2, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

interface FoldersPanelProps {
  selectedFolderId?: string;
  onSelectFolder: (folderId: string | undefined) => void;
}

const FoldersPanel: React.FC<FoldersPanelProps> = ({ selectedFolderId, onSelectFolder }) => {
  const { folders, addFolder, updateFolder, deleteFolder } = useChat();
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

  return (
    <div className="py-2">
      <div className="px-3 mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Papkalar</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isAdding && (
        <div className="px-3 mb-2 flex items-center gap-1">
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

      <div className="space-y-1">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={cn(
              "group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-sidebar-accent rounded-md mx-2",
              selectedFolderId === folder.id && "bg-sidebar-accent"
            )}
            onClick={() => onSelectFolder(selectedFolderId === folder.id ? undefined : folder.id)}
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
                  <span className="text-sm text-foreground">{folder.name}</span>
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
      </div>
    </div>
  );
};

export default FoldersPanel;
