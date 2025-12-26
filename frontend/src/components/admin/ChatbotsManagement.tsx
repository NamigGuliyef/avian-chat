import React, { useState } from 'react';
import { Search, Bot, Globe, User, Pencil, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import ChatbotFlowBuilder from './ChatbotFlowBuilder';

interface Chatbot {
  id: string;
  name: string;
  isActive: boolean;
  channel: string;
  author: string;
  status: 'up-to-date' | 'outdated';
}

const mockChatbots: Chatbot[] = [
  {
    id: '1',
    name: 'Mədəniyyət Nazirliyi',
    isActive: true,
    channel: 'webchat',
    author: 'Whelp Team',
    status: 'up-to-date',
  },
];

const templates = [
  {
    id: 'demo',
    name: 'Demo chatbot',
    description: 'This chatbot is for demo...',
    image: '/placeholder.svg',
  },
];

type ViewMode = 'list' | 'templates' | 'editor';

const ChatbotsManagement: React.FC = () => {
  const [chatbots, setChatbots] = useState<Chatbot[]>(mockChatbots);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newChatbotName, setNewChatbotName] = useState('');
  const [selectedChatbotId, setSelectedChatbotId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setChatbots(prev => prev.map(bot => 
      bot.id === id ? { ...bot, isActive: !bot.isActive } : bot
    ));
  };

  const handleDelete = (id: string) => {
    setChatbots(prev => prev.filter(bot => bot.id !== id));
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newBot: Chatbot = {
        id: `chatbot-${Date.now()}`,
        name: template.name,
        isActive: false,
        channel: 'webchat',
        author: 'User',
        status: 'up-to-date',
      };
      setChatbots(prev => [...prev, newBot]);
      setViewMode('list');
    }
  };

  const handleCreateNew = () => {
    if (!newChatbotName.trim()) return;
    const newBot: Chatbot = {
      id: `chatbot-${Date.now()}`,
      name: newChatbotName,
      isActive: false,
      channel: 'webchat',
      author: 'User',
      status: 'up-to-date',
    };
    setChatbots(prev => [...prev, newBot]);
    setNewChatbotName('');
    setIsDialogOpen(false);
    // Open editor for the new chatbot
    setSelectedChatbotId(newBot.id);
    setViewMode('editor');
  };

  const handleEditChatbot = (id: string) => {
    setSelectedChatbotId(id);
    setViewMode('editor');
  };

  // Flow Builder Editor View
  if (viewMode === 'editor') {
    const selectedBot = chatbots.find(b => b.id === selectedChatbotId);
    return (
      <div className="flex-1 flex flex-col h-full">
        {/* Back Header */}
        <div className="h-12 border-b border-border flex items-center px-4 bg-background shrink-0">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri qayıt
          </Button>
          <span className="ml-4 font-medium">{selectedBot?.name || 'Chatbot'}</span>
        </div>
        {/* Flow Builder */}
        <div className="flex-1 min-h-0">
          <ChatbotFlowBuilder />
        </div>
      </div>
    );
  }

  if (viewMode === 'templates') {
    return (
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">Create chatbot from template</h1>
          <Button variant="link" onClick={() => setViewMode('list')} className="text-primary">
            Back to projects
          </Button>
        </div>

        {/* Templates Grid */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="h-40 bg-muted flex items-center justify-center">
                  <Bot className="h-16 w-16 text-primary" />
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold">Chatbots</h1>
        <div className="flex items-center gap-2">
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setViewMode('templates')}
          >
            New from template
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsDialogOpen(true)}
          >
            New chatbot
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-muted/50 sticky top-0">
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                  Status
                </div>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Chatbot Name
                </div>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Channels
                </div>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Author
                </div>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Changes
                </div>
              </th>
              <th className="w-32"></th>
            </tr>
          </thead>
          <tbody>
            {chatbots
              .filter(bot => bot.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((bot) => (
                <tr 
                  key={bot.id} 
                  className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleEditChatbot(bot.id)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={bot.isActive}
                      onCheckedChange={() => handleToggle(bot.id)}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium">{bot.name}</td>
                  <td className="px-6 py-4">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-yellow-200 flex items-center justify-center text-xs font-medium">
                        W
                      </div>
                      <span className="text-sm">{bot.author}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {bot.status === 'up-to-date' ? 'Up-to-date' : 'Outdated'}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditChatbot(bot.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(bot.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {chatbots.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bot className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No chatbots yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first chatbot to get started.</p>
            <Button onClick={() => setViewMode('templates')}>
              Create from template
            </Button>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Chatbot</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="chatbot-name">Chatbot Name</Label>
            <Input
              id="chatbot-name"
              value={newChatbotName}
              onChange={(e) => setNewChatbotName(e.target.value)}
              placeholder="Enter chatbot name"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNew}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatbotsManagement;
