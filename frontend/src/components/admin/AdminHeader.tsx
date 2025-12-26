import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  adminName: string;
}

export function AdminHeader({ title, subtitle, adminName }: AdminHeaderProps) {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-card border-b border-border px-6 flex items-center justify-between"
    >
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-secondary-foreground">{adminName}</p>
          <p className="text-xs text-muted-foreground">Administrator</p>
        </div>
      </div>
    </motion.header>
  );
}
