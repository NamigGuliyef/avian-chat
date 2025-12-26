import React from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  Ticket,
  Phone,
  MessageSquare,
  Target,
  AlertTriangle,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { DashboardKPIs, Ticket as TicketType, CSMUser, QAResult } from '@/types/csm';

interface DashboardProps {
  kpis: DashboardKPIs;
  slaRiskTickets: TicketType[];
  teamStatus?: CSMUser[];
  myQueue?: TicketType[];
  qaResults?: QAResult[];
  userRole: 'agent' | 'supervisor' | 'admin';
}

const Dashboard: React.FC<DashboardProps> = ({
  kpis,
  slaRiskTickets,
  teamStatus,
  myQueue,
  qaResults,
  userRole,
}) => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Performans göstəriciləri və statistika</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SLA Uyğunluğu</p>
                <p className="text-3xl font-bold text-primary">{kpis.slaCompliance}%</p>
              </div>
              <div className={cn(
                "p-3 rounded-full",
                kpis.slaCompliance >= 90 ? "bg-green-100" :
                  kpis.slaCompliance >= 70 ? "bg-yellow-100" : "bg-red-100"
              )}>
                <TrendingUp className={cn(
                  "h-6 w-6",
                  kpis.slaCompliance >= 90 ? "text-green-600" :
                    kpis.slaCompliance >= 70 ? "text-yellow-600" : "text-red-600"
                )} />
              </div>
            </div>
            <Progress value={kpis.slaCompliance} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AHT (Orta Cavab Vaxtı)</p>
                <p className="text-3xl font-bold">{kpis.avgHandleTime} dəq</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Hədəf: 10 dəq</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">FCR (İlk Əlaqədə Həll)</p>
                <p className="text-3xl font-bold text-green-600">{kpis.firstContactResolution}%</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Progress value={kpis.firstContactResolution} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hədəf Yerinə Yetirmə</p>
                <p className="text-3xl font-bold">{kpis.targetCompletion}%</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Progress value={kpis.targetCompletion} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ümumi Ticket</p>
                <p className="text-2xl font-bold">{kpis.totalTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card> */}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zəng Sayı</p>
                <p className="text-2xl font-bold">{kpis.callCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chat Sayı</p>
                <p className="text-2xl font-bold">{kpis.chatCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* My Queue - Agent */}
        {myQueue && myQueue.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                My Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {myQueue.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground">{ticket.customerName}</p>
                      </div>
                      <Badge variant={
                        ticket.priority === 'urgent' ? 'destructive' :
                          ticket.priority === 'high' ? 'default' : 'secondary'
                      }>
                        {ticket.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Team Status - Supervisor */}
        {(userRole === 'supervisor' || userRole === 'admin') && teamStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {teamStatus.filter(u => u.role === 'agent').map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'w-2 h-2 rounded-full',
                          user.status === 'available' ? 'bg-green-500' :
                            user.status === 'busy' ? 'bg-red-500' :
                              user.status === 'break' ? 'bg-yellow-500' : 'bg-gray-400'
                        )} />
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.activeTickets} ticket</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">{user.status}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* SLA Risk */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              SLA Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {slaRiskTickets.length > 0 ? slaRiskTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                    <div>
                      <p className="text-sm font-medium">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">{ticket.id}</p>
                    </div>
                    <Badge variant="destructive">{ticket.waitingTime} dəq</Badge>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    SLA riski olan ticket yoxdur
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* QA Overview */}
        {qaResults && qaResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                QA Xülasəsi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {qaResults.slice(0, 5).map((qa) => (
                    <div key={qa.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{qa.agentName}</p>
                        <p className="text-xs text-muted-foreground">{qa.ticketId}</p>
                      </div>
                      <Badge variant={
                        qa.overallScore >= 85 ? 'default' :
                          qa.overallScore >= 70 ? 'secondary' : 'destructive'
                      }>
                        {qa.overallScore}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
