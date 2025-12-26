import React, { useState } from 'react';
import { Filter, Calendar, Download, HelpCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

type ReportSubSection = 'overview' | 'channels' | 'monitoring' | 'operators' | 'chatbot';

const ReportsPage: React.FC = () => {
  const { conversations, users } = useChat();
  const [activeSubSection, setActiveSubSection] = useState<ReportSubSection>('overview');

  const totalTickets = conversations.length;
  const openTickets = conversations.filter(c => c.status === 'open').length;
  const closedTickets = conversations.filter(c => c.status === 'closed').length;
  const agentCount = users.filter(u => u.role === 'agent').length;

  const subSections = [
    { id: 'overview', label: 'Overview' },
    { id: 'channels', label: 'Channels', hasArrow: true },
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'operators', label: 'Operators' },
    { id: 'chatbot', label: 'Chatbot' },
  ];

  return (
    <div className="flex-1 flex bg-background">
      {/* Sub Navigation */}
      <div className="w-56 border-r border-border bg-muted/30">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Reports</h2>
          <nav className="space-y-1">
            {subSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSubSection(section.id as ReportSubSection)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between",
                  activeSubSection === section.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{section.label}</span>
                {section.hasArrow && <span className="text-xs">›</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">≡</span>
            <h1 className="text-lg font-semibold">Overview</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="p-6 overflow-auto">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="text-sm font-medium">Overview Metrics</h3>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MetricCard
              title="Total Tickets"
              value={totalTickets}
              color="green"
            />
            <MetricCard
              title="Open Tickets"
              value={openTickets}
              color="purple"
            />
            <MetricCard
              title="Closed Tickets"
              value={closedTickets}
              change={-73.68}
              color="yellow"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <MetricCard
              title="Missed Tickets"
              value={0}
              color="blue"
            />
            <MetricCard
              title="Lapsed Tickets"
              value={0}
              color="red"
            />
          </div>

          {/* Performance */}
          <div className="mb-4 flex items-center gap-2">
            <h3 className="text-sm font-medium">Performance</h3>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-sm text-muted-foreground">Channel Distribution:</h4>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold">{totalTickets}</span>
                <span className="text-xs text-red-500 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -57.89%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">-11 vs. last month</p>
              <div className="mt-4 h-20 flex items-end justify-center">
                <div className="w-32 h-16 rounded-full bg-status-online/80" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-sm text-muted-foreground">Agents:</h4>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-3xl font-bold">{agentCount}</span>
              <div className="mt-4 h-4 bg-purple-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  color: 'green' | 'purple' | 'yellow' | 'blue' | 'red';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, color }) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
  };

  const lineColors = {
    green: 'text-green-500',
    purple: 'text-purple-500',
    yellow: 'text-yellow-600',
    blue: 'text-blue-500',
    red: 'text-red-500',
  };

  return (
    <div className={cn("rounded-lg border p-4", colorClasses[color])}>
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-sm text-muted-foreground">{title}</h4>
        <HelpCircle className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold">{value}</span>
        {change !== undefined && (
          <span className={cn(
            "text-xs flex items-center",
            change < 0 ? "text-red-500" : "text-green-500"
          )}>
            {change < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
            {change}%
          </span>
        )}
      </div>
      <div className={cn("mt-4 h-8 flex items-center justify-end", lineColors[color])}>
        <svg className="w-full h-6" viewBox="0 0 100 20">
          <path
            d="M0,10 Q10,5 20,12 T40,8 T60,14 T80,6 T100,10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};

export default ReportsPage;
