import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit3,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  User as UserIcon,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import { User, CrmUserRole } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useChat } from '@/contexts/ChatContext';

interface UserManagementProps {
  users: User[];
  onUsersChange: (users: User[]) => void;
}

const roleLabels: Record<CrmUserRole, string> = {
  admin: 'Admin',
  supervayzer: 'Supervayzer',
  agent: 'Agent',
  partner: 'Partner',
};

const roleColors: Record<CrmUserRole, string> = {
  admin: 'bg-primary text-primary-foreground',
  supervayzer: 'bg-purple-500 text-white',
  agent: 'bg-blue-500 text-white',
  partner: 'bg-orange-500 text-white',
};

export function UserManagement({ users, onUsersChange }: UserManagementProps) {
  const { companies } = useChat();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent' as CrmUserRole,
    companyId: '',
  });

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'agent', companyId: '' });
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      password: user.password, 
      role: user.role,
      companyId: user.companyId || ''
    });
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.companyId) {
      toast({
        title: "Xəta",
        description: "Bütün sahələri doldurun (Şirkət seçimi mütləqdir)",
        variant: "destructive",
      });
      return;
    }

    if (editingUser) {
      onUsersChange(
        users.map((u) =>
          u.id === editingUser.id
            ? { ...u, name: formData.name, email: formData.email, password: formData.password, role: formData.role, companyId: formData.companyId }
            : u
        )
      );
      toast({
        title: "User yeniləndi",
        description: "User məlumatları uğurla yeniləndi",
      });
    } else {
      const existingEmail = users.find(u => u.email === formData.email);
      if (existingEmail) {
        toast({
          title: "Xəta",
          description: "Bu email artıq istifadə olunur",
          variant: "destructive",
        });
        return;
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        companyId: formData.companyId,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onUsersChange([...users, newUser]);
      toast({
        title: "User yaradıldı",
        description: "Yeni user uğurla yaradıldı",
      });
    }

    setIsDialogOpen(false);
  };

  const handleToggleActive = (userId: string) => {
    onUsersChange(
      users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const handleDeleteUser = (userId: string) => {
    onUsersChange(users.filter((u) => u.id !== userId));
    toast({
      title: "User silindi",
      description: "User uğurla silindi",
    });
  };

  const filteredUsers = companyFilter === 'all' 
    ? users 
    : users.filter(u => u.companyId === companyFilter);

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return '-';
    const company = companies.find(c => c.id === companyId);
    return company?.name || '-';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">User İdarəetməsi</h3>
          <p className="text-sm text-muted-foreground">
            İstifadəçiləri əlavə edin, redaktə edin və idarə edin
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddUser} className="gap-2">
              <Plus className="w-4 h-4" />
              Yeni user
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'User redaktə et' : 'Yeni user yarat'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Ad</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="İstifadəçi adı"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@company.az"
                />
              </div>
              <div className="space-y-2">
                <Label>Şifrə</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Şifrə"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: CrmUserRole) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="supervayzer">Supervayzer</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Şirkət</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, companyId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Şirkət seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveUser} className="w-full">
                {editingUser ? 'Yenilə' : 'Yarat'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Şirkətə görə filter:</span>
        </div>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-64 h-9">
            <SelectValue placeholder="Şirkət seçin" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-lg z-50">
            <SelectItem value="all">Bütün şirkətlər</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {companyFilter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setCompanyFilter('all')}>
            Filtri təmizlə
          </Button>
        )}
        <span className="ml-auto text-sm text-muted-foreground">
          {filteredUsers.length} user göstərilir
        </span>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Şifrə
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Rol
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Şirkət
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Yaradılma tarixi
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Əməliyyat
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        user.role === 'admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary text-secondary-foreground'
                      )}
                    >
                      {user.role === 'admin' ? (
                        <Shield className="w-5 h-5" />
                      ) : (
                        <UserIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="font-medium text-foreground">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {user.email}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  <code className="bg-muted px-2 py-1 rounded text-xs">••••••••</code>
                </td>
                <td className="px-4 py-3">
                  <Badge className={cn('text-xs', roleColors[user.role])}>
                    {roleLabels[user.role]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {getCompanyName(user.companyId)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={() => handleToggleActive(user.id)}
                    />
                    {user.isActive ? (
                      <span className="flex items-center gap-1 text-sm text-success">
                        <UserCheck className="w-4 h-4" />
                        Aktiv
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <UserX className="w-4 h-4" />
                        Deaktiv
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {user.createdAt}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditUser(user)}
                      className="h-8 w-8"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteUser(user.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
