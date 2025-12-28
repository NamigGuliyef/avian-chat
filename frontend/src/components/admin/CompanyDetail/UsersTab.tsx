import { getChannels, getUsers, removeAgentFromCompany, updateUserChannels } from '@/api/company';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IChannel, IUser, roleLabels } from '@/types/types';
import { Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const UsersTab = ({ companyId }: { companyId: string }) => {
    const [users, setUsers] = useState<IUser[]>([])
    const [isUserDialogOpen, setIsUserDialogOpen] = useState("")
    const [channels, setChannels] = useState<IChannel[]>([])
    const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([])

    useEffect(() => {
        getChannels(companyId).then((d) => {
            setChannels(d)
        })
    }, [])
    useEffect(() => {
        getUsers(`?companyId=${companyId}`).then((d) => {
            setUsers(d)
        })
    }, [])


    const handleRemoveAgent = (userId: string) => {
        removeAgentFromCompany(userId, companyId);
        toast.success('Agent şirkətdən çıxarıldı');
    };

    const toggleChannelForUser = (channelId: string) => {
        setSelectedChannelIds(prev =>
            prev.includes(channelId)
                ? prev.filter(id => id !== channelId)
                : [...prev, channelId]
        );
    };

    const handleUpdateUserChannels = () => {
        updateUserChannels(isUserDialogOpen, {
            channelIds: selectedChannelIds
        });
        toast.success('Agent yeniləndi');
        setIsUserDialogOpen("");
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Agentlər</h3>
                    <p className="text-sm text-muted-foreground">Bu şirkətə bağlı istifadəçilər</p>
                </div>
            </div>

            <div className="space-y-3">
                {users.map((user) => (
                    <Card key={user._id}>
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
                                        {(user.assignedChannels).map((ch) => <Badge key={ch._id} variant="outline" className="text-xs">
                                            {ch.name}
                                        </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => {
                                    setIsUserDialogOpen(user._id)
                                    setSelectedChannelIds(user.assignedChannels.map((ch) => ch._id))
                                }}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveAgent(user._id)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {users.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Bu şirkətdə heç bir agent yoxdur</p>
                )}
            </div>

            <Dialog open={Boolean(isUserDialogOpen)} onOpenChange={() => {
                setIsUserDialogOpen("");
            }}>
                <DialogTrigger asChild>

                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>'Agent Kanal İcazələri</DialogTitle>
                    </DialogHeader>
                    {channels.length > 0 && (
                        <>
                            <div>
                                <Label className="mb-2 block">Kanal icazələri</Label>
                                <p className="text-xs text-muted-foreground mb-2">Bu agent hansı kanallardan gələn mesajlara cavab verə bilər?</p>
                                <div className="space-y-2 p-3 bg-muted rounded-lg max-h-32 overflow-y-auto">
                                    {channels.map((channel) => (
                                        <div key={channel._id} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`edit-ch-${channel._id}`}
                                                checked={selectedChannelIds.includes(channel._id)}
                                                onCheckedChange={() => toggleChannelForUser(channel._id)}
                                            />
                                            <label htmlFor={`edit-ch-${channel._id}`} className="text-sm cursor-pointer">
                                                {channel.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Button className="w-full" onClick={handleUpdateUserChannels}>
                                Yenilə
                            </Button>
                        </>
                    )}
                </DialogContent >
            </Dialog >
        </>
    )
}
export default UsersTab
