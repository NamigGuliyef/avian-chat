import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GripVertical,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Edit3,
  Save,
  X,
  Users,
  Settings2,
} from 'lucide-react';
import { ColumnConfig, ColumnType, ColumnOption, User } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ColumnBuilderProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  users: User[];
}

const columnTypes: { value: ColumnType; label: string; description: string }[] = [
  { value: 'text', label: 'Mətn', description: 'Sərbəst mətn daxil etmə' },
  { value: 'number', label: 'Rəqəm', description: 'Ədədi dəyərlər (AZN)' },
  { value: 'date', label: 'Tarix', description: 'Tarix seçici' },
  { value: 'select', label: 'Dropdown', description: 'Seçim siyahısı' },
  { value: 'phone', label: 'Telefon', description: 'Zəng edilə bilən nömrə' },
];

const statusColors = [
  { value: 'green', label: 'Yaşıl', class: 'bg-success text-success-foreground' },
  { value: 'red', label: 'Qırmızı', class: 'bg-destructive text-destructive-foreground' },
  { value: 'yellow', label: 'Sarı', class: 'bg-warning text-warning-foreground' },
  { value: 'blue', label: 'Mavi', class: 'bg-primary text-primary-foreground' },
  { value: 'gray', label: 'Boz', class: 'bg-muted text-muted-foreground' },
];

export function ColumnBuilder({ columns, onColumnsChange, users }: ColumnBuilderProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [optionsDialogOpen, setOptionsDialogOpen] = useState<string | null>(null);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');

  const userList = users.filter(u => u.role === 'agent');

  const handleAddColumn = () => {
    const newColumn: ColumnConfig = {
      id: `col_${Date.now()}`,
      name: 'Yeni sütun',
      dataKey: `new_column_${Date.now()}`,
      type: 'text',
      visibleToUser: true,
      editableByUser: false,
      order: columns.length + 1,
      userIds: userList.map(u => u.id),
      options: [],
    };
    onColumnsChange([...columns, newColumn]);
    setEditingId(newColumn.id);
  };

  const handleUpdateColumn = (id: string, updates: Partial<ColumnConfig>) => {
    onColumnsChange(
      columns.map((col) => (col.id === id ? { ...col, ...updates } : col))
    );
  };

  const handleDeleteColumn = (id: string) => {
    onColumnsChange(columns.filter((col) => col.id !== id));
    toast({
      title: "Sütun silindi",
      description: "Sütun uğurla silindi",
    });
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = columns.findIndex((c) => c.id === draggedId);
    const targetIndex = columns.findIndex((c) => c.id === targetId);

    const newColumns = [...columns];
    const [draggedItem] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, draggedItem);

    const reorderedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index + 1,
    }));

    onColumnsChange(reorderedColumns);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const handleSave = () => {
    toast({
      title: "Yadda saxlanıldı",
      description: "Sütun konfiqurasiyası uğurla saxlanıldı",
    });
    setEditingId(null);
  };

  const handleToggleUser = (columnId: string, userId: string, checked: boolean) => {
    const column = columns.find(c => c.id === columnId);
    if (!column) return;

    const currentUserIds = column.userIds || [];
    const newUserIds = checked 
      ? [...currentUserIds, userId]
      : currentUserIds.filter(id => id !== userId);
    
    handleUpdateColumn(columnId, { userIds: newUserIds });
  };

  const getSelectedUsersCount = (column: ColumnConfig) => {
    return column.userIds?.length || 0;
  };

  const handleAddOption = (columnId: string) => {
    if (!newOptionLabel.trim() || !newOptionValue.trim()) {
      toast({
        title: "Xəta",
        description: "Ad və dəyər daxil edilməlidir",
        variant: "destructive",
      });
      return;
    }

    const column = columns.find(c => c.id === columnId);
    if (!column) return;

    const newOption: ColumnOption = {
      value: newOptionValue.trim().toLowerCase().replace(/\s+/g, '_'),
      label: newOptionLabel.trim(),
    };

    const updatedOptions = [...(column.options || []), newOption];
    handleUpdateColumn(columnId, { options: updatedOptions });

    setNewOptionLabel('');
    setNewOptionValue('');

    toast({
      title: "Seçim əlavə edildi",
      description: `"${newOption.label}" seçimi əlavə edildi`,
    });
  };

  const handleDeleteOption = (columnId: string, optionValue: string) => {
    const column = columns.find(c => c.id === columnId);
    if (!column) return;

    const updatedOptions = (column.options || []).filter(o => o.value !== optionValue);
    handleUpdateColumn(columnId, { options: updatedOptions });

    toast({
      title: "Seçim silindi",
    });
  };

  const getColorClass = () => 'bg-muted text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sütun Qurucusu</h3>
          <p className="text-sm text-muted-foreground">
            Cədvəl sütunlarını idarə edin və hər user üçün görünüşü təyin edin
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddColumn} className="gap-2">
            <Plus className="w-4 h-4" />
            Yeni sütun
          </Button>
          <Button onClick={handleSave} variant="secondary" className="gap-2">
            <Save className="w-4 h-4" />
            Yadda saxla
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-16 gap-4 p-4 bg-muted text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-1"></div>
          <div className="col-span-2">Ad</div>
          <div className="col-span-2">Data Key</div>
          <div className="col-span-2">Tip</div>
          <div className="col-span-2">Seçimlər</div>
          <div className="col-span-2">User üçün görünür</div>
          <div className="col-span-2">Redaktə oluna bilər</div>
          <div className="col-span-2">User-lər</div>
          <div className="col-span-1">Əməliyyat</div>
        </div>

        <div className="divide-y divide-border">
          {columns
            .sort((a, b) => a.order - b.order)
            .map((column, index) => (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                draggable
                onDragStart={() => handleDragStart(column.id)}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'grid grid-cols-16 gap-4 p-4 items-center transition-colors',
                  draggedId === column.id && 'bg-primary/5',
                  editingId === column.id && 'bg-accent/50'
                )}
              >
                <div className="col-span-1">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                </div>

                <div className="col-span-2">
                  {editingId === column.id ? (
                    <Input
                      value={column.name}
                      onChange={(e) =>
                        handleUpdateColumn(column.id, { name: e.target.value })
                      }
                      className="h-9"
                    />
                  ) : (
                    <span className="font-medium text-foreground">{column.name}</span>
                  )}
                </div>

                <div className="col-span-2">
                  {editingId === column.id ? (
                    <Input
                      value={column.dataKey}
                      onChange={(e) =>
                        handleUpdateColumn(column.id, { dataKey: e.target.value })
                      }
                      className="h-9 font-mono text-xs"
                    />
                  ) : (
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {column.dataKey}
                    </code>
                  )}
                </div>

                <div className="col-span-2">
                  {editingId === column.id ? (
                    <Select
                      value={column.type}
                      onValueChange={(value: ColumnType) =>
                        handleUpdateColumn(column.id, { type: value, options: value === 'select' ? [] : undefined })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border shadow-lg z-50">
                        {columnTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex flex-col">
                              <span>{type.label}</span>
                              <span className="text-xs text-muted-foreground">{type.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {columnTypes.find((t) => t.value === column.type)?.label}
                    </span>
                  )}
                </div>

                <div className="col-span-2">
                  {column.type === 'select' ? (
                    <Dialog open={optionsDialogOpen === column.id} onOpenChange={(open) => setOptionsDialogOpen(open ? column.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Settings2 className="w-4 h-4" />
                          {column.options?.length || 0} seçim
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>"{column.name}" - Seçimləri idarə et</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          {/* Existing options */}
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {column.options?.map((option) => (
                              <div key={option.value} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                <div className="flex items-center gap-2">
                                  <span className={cn('px-2 py-1 rounded text-xs font-medium', getColorClass())}>
                                    {option.label}
                                  </span>
                                  <code className="text-xs text-muted-foreground">{option.value}</code>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteOption(column.id, option.value)}
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                            {(!column.options || column.options.length === 0) && (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Heç bir seçim əlavə edilməyib
                              </p>
                            )}
                          </div>

                          {/* Add new option */}
                          <div className="border-t pt-4 space-y-3">
                            <h4 className="text-sm font-medium">Yeni seçim əlavə et</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Görünən ad"
                                value={newOptionLabel}
                                onChange={(e) => setNewOptionLabel(e.target.value)}
                              />
                              <Input
                                placeholder="Dəyər (texniki)"
                                value={newOptionValue}
                                onChange={(e) => setNewOptionValue(e.target.value)}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1" />
                              <Button
                                size="sm"
                                onClick={() => handleAddOption(column.id)}
                                className="ml-auto"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Əlavə et
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <Switch
                    checked={column.visibleToUser}
                    onCheckedChange={(checked) =>
                      handleUpdateColumn(column.id, { visibleToUser: checked })
                    }
                  />
                  {column.visibleToUser ? (
                    <Eye className="w-4 h-4 text-success" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <Switch
                    checked={column.editableByUser}
                    onCheckedChange={(checked) =>
                      handleUpdateColumn(column.id, { editableByUser: checked })
                    }
                  />
                  {column.editableByUser ? (
                    <Edit3 className="w-4 h-4 text-success" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Yalnız oxu</span>
                  )}
                </div>

                <div className="col-span-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Users className="w-4 h-4" />
                        {getSelectedUsersCount(column)} user
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4" align="start">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">User-ləri seçin</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {userList.map(user => (
                            <div key={user.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`${column.id}-${user.id}`}
                                checked={column.userIds?.includes(user.id) || false}
                                onCheckedChange={(checked) => 
                                  handleToggleUser(column.id, user.id, checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={`${column.id}-${user.id}`}
                                className="text-sm cursor-pointer"
                              >
                                {user.name}
                              </Label>
                            </div>
                          ))}
                          {userList.length === 0 && (
                            <p className="text-sm text-muted-foreground">User tapılmadı</p>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="col-span-1 flex items-center gap-1">
                  {editingId === column.id ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingId(column.id)}
                      className="h-8 w-8"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteColumn(column.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </motion.div>
  );
}
