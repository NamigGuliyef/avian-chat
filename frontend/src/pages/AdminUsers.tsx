import { updateUser } from '@/api/admin';
import { getSupervisorAgents, searchUsers, signUp, PaginatedResponse } from '@/api/users';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
    UserX,
    Users,
    RotateCcw,
    ShieldAlert,
    Mail,
    Wand2
} from 'lucide-react';
import { useEffect, useState } from 'react';

const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};



export function AdminUsers() {
    const [users, setUsers] = useState<IUser[]>([])
    const [agents, setAgents] = useState<IUser[]>([])
    const [agentPopOver, setAgentPopOver] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [roleFilter, setRoleFilter] = useState<Roles | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalUsers, setTotalUsers] = useState(0)
    const [editingUser, setEditingUser] = useState<IUser | null>(null);
    const [showPassword, setShowPassword] = useState(false)
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<IUser>>({
        name: '',
        surname: '',
        password: '',
        role: Roles.Agent
    });

    useEffect(() => {
        const role = roleFilter ? roleFilter : undefined
        searchUsers({ query: searchQuery, role, page: currentPage }).then((d) => {
            setUsers(d.data)
            setTotalPages(d.totalPages || 1)
            setTotalUsers(d.total || 0)
        })
    }, [roleFilter, searchQuery, currentPage])

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

    const handleDeleteUser = (userId: string) => {
        const user = users.find(u => u._id === userId);
        if (!user) return;
        updateUser(userId, { isDeleted: !user.isDeleted }).then(() => {
            setUsers(users.filter((u) => u._id !== userId));
            toast({
                title: "User silindi",
                description: "User uğurla silindi",
            });
        })
    };


    const filteredUsers = users


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 space-y-6"
        >
            {/* HEADER */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">User İdarəetməsi</h1>
                            <p className="text-slate-600 mt-1">İstifadəçiləri əlavə edin, redaktə edin və idarə edin</p>
                        </div>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleAddUser} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                                <Plus className="w-5 h-5" />
                                Yeni User Əlavə Et
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border-slate-200 shadow-xl rounded-xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-slate-900">
                                    {editingUser ? '✏️ User Redaktə Et' : '➕ Yeni User Yarat'}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-slate-700">Ad</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                            placeholder="Ad"
                                            className="border-slate-300 focus:border-blue-500 rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-slate-700">Soyad</Label>
                                        <Input
                                            value={formData.surname}
                                            onChange={(e) =>
                                                setFormData({ ...formData, surname: e.target.value })
                                            }
                                            placeholder="Soyad"
                                            className="border-slate-300 focus:border-blue-500 rounded-lg"
                                        />
                                    </div>
                                </div>
                                {
                                    !editingUser &&
                                    <>
                                        <div className="space-y-2">
                                            <Label className="font-semibold text-slate-700">Email</Label>
                                            <div className="relative">
                                                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                                                <Input
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, email: e.target.value })
                                                    }
                                                    placeholder="user@example.com"
                                                    className="pl-10 border-slate-300 focus:border-blue-500 rounded-lg"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-semibold text-slate-700">Şifrə (Min. 8 simvol)</Label>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={formData.password}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, password: e.target.value })
                                                    }
                                                    placeholder="Şifrə"
                                                    className="pr-20 border-slate-300 focus:border-blue-500 rounded-lg"
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-500 hover:text-slate-700"
                                                        onClick={() => setFormData({ ...formData, password: generateRandomPassword() })}
                                                        title="Təsadüfi şifrə yarat"
                                                    >
                                                        <Wand2 className="w-4 h-4" />
                                                    </Button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="text-slate-500 hover:text-slate-700 p-1"
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                }
                                <div className="space-y-2">
                                    <Label className="font-semibold text-slate-700">Rol</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value: Roles) =>
                                            setFormData({ ...formData, role: value })
                                        }
                                    >
                                        <SelectTrigger className="border-slate-300 focus:border-blue-500 rounded-lg">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border border-slate-200 shadow-lg z-50">
                                            <SelectItem value={Roles.Admin}>Admin</SelectItem>
                                            <SelectItem value={Roles.Supervisor}>Supervisor</SelectItem>
                                            <SelectItem value={Roles.Agent}>Agent</SelectItem>
                                            <SelectItem value={Roles.Partner}>Partner</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleSaveUser} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 rounded-lg transition-all">
                                    {editingUser ? '✅ Yenilə' : '✅ Yarat'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* FILTER & STATS */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-slate-900">Rola görə filter:</span>
                    </div>
                    <div className="flex items-center gap-3 flex-1 md:flex-none md:w-64">
                        <Select value={roleFilter} onValueChange={(v: Roles | "all") => {
                            if (v === 'all') {
                                setRoleFilter(null)
                            } else {
                                setRoleFilter(v)
                            }
                        }}>
                            <SelectTrigger className="h-10 border-slate-300 rounded-lg hover:border-blue-400">
                                <SelectValue placeholder="Rol seçin" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-slate-200 shadow-lg z-50">
                                <SelectItem value="all">📋 Bütün rollar</SelectItem>
                                <SelectItem value={Roles.Admin}>{roleLabels[Roles.Admin]}</SelectItem>
                                <SelectItem value={Roles.Supervisor}>{roleLabels[Roles.Supervisor]}</SelectItem>
                                <SelectItem value={Roles.Agent}>{roleLabels[Roles.Agent]}</SelectItem>
                                <SelectItem value={Roles.Partner}>{roleLabels[Roles.Partner]}</SelectItem>
                            </SelectContent>
                        </Select>
                        {roleFilter && (
                            <Button variant="outline" size="sm" onClick={() => setRoleFilter(null)} className="hover:bg-slate-100 border-slate-300">
                                <RotateCcw className="w-4 h-4 mr-2" /> Təmizlə
                            </Button>
                        )}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                        📊 {totalUsers} user ({currentPage}/{totalPages} səhifə)
                    </div>
                </div>
            </motion.div>

            {/* TABLE */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tarix</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider" >Əməliyyat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredUsers.filter((user) => user?._id).map((user, index) => {
                                const roleColorMap = {
                                    [Roles.Admin]: 'bg-red-100 text-red-800',
                                    [Roles.Supervisor]: 'bg-blue-100 text-blue-800',
                                    [Roles.Agent]: 'bg-green-100 text-green-800',
                                    [Roles.Partner]: 'bg-purple-100 text-purple-800',
                                }
                                return (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-blue-50 transition-colors duration-200 group border-b border-slate-100"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white',
                                                        user.role === Roles.Admin
                                                            ? 'bg-gradient-to-br from-red-500 to-red-600'
                                                            : user.role === Roles.Supervisor
                                                                ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                                                : user.role === Roles.Agent
                                                                    ? 'bg-gradient-to-br from-green-500 to-green-600'
                                                                    : 'bg-gradient-to-br from-purple-500 to-purple-600'
                                                    )}
                                                >
                                                    {(user.name.charAt(0) + user.surname.charAt(0)).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 group-hover:text-blue-700">{user.name} {user.surname}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={cn('text-xs font-semibold', roleColorMap[user.role])}>
                                                {roleLabels[user.role]}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={user.isActive}
                                                    onCheckedChange={() => handleToggleActive(user._id, !user.isActive)}
                                                />
                                                {user.isActive ? (
                                                    <span className="flex items-center gap-1 text-sm font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                                                        <UserCheck className="w-4 h-4" />
                                                        Aktiv
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                                                        <UserX className="w-4 h-4" />
                                                        Deaktiv
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                            {user.createdAt.slice(0, 10)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {user?.role === Roles.Supervisor &&
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                onClick={() => {
                                                                    setAgentPopOver(true)
                                                                    getSupervisorAgents(user._id).then((d) => {
                                                                        setAgents(d)
                                                                    })
                                                                }}
                                                                variant="outline" size="sm" className="gap-2 border-slate-300 hover:bg-blue-50 text-slate-700">
                                                                <Eye className="h-4 w-4" />
                                                                Agentlər
                                                            </Button>
                                                        </PopoverTrigger>
                                                        {
                                                            agentPopOver && <PopoverContent className="w-72 p-0" align="end">
                                                                <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-blue-50"><p className="font-semibold text-slate-900"> {user.name} Agentləri</p></div>
                                                                <ScrollArea className="max-h-56">
                                                                    <div className="p-3 space-y-2">
                                                                        {agents.length > 0 ? agents.map((agent) => (
                                                                            <div key={agent._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                                                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                                                                                    {agent.name.charAt(0)}{agent.surname.charAt(0)}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="text-sm font-semibold text-slate-900 truncate">{agent.name} {agent.surname}</p>
                                                                                    <p className="text-xs text-slate-500 truncate">{agent.email}</p>
                                                                                </div>
                                                                            </div>
                                                                        )) : (
                                                                            <div className="py-8 text-center text-slate-500 text-sm">
                                                                                Heç bir agent tapılmadı
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </ScrollArea>
                                                            </PopoverContent>
                                                        }
                                                    </Popover>
                                                }
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    onClick={() => handleEditUser(user)}
                                                    className="h-9 w-9 border-slate-300 hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    onClick={() => setUserToDelete(user._id)}
                                                    className="h-9 w-9 border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
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
                {filteredUsers.length === 0 && (
                    <div className="py-12 text-center">
                        <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">Heç bir user tapılmadı</p>
                        <p className="text-slate-400 text-sm mt-1">Yeni user əlavə etmə düyməsinə klikləyin</p>
                    </div>
                )}
                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
                        <div className="text-sm text-slate-600">
                            {currentPage} - {totalPages} səhifəsindən
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                className="border-slate-300 hover:bg-slate-100"
                            >
                                Əvvəl
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className={currentPage === page ? "bg-blue-600" : "border-slate-300 hover:bg-slate-100"}
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                className="border-slate-300 hover:bg-slate-100"
                            >
                                Sonra
                            </Button>
                        </div>
                    </div>
                )}
            </motion.div>

            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu istifadəçini silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (userToDelete) {
                                    handleDeleteUser(userToDelete);
                                    setUserToDelete(null);
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div >
    );
}
