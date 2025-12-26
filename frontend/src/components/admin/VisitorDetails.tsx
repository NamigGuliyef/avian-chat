import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  User, 
  Monitor, 
  Smartphone,
  Languages,
  Link2,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  MessageCircle,
  Save,
  X
} from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface VisitorField {
  icon: React.ElementType;
  label: string;
  key: string;
  value: string;
  editable: boolean;
}

const VisitorDetails: React.FC = () => {
  const { activeConversation, setActiveConversation } = useChat();
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [channelsOpen, setChannelsOpen] = useState(true);

  useEffect(() => {
    if (activeConversation) {
      setEditedFields({});
      setHasChanges(false);
      setTags(activeConversation.tags || []);
    }
  }, [activeConversation?.id]);

  if (!activeConversation) {
    return (
      <div className="w-80 border-l border-border bg-card flex items-center justify-center h-full">
        <div className="text-center px-4">
          <div className="w-32 h-32 mx-auto mb-4 opacity-50">
            <svg viewBox="0 0 100 100" className="w-full h-full text-muted-foreground">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <rect x="25" y="30" width="50" height="8" rx="2" fill="currentColor" opacity="0.2" />
              <rect x="25" y="45" width="40" height="6" rx="2" fill="currentColor" opacity="0.2" />
              <rect x="25" y="58" width="45" height="6" rx="2" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  const { visitor, trigger, channel } = activeConversation;

  const getFieldValue = (key: string, defaultValue: string) => {
    if (editedFields[key] !== undefined) return editedFields[key];
    return defaultValue;
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditedFields(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast.success('Məlumatlar yadda saxlanıldı');
    setHasChanges(false);
  };

  // Tags state and handlers
  const [tags, setTags] = useState<string[]>(activeConversation?.tags || []);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const tag = newTag.trim();
    setTags(prev => [...prev, tag]);
    // Update active conversation locally
    if (activeConversation) {
      const updated = { ...activeConversation, tags: [...(activeConversation.tags || []), tag] };
      setActiveConversation(updated);
    }
    setNewTag('');
    toast.success('Tag əlavə edildi');
  };

  const handleRemoveTag = (index: number) => {
    setTags(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (activeConversation) {
        const updated = { ...activeConversation, tags: next };
        setActiveConversation(updated);
      }
      toast.success('Tag silindi');
      return next;
    });
  };

  const detailItems: VisitorField[] = [
    { icon: MessageCircle, label: 'Conversation', key: 'conversationId', value: `#${visitor.visitorId}`, editable: false },
    { icon: Mail, label: 'Email', key: 'email', value: 'Unknown', editable: true },
    { icon: Phone, label: 'Phone', key: 'phone', value: 'Unknown', editable: true },
    { icon: Globe, label: 'Is EU contact', key: 'isEu', value: 'Unknown', editable: true },
    { icon: Calendar, label: 'First seen', key: 'firstSeen', value: formatDistanceToNow(visitor.createdAt, { addSuffix: true }), editable: false },
    { icon: Calendar, label: 'Last seen', key: 'lastSeen', value: formatDistanceToNow(visitor.lastSeenAt, { addSuffix: true }), editable: false },
    { icon: User, label: 'Gender', key: 'gender', value: 'Unknown', editable: true },
    { icon: Smartphone, label: 'Device', key: 'device', value: 'Unknown', editable: true },
    { icon: Monitor, label: 'OS', key: 'os', value: visitor.metadata?.os || 'Unknown', editable: true },
    { icon: Languages, label: 'Languages', key: 'languages', value: 'Unknown', editable: true },
    { icon: Link2, label: 'Livechat Source', key: 'source', value: 'Unknown', editable: true },
    { icon: UserCheck, label: 'Authenticated', key: 'authenticated', value: 'Unknown', editable: true },
  ];

  return (
    <div className="w-80 border-l border-border bg-card overflow-y-auto scrollbar-thin h-full">
      {/* Visitor Header */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col items-center">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-medium mb-3",
            activeConversation.status === 'open' ? "bg-status-online" : "bg-orange-500"
          )}>
            {visitor.visitorId.charAt(1)}
          </div>
          <h3 className="font-semibold text-lg">Visitor #{visitor.visitorId}</h3>
        </div>
      </div>

      {/* Details Section - Collapsible */}
      <div className="border-b border-border">
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium hover:bg-muted/50 transition-colors">
              <span>Details</span>
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-muted-foreground" />
                {detailsOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              {detailItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-muted-foreground block mb-1">{item.label}</span>
                    {item.editable ? (
                      <Input
                        value={getFieldValue(item.key, item.value)}
                        onChange={(e) => handleFieldChange(item.key, e.target.value)}
                        className="h-8 text-sm"
                        placeholder={item.value}
                      />
                    ) : (
                      <span className="text-sm">{item.value}</span>
                    )}
                  </div>
                </div>
              ))}

              {hasChanges && (
                <Button onClick={handleSave} className="w-full mt-4" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Yadda saxla
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Channels Section - Collapsible */}
      <div className="border-b border-border">
        <Collapsible open={channelsOpen} onOpenChange={setChannelsOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium hover:bg-muted/50 transition-colors">
              <span>Channels</span>
              {channelsOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md">
                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                </div>
                <span className="text-sm">Livechat</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Trigger Info */}
      {trigger && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Trigger:</span>
            <span className="font-medium">{trigger.name}</span>
          </div>
        </div>
      )}

      {/* Tags Section - added after Trigger */}
      <div className="px-4 py-3 border-t border-border">
        <div className="text-sm text-muted-foreground mb-2">Tag-lər</div>
        <div className="flex gap-2 mb-2">
          <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Tag əlavə et" onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} />
          <Button size="sm" onClick={handleAddTag}><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="gap-1">{tag}<X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(i)} /></Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisitorDetails;
