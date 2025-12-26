import React, { useState } from 'react';
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Radio,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useChat } from '@/contexts/ChatContext';
import { Company, Channel, User, UserRole } from '@/types/chat';

interface CompanyDetailProps {
  company: Company;
  onBack: () => void;
}

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  supervayzer: 'Supervayzer',
  agent: 'Agent',
  partner: 'Partner',
};

const CompanyDetail: React.FC<CompanyDetailProps> = ({ company, onBack }) => {
  const { 
    users, 
    updateUser, 
    deleteUser, 
    addChannel, 
    updateChannel, 
    deleteChannel
  } = useChat();
  
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [channelForm, setChannelForm] = useState({ name: '' });
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [supervisorSearchQuery, setSupervisorSearchQuery] = useState('');

  const companyUsers = users.filter(u => u.companyId === company.id);
  const companyChannels = company.channels || [];
  
  // Get all supervisors
  const allSupervisors = users.filter(u => u.role === 'supervayzer');
  
  // Get all agents that are NOT already in this company (available to add)
  const availableAgents = users.filter(u => 
    u.role === 'agent' && u.companyId !== company.id
  );

  const resetChannelForm = () => {
    setChannelForm({ name: '' });
  };

  const resetUserForm = () => {
    setSelectedSupervisorId('');
    setSelectedAgentIds([]);
    setSelectedChannelIds([]);
    setEditingUser(null);
    setAgentSearchQuery('');
    setSupervisorSearchQuery('');
  };

  const handleAddChannel = () => {
    if (!channelForm.name) {
      toast.error('Kanal adını daxil edin');
      return;
    }
    addChannel(company.id, {
      name: channelForm.name.toLowerCase().replace(/\s+/g, '-'),
      isActive: true
    });
    toast.success('Kanal yaradıldı');
    resetChannelForm();
    setIsChannelDialogOpen(false);
  };

  const handleToggleChannel = (channelId: string, isActive: boolean) => {
    updateChannel(company.id, channelId, { isActive: !isActive });
    toast.success(isActive ? 'Kanal deaktiv edildi' : 'Kanal aktiv edildi');
  };

  const handleDeleteChannel = (channelId: string) => {
    deleteChannel(company.id, channelId);
    toast.success('Kanal silindi');
  };

  // Add selected agents to company
  const handleAddAgents = () => {
    if (selectedAgentIds.length === 0) {
      toast.error('Ən azı bir agent seçin');
      return;
    }
    
    selectedAgentIds.forEach(agentId => {
      updateUser(agentId, { 
        companyId: company.id,
        channelIds: selectedChannelIds
      });
    });
    
    toast.success(`${selectedAgentIds.length} agent əlavə edildi`);
    resetUserForm();
    setIsUserDialogOpen(false);
  };

  const handleUpdateUserChannels = () => {
    if (!editingUser) return;
    updateUser(editingUser, {
      channelIds: selectedChannelIds
    });
    toast.success('Agent yeniləndi');
    resetUserForm();
    setIsUserDialogOpen(false);
  };

  const startEditUser = (user: User) => {
    setSelectedChannelIds(user.channelIds || []);
    setEditingUser(user.id);
    setIsUserDialogOpen(true);
  };

  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgentIds(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId) 
        : [...prev, agentId]
    );
  };

  const toggleChannelForUser = (channelId: string) => {
    setSelectedChannelIds(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId) 
        : [...prev, channelId]
    );
  };

  // Remove agent from company
  const handleRemoveAgent = (userId: string) => {
    updateUser(userId, { companyId: undefined, channelIds: [] });
    toast.success('Agent şirkətdən çıxarıldı');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{company.name}</h2>
          <p className="text-sm text-muted-foreground">{company.domain}</p>
        </div>
      </div>

      {/* Tabs - Only Channels and Users */}
      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="channels" className="gap-2">
            <Radio className="w-4 h-4" />
            Kanallar
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            İstifadəçilər
          </TabsTrigger>
        </TabsList>

        {/* Channels Tab */}
        <TabsContent value="channels">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Kanallar</h3>
              <p className="text-sm text-muted-foreground">Mesaj mənbələrini idarə edin</p>
            </div>
            <Dialog open={isChannelDialogOpen} onOpenChange={(open) => {
              setIsChannelDialogOpen(open);
              if (!open) resetChannelForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Kanal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Kanal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Kanal adı</Label>
                    <Input
                      value={channelForm.name}
                      onChange={(e) => setChannelForm({ name: e.target.value })}
                      placeholder="instagram, facebook, whatsapp..."
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddChannel}>
                    Yarat
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {companyChannels.map((channel) => (
              <Card key={channel.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      channel.isActive ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                    )}>
                      <Radio className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {channel.isActive ? 'Aktiv' : 'Deaktiv'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={channel.isActive} 
                      onCheckedChange={() => handleToggleChannel(channel.id, channel.isActive)}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteChannel(channel.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {companyChannels.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Heç bir kanal yoxdur</p>
            )}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Agentlər</h3>
              <p className="text-sm text-muted-foreground">Bu şirkətə bağlı istifadəçilər</p>
            </div>
            <Dialog open={isUserDialogOpen} onOpenChange={(open) => {
              setIsUserDialogOpen(open);
              if (!open) resetUserForm();
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetUserForm(); setEditingUser(null); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agent Əlavə Et
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Agent Kanal İcazələri' : 'Agent Seç'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {!editingUser ? (
                    <>
                      <div>
                        <Label className="mb-2 block">Əvvəlcə supervayzer seçin</Label>
                        <p className="text-xs text-muted-foreground mb-2">Agentin hansı supervayzerə aid olacağını seçin</p>
                        <Input
                          placeholder="Supervayzer axtar..."
                          className="mb-2"
                          value={supervisorSearchQuery}
                          onChange={(e) => setSupervisorSearchQuery(e.target.value)}
                        />
                        <ScrollArea className="h-32 border rounded-lg p-2 overflow-y-auto">
                          {allSupervisors
                            .filter(sup => {
                              const searchTerm = supervisorSearchQuery.toLowerCase();
                              return sup.name.toLowerCase().includes(searchTerm) || sup.email.toLowerCase().includes(searchTerm);
                            })
                            .map((sup) => (
                            <div 
                              key={sup.id} 
                              className={`flex items-center gap-3 py-2 px-2 hover:bg-muted rounded-md cursor-pointer ${selectedSupervisorId === sup.id ? 'bg-primary/10 border border-primary' : ''}`}
                              onClick={() => { setSelectedSupervisorId(sup.id); setSelectedAgentIds([]); }}
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                                {sup.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{sup.name}</p>
                                <p className="text-xs text-muted-foreground">{sup.email}</p>
                              </div>
                            </div>
                          ))}
                          {allSupervisors.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Supervayzer yoxdur</p>
                          )}
                        </ScrollArea>
                      </div>

                      {selectedSupervisorId && (
                        <div>
                          <Label className="mb-2 block">İndi agentlərdən seçin</Label>
                          <p className="text-xs text-muted-foreground mb-2">Bu supervayzerə aid olan agentlərdən seçin</p>
                          <Input
                            placeholder="Agent axtar..."
                            className="mb-2"
                            value={agentSearchQuery}
                            onChange={(e) => setAgentSearchQuery(e.target.value)}
                          />
                          <ScrollArea className="h-48 border rounded-lg p-2 overflow-y-auto">
                            {availableAgents.length > 0 ? (
                              availableAgents
                                .filter(agent => {
                                  const searchTerm = agentSearchQuery.toLowerCase();
                                  return agent.name.toLowerCase().includes(searchTerm) || agent.email.toLowerCase().includes(searchTerm);
                                })
                                .map((agent) => (
                                <div key={agent.id} className="flex items-center gap-3 py-2 px-2 hover:bg-muted rounded-md">
                                  <Checkbox
                                    id={`agent-${agent.id}`}
                                    checked={selectedAgentIds.includes(agent.id)}
                                    onCheckedChange={() => toggleAgentSelection(agent.id)}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                                      {agent.name.charAt(0)}
                                    </div>
                                    <div>
                                      <label htmlFor={`agent-${agent.id}`} className="text-sm font-medium cursor-pointer">
                                        {agent.name}
                                      </label>
                                      <p className="text-xs text-muted-foreground">{agent.email}</p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">Bu supervayzerə aid agent yoxdur</p>
                            )}
                          </ScrollArea>
                        </div>
                      )}
                      
                      {companyChannels.length > 0 && selectedAgentIds.length > 0 && (
                        <div>
                          <Label className="mb-2 block">Kanal icazələri</Label>
                          <p className="text-xs text-muted-foreground mb-2">Seçilmiş agentlər hansı kanallardan mesaj ala bilər?</p>
                          <div className="space-y-2 p-3 bg-muted rounded-lg max-h-32 overflow-y-auto">
                            {companyChannels.map((channel) => (
                              <div key={channel.id} className="flex items-center gap-2">
                                <Checkbox
                                  id={`ch-${channel.id}`}
                                  checked={selectedChannelIds.includes(channel.id)}
                                  onCheckedChange={() => toggleChannelForUser(channel.id)}
                                />
                                <label htmlFor={`ch-${channel.id}`} className="text-sm cursor-pointer">
                                  {channel.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <Button className="w-full" onClick={handleAddAgents} disabled={selectedAgentIds.length === 0}>
                        {selectedAgentIds.length > 0 ? `${selectedAgentIds.length} Agent Əlavə Et` : 'Agent Seçin'}
                      </Button>
                    </>
                  ) : (
                    <>
                      {companyChannels.length > 0 && (
                        <div>
                          <Label className="mb-2 block">Kanal icazələri</Label>
                          <p className="text-xs text-muted-foreground mb-2">Bu agent hansı kanallardan gələn mesajlara cavab verə bilər?</p>
                          <div className="space-y-2 p-3 bg-muted rounded-lg max-h-32 overflow-y-auto">
                            {companyChannels.map((channel) => (
                              <div key={channel.id} className="flex items-center gap-2">
                                <Checkbox
                                  id={`edit-ch-${channel.id}`}
                                  checked={selectedChannelIds.includes(channel.id)}
                                  onCheckedChange={() => toggleChannelForUser(channel.id)}
                                />
                                <label htmlFor={`edit-ch-${channel.id}`} className="text-sm cursor-pointer">
                                  {channel.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <Button className="w-full" onClick={handleUpdateUserChannels}>
                        Yenilə
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {companyUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {roleLabels[user.role]}
                        </Badge>
                        {(user.channelIds || []).map(chId => {
                          const ch = companyChannels.find(c => c.id === chId);
                          return ch ? (
                            <Badge key={chId} variant="outline" className="text-xs">
                              {ch.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => startEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveAgent(user.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {companyUsers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Bu şirkətdə heç bir agent yoxdur</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyDetail;