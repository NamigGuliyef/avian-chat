import React, { useState } from 'react';
import { Plus, GripVertical, MoreVertical, Calendar, Paperclip } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Task, TaskStatus, TaskPriority, CSMUser } from '@/types/csm';

interface TasksKanbanProps {
  tasks: Task[];
  users: CSMUser[];
  currentUserId: string;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-700 border-gray-300',
  medium: 'bg-blue-100 text-blue-700 border-blue-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
};

const statusLabels: Record<TaskStatus, string> = {
  new: 'Yeni',
  in_progress: 'Davam edir',
  done: 'Tamamlandı',
};

const TasksKanban: React.FC<TasksKanbanProps> = ({
  tasks,
  users,
  currentUserId,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    assignedTo: currentUserId,
    dueDate: '',
  });

  const columns: { status: TaskStatus; title: string; color: string }[] = [
    { status: 'new', title: 'Yeni', color: 'border-t-blue-500' },
    { status: 'in_progress', title: 'Davam edir', color: 'border-t-yellow-500' },
    { status: 'done', title: 'Tamamlandı', color: 'border-t-green-500' },
  ];

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTask) {
      onTaskUpdate(draggedTask, { status });
      setDraggedTask(null);
    }
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    const assignedUser = users.find(u => u.id === newTask.assignedTo);
    onTaskCreate({
      title: newTask.title,
      description: newTask.description,
      status: 'new',
      priority: newTask.priority,
      assignedTo: newTask.assignedTo,
      assignedToName: assignedUser?.name || '',
      dueDate: newTask.dueDate || undefined,
      createdBy: currentUserId,
    });

    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: currentUserId,
      dueDate: '',
    });
    setIsDialogOpen(false);
  };

  // Stats
  const newCount = getTasksByStatus('new').length;
  const inProgressCount = getTasksByStatus('in_progress').length;
  const doneCount = getTasksByStatus('done').length;

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Tapşırıqların idarə olunması</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Tapşırıq</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Başlıq</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Tapşırıq başlığı"
                />
              </div>
              <div>
                <Label>Təsvir</Label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Tapşırıq təsviri"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioritet</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(v) => setNewTask({ ...newTask, priority: v as TaskPriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Aşağı</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="high">Yüksək</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Təyin edilən</Label>
                  <Select
                    value={newTask.assignedTo}
                    onValueChange={(v) => setNewTask({ ...newTask, assignedTo: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Son tarix</Label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleCreateTask}>
                Yarat
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <Badge variant="secondary" className="text-sm">
          Yeni: {newCount}
        </Badge>
        <Badge variant="secondary" className="text-sm bg-yellow-100 text-yellow-700">
          Davam edir: {inProgressCount}
        </Badge>
        <Badge variant="secondary" className="text-sm bg-green-100 text-green-700">
          Tamamlandı: {doneCount}
        </Badge>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        {columns.map((column) => (
          <div
            key={column.status}
            className={cn(
              "bg-muted/30 rounded-lg border-t-4 flex flex-col",
              column.color
            )}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.status)}
          >
            <div className="p-3 border-b">
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <p className="text-xs text-muted-foreground">
                {getTasksByStatus(column.status).length} tapşırıq
              </p>
            </div>
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-2">
                {getTasksByStatus(column.status).map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm">{task.title}</p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onTaskUpdate(task.id, { status: 'new' })}>
                                  Yeniyə köçür
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onTaskUpdate(task.id, { status: 'in_progress' })}>
                                  Davam edirə köçür
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onTaskUpdate(task.id, { status: 'done' })}>
                                  Tamamlandıya köçür
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => onTaskDelete(task.id)}
                                >
                                  Sil
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge className={cn('text-xs', priorityColors[task.priority])}>
                              {task.priority}
                            </Badge>
                            {task.dueDate && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString('az-AZ')}
                              </div>
                            )}
                            {task.attachments && task.attachments.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Paperclip className="h-3 w-3" />
                                {task.attachments.length}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {task.assignedToName}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksKanban;
