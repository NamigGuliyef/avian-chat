import React, { useState } from 'react';
import { Search, Settings, ChevronDown, LogOut, User, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { UserStatus } from '@/types/csm';

interface TopBarProps {
  currentUser: {
    name: string;
    email: string;
    avatar?: string;
    status: UserStatus;
  };
  onStatusChange: (status: UserStatus) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
}

const statusColors: Record<UserStatus, string> = {
  available: 'bg-green-500',
  busy: 'bg-red-500',
  break: 'bg-yellow-500',
  offline: 'bg-gray-400',
};

const statusLabels: Record<UserStatus, string> = {
  available: 'Available',
  busy: 'Busy',
  break: 'Break',
  offline: 'Offline',
};

const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  onStatusChange,
  onLogout,
  onNavigateHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
      {/* Logo - Left */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={onNavigateHome}
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">CSM</span>
        </div>
        <span className="font-semibold text-foreground hidden sm:inline">Customer Service</span>
      </div>

      {/* Search - Center */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Axtarış..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-transparent focus:border-primary rounded-full"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        {/* Status Selector */}
        <Select value={currentUser.status} onValueChange={(v) => onStatusChange(v as UserStatus)}>
          <SelectTrigger className="w-32 h-9">
            <div className="flex items-center gap-2">
              <span className={cn('w-2 h-2 rounded-full', statusColors[currentUser.status])} />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(statusLabels) as UserStatus[]).map((status) => (
              <SelectItem key={status} value={status}>
                <div className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full', statusColors[status])} />
                  {statusLabels[status]}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Settings */}
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover">
            <div className="px-3 py-2">
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              Profil redaktəsi
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Hesab parametrləri
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Çıxış
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
