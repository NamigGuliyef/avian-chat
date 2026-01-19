import { updateUser } from '@/api/admin';
import { getSupervisorAgents, searchUsers, signUp } from '@/api/users';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { IUser, Roles, UserStatus, roleColors, roleIcons, roleLabels } from '@/types/types';
import { motion } from 'framer-motion';
import {
    Edit3,
    Eye,
    EyeOff,
    Filter,
    Plus,
    Trash2,
    UserCheck,
    UserX
} from 'lucide-react';
import { useEffect, useState } from 'react';



export function AdminUsers() {
    const [users, setUsers] = useState<IUser[]>([])
    const [agents, setAgents] = useState<IUser[]>([])
    const [agentPopOver, setAgentPopOver] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [roleFilter, setRoleFilter] = useState<Roles | null>(null)
    const [editingUser, setEditingUser] = useState<IUser | null>(null);
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState<Partial<IUser>>({
        name: '',
        surname: '',
        password: '',
        role: Roles.Agent
    });

    useEffect(() => {
        searchUsers().then((d) => {
            setUsers(d)
        })
    }, [])

    const handleAddUser = () => {
        setEditingUser(null);
        setFormData({ name: '', password: '', role: Roles.Agent });
        setIsDialogOpen(true);
    };
    const handleEditUser = (user: IUser) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            surname: user.surname,
            role: user.role,
        });
        setIsDialogOpen(true);
    };

    const handleSaveUser = () => {
        if (!formData.name || !formData.surname || !formData.role) {
            toast({
                title: "Xəta",
                description: "Bütün sahələri doldurun",
                variant: "destructive",
            });
            return;
        }

        if (editingUser) {
            const newFields = {
                name: formData.name,
                surname: formData.surname,
                role: formData.role
            }
            updateUser(editingUser._id, newFields).then(() => {
                setUsers(
                    users.map((u) =>
                        u._id === editingUser._id
                            ? { ...u, ...newFields }
                            : u
                    )
                );
                toast({
                    title: "User yeniləndi",
                    description: "User məlumatları uğurla yeniləndi",
                });
            })
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
            if (formData.password.length < 8) {
                toast({
                    title: "Xəta",
                    description: "Parol 8 simvoldan azdır",
                    variant: "destructive",
                });
                return;
            }
            const newUser: Partial<IUser> = {
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                status: UserStatus.Active,
                password: formData.password,
                role: formData.role,
                isActive: true,
            };
            signUp(newUser).then((d) => {
                setUsers([...users, d] as any);
                toast({
                    title: "User yaradıldı",
                    description: "Yeni user uğurla yaradıldı",
                });
            })
        }

        setIsDialogOpen(false);
    };

    const handleToggleActive = (userId: string, isActive: boolean) => {
        updateUser(userId, { isActive }).then(() => {
            setUsers(
                users.map((u) => (u._id === userId ? { ...u, isActive } : u))
            );
        })
    };

    const handleDeleteUser = (userId: string, isDeleted) => {
        updateUser(userId, { isDeleted }).then(() => {
            setUsers(users.filter((u) => u._id !== userId));
            toast({
                title: "User silindi",
                description: "User uğurla silindi",
            });
        })
    };


    const filteredUsers = roleFilter ?
        users.filter((us) => us && us.role === roleFilter)
        : users


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
                                <Label>Soyad</Label>
                                <Input
                                    value={formData.surname}
                                    onChange={(e) =>
                                        setFormData({ ...formData, surname: e.target.value })
                                    }
                                    placeholder="İstifadəçi soyadı"
                                />
                            </div>
                            {
                                !editingUser &&
                                <>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                            placeholder="İstifadəçi emaili"
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
                                </>
                            }
                            <div className="space-y-2">
                                <Label>Rol</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value: Roles) =>
                                        setFormData({ ...formData, role: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                                        <SelectItem value={Roles.Admin}>Admin</SelectItem>
                                        <SelectItem value={Roles.Supervisor}>Supervisor</SelectItem>
                                        <SelectItem value={Roles.Agent}>Agent</SelectItem>
                                        <SelectItem value={Roles.Partner}>Partner</SelectItem>
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
                    <span className="text-sm font-medium text-foreground">Rola görə filter:</span>
                </div>
                <Select value={roleFilter} onValueChange={(v: Roles | "all") => {
                    if (v === 'all') {
                        setRoleFilter(null)
                    } else {
                        setRoleFilter(v)
                    }
                }}>
                    <SelectTrigger className="w-64 h-9">
                        <SelectValue placeholder="Şirkət seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                        <SelectItem value={null}>Bütün rollar</SelectItem>
                        <SelectItem key={Roles.Admin} value={Roles.Admin}>
                            {roleLabels[Roles.Admin]}
                        </SelectItem>
                        <SelectItem key={Roles.Supervisor} value={Roles.Supervisor}>
                            {roleLabels[Roles.Supervisor]}
                        </SelectItem>
                        <SelectItem key={Roles.Agent} value={Roles.Agent}>
                            {roleLabels[Roles.Agent]}
                        </SelectItem>
                        <SelectItem key={Roles.Partner} value={Roles.Partner}>
                            {roleLabels[Roles.Partner]}
                        </SelectItem>
                    </SelectContent>
                </Select>
                {roleFilter && (
                    <Button variant="ghost" size="sm" onClick={() => setRoleFilter(null)}>
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
                                Rol
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
                        {filteredUsers.filter((user) => user?._id).map((user, index) => {
                            console.log('user', user)
                            const UserRoleIcon = roleIcons[user.role]
                            return (
                                <motion.tr
                                    key={user._id}
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
                                                    user.role === Roles.Admin
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-secondary text-secondary-foreground'
                                                )}
                                            >
                                                <UserRoleIcon className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-foreground">{user.name + ' ' + user.surname}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {user.email}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={cn('text-xs', roleColors[user.role])}>
                                            {roleLabels[user.role]}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={user.isActive}
                                                onCheckedChange={() => handleToggleActive(user._id, !user.isActive)}
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
                                        {user.createdAt.slice(0, 10)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {user?.role === Roles.Supervisor &&

                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            onClick={() => {
                                                                setAgentPopOver(true)
                                                                getSupervisorAgents(user._id).then((d) => {
                                                                    console.log('dasssaa', d)
                                                                    setAgents(d)
                                                                })
                                                            }}
                                                            variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                                                            <Eye className="h-4 w-4" />
                                                            Agentlər
                                                        </Button>
                                                    </PopoverTrigger>
                                                    {
                                                        agentPopOver && <PopoverContent className="w-64 p-0" align="end">
                                                            <div className="p-3 border-b"><p className="font-medium text-sm">{user.name} agentləri</p></div>
                                                            <ScrollArea className="max-h-48">
                                                                <div className="p-2 space-y-1">
                                                                    {agents.map((agent) => (
                                                                        <div key={agent._id} className="flex items-center gap-2 p-2 rounded hover:bg-muted">
                                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                                                                {agent.name.charAt(0)}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">
                                                                                {agent.name} {agent.surname}
                                                                            </p>
                                                                                <p className="text-xs text-muted-foreground truncate">
                                                                                    {agent.email}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </ScrollArea>
                                                        </PopoverContent>
                                                    }
                                                </Popover>
                                            }
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
                                                onClick={() => handleDeleteUser(user._id, !user.isDeleted)}
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </motion.tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
