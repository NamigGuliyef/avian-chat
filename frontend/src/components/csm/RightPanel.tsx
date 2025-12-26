import React, { useState } from 'react';
import { User, Clock, Plus, X, Facebook, Instagram, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CSMUser, VisitorInfo, Tag, UserStatus } from '@/types/csm';

interface RightPanelProps {
  currentUser: CSMUser;
  selectedVisitor?: VisitorInfo;
  availableTags: Tag[];
  onVisitorUpdate?: (visitor: VisitorInfo) => void;
  onAddTag?: (visitorId: string, tagId: string) => void;
  onCreateTag?: (name: string, color: string) => void;
}

const statusColors: Record<UserStatus, string> = {
  available: 'bg-green-500',
  busy: 'bg-red-500',
  break: 'bg-yellow-500',
  offline: 'bg-gray-400',
};

const RightPanel: React.FC<RightPanelProps> = ({
  currentUser,
  selectedVisitor,
  availableTags,
  onVisitorUpdate,
  onAddTag,
  onCreateTag,
}) => {
  const [editingVisitor, setEditingVisitor] = useState<VisitorInfo | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [showTagForm, setShowTagForm] = useState(false);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}s ${mins}d`;
  };

  const handleCreateTag = () => {
    if (newTagName.trim() && onCreateTag) {
      onCreateTag(newTagName.trim(), '#3B82F6');
      setNewTagName('');
      setShowTagForm(false);
    }
  };

  return (
    <aside className="w-[300px] bg-card border-l border-border flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* My Profile Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                My Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {currentUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className={cn(
                    'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card',
                    statusColors[currentUser.status]
                  )} />
                </div>
                <div>
                  <p className="font-medium text-sm">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{currentUser.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">Online</span>
                  </div>
                  <p className="font-semibold text-sm">{formatDuration(currentUser.onlineDuration || 0)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground mb-1">Aktiv ticket</p>
                  <p className="font-semibold text-sm">{currentUser.activeTickets}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Kapasite</span>
                  <span className="font-medium">{currentUser.capacityPercent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all",
                      currentUser.capacityPercent > 80 ? "bg-destructive" : 
                      currentUser.capacityPercent > 60 ? "bg-yellow-500" : "bg-primary"
                    )}
                    style={{ width: `${currentUser.capacityPercent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visitor Info Panel */}
          {selectedVisitor && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Müştəri məlumatları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Ad Soyad</Label>
                    <Input 
                      value={editingVisitor?.name || selectedVisitor.name} 
                      onChange={(e) => setEditingVisitor({ ...selectedVisitor, name: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Mobil nömrə</Label>
                    <Input 
                      value={editingVisitor?.phone || selectedVisitor.phone || ''} 
                      onChange={(e) => setEditingVisitor({ ...selectedVisitor, phone: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Cins</Label>
                    <Select 
                      value={editingVisitor?.gender || selectedVisitor.gender || ''}
                      onValueChange={(v) => setEditingVisitor({ ...selectedVisitor, gender: v as 'male' | 'female' | 'other' })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Kişi</SelectItem>
                        <SelectItem value="female">Qadın</SelectItem>
                        <SelectItem value="other">Digər</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Location</Label>
                    <Input 
                      value={editingVisitor?.location || selectedVisitor.location || ''} 
                      onChange={(e) => setEditingVisitor({ ...selectedVisitor, location: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Social Profiles */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    <Input 
                      placeholder="Facebook profil"
                      value={editingVisitor?.facebookProfile || selectedVisitor.facebookProfile || ''} 
                      onChange={(e) => setEditingVisitor({ ...selectedVisitor, facebookProfile: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-600" />
                    <Input 
                      placeholder="Instagram profil"
                      value={editingVisitor?.instagramProfile || selectedVisitor.instagramProfile || ''} 
                      onChange={(e) => setEditingVisitor({ ...selectedVisitor, instagramProfile: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    <Input 
                      placeholder="WhatsApp"
                      value={editingVisitor?.whatsapp || selectedVisitor.whatsapp || ''} 
                      onChange={(e) => setEditingVisitor({ ...selectedVisitor, whatsapp: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {editingVisitor && (
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      onVisitorUpdate?.(editingVisitor);
                      setEditingVisitor(null);
                    }}
                  >
                    Yadda saxla
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tags Panel */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Tag-lər</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setShowTagForm(!showTagForm)}
                >
                  {showTagForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {showTagForm && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Yeni tag adı"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="h-8 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                  />
                  <Button size="sm" className="h-8" onClick={handleCreateTag}>
                    Əlavə et
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}
                    onClick={() => selectedVisitor && onAddTag?.(selectedVisitor.id, tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>

              {selectedVisitor && selectedVisitor.tags.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Seçilmiş tag-lər:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedVisitor.tags.map((tagName, idx) => (
                      <Badge key={idx} variant="default" className="text-xs">
                        {tagName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default RightPanel;
