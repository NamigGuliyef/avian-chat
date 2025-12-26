import { motion } from 'framer-motion';
import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserHeaderProps {
  userName: string;
  onLogout: () => void;
}

export function UserHeader({ userName, onLogout }: UserHeaderProps) {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-card border-b border-border px-6 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-lg font-bold text-primary-foreground">CRM</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">User Panel</h1>
          <p className="text-xs text-muted-foreground">Lead İdarəetmə Sistemi</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-secondary-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">User</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} className="text-muted-foreground hover:text-destructive">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </motion.header>
  );
}
