import { createFlow, createFlowButton, createTrigger, Flow, FlowBlock, FlowButton, getFlowsByChatbotId, getTriggersByChatbotId, Trigger, updateTrigger } from '@/api/chatbot';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ActionType, BlockType } from '@/types/types';
import {
  ArrowRightFromLine,
  Check,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Image,
  MousePointer,
  Plus,
  Send,
  Smile,
  Target,
  Type,
  X,
  Zap
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';


// Block types for the right panel (MVP only)
const blockTypes: Array<{ type: BlockType; label: string; icon: any }> = [
  { type: BlockType.MESSAGE, label: 'Message', icon: Send },
  { type: BlockType.ACTION, label: 'Action', icon: Zap },
  { type: BlockType.GOTO, label: 'Go To Flow', icon: ArrowRightFromLine }
];


const ChatbotFlowBuilder: React.FC = () => {
  const { chatbotId } = useParams()
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string>('salamlama');
  const [flowsExpanded, setFlowsExpanded] = useState(true);
  const [triggersExpanded, setTriggersExpanded] = useState(false);
  const [isAddingFlow, setIsAddingFlow] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);
  const [isDraggingNewBlock, setIsDraggingNewBlock] = useState<BlockType | null>(null);

  // Triggers state
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [isAddingTrigger, setIsAddingTrigger] = useState(false);
  const [selectedTriggerId, setSelectedTriggerId] = useState<string | null>(null);
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);

  const selectedFlow = flows.find((f) => f._id === selectedFlowId);
  const selectedBlock = selectedFlow?.blocks.find((b) => b._id === selectedBlockId);

  useEffect(() => {
    if (chatbotId) {
      getFlowsByChatbotId(chatbotId).then(setFlows);
      getTriggersByChatbotId(chatbotId).then(setTriggers)
    }
  }, [chatbotId])

  // Flow management
  const handleAddFlow = async () => {
    if (!newFlowName.trim()) return;
    const newFlow = await createFlow({ chatbotId, name: newFlowName, blocks: [], isDefault: false })
    setFlows([...flows, newFlow]);
    setNewFlowName('');
    setIsAddingFlow(false);
    setSelectedFlowId(newFlow._id);
    setIsSaved(false);
  };


  // Block management
  const handleAddBlock = useCallback((type: BlockType, insertIndex?: number) => {
    if (!selectedFlow) return;

    const newBlock: FlowBlock = {
      type,
      content: type === 'message' ? '' : undefined,
      buttons: type === 'message' ? [] : undefined,
      targetFlowId: type === 'goto' ? '' : undefined,
      actionType: (type === 'action' ? 'close' : "open") as any // here
    };

    const updatedFlows = flows.map((f) => {
      if (f._id === selectedFlowId) {
        const newBlocks = [...f.blocks];
        if (insertIndex !== undefined) {
          newBlocks.splice(insertIndex, 0, newBlock);
        } else {
          newBlocks.push(newBlock);
        }
        return { ...f, blocks: newBlocks };
      }
      return f;
    });

    setFlows(updatedFlows);
    setSelectedBlockId(newBlock._id);
    setIsSaved(false);
  }, [selectedFlow, flows, selectedFlowId]);

  const handleDeleteBlock = (blockId: string) => {
    const updatedFlows = flows.map((f) =>
      f._id === selectedFlowId
        ? { ...f, blocks: f.blocks.filter((b) => b._id !== blockId) }
        : f
    );
    setFlows(updatedFlows);
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
    setIsSaved(false);
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<FlowBlock>) => {
    const updatedFlows = flows.map((f) =>
      f._id === selectedFlowId
        ? {
          ...f,
          blocks: f.blocks.map((b) => (b._id === blockId ? { ...b, ...updates } : b))
        }
        : f
    );
    setFlows(updatedFlows);
    setIsSaved(false);
  };

  // Button management for message blocks
  const handleAddButton = async (blockId: string) => {
    const block = selectedFlow?.blocks.find((b) => b._id === blockId);
    if (!block) return;

    const newButton: FlowButton = await createFlowButton({
      label: 'Yeni düymə',
      goToFlowId: selectedFlowId
    });

    handleUpdateBlock(blockId, {
      buttons: [...(block.buttons || []), newButton]
    });
  };

  const handleUpdateButton = (blockId: string, buttonId: string, updates: Partial<FlowButton>) => {
    const block = selectedFlow?.blocks.find((b) => b._id === blockId);
    if (!block) return;

    handleUpdateBlock(blockId, {
      buttons: block.buttons?.map((btn) =>
        btn._id === buttonId ? { ...btn, ...updates } : btn
      )
    });
  };

  const handleDeleteButton = (blockId: string, buttonId: string) => {
    const block = selectedFlow?.blocks.find((b) => b._id === blockId);
    if (!block) return;

    handleUpdateBlock(blockId, {
      buttons: block.buttons?.filter((btn) => btn._id !== buttonId)
    });
  };

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = isDraggingNewBlock ? 'copy' : 'move';
    setDragOverBlockId(blockId);
  }, [isDraggingNewBlock]);

  const handleDragLeave = useCallback(() => {
    setDragOverBlockId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();

    // Handle new block drag from sidebar
    if (isDraggingNewBlock && selectedFlow) {
      const targetIndex = selectedFlow.blocks.findIndex((b) => b._id === targetBlockId);
      handleAddBlock(isDraggingNewBlock, targetIndex);
      setIsDraggingNewBlock(null);
      setDragOverBlockId(null);
      return;
    }

    // Handle reordering existing blocks
    if (!draggedBlockId || draggedBlockId === targetBlockId || !selectedFlow) {
      setDraggedBlockId(null);
      setDragOverBlockId(null);
      return;
    }

    const blocks = [...selectedFlow?.blocks];
    const draggedIndex = blocks.findIndex((b) => b._id === draggedBlockId);
    const targetIndex = blocks.findIndex((b) => b._id === targetBlockId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedBlock] = blocks.splice(draggedIndex, 1);
      blocks.splice(targetIndex, 0, draggedBlock);

      const updatedFlows = flows.map((f) =>
        f._id === selectedFlowId ? { ...f, blocks } : f
      );
      setFlows(updatedFlows);
      setIsSaved(false);
    }

    setDraggedBlockId(null);
    setDragOverBlockId(null);
  }, [draggedBlockId, isDraggingNewBlock, selectedFlow, flows, selectedFlowId, handleAddBlock]);

  const handleDropZone = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isDraggingNewBlock) {
      handleAddBlock(isDraggingNewBlock);
      setIsDraggingNewBlock(null);
    }
    setDragOverBlockId(null);
  }, [isDraggingNewBlock, handleAddBlock]);

  const handleNewBlockDragStart = useCallback((e: React.DragEvent, type: BlockType) => {
    setIsDraggingNewBlock(type);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', `new-${type}`);
  }, []);

  const handleSave = () => {
    setIsSaved(true);
  };

  // Get all buttons for the bottom bar preview
  const getAllButtons = () => {
    if (!selectedFlow) return [];
    return selectedFlow.blocks
      .filter((b) => b.type === 'message' && b.buttons)
      .flatMap((b) => b.buttons || []);
  };

  const getActionLabel = (actionType?: string) => {
    switch (actionType) {
      case 'close': return 'Söhbəti bağla';
      case 'open': return 'Söhbəti aç (Operatora yönləndir)';
      case 'agent': return 'Agent-ə yönləndir';
      default: return 'Action seçin';
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg text-foreground">Chatbots</h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="py-2">
            {/* Flows Section */}
            <Collapsible open={flowsExpanded} onOpenChange={setFlowsExpanded}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    {flowsExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    Flows
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingFlow(true);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {isAddingFlow && (
                  <div className="flex items-center gap-1 px-4 py-1">
                    <Input
                      value={newFlowName}
                      onChange={(e) => setNewFlowName(e.target.value)}
                      placeholder="Flow adı"
                      className="h-7 text-xs"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleAddFlow()}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0"
                      onClick={handleAddFlow}
                    >
                      <Check className="h-3 w-3 text-primary" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0"
                      onClick={() => setIsAddingFlow(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {flows.map((flow) => (
                  <div
                    key={flow._id}
                    className={cn(
                      'group flex items-center justify-between px-4 py-2 cursor-pointer text-sm',
                      selectedFlowId === flow._id
                        ? 'bg-accent/50 text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                    onClick={() => {
                      setSelectedFlowId(flow._id);
                      setSelectedBlockId(null);
                    }}
                  >
                    <span className="truncate pl-6">{flow.name}</span>
                    <div className="flex items-center gap-1">
                      {flow.isDefault && (
                        <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Triggers Section */}
            <Collapsible open={triggersExpanded} onOpenChange={setTriggersExpanded}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    {triggersExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <Target className="h-4 w-4" />
                    Triggers
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingTrigger(true);
                      setTriggersExpanded(true);
                      setEditingTrigger({
                        _id: '',
                        name: '',
                        keywords: [],
                        targetFlowId: '',
                        isActive: true,
                        chatbotId
                      });
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {triggers.map((trigger) => (
                  <div
                    key={trigger._id}
                    className={cn(
                      'group flex items-center justify-between px-4 py-2 cursor-pointer text-sm',
                      selectedTriggerId === trigger._id
                        ? 'bg-accent/50 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                    onClick={() => {
                      setSelectedTriggerId(trigger._id);
                      setEditingTrigger(trigger);
                      setIsAddingTrigger(false);
                    }}
                  >
                    <span className="truncate pl-6 flex items-center gap-2">
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        trigger.isActive ? 'bg-green-500' : 'bg-gray-300'
                      )} />
                      {trigger.name || 'Unnamed Trigger'}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTriggers(triggers.filter(t => t._id !== trigger._id));
                        if (selectedTriggerId === trigger._id) {
                          setSelectedTriggerId(null);
                          setEditingTrigger(null);
                        }
                        setIsSaved(false);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{selectedFlow?.name || 'Flow seçin'}</span>
          </div>
        </div>

        {/* Canvas Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-3">
            {selectedFlow?.blocks.map((block) => (
              <div
                key={block._id}
                draggable
                onDragStart={(e) => handleDragStart(e, block._id)}
                onDragOver={(e) => handleDragOver(e, block._id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, block._id)}
                onClick={() => setSelectedBlockId(block._id)}
                className={cn(
                  'bg-white rounded-xl border shadow-sm transition-all duration-200 cursor-pointer',
                  draggedBlockId === block._id && 'opacity-50 scale-95',
                  dragOverBlockId === block._id && 'border-primary border-2 shadow-lg',
                  selectedBlockId === block._id && 'ring-2 ring-primary'
                )}
              >
                {/* Message Block */}
                {block.type === 'message' && (
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-1 cursor-grab shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Type className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Message</span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap text-foreground">
                          {block.content || 'Mesajınızı daxil edin...'}
                        </div>
                        {block.buttons && block.buttons.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {block.buttons.map((btn) => (
                              <div
                                key={btn._id}
                                className="py-2 px-3 bg-slate-100 rounded-lg text-center text-sm border border-border"
                              >
                                {btn.emoji && <span className="mr-1">{btn.emoji}</span>}
                                {btn.label}
                                {btn.goToFlowId && (
                                  <span className="ml-2 text-xs text-blue-500">
                                    → {flows.find(f => f._id === btn.goToFlowId)?.name}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBlock(block._id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Block */}
                {block.type === 'action' && (
                  <div className="p-4 bg-purple-50 rounded-xl border-purple-200">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <Zap className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Action</span>
                      <span className="text-xs text-purple-500 ml-2">
                        {getActionLabel(block.actionType)}
                      </span>
                      <div className="flex-1" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBlock(block._id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* GoTo Flow Block */}
                {block.type === 'goto' && (
                  <div className="p-4 bg-green-50 rounded-xl border-green-200">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <ArrowRightFromLine className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Go To Flow</span>
                      <span className="text-xs text-green-500 ml-2">
                        → {flows.find(f => f._id === block.targetFlowId)?.name || 'Seçilməyib'}
                      </span>
                      <div className="flex-1" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBlock(block._id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverBlockId('dropzone');
              }}
              onDragLeave={handleDragLeave}
              onDrop={handleDropZone}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
                dragOverBlockId === 'dropzone'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-white/50'
              )}
            >
              <p className="text-muted-foreground text-sm">Bloku buraya sürükləyin</p>
            </div>
          </div>
        </ScrollArea>

        {/* Bottom Bar - Buttons Preview */}
        {selectedFlow && getAllButtons().length > 0 && (
          <div className="bg-white border-t border-border p-4">
            <div className="flex items-center gap-2 flex-wrap">
              {getAllButtons().slice(0, 8).map((btn) => (
                <span
                  key={btn._id}
                  className="inline-flex items-center px-3 py-1.5 bg-slate-100 rounded-full text-sm text-foreground"
                >
                  {btn.emoji && <span className="mr-1">{btn.emoji}</span>}
                  {btn.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Block Editor / Block List */}
      <div className="w-72 border-l border-border bg-white flex flex-col">
        {/* Header with Save Status */}
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isSaved ? 'bg-green-500' : 'bg-yellow-500'
            )} />
            <span className="text-xs text-muted-foreground">
              {isSaved ? 'Saved' : 'Unsaved'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" className="h-7 text-xs px-3 bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
              Publish
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {editingTrigger ? (
            /* Trigger Editor Panel */
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">
                  {isAddingTrigger ? 'Yeni Trigger' : 'Trigger Redaktəsi'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setEditingTrigger(null);
                    setSelectedTriggerId(null);
                    setIsAddingTrigger(false);
                  }}
                >
                  Bağla
                </Button>
              </div>

              {/* Trigger Name */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Trigger adı</label>
                <Input
                  value={editingTrigger.name}
                  onChange={(e) => setEditingTrigger({ ...editingTrigger, name: e.target.value })}
                  placeholder="Trigger adını daxil edin..."
                  className="text-sm"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Açar sözlər (vergüllə ayırın)
                </label>
                <Input
                  value={editingTrigger.keywords.join(', ')}
                  onChange={(e) => setEditingTrigger({
                    ...editingTrigger,
                    keywords: e.target.value.split(', ').map(k => k.trim()).filter(k => k)
                  })}
                  placeholder="salam, hello, hi..."
                  className="text-sm"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {editingTrigger.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                    >
                      {keyword}
                      <button
                        onClick={() => setEditingTrigger({
                          ...editingTrigger,
                          keywords: editingTrigger.keywords.filter((_, i) => i !== idx)
                        })}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Flow */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Hədəf Flow (Target)</label>
                <Select
                  value={editingTrigger.targetFlowId || ''}
                  onValueChange={(value) => setEditingTrigger({
                    ...editingTrigger,
                    targetFlowId: value
                  })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Flow seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {flows.map((f) => (
                      <SelectItem key={f._id} value={f._id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between pt-2 border-t">
                <label className="text-xs text-muted-foreground">Aktiv</label>
                <button
                  onClick={() => setEditingTrigger({ ...editingTrigger, isActive: !editingTrigger.isActive })}
                  className={cn(
                    'w-10 h-6 rounded-full transition-colors relative',
                    editingTrigger.isActive ? 'bg-green-500' : 'bg-gray-300'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                      editingTrigger.isActive ? 'right-1' : 'left-1'
                    )}
                  />
                </button>
              </div>

              {/* Save Button */}
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => {
                  const _data: any = { ...editingTrigger }
                  delete _data.createdAt
                  delete _data.updatedAt
                  delete _data._id
                  if (isAddingTrigger) {
                    createTrigger(_data).then((d) => setTriggers((pre) => ([...pre, d])))
                  } else {
                    updateTrigger(editingTrigger._id, _data).then((d) => {
                      setTriggers((pre) => pre.map(t =>
                        t._id === d._id ? d : t
                      ));
                    })
                  }
                  setEditingTrigger(null);
                  setSelectedTriggerId(null);
                  setIsAddingTrigger(false);
                  setIsSaved(false);
                }}
              >
                {isAddingTrigger ? 'Trigger əlavə et' : 'Yadda saxla'}
              </Button>
            </div>
          ) : selectedBlock ? (
            /* Block Editor Panel */
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Blok Redaktəsi</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setSelectedBlockId(null)}
                >
                  Bağla
                </Button>
              </div>

              {/* Message Block Editor */}
              {selectedBlock.type === 'message' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Mesaj mətni</label>
                    <Textarea
                      value={selectedBlock.content || ''}
                      onChange={(e) => handleUpdateBlock(selectedBlock._id, { content: e.target.value })}
                      placeholder="Mesajınızı yazın..."
                      className="min-h-[100px] text-sm"
                    />
                  </div>

                  {/*
                  <div className="flex items-center gap-2 border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={() => { }}
                    >
                      <Type className="h-3 w-3" />
                      Text
                    </Button>
                     <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={() => { }}
                    >
                      <Image className="h-3 w-3" />
                      Image
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={() => { }}
                    >
                      <Smile className="h-3 w-3" />
                      GIF
                    </Button> 
                  </div>
                    */}

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-muted-foreground flex items-center gap-1">
                        <MousePointer className="h-3 w-3" />
                        Düymələr
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => handleAddButton(selectedBlock._id)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Əlavə et
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {selectedBlock.buttons?.map((btn) => (
                        <div key={btn._id} className="p-2 bg-slate-50 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={btn.label}
                              onChange={(e) => handleUpdateButton(selectedBlock._id, btn._id, { label: e.target.value })}
                              className="h-7 text-xs flex-1"
                              placeholder="Düymə mətni"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => handleDeleteButton(selectedBlock._id, btn._id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              value={btn.emoji || ''}
                              onChange={(e) => handleUpdateButton(selectedBlock._id, btn._id, { emoji: e.target.value })}
                              className="h-7 text-xs w-16"
                              placeholder="Emoji"
                            />
                            <Select
                              value={btn.goToFlowId || 'none'}
                              onValueChange={(value) => handleUpdateButton(selectedBlock._id, btn._id, {
                                goToFlowId: value === 'none' ? undefined : value
                              })}
                            >
                              <SelectTrigger className="h-7 text-xs flex-1">
                                <SelectValue placeholder="Go to flow..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Heç biri</SelectItem>
                                {flows.filter(f => f._id !== selectedFlowId).map((f) => (
                                  <SelectItem key={f._id} value={f._id}>
                                    {f.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Block Editor */}
              {selectedBlock.type === 'action' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Action növü</label>
                    <Select
                      value={selectedBlock.actionType || 'close'}
                      onValueChange={(value) => handleUpdateBlock(selectedBlock._id, {
                        actionType: value as ActionType
                      })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Action seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="close">Söhbəti bağla (Close conversation)</SelectItem>
                        <SelectItem value="open">Söhbəti aç (Operatora yönləndir)</SelectItem>
                        <SelectItem value="agent">Agent-ə yönləndir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* GoTo Flow Block Editor */}
              {selectedBlock.type === 'goto' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Hədəf Flow</label>
                    <Select
                      value={selectedBlock.targetFlowId || ''}
                      onValueChange={(value) => handleUpdateBlock(selectedBlock._id, { targetFlowId: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Flow seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        {flows.filter(f => f._id !== selectedFlowId).map((f) => (
                          <SelectItem key={f._id} value={f._id}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Block List Panel */
            <div className="p-3">
              <h3 className="font-medium text-sm mb-3">Block list</h3>
              <div className="space-y-2">
                {blockTypes.map((bt) => (
                  <button
                    key={bt.type}
                    draggable
                    onDragStart={(e) => handleNewBlockDragStart(e, bt.type)}
                    onClick={() => handleAddBlock(bt.type)}
                    className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-accent hover:border-primary cursor-pointer transition-all duration-200"
                  >
                    <bt.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {bt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default ChatbotFlowBuilder;
