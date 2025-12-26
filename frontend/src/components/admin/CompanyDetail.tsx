import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { Company, UserRole } from '@/types/chat';
import {
  ArrowLeft,
  Folder,
  Plus,
  Radio,
  Trash2,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

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
    addChannel,
    updateChannel,
    deleteChannel
  } = useChat();

  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);

  const [channelForm, setChannelForm] = useState({ name: '' });
  const companyUsers = users.filter(u => u.companyId === company.id);
  const companyChannels = company.channels || [];

  const resetChannelForm = () => {
    setChannelForm({ name: '' });
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
          <TabsTrigger value="projects" className="gap-2">
            <Folder className="w-4 h-4" />
            Layihələr
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
                </CardContent>
              </Card>
            ))}
            {companyUsers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Bu şirkətdə heç bir agent yoxdur</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="projects">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Layiheler</h3>
              <p className="text-sm text-muted-foreground">Bu şirkətə bağlı layiheler</p>
            </div>
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
                </CardContent>
              </Card>
            ))}
            {companyUsers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Bu şirkətdə heç bir layihe`` yoxdur</p>
            )}
          </div>

        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyDetail;