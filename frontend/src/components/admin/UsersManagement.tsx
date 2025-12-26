import React, { useState } from 'react';
import { Plus, Edit2, Trash2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from '@/contexts/ChatContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/types/chat';

const UsersManagement: React.FC = () => {
  const { users, companies, addUser, updateUser, deleteUser } = useChat();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent' as UserRole,
    companyId: '',
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'agent', companyId: '' });
  };

  const handleAddUser = () => {
    if (!formData.name || !formData.email || !formData.companyId) return;
    
    addUser({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      companyId: formData.companyId,
      channelIds: [],
      isOnline: false,
    });
    resetForm();
    setIsAddOpen(false);
  };

  const handleUpdateUser = (userId: string) => {
    updateUser(userId, {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      companyId: formData.companyId,
    });
    setEditingUser(null);
    resetForm();
  };

  const startEdit = (user: typeof users[0]) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      companyId: user.companyId,
    });
    setEditingUser(user.id);
  };

  return (
    <div className="flex-1 p-6 bg-background overflow-auto">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">İstifadəçilər</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                Yeni istifadəçi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni istifadəçi əlavə et</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Ad</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ad daxil edin"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email daxil edin"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Şifrə</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Şifrə daxil edin"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select value={formData.role} onValueChange={(v: UserRole) => setFormData({ ...formData, role: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Şirkət</Label>
                  <Select value={formData.companyId} onValueChange={(v) => setFormData({ ...formData, companyId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Şirkət seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddUser} className="w-full">
                  Əlavə et
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Agent'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {companies.find(c => c.id === user.companyId)?.name}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={editingUser === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => startEdit(user)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>İstifadəçini redaktə et</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Ad</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Rol</Label>
                        <Select value={formData.role} onValueChange={(v: UserRole) => setFormData({ ...formData, role: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="agent">Agent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Şirkət</Label>
                        <Select value={formData.companyId} onValueChange={(v) => setFormData({ ...formData, companyId: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={() => handleUpdateUser(user.id)} className="w-full">
                        Yadda saxla
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" onClick={() => deleteUser(user.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
