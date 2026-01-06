import { addChannel, getChannels, updateChannel } from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { IChannel } from '@/types/types';
import {
    Plus,
    Radio
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';


const ChannelsTabs = ({ companyId }: { companyId: string }) => {
    const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
    const [channelForm, setChannelForm] = useState({ name: '' });
    const [channels, setChannels] = useState<IChannel[]>([])

    useEffect(() => {
        if (companyId) {
            getChannels(companyId).then((d) => {
                setChannels(d)
            })
        }
    }, [companyId])

    const resetChannelForm = () => {
        setChannelForm({ name: '' });
    };


    const handleAddChannel = async () => {
        if (!channelForm.name) {
            toast.error('Kanal adını daxil edin');
            return;
        }
        const d = await addChannel({
            companyId: companyId,
            name: channelForm.name.toLowerCase().replace(/\s+/g, '-'),
        });
        setChannels((pre) => ([...pre, d]))
        toast.success('Kanal yaradıldı');
        resetChannelForm();
        setIsChannelDialogOpen(false);
    };

    const handleToggleChannel = async (channelId: string, isActive: boolean) => {
        const d = await updateChannel(channelId, { isActive }).then(() => {
            setChannels((pre) => pre.map((ch) => ch._id === channelId ? { ...ch, isActive } : ch))
            toast.success(isActive ? 'Kanal deaktiv edildi' : 'Kanal aktiv edildi');
        });
    };

    const handleDeleteChannel = (channelId: string) => {
        // deleteChannel(channelId);
        toast.success('Kanal silindi');
    };
    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Kanallar</h3>
                    <p className="text-sm text-muted-foreground">Mesaj mənbələrini idarə edin</p>
                </div>
                <Dialog open={isChannelDialogOpen} onOpenChange={(open) => {
                    setIsChannelDialogOpen(open);
                    if (!open) resetChannelForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Yeni Kanal
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Yeni Kanal</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <Label>Kanal adı</Label>
                                <Input
                                    value={channelForm.name}
                                    onChange={(e) => setChannelForm({ name: e.target.value })}
                                    placeholder="instagram, facebook, whatsapp..."
                                />
                            </div>
                            <Button className="w-full" onClick={handleAddChannel}>
                                Yarat
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-3">
                {channels.map((channel) => (
                    <Card key={channel._id}>
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                    channel.isActive ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                                )}>
                                    <Radio className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium">{channel.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {channel.isActive ? 'Aktiv' : 'Deaktiv'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={channel.isActive}
                                    onCheckedChange={() => handleToggleChannel(channel._id, !channel.isActive)}
                                />
                                {/* <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteChannel(channel._id)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button> */}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {channels.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Heç bir kanal yoxdur</p>
                )}
            </div>
        </>
    )
}
export default ChannelsTabs
