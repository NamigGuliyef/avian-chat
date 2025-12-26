import { motion } from 'framer-motion';
import { Phone, CheckCircle, Users, DollarSign, FileDown, FileSpreadsheet } from 'lucide-react';
import { Stats } from '@/types/crm';
import { StatCard } from './StatCard';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ReportsViewProps {
  stats: Stats;
}

export function ReportsView({ stats }: ReportsViewProps) {
  const handleExport = (type: 'excel' | 'pdf') => {
    toast({
      title: `${type.toUpperCase()} export`,
      description: `Hesabat ${type.toUpperCase()} formatında ixrac edilir...`,
    });
  };

  const statCards = [
    {
      title: 'Ümumi zəng sayı',
      value: stats.totalCalls,
      icon: Phone,
      color: 'primary' as const,
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Uğurlu zənglər',
      value: stats.successfulCalls,
      icon: CheckCircle,
      color: 'success' as const,
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Ok müştərilər',
      value: stats.okCustomers,
      icon: Users,
      color: 'warning' as const,
      trend: { value: 5, isPositive: true },
    },
    {
      title: 'Ümumi xərc',
      value: `${stats.totalCost} AZN`,
      icon: DollarSign,
      color: 'destructive' as const,
      trend: { value: 3, isPositive: false },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Hesabatlar</h3>
          <p className="text-sm text-muted-foreground">
            Statistik məlumatlar və hesabatlar
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            className="gap-2"
          >
            <FileDown className="w-4 h-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Detailed Report Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h4 className="font-semibold text-foreground">Ətraflı hesabat</h4>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Göstərici
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Bu gün
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Bu həftə
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Bu ay
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ümumi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <motion.tr
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="hover:bg-muted/50"
            >
              <td className="px-4 py-3 font-medium text-foreground">Zəng sayı</td>
              <td className="px-4 py-3 text-muted-foreground">23</td>
              <td className="px-4 py-3 text-muted-foreground">89</td>
              <td className="px-4 py-3 text-muted-foreground">156</td>
              <td className="px-4 py-3 font-semibold text-foreground">{stats.totalCalls}</td>
            </motion.tr>
            <motion.tr
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="hover:bg-muted/50"
            >
              <td className="px-4 py-3 font-medium text-foreground">Uğurlu zənglər</td>
              <td className="px-4 py-3 text-muted-foreground">15</td>
              <td className="px-4 py-3 text-muted-foreground">52</td>
              <td className="px-4 py-3 text-muted-foreground">89</td>
              <td className="px-4 py-3 font-semibold text-success">{stats.successfulCalls}</td>
            </motion.tr>
            <motion.tr
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="hover:bg-muted/50"
            >
              <td className="px-4 py-3 font-medium text-foreground">Ok müştərilər</td>
              <td className="px-4 py-3 text-muted-foreground">12</td>
              <td className="px-4 py-3 text-muted-foreground">45</td>
              <td className="px-4 py-3 text-muted-foreground">72</td>
              <td className="px-4 py-3 font-semibold text-warning">{stats.okCustomers}</td>
            </motion.tr>
            <motion.tr
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="hover:bg-muted/50"
            >
              <td className="px-4 py-3 font-medium text-foreground">Xərc (AZN)</td>
              <td className="px-4 py-3 text-muted-foreground">450</td>
              <td className="px-4 py-3 text-muted-foreground">1,250</td>
              <td className="px-4 py-3 text-muted-foreground">3,450</td>
              <td className="px-4 py-3 font-semibold text-destructive">{stats.totalCost} AZN</td>
            </motion.tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
